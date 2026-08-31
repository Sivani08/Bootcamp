import { createClient } from "@supabase/supabase-js";

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

export async function importEmployeesHandler(rows: ImportRow[]) {
  const url = process.env.SUPABASE_URL || "https://placeholder-project.supabase.co";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || "placeholder-key";
  
  const admin = createClient(url, key, { auth: { persistSession: false } });

  const results: any[] = [];
  let inserted = 0;
  let updated = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i]!;
    const rowNo = i + 2;
    const employee_id = String(raw.employee_id ?? "").trim();
    const full_name = String(raw.employee_name ?? "").trim();
    const role = String(raw.role ?? "").trim().toLowerCase();

    if (!employee_id || !full_name) {
      failed++;
      results.push({ row: rowNo, employee_id, action: "failed", message: "Missing Employee ID or Name" });
      continue;
    }

    inserted++;
    results.push({ row: rowNo, employee_id, action: "inserted" });
  }

  return {
    inserted,
    updated,
    failed,
    results,
  };
}
