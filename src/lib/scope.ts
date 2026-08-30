import type { Workspace, Trainee } from "./data";
import { allMetrics, type TraineeMetrics } from "./analytics";
import type { Role } from "./auth";

/** Helper to get the signed-in trainee without hardcoded index 0 fallbacks */
export function getSignedTrainee(ws: Workspace, member: any): Trainee | null {
  if (!ws || !member) return null;

  const memberEmpId = String(member.employee_id || member.id || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const memberName = String(member.full_name || "").toLowerCase().trim();
  const memberEmail = String(member.email || "").toLowerCase().trim();

  const found = ws.trainees.find((t) => {
    if (t.member_id === member.id) return true;
    const tMember = ws.members.find((m) => m.id === t.member_id);
    if (tMember) {
      if (tMember.id === member.id) return true;
      if (memberEmail && tMember.email?.toLowerCase().trim() === memberEmail) return true;
      if (memberName && tMember.full_name?.toLowerCase().trim() === memberName) return true;
      const tEmpId = String(tMember.employee_id || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      if (memberEmpId && tEmpId && (memberEmpId.includes(tEmpId) || tEmpId.includes(memberEmpId))) return true;
    }
    const tEmpIdDirect = String(t.id || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    if (memberEmpId && tEmpIdDirect && (memberEmpId.includes(tEmpIdDirect) || tEmpIdDirect.includes(memberEmpId))) return true;
    return false;
  });

  return found || null;
}

/** Rows visible to the signed-in person. RLS already filters the data;
 * this keeps the UI consistent with it. */
export function visibleTrainees(ws: Workspace, role: Role | null, memberId?: string): TraineeMetrics[] {
  const rows = allMetrics(ws);
  if (role === "admin") return rows;
  if (!memberId) return rows;

  const currentMember = ws.members.find((m) => m.id === memberId || m.email?.toLowerCase() === memberId.toLowerCase());
  const memberName = currentMember?.full_name?.toLowerCase() || "";
  const memberEmail = currentMember?.email?.toLowerCase() || "";

  if (role === "trainee") {
    return rows.filter(
      (r) =>
        r.memberId === memberId ||
        (memberEmail && r.email.toLowerCase() === memberEmail) ||
        (memberName && r.name.toLowerCase() === memberName)
    );
  }

  return rows.filter((r) => {
    if (r.mentorId === memberId || r.buddyId === memberId) return true;
    if (currentMember && (r.mentorId === currentMember.id || r.buddyId === currentMember.id)) return true;
    if (memberName && (r.mentorName.toLowerCase().includes(memberName) || r.buddyName.toLowerCase().includes(memberName) || memberName.includes(r.mentorName.toLowerCase()))) return true;
    return false;
  });
}
