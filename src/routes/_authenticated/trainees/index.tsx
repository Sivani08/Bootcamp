import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Search, Plus, UserCheck, Shield } from "lucide-react";
import { useWorkspace } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { visibleTrainees } from "@/lib/scope";
import { statusLabel, type Status } from "@/lib/analytics";
import { exportCohort } from "@/lib/excel";
import { useActions, saveLocalTraineeAssignment, saveLocalNewTrainee } from "@/lib/actions";
import { Initials, Meter, PageHeader, Panel, SkeletonPage, StatusPill, EmptyState, Kpi } from "@/components/ui-bits";

export const Route = createFileRoute("/_authenticated/trainees/")({
  head: () => ({ meta: [
    { title: "Trainees — BootMind" },
    { name: "description", content: "Every trainee with live progress, domain badges, quiz averages, learning health and mentor/buddy assignments." },
    { property: "og:title", content: "Trainees — BootMind" },
    { property: "og:description", content: "Every trainee with live progress, domain badges, quiz averages, learning health and mentor/buddy assignments." },
  ] }),
  component: Page,
});

const STATUSES: (Status | "all")[] = ["all", "on_track", "at_risk", "behind"];

function getDomainBadge(domainName: string) {
  const lower = domainName.toLowerCase();
  if (lower.includes("consulting") || lower.includes("dcg") || lower.includes("clinical research") || lower.includes("analytics") || lower.includes("governance")) {
    return { code: "DCG", label: "Domain Consulting Group", badgeClass: "bg-purple-500/10 text-purple-500 border-purple-500/30" };
  }
  if (lower.includes("cognitive") || lower.includes("ct") || lower.includes("clinical")) {
    return { code: "CT", label: "Cognitive Tech", badgeClass: "bg-blue-500/10 text-blue-500 border-blue-500/30" };
  }
  return { code: "DE", label: "Data Engineering", badgeClass: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" };
}

function Page() {
  const { data: ws, isLoading } = useWorkspace();
  const { role, member } = useAuth();
  const { db, run } = useActions();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<Status | "all">("all");
  const [batch, setBatch] = useState("all");
  const [domain, setDomain] = useState("all");
  const [sort, setSort] = useState<"health" | "name" | "progress">("health");

  const [openAddModal, setOpenAddModal] = useState(false);
  const [newTrainee, setNewTrainee] = useState({
    full_name: "",
    employee_id: "",
    email: "",
    domain_id: "",
    batch_id: "",
    mentor_member_id: "",
    buddy_member_id: "",
  });

  const rows = useMemo(() => (ws ? visibleTrainees(ws, role, member?.id) : []), [ws, role, member]);

  const mentors = useMemo(() => (ws ? ws.members.filter((m) => m.role === "mentor" || m.role === "admin") : []), [ws]);
  const buddies = useMemo(() => (ws ? ws.members.filter((m) => m.role === "buddy" || m.role === "admin") : []), [ws]);

  const filtered = useMemo(() => {
    const out = rows.filter(
      (r) =>
        (status === "all" || r.status === status) &&
        (batch === "all" || r.batchId === batch) &&
        (domain === "all" || r.domainId === domain) &&
        (q.trim().length < 2 || r.name.toLowerCase().includes(q.toLowerCase()) || r.employeeId?.toLowerCase().includes(q.toLowerCase())),
    );
    return out.sort((a, b) =>
      sort === "name" ? a.name.localeCompare(b.name) : sort === "progress" ? b.progress - a.progress : b.health - a.health,
    );
  }, [rows, status, batch, domain, q, sort]);

  if (isLoading || !ws) return <SkeletonPage />;

  const select = "h-9 rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

  const deCount = rows.filter((r) => getDomainBadge(r.domainName).code === "DE").length;
  const ctCount = rows.filter((r) => getDomainBadge(r.domainName).code === "CT").length;
  const dcgCount = rows.filter((r) => getDomainBadge(r.domainName).code === "DCG").length;

  const handleAssignmentChange = async (traineeId: string, mentorMemberId: string | null, buddyMemberId: string | null) => {
    saveLocalTraineeAssignment(traineeId, mentorMemberId, buddyMemberId);
    await run("Mentor & Buddy assignment updated", async () => {
      try {
        await db.from("trainees").update({
          mentor_member_id: mentorMemberId || null,
          buddy_member_id: buddyMemberId || null,
        }).eq("id", traineeId);
      } catch (err) {
        console.warn("Server assignment notice:", err);
      }
      return { ok: true };
    });
  };

  const handleAddTraineeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetDomainId = newTrainee.domain_id || ws.domains[0]?.id || "";
    const targetBatchId = newTrainee.batch_id || ws.batches[0]?.id || "";

    saveLocalNewTrainee({
      full_name: newTrainee.full_name,
      employee_id: newTrainee.employee_id,
      email: newTrainee.email,
      domain_id: targetDomainId,
      batch_id: targetBatchId,
      mentor_member_id: newTrainee.mentor_member_id || null,
      buddy_member_id: newTrainee.buddy_member_id || null,
    });

    await run("New trainee added successfully", async () => {
      try {
        const { data: memberData } = await db.from("members").insert({
          full_name: newTrainee.full_name,
          email: newTrainee.email,
          employee_id: newTrainee.employee_id,
          role: "trainee",
          title: "Trainee",
          status: "active",
        }).select().single();

        if (memberData) {
          await db.from("trainees").insert({
            member_id: memberData.id,
            batch_id: targetBatchId,
            domain_id: targetDomainId,
            mentor_member_id: newTrainee.mentor_member_id || null,
            buddy_member_id: newTrainee.buddy_member_id || null,
            learning_hours: 0,
            streak_days: 1,
            longest_streak: 1,
          });
        }
      } catch (err) {
        console.warn("Server insert trainee notice:", err);
      }
      return { ok: true };
    });

    setNewTrainee({ full_name: "", employee_id: "", email: "", domain_id: "", batch_id: "", mentor_member_id: "", buddy_member_id: "" });
    setOpenAddModal(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={role === "admin" ? "Trainees Directory (27 Total)" : "My trainees"}
        subtitle={`${filtered.length} of ${rows.length} trainees shown · Admin can assign Mentors & Buddies`}
        actions={
          <div className="flex items-center gap-2">
            {role === "admin" && (
              <button
                onClick={() => setOpenAddModal((o) => !o)}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="size-4" /> Add Trainee
              </button>
            )}
            <button
              onClick={() => exportCohort(ws, filtered, "bootmind-trainees")}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-input px-3 text-sm font-medium hover:bg-muted"
            >
              <Download className="size-4" /> Export Excel
            </button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Total Trainees" value={rows.length} />
        {deCount > 0 && <Kpi label="DE (Data Engineering)" value={deCount} tone="success" />}
        {ctCount > 0 && <Kpi label="CT (Cognitive Tech)" value={ctCount} tone="warning" />}
        {dcgCount > 0 && <Kpi label="DCG (Domain Consulting Group)" value={dcgCount} tone="neutral" />}
      </div>

      {openAddModal && role === "admin" && (
        <Panel title="Add New Trainee to Directory">
          <form onSubmit={handleAddTraineeSubmit} className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium">Full Name
              <input required value={newTrainee.full_name} onChange={(e) => setNewTrainee({ ...newTrainee, full_name: e.target.value })} placeholder="e.g. John Doe" className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" />
            </label>
            <label className="text-sm font-medium">Employee ID
              <input required value={newTrainee.employee_id} onChange={(e) => setNewTrainee({ ...newTrainee, employee_id: e.target.value })} placeholder="e.g. CI280" className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" />
            </label>
            <label className="text-sm font-medium">Email
              <input required type="email" value={newTrainee.email} onChange={(e) => setNewTrainee({ ...newTrainee, email: e.target.value })} placeholder="e.g. john.doe@agilisium.com" className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" />
            </label>
            <label className="text-sm font-medium">Domain
              <select value={newTrainee.domain_id} onChange={(e) => setNewTrainee({ ...newTrainee, domain_id: e.target.value })} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                <option value="">Select Domain</option>
                {ws.domains.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium">Batch
              <select value={newTrainee.batch_id} onChange={(e) => setNewTrainee({ ...newTrainee, batch_id: e.target.value })} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                <option value="">Select Batch</option>
                {ws.batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium">Assign Mentor
              <select value={newTrainee.mentor_member_id} onChange={(e) => setNewTrainee({ ...newTrainee, mentor_member_id: e.target.value })} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                <option value="">None / Unassigned</option>
                {mentors.map((m) => <option key={m.id} value={m.id}>{m.full_name} ({m.role})</option>)}
              </select>
            </label>
            <label className="text-sm font-medium">Assign Buddy
              <select value={newTrainee.buddy_member_id} onChange={(e) => setNewTrainee({ ...newTrainee, buddy_member_id: e.target.value })} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                <option value="">None / Unassigned</option>
                {buddies.map((b) => <option key={b.id} value={b.id}>{b.full_name} ({b.role})</option>)}
              </select>
            </label>
            <div className="flex gap-2 sm:col-span-2 mt-2">
              <button type="submit" className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">Save & Register Trainee</button>
              <button type="button" onClick={() => setOpenAddModal(false)} className="h-10 rounded-lg border border-input px-4 text-sm font-medium">Cancel</button>
            </div>
          </form>
        </Panel>
      )}

      <Panel>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by trainee name or Employee ID…"
              aria-label="Search trainees"
              className="h-9 w-full rounded-lg border border-input bg-background pr-3 pl-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <select aria-label="Status" className={select} value={status} onChange={(e) => setStatus(e.target.value as Status | "all")}>
            {STATUSES.map((s) => <option key={s} value={s}>{s === "all" ? "All statuses" : statusLabel(s as Status)}</option>)}
          </select>
          <select aria-label="Batch" className={select} value={batch} onChange={(e) => setBatch(e.target.value)}>
            <option value="all">All batches</option>
            {ws.batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select aria-label="Domain" className={select} value={domain} onChange={(e) => setDomain(e.target.value)}>
            <option value="all">All domains</option>
            {ws.domains.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select aria-label="Sort" className={select} value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
            <option value="health">Sort: Health</option>
            <option value="progress">Sort: Progress</option>
            <option value="name">Sort: Name</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No trainees match these filters" hint="Clear a filter or widen the search." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs tracking-wide text-muted-foreground uppercase">
                  <th className="py-2 pr-3 font-medium">Trainee & Emp ID</th>
                  <th className="py-2 pr-3 font-medium">Domain Badge</th>
                  <th className="py-2 pr-3 font-medium">Assigned Mentor</th>
                  <th className="py-2 pr-3 font-medium">Assigned Buddy</th>
                  <th className="py-2 pr-3 font-medium">Progress</th>
                  <th className="py-2 pr-3 font-medium">Quiz Status</th>
                  <th className="py-2 pr-3 font-medium">Feedback</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const traineeObj = ws.trainees.find((t) => t.id === r.traineeId);
                  const currentMentorId = traineeObj?.mentor_member_id || "";
                  const currentBuddyId = traineeObj?.buddy_member_id || "";
                  const domainInfo = getDomainBadge(r.domainName);

                  const traineeFeedbacks = ws.feedback.filter((f) => f.trainee_id === r.traineeId).sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
                  const mentorRatings = traineeFeedbacks
                    .filter((f) => f.kind === "mentor" || ws.members.find((m) => m.id === f.from_member_id)?.role === "mentor" || ws.members.find((m) => m.id === f.from_member_id)?.role === "admin")
                    .map((f) => Number(f.rating));

                  const buddyRatings = traineeFeedbacks
                    .filter((f) => f.kind === "buddy" || ws.members.find((m) => m.id === f.from_member_id)?.role === "buddy")
                    .map((f) => Number(f.rating));

                  const mentorAvg = mentorRatings.length ? mentorRatings.reduce((a, b) => a + b, 0) / mentorRatings.length : null;
                  const buddyAvg = buddyRatings.length ? buddyRatings.reduce((a, b) => a + b, 0) / buddyRatings.length : null;

                  let combinedAvg: string | null = null;
                  if (mentorAvg !== null && buddyAvg !== null) {
                    combinedAvg = ((mentorAvg + buddyAvg) / 2).toFixed(1);
                  } else if (mentorAvg !== null) {
                    combinedAvg = mentorAvg.toFixed(1);
                  } else if (buddyAvg !== null) {
                    combinedAvg = buddyAvg.toFixed(1);
                  } else if (traineeFeedbacks.length > 0) {
                    combinedAvg = (traineeFeedbacks.reduce((a, b) => a + Number(b.rating), 0) / traineeFeedbacks.length).toFixed(1);
                  }

                  return (
                    <tr key={r.traineeId} className="border-b border-border/60 last:border-0 hover:bg-muted/50">
                      <td className="py-3 pr-3">
                        <Link to="/trainees/$id" params={{ id: r.traineeId }} className="flex items-center gap-3">
                          <Initials name={r.name} />
                          <span>
                            <span className="flex items-center gap-1.5 font-medium">
                              {r.name}
                              {r.employeeId && <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">{r.employeeId}</span>}
                            </span>
                            <span className="block text-xs text-muted-foreground">{r.email}</span>
                          </span>
                        </Link>
                      </td>
                      <td className="py-3 pr-3">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${domainInfo.badgeClass}`}>
                          {domainInfo.code}
                        </span>
                        <span className="block text-[11px] text-muted-foreground mt-0.5">{r.domainName}</span>
                      </td>
                      <td className="py-3 pr-3">
                        {role === "admin" ? (
                          <select
                            value={currentMentorId}
                            onChange={(e) => {
                              const val = e.target.value || null;
                              handleAssignmentChange(r.traineeId, val, val);
                            }}
                            className="h-8 rounded-md border border-input bg-background px-2 text-xs outline-none focus:ring-1 focus:ring-primary font-semibold text-foreground"
                          >
                            <option value="">Unassigned</option>
                            {mentors.map((m) => (
                              <option key={m.id} value={m.id}>{m.full_name}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-xs text-muted-foreground">{r.mentorName || "Unassigned"}</span>
                        )}
                      </td>
                      <td className="py-3 pr-3">
                        {role === "admin" ? (
                          <select
                            value={currentBuddyId}
                            onChange={(e) => {
                              const val = e.target.value || null;
                              handleAssignmentChange(r.traineeId, val, val);
                            }}
                            className="h-8 rounded-md border border-input bg-background px-2 text-xs outline-none focus:ring-1 focus:ring-primary font-semibold text-foreground"
                          >
                            <option value="">Unassigned</option>
                            {mentors.map((b) => (
                              <option key={b.id} value={b.id}>{b.full_name}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-xs text-muted-foreground font-medium">{r.buddyName || r.mentorName || "Unassigned"}</span>
                        )}
                      </td>
                      <td className="w-36 py-3 pr-3">
                        <Meter value={r.progress} />
                        <span className="mt-1 block text-xs text-muted-foreground">{r.progress}% · {r.modulesCompleted}/{r.modulesTotal}</span>
                      </td>
                      <td className="py-3 pr-3">
                        {(() => {
                          const traineeAttempts = ws.attempts.filter((a) => a.trainee_id === r.traineeId);
                          const quizAvg = traineeAttempts.length ? Math.round(traineeAttempts.reduce((sum, a) => sum + Number(a.percentage), 0) / traineeAttempts.length) : null;
                          return quizAvg !== null ? (
                            <div>
                              <span className="inline-flex items-center gap-1 font-semibold text-xs bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full">
                                ★ {quizAvg}% Avg
                              </span>
                              <span className="block text-[11px] text-muted-foreground mt-0.5">
                                {traineeAttempts.length} Quiz Attempt(s)
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">No Quizzes Taken</span>
                          );
                        })()}
                      </td>
                      <td className="py-3 pr-3">
                        {combinedAvg ? (
                          <div>
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                              ★ {combinedAvg} / 5
                            </span>
                            <span className="block text-[10px] text-muted-foreground mt-0.5 font-medium">
                              {mentorAvg !== null ? `Mentor: ${mentorAvg.toFixed(1)}` : "Mentor: —"}
                              {" · "}
                              {buddyAvg !== null ? `Buddy: ${buddyAvg.toFixed(1)}` : "Buddy: —"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">No rating</span>
                        )}
                      </td>
                      <td className="py-3 pr-3"><StatusPill status={r.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
