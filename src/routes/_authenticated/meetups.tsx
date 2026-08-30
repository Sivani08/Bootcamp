import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { CalendarClock, Check, X, ClipboardList, UserCheck, HeartHandshake, Calendar, MessageSquare, Send, Trash2, BarChart2, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { useWorkspace, type Meeting } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { useActions, notify, deleteLocalItem } from "@/lib/actions";
import { EmptyState, Kpi, PageHeader, Panel, SkeletonPage, Initials } from "@/components/ui-bits";
import { getSignedTrainee } from "@/lib/scope";
import { ScorecardForm } from "@/components/scorecard-form";
import { exportAdminMeetupScorecards } from "@/lib/excel";

export const Route = createFileRoute("/_authenticated/meetups")({
  head: () => ({ meta: [
    { title: "Meetups & Sessions — BootMind" },
    { name: "description", content: "Schedule 1-on-1 mentor & buddy connect sessions, send invites, specify meeting reasons, and track feedback scorecards." },
    { property: "og:title", content: "Meetups & Sessions — BootMind" },
    { property: "og:description", content: "Schedule 1-on-1 mentor & buddy connect sessions, send invites, specify meeting reasons, and track feedback scorecards." },
  ] }),
  component: Page,
});

const PRESET_REASONS = [
  "Doubt clearing & Technical Support",
  "1-on-1 Code Review & Refactoring",
  "Project Guidance & Architecture",
  "Weekly Progress & Career Sync",
  "Personal Support & Wellbeing",
  "Custom Reason",
];

function Page() {
  const { data: ws, isLoading } = useWorkspace();
  const { role, member } = useAuth();
  const { db, run, refresh } = useActions();

  const [kind, setKind] = useState<"mentor" | "buddy">("mentor");
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [when, setWhen] = useState("");
  const [reason, setReason] = useState(PRESET_REASONS[0]!);
  const [customReason, setCustomReason] = useState("");
  const [message, setMessage] = useState("");
  const [scoring, setScoring] = useState<string | null>(null);

  const me = useMemo(() => {
    if (!ws || !member) return null;
    return getSignedTrainee(ws, member);
  }, [ws, member]);

  const mentors = useMemo(() => ws ? ws.members.filter((m) => m.role === "mentor" || m.role === "admin") : [], [ws]);
  const buddies = useMemo(() => ws ? ws.members.filter((m) => m.role === "buddy") : [], [ws]);

  // Mentor & Buddy list of actionable meeting invites
  const rows = useMemo(() => {
    if (!ws) return [];
    return ws.meetings
      .filter((m) => {
        if (!m) return false;
        if (role === "trainee") {
          if (!me) return true;
          return m.trainee_id === me.id || m.trainee_id === me.member_id || m.trainee_id === member?.id;
        }
        // Mentor or Buddy view
        return m.with_member_id === member?.id || m.kind === role || (me && m.with_member_id === me.id);
      })
      .sort((a, b) => new Date(b.requested_for || 0).getTime() - new Date(a.requested_for || 0).getTime());
  }, [ws, role, member, me]);

  // Admin summary per trainee metrics
  const adminTraineeCounts = useMemo(() => {
    if (!ws || role !== "admin") return [];
    return ws.trainees.map((t) => {
      const traineeMember = ws.members.find((m) => m.id === t.member_id);
      const domain = ws.domains.find((d) => d.id === t.domain_id);
      const batch = ws.batches.find((b) => b.id === t.batch_id);
      const traineeMeetings = ws.meetings.filter((m) => m.trainee_id === t.id || m.trainee_id === t.member_id);

      const mentorCount = traineeMeetings.filter((m) => m.kind === "mentor").length;
      const buddyCount = traineeMeetings.filter((m) => m.kind === "buddy").length;
      const completedCount = traineeMeetings.filter((m) => m.status === "completed").length;
      const pendingCount = traineeMeetings.filter((m) => m.status === "requested").length;
      const latestMeeting = traineeMeetings[0];

      return {
        id: t.id,
        name: traineeMember?.full_name ?? "Trainee",
        employeeId: (traineeMember as any)?.employee_id ?? "—",
        domainName: domain?.name ?? "General",
        batchName: batch?.name ?? "Batch 12",
        mentorCount,
        buddyCount,
        completedCount,
        pendingCount,
        latestDate: latestMeeting ? new Date(latestMeeting.requested_for).toLocaleDateString() : "No sessions yet",
      };
    });
  }, [ws, role]);

  if (isLoading || !ws) return <SkeletonPage />;

  const mentorMeetupsCount = ws.meetings.filter((m) => m.kind === "mentor").length;
  const buddyMeetupsCount = ws.meetings.filter((m) => m.kind === "buddy").length;
  const completedCount = ws.meetings.filter((m) => m.status === "completed").length;
  const pendingCount = ws.meetings.filter((m) => m.status === "requested").length;

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!when) {
      toast.error("Please select a calendar date & time for the meetup.");
      return;
    }

    const activeTrainee = me || ws.trainees[0];
    const traineeId = activeTrainee ? activeTrainee.id : (member?.id || "t-local-active");

    const mentorMember = ws.members.find((m) => m.id === activeTrainee?.mentor_member_id || m.role === "mentor" || m.role === "admin");
    const buddyMember = ws.members.find((m) => m.id === activeTrainee?.buddy_member_id || m.role === "buddy");

    let targetMemberId = selectedStaffId;
    if (!targetMemberId) {
      targetMemberId = kind === "mentor"
        ? (mentorMember?.id || ws.members.find((m) => m.role === "admin")?.id || "admin-member")
        : (buddyMember?.id || mentorMember?.id || "buddy-member");
    }

    const finalReason = reason === "Custom Reason" ? (customReason.trim() || "1-on-1 Connect Session") : reason;
    const meetingId = `meet-local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const isoDate = new Date(when).toISOString();

    const newMeeting: Meeting = {
      id: meetingId,
      trainee_id: traineeId,
      with_member_id: targetMemberId,
      kind,
      requested_for: isoDate,
      reason: finalReason,
      message: message.trim() || null,
      response_note: null,
      status: "requested",
      created_at: new Date().toISOString(),
    };

    try {
      const list: Meeting[] = JSON.parse(localStorage.getItem("bootmind_local_meetings") || "[]");
      list.unshift(newMeeting);
      localStorage.setItem("bootmind_local_meetings", JSON.stringify(list));
    } catch (err) {
      console.warn("Failed to write to local storage:", err);
    }

    await run("Meetup invite sent successfully!", async () => {
      try {
        await db.from("meetings").insert({
          id: meetingId,
          trainee_id: traineeId,
          with_member_id: targetMemberId,
          kind,
          requested_for: isoDate,
          reason: finalReason,
          message: message.trim() || null,
          status: "requested",
        });
      } catch (err) {
        console.warn("Server meeting insert notice:", err);
      }
      return { ok: true };
    });

    await notify(
      targetMemberId,
      `New 1-on-1 ${kind === "mentor" ? "Mentor" : "Buddy"} Meetup Invite`,
      `Reason: ${finalReason} on ${new Date(when).toLocaleString()}`,
      "connect",
      "/meetups"
    );

    setMessage("");
    setWhen("");
    setCustomReason("");
    refresh();
  };

  const respond = async (id: string, status: "accepted" | "rejected" | "completed", traineeMemberId: string) => {
    try {
      const list: Meeting[] = JSON.parse(localStorage.getItem("bootmind_local_meetings") || "[]");
      const idx = list.findIndex((m) => m.id === id);
      if (idx >= 0) {
        list[idx] = { ...list[idx]!, status };
        localStorage.setItem("bootmind_local_meetings", JSON.stringify(list));
      }
    } catch {}

    const ok = await run(`Meetup ${status}`, () => db.from("meetings").update({ status }).eq("id", id));
    if (ok) {
      await notify(traineeMemberId, `Meetup ${status}`, `Your meetup status is now ${status}.`, "connect", "/meetups");
      refresh();
    }
  };

  const cancelInvite = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this meetup invite?")) return;
    deleteLocalItem("bootmind_local_meetings", id);
    await run("Meetup invite canceled", () => db.from("meetings").delete().eq("id", id));
    refresh();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={role === "admin" ? "Meetup Counts & Session Analytics" : "Meetups & Sessions"}
        subtitle={role === "admin"
          ? "Overview of total 1-on-1 meetup counts conducted between trainees, mentors, and buddies."
          : "Schedule 1-on-1 sessions, send calendar invites, approve requests, and submit trainee feedback scorecards."}
        actions={
          role === "admin" && ws ? (
            <button
              onClick={() => exportAdminMeetupScorecards(ws)}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-600 px-3.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm transition-all"
            >
              <FileSpreadsheet className="size-4" /> Download Meetups Excel Scorecard
            </button>
          ) : null
        }
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <Kpi label="Mentor Meetups" value={mentorMeetupsCount} icon={<UserCheck className="size-4" />} tone="success" />
        <Kpi label="Buddy Meetups" value={buddyMeetupsCount} icon={<HeartHandshake className="size-4" />} tone="warning" />
        <Kpi label="Sessions Completed" value={completedCount} icon={<CalendarClock className="size-4" />} tone="neutral" />
        <Kpi label="Pending Requests" value={pendingCount} icon={<BarChart2 className="size-4" />} tone="warning" />
      </div>

      {/* ADMIN VIEW: Only Meetup Counts & Summary Breakdown */}
      {role === "admin" ? (
        <Panel title="1-on-1 Meetup Counts Breakdown by Trainee" description="Live summary of mentor and buddy connect sessions for all trainees">
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50">
                <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="py-3 px-3.5 font-medium">Trainee &amp; Emp ID</th>
                  <th className="py-3 px-3.5 font-medium">Domain</th>
                  <th className="py-3 px-3.5 font-medium">Batch</th>
                  <th className="py-3 px-3.5 font-medium text-center">Mentor Meetups</th>
                  <th className="py-3 px-3.5 font-medium text-center">Buddy Meetups</th>
                  <th className="py-3 px-3.5 font-medium text-center">Total Completed</th>
                  <th className="py-3 px-3.5 font-medium text-center">Pending Invites</th>
                  <th className="py-3 px-3.5 font-medium text-right">Latest Session</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {adminTraineeCounts.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-2.5">
                        <Initials name={t.name} />
                        <div>
                          <span className="font-bold flex items-center gap-1.5">
                            {t.name}
                            <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground">{t.employeeId}</span>
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3.5 font-medium">{t.domainName}</td>
                    <td className="py-3 px-3.5 text-muted-foreground">{t.batchName}</td>
                    <td className="py-3 px-3.5 text-center font-bold text-emerald-600">{t.mentorCount}</td>
                    <td className="py-3 px-3.5 text-center font-bold text-amber-600">{t.buddyCount}</td>
                    <td className="py-3 px-3.5 text-center font-bold text-primary">{t.completedCount}</td>
                    <td className="py-3 px-3.5 text-center font-bold">{t.pendingCount}</td>
                    <td className="py-3 px-3.5 text-right text-muted-foreground font-medium">{t.latestDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      ) : (
        /* MENTOR, BUDDY & TRAINEE WORKSPACE VIEW */
        <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
          {role === "trainee" && (
            <Panel title="📅 Send Meetup Invite & Schedule Session">
              <form onSubmit={sendInvite} className="space-y-3.5">
                <label className="block text-sm font-medium">Session Type
                  <select value={kind} onChange={(e) => { setKind(e.target.value as "mentor" | "buddy"); setSelectedStaffId(""); }} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                    <option value="mentor">Mentor Connect</option>
                    <option value="buddy">Buddy Connect</option>
                  </select>
                </label>

                <label className="block text-sm font-medium">Select Person to Invite
                  <select value={selectedStaffId} onChange={(e) => setSelectedStaffId(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                    <option value="">
                      Default: {kind === "mentor" ? (ws.members.find((m) => m.id === me?.mentor_member_id)?.full_name || "Assigned Mentor") : (ws.members.find((m) => m.id === me?.buddy_member_id)?.full_name || "Assigned Buddy")}
                    </option>
                    {(kind === "mentor" ? mentors : buddies).map((s) => (
                      <option key={s.id} value={s.id}>{s.full_name} ({s.title || s.role})</option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-medium">Select Calendar Date &amp; Time
                  <input required type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" />
                  {when && (
                    <p className="mt-1 text-[11px] font-semibold text-primary flex items-center gap-1">
                      <Calendar className="size-3" /> Scheduled: {new Date(when).toLocaleString()}
                    </p>
                  )}
                </label>

                <label className="block text-sm font-medium">Reason to Meet
                  <select value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                    {PRESET_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </label>

                {reason === "Custom Reason" && (
                  <label className="block text-sm font-medium">Specify Custom Reason
                    <input required value={customReason} onChange={(e) => setCustomReason(e.target.value)} placeholder="e.g. Debugging PySpark Memory Leak" className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" />
                  </label>
                )}

                <label className="block text-sm font-medium">Message / Details to Share
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="Provide topics or questions you would like to discuss..." className="mt-1 w-full rounded-lg border border-input bg-background p-3 text-sm" />
                </label>

                <button type="submit" className="h-10 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors">
                  <Send className="size-4" /> Send Meetup Invite
                </button>
              </form>
            </Panel>
          )}

          <Panel title="Mentor & Buddy Meetups Log & Feedbacks" className={role !== "trainee" ? "lg:col-span-2" : ""}>
            {rows.length === 0 ? (
              <EmptyState title="No meetups yet" hint="Send a meetup invite using the calendar form on the left." />
            ) : (
              <ul className="space-y-3">
                {rows.map((m) => {
                  const trainee = ws.trainees.find((t) => t.id === m.trainee_id);
                  const traineeName = ws.members.find((x) => x.id === trainee?.member_id)?.full_name ?? "Trainee";
                  const withName = ws.members.find((x) => x.id === m.with_member_id)?.full_name ?? (m.kind === "mentor" ? "Mentor" : "Buddy");
                  const cards = ws.scorecards.filter((s) => s.meeting_id === m.id);
                  const traineeFeedbacks = ws.feedback.filter((f) => f.trainee_id === m.trainee_id);
                  const canScore = (role === "mentor" || role === "buddy") && m.status === "completed" && !!trainee && !!member;
                  const nextSession = ws.scorecards.filter((s) => s.trainee_id === m.trainee_id && s.participant_role === m.kind).length + 1;

                  return (
                    <li key={m.id} className="rounded-lg border border-border p-3.5 space-y-2.5 bg-card">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="flex items-center gap-2 text-sm font-bold text-foreground">
                            <CalendarClock className="size-4 text-primary shrink-0" />
                            {m.reason}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Requested by <span className="font-semibold text-foreground">{traineeName}</span> with <span className="font-semibold text-foreground">{withName}</span> ({m.kind}) · <span className="font-bold text-primary">{new Date(m.requested_for).toLocaleString()}</span>
                          </p>
                          {m.message && (
                            <div className="mt-1.5 text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border/50 space-y-2">
                              <div className="flex items-start gap-1.5">
                                <MessageSquare className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                <span className="whitespace-pre-wrap">“{m.message}”</span>
                              </div>
                              {m.message.includes("https://") && (
                                <div className="flex flex-wrap gap-2 pt-1 border-t border-border/40">
                                  {Array.from(m.message.matchAll(/https:\/\/[^\s]+/g)).map((match, i) => {
                                    const url = match[0];
                                    const isDoc = url.includes("IQAA8Zb6Aj") || url.toLowerCase().includes(".docx") || url.includes("w:");
                                    return (
                                      <a
                                        key={i}
                                        href={url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1.5 rounded-md bg-purple-600/10 px-2.5 py-1 text-xs font-bold text-purple-600 dark:text-purple-400 border border-purple-500/30 hover:bg-purple-600/20 transition-all"
                                      >
                                        <HeartHandshake className="size-3.5" />
                                        {isDoc ? "📄 Open BUDDY CONNECT REPORT.docx ↗" : "📂 Open SharePoint Buddy Connect Folder ↗"}
                                      </a>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-bold capitalize ${
                            m.status === "accepted" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600" :
                            m.status === "completed" ? "border-primary/30 bg-primary/10 text-primary" :
                            m.status === "rejected" ? "border-destructive/30 bg-destructive/10 text-destructive" :
                            "border-amber-500/30 bg-amber-500/10 text-amber-600"
                          }`}>
                            {m.status}
                          </span>

                          {cards.length > 0 && (
                            <span className="rounded-full border border-primary/30 bg-primary/10 text-primary px-2.5 py-1 text-xs font-medium">
                              {cards.length} scorecard{cards.length > 1 ? "s" : ""}
                            </span>
                          )}

                          {role === "trainee" && m.status === "requested" && (
                            <button onClick={() => cancelInvite(m.id)} title="Cancel meetup invite" className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                              <Trash2 className="size-4" />
                            </button>
                          )}

                          {role !== "trainee" && m.status === "requested" && (
                            <>
                              <button
                                onClick={() => respond(m.id, "accepted", trainee?.member_id || m.trainee_id)}
                                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm"
                              >
                                <Check className="size-3.5" /> Approve &amp; Accept
                              </button>
                              <button
                                onClick={() => respond(m.id, "rejected", trainee?.member_id || m.trainee_id)}
                                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive px-3.5 text-xs font-semibold hover:bg-destructive/20 transition-colors"
                              >
                                <X className="size-3.5" /> Decline / Reject
                              </button>
                            </>
                          )}

                          {role !== "trainee" && m.status === "accepted" && (
                            <button onClick={() => respond(m.id, "completed", trainee?.member_id || m.trainee_id)} className="h-8 rounded-lg border border-input px-3 text-xs font-semibold hover:bg-accent">
                              Mark completed
                            </button>
                          )}

                          {canScore && (
                            <button onClick={() => setScoring(scoring === m.id ? null : m.id)} className="inline-flex h-8 items-center gap-1 rounded-lg border border-input px-3 text-xs font-medium">
                              <ClipboardList className="size-3.5" /> {scoring === m.id ? "Close scorecard" : "Record scorecard"}
                            </button>
                          )}
                        </div>
                      </div>

                      {traineeFeedbacks.length > 0 && (
                        <div className="rounded-md bg-muted/50 p-2.5 text-xs space-y-1 mt-2 border border-border/60">
                          <span className="font-bold block text-muted-foreground uppercase text-[10px]">Trainee Feedback Notes:</span>
                          {traineeFeedbacks.slice(0, 2).map((fb) => (
                            <p key={fb.id} className="text-muted-foreground">
                              • <span className="font-semibold text-foreground">{fb.category} ({fb.rating}/5):</span> “{fb.comments}”
                            </p>
                          ))}
                        </div>
                      )}

                      {canScore && scoring === m.id && trainee && member && (
                        <div className="mt-4 border-t border-border pt-4">
                          <ScorecardForm
                            traineeId={trainee.id}
                            traineeMemberId={trainee.member_id}
                            traineeName={traineeName}
                            evaluatorMemberId={member.id}
                            participantRole={m.kind}
                            meetingId={m.id}
                            defaultSessionNumber={nextSession}
                            defaultSessionDate={m.requested_for.slice(0, 10)}
                            teamName={ws.batches.find((b) => b.id === trainee.batch_id)?.name ?? ""}
                            onSaved={() => setScoring(null)}
                          />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </div>
      )}
    </div>
  );
}
