import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface ImportRow {
  employee_id: string;
  employee_name: string;
  email?: string;
  role: string;
  batch?: string;
  domain?: string;
  mentor?: string;
  buddy?: string;
  status?: string;
  joining_date?: string;
  phone?: string;
}

export interface ImportRowResult {
  row: number;
  employee_id: string;
  action: "inserted" | "updated" | "failed";
  message?: string;
}

const ROLES = ["admin", "mentor", "buddy", "trainee"];

/** Admin-only import of real bootcamp employees. Validated server-side before any write. */
export const importEmployees = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { rows: ImportRow[] }) => {
    if (!input || !Array.isArray(input.rows)) throw new Error("Invalid payload");
    if (input.rows.length > 2000) throw new Error("Too many rows in one import (max 2000)");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = supabaseAdmin as any;

    const [{ data: batches }, { data: domains }, { data: members }] = await Promise.all([
      admin.from("batches").select("id,name"),
      admin.from("domains").select("id,name,batch_id"),
      admin.from("members").select("id,employee_id,email,full_name,role"),
    ]);

    type Named = { id: string; name: string };
    type Mem = { id: string; employee_id: string | null; email: string; full_name: string; role: string };
    const memberList: Mem[] = members ?? [];

    const findStaff = (ref?: string) => {
      if (!ref) return null;
      const r = ref.trim().toLowerCase();
      return (
        memberList.find((m) => (m.employee_id ?? "").toLowerCase() === r) ??
        memberList.find((m) => m.email.toLowerCase() === r) ??
        memberList.find((m) => m.full_name.toLowerCase() === r) ??
        null
      );
    };

    const results: ImportRowResult[] = [];

    for (let i = 0; i < data.rows.length; i++) {
      const raw = data.rows[i]!;
      const rowNo = i + 2; // header offset
      const employee_id = String(raw.employee_id ?? "").trim();
      const full_name = String(raw.employee_name ?? "").trim();
      const role = String(raw.role ?? "").trim().toLowerCase();
      const status = (String(raw.status ?? "active").trim().toLowerCase() === "inactive"
        ? "inactive"
        : "active") as "active" | "inactive";

      try {
        if (!employee_id) throw new Error("Employee ID missing");
        if (!full_name) throw new Error("Employee name missing");
        if (!ROLES.includes(role)) throw new Error(`Unknown role "${raw.role}"`);
        if (role !== "trainee" && !raw.email) throw new Error("Email is required for admin/mentor/buddy");

        const email =
          (raw.email ?? "").trim().toLowerCase() ||
          `${employee_id.toLowerCase().replace(/[^a-z0-9]/g, "")}@bootmind.internal`;

        const existing = memberList.find(
          (m) => (m.employee_id ?? "").toLowerCase() === employee_id.toLowerCase(),
        );

        const memberPayload = {
          employee_id,
          full_name,
          email,
          role,
          status,
          is_demo: false,
          phone: raw.phone?.trim() || null,
          joining_date: raw.joining_date?.trim() || null,
          title: role === "trainee" ? "Trainee" : role.charAt(0).toUpperCase() + role.slice(1),
        };

        let memberId: string;
        if (existing) {
          const { error } = await admin.from("members").update(memberPayload).eq("id", existing.id);
          if (error) throw error;
          memberId = existing.id;
        } else {
          const { data: ins, error } = await admin
            .from("members")
            .insert(memberPayload)
            .select("id")
            .single();
          if (error) throw error;
          memberId = ins.id;
          memberList.push({ id: memberId, employee_id, email, full_name, role });
        }

        if (role === "trainee") {
          const batch = (batches ?? []).find(
            (b: Named) => b.name.toLowerCase() === String(raw.batch ?? "").trim().toLowerCase(),
          );
          if (!batch) throw new Error(`Batch "${raw.batch ?? ""}" not found`);
          const domain = (domains ?? []).find(
            (d: Named) => d.name.toLowerCase() === String(raw.domain ?? "").trim().toLowerCase(),
          );
          if (!domain) throw new Error(`Domain "${raw.domain ?? ""}" not found`);

          const mentor = findStaff(raw.mentor);
          if (raw.mentor && !mentor) throw new Error(`Mentor "${raw.mentor}" not found`);
          const buddy = findStaff(raw.buddy);
          if (raw.buddy && !buddy) throw new Error(`Buddy "${raw.buddy}" not found`);

          const { data: existingTrainee } = await admin
            .from("trainees")
            .select("id")
            .eq("member_id", memberId)
            .maybeSingle();

          const traineePayload = {
            member_id: memberId,
            batch_id: batch.id,
            domain_id: domain.id,
            mentor_member_id: mentor?.id ?? null,
            buddy_member_id: buddy?.id ?? null,
          };

          if (existingTrainee) {
            const { error } = await admin
              .from("trainees")
              .update(traineePayload)
              .eq("id", existingTrainee.id);
            if (error) throw error;
          } else {
            const { error } = await admin.from("trainees").insert(traineePayload);
            if (error) throw error;
          }
        }

        results.push({ row: rowNo, employee_id, action: existing ? "updated" : "inserted" });
      } catch (e) {
        console.error(`[importEmployees] row ${rowNo} failed`, e);
        results.push({
          row: rowNo,
          employee_id,
          action: "failed",
          message: e instanceof Error ? e.message : "Could not import this row",
        });
      }
    }

    return {
      inserted: results.filter((r) => r.action === "inserted").length,
      updated: results.filter((r) => r.action === "updated").length,
      failed: results.filter((r) => r.action === "failed").length,
      results,
    };
  });
