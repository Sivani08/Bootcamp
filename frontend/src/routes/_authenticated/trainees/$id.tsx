import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Sparkles, ArrowLeft } from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useWorkspace, type Workspace } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { computeMetrics, weeklyActivity } from "@/lib/analytics";
import { exportTrainee } from "@/lib/excel";
import { exportScorecard, type ScorecardContext } from "@/lib/scorecard-excel";
import { overallAverage, scorecardTrend, sortedByDate } from "@/lib/scorecard";
import { ScorecardForm } from "@/components/scorecard-form";
import { toast } from "sonner";
import { useActions, notify } from "@/lib/actions";
import { Initials, Kpi, Meter, PageHeader, Panel, SkeletonPage, StatusPill, EmptyState } from "@/components/ui-bits";

export const Route = createFileRoute("/_authenticated/trainees/$id")({
  head: () => ({ meta: [
    { title: "Trainee profile — BootMind" },
    { name: "description", content: "Full learning profile: progress, quizzes, coding, feedback, meetups and AI recommendations." },
    { property: "og:title", content: "Trainee profile — BootMind" },
    { property: "og:description", content: "Full learning profile: progress, quizzes, coding, feedback, meetups and AI recommendations." },
  ] }),
  component: Page,
});

const TABS = ["Overview", "Courses", "Tasks", "Assessments", "Feedback", "Meetups", "Scorecards"] as const;

function Page() {
  const { id } = Route.useParams();
  const { data: ws, isLoading } = useWorkspace();
  const { member, role } = useAuth();
  const { db, run } = useActions();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const [rating, setRating] = useState(4);
  const [category, setCategory] = useState("Technical");
  const [comments, setComments] = useState("");
  const [showScorecardForm, setShowScorecardForm] = useState(false);

  if (isLoading || !ws) return <SkeletonPage />;
  const m = computeMetrics(ws, id);
  if (!m) return <EmptyState title="Trainee not found" hint="This trainee is outside your access scope." />;

  const canReview = role === "admin" || role === "mentor" || role === "buddy";
  const courses = ws.courses.filter((c) => c.domain_id === m.domainId).sort((a, b) => a.order_index - b.order_index);
  const tasks = ws.tasks.filter((t) => t.domain_id === m.domainId || t.trainee_id === m.traineeId);
  const activity = weeklyActivity(ws, new Set([m.traineeId]));
  const radar = [
    { k: "Progress", v: m.progress }, { k: "Quiz", v: m.quizAvg }, { k: "Assignments", v: m.assignmentAvg },
    { k: "Coding", v: m.codingAccuracy }, { k: "Tasks", v: m.taskCompletion }, { k: "Consistency", v: m.consistency },
  ];

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;
    const ok = await run("Feedback recorded", () =>
      db.from("feedback").insert({
        trainee_id: m.traineeId, from_member_id: member.id, kind: role, category, rating, comments,
      }),
    );
    if (ok) {
      setComments("");
      await notify(m.memberId, `New ${category.toLowerCase()} feedback`, `${member.full_name} rated you ${rating}/5.`, "feedback", "/feedback");
    }
  };

  return (
    <div className="space-y-6">
      <Link to="/trainees" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All trainees
      </Link>

      <div className="panel flex flex-wrap items-center gap-4 p-5">
        <Initials name={m.name} className="size-14 text-base" />
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold tracking-tight">{m.name}</h1>
          <p className="text-sm text-muted-foreground">{m.email} · {m.batchName} · {m.domainName}</p>
          <p className="mt-1 text-xs text-muted-foreground">Mentor: {m.mentorName} · Buddy: {m.buddyName}</p>
        </div>
        <StatusPill status={m.status} />
        <button onClick={() => exportTrainee(ws, m)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-input px-3 text-sm font-medium hover:bg-muted">
          <Download className="size-4" /> Export
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Health score" value={m.health} tone={m.health >= 70 ? "success" : m.health >= 50 ? "warning" : "danger"} hint={m.statusReason.slice(0, 60)} />
        <Kpi label="Progress" value={`${m.progress}%`} hint={`${m.modulesCompleted}/${m.modulesTotal} modules`} />
        <Kpi label="Course Modules" value={`${m.modulesCompleted} / ${m.modulesTotal}`} hint="Completed learning modules" />
        <Kpi label="Consistency" value={`${m.consistency}%`} hint="Active days in last 14" />
      </div>

      <div className="flex flex-wrap gap-1 rounded-lg bg-muted p-1" role="tablist">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${tab === t ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Skill balance" description="Every axis is computed from recorded activity">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radar} outerRadius="75%">
                  <PolarGrid />
                  <PolarAngleAxis dataKey="k" tick={{ fontSize: 11 }} />
                  <Radar dataKey="v" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.28} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
          <Panel title="Daily activity" description="Minutes tracked over the last 14 days">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activity}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area dataKey="minutes" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>
          <Panel className="lg:col-span-2" title="AI insight" description="Rule-based intelligence over this trainee's data">
            <p className="text-sm">{m.statusReason}</p>
            <p className="mt-2 rounded-lg bg-muted p-3 text-sm text-muted-foreground">{m.prediction}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {m.recommendations.length === 0 ? (
                <p className="text-sm text-muted-foreground">No weak topics detected.</p>
              ) : m.recommendations.map((r, i) => (
                <div key={i} className="rounded-lg border border-ai/25 bg-ai/5 p-3">
                  <p className="flex items-center gap-2 text-sm font-semibold text-ai"><Sparkles className="size-4" />{r.action}: {r.topic}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{r.reason}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {m.strongTopics.map((t) => <span key={t} className="rounded-full border border-success/25 bg-success/10 px-2.5 py-1 text-success">Strong · {t}</span>)}
              {m.weakTopics.map((t) => <span key={t} className="rounded-full border border-destructive/25 bg-destructive/10 px-2.5 py-1 text-destructive">Focus · {t}</span>)}
            </div>
          </Panel>
        </div>
      )}

      {tab === "Courses" && (
        <Panel title="Course path">
          <ul className="space-y-2">
            {courses.map((c) => {
              const mods = ws.modules.filter((x) => x.course_id === c.id);
              const done = mods.filter((x) => ws.progress.some((p) => p.trainee_id === m.traineeId && p.module_id === x.id)).length;
              const pct = mods.length ? Math.round((done / mods.length) * 100) : 0;
              return (
                <li key={c.id}>
                  <Link
                    to="/courses/$id"
                    params={{ id: c.id }}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted hover:border-primary/40 group"
                  >
                    <span className="w-52 shrink-0 truncate text-sm font-semibold text-foreground group-hover:text-primary group-hover:underline">
                      {c.title}
                    </span>
                    <Meter value={pct} />
                    <span className="shrink-0 text-xs font-medium text-muted-foreground">{done}/{mods.length} modules · {pct}%</span>
                    <span className="text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform">
                      Open Course ➔
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Panel>
      )}

      {tab === "Tasks" && (
        <Panel title="Tasks & assignments">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead><tr className="border-b border-border text-left text-xs text-muted-foreground uppercase">
                <th className="py-2 pr-3">Task</th><th className="py-2 pr-3">Type</th><th className="py-2 pr-3">Due</th><th className="py-2 pr-3">Status</th><th className="py-2">Score</th>
              </tr></thead>
              <tbody>
                {tasks.map((t) => {
                  const sub = ws.submissions.find((s) => s.task_id === t.id && s.trainee_id === m.traineeId);
                  return (
                    <tr key={t.id} className="border-b border-border/60 last:border-0">
                      <td className="py-2 pr-3 font-medium">
                        <Link to="/tasks" className="text-foreground hover:text-primary hover:underline">
                          {t.title} ➔
                        </Link>
                      </td>
                      <td className="py-2 pr-3 capitalize text-muted-foreground">{t.kind}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{t.due_at ? new Date(t.due_at).toLocaleDateString() : "—"}</td>
                      <td className="py-2 pr-3 capitalize">{(sub?.status ?? "not_started").replace("_", " ")}</td>
                      <td className="py-2">{sub?.score ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {tab === "Assessments" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Quiz attempts">
            <ul className="space-y-2 text-sm">
              {ws.attempts.filter((a) => a.trainee_id === m.traineeId).map((a) => (
                <li key={a.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <Link to={`/quizzes/${a.quiz_id}` as any} className="text-foreground hover:text-primary hover:underline font-semibold">
                    {ws.quizzes.find((q) => q.id === a.quiz_id)?.title ?? "Quiz"} ➔
                  </Link>
                  <span className="font-semibold">{Math.round(Number(a.percentage))}%</span>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Coding attempts">
            <ul className="space-y-2 text-sm">
              {ws.codingAttempts.filter((a) => a.trainee_id === m.traineeId).map((a) => (
                <li key={a.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <span>{ws.problems.find((p) => p.id === a.problem_id)?.title ?? "Problem"}</span>
                  <span className={a.passed ? "text-success" : "text-destructive"}>{a.passed ? "Passed" : "Failed"}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      )}

      {tab === "Feedback" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Feedback history">
            <ul className="space-y-2 text-sm">
              {ws.feedback.filter((f) => f.trainee_id === m.traineeId).map((f) => (
                <li key={f.id} className="rounded-lg border border-border p-3">
                  <p className="font-medium">{ws.members.find((x) => x.id === f.from_member_id)?.full_name} · {f.category} · {f.rating}/5</p>
                  <p className="mt-1 text-muted-foreground">{f.comments}</p>
                </li>
              ))}
            </ul>
          </Panel>
          {canReview && (
            <Panel title="Give feedback">
              <form onSubmit={submitFeedback} className="space-y-3">
                <label className="block text-sm font-medium">Category
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                    {["Technical", "Communication", "Consistency", "Attitude", "Problem Solving"].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </label>
                <label className="block text-sm font-medium">Rating: {rating}/5
                  <input type="range" min={1} max={5} value={rating} onChange={(e) => setRating(Number(e.target.value))} className="mt-2 w-full" />
                </label>
                <label className="block text-sm font-medium">Comments
                  <textarea required value={comments} onChange={(e) => setComments(e.target.value)} rows={4}
                    className="mt-1 w-full rounded-lg border border-input bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </label>
                <button className="h-10 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90">Submit feedback</button>
              </form>
            </Panel>
          )}
        </div>
      )}

      {tab === "Meetups" && (
        <Panel title="Meetups">
          <ul className="space-y-2 text-sm">
            {ws.meetings.filter((x) => x.trainee_id === m.traineeId).map((x) => (
              <li key={x.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3">
                <span>
                  <span className="font-medium capitalize">{x.kind} session</span>
                  <span className="block text-xs text-muted-foreground">{new Date(x.requested_for).toLocaleString()} · {x.reason}</span>
                </span>
                <span className="rounded-full border border-border px-2.5 py-1 text-xs capitalize">{x.status}</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {tab === "Scorecards" && (
        <ScorecardsTab
          ws={ws}
          traineeId={m.traineeId}
          traineeMemberId={m.memberId}
          traineeName={m.name}
          batchName={m.batchName}
          domainName={m.domainName}
          canReview={canReview}
          evaluatorMemberId={member?.id ?? null}
          evaluatorRole={role}
          showForm={showScorecardForm}
          setShowForm={setShowScorecardForm}
        />
      )}
    </div>
  );
}

function ScorecardsTab({
  ws, traineeId, traineeMemberId, traineeName, batchName, domainName,
  canReview, evaluatorMemberId, evaluatorRole, showForm, setShowForm,
}: {
  ws: Workspace;
  traineeId: string; traineeMemberId: string; traineeName: string; batchName: string; domainName: string;
  canReview: boolean; evaluatorMemberId: string | null;
  evaluatorRole: "admin" | "mentor" | "buddy" | "trainee" | null;
  showForm: boolean; setShowForm: (v: boolean) => void;
}) {
  const rows = ws.scorecards.filter((s) => s.trainee_id === traineeId);
  const mentorRows = sortedByDate(rows.filter((r) => r.participant_role !== "buddy")).reverse();
  const buddyRows = sortedByDate(rows.filter((r) => r.participant_role === "buddy")).reverse();
  const trend = scorecardTrend(rows);

  const download = (row: (typeof rows)[number]) => {
    try {
      const ctx: ScorecardContext = {
        row,
        traineeName,
        evaluatorName: ws.members.find((x) => x.id === row.evaluator_member_id)?.full_name ?? "—",
        batchName,
        domainName,
      };
      exportScorecard(ctx);
    } catch {
      toast.error("Unable to generate the scorecard. Please try again.");
    }
  };

  const list = (title: string, items: typeof rows) => (
    <Panel title={title}>
      {items.length === 0 ? (
        <EmptyState title="No scorecard available for this session." hint="Completed connects with a submitted scorecard appear here." />
      ) : (
        <ul className="space-y-2 text-sm">
          {items.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3">
              <span>
                <span className="font-medium">Session {r.session_number}</span>
                <span className="block text-xs text-muted-foreground">
                  {new Date(r.session_date).toLocaleDateString()} · {ws.members.find((x) => x.id === r.evaluator_member_id)?.full_name ?? "—"} · Avg {overallAverage(r) ?? "—"}/5
                </span>
              </span>
              <button onClick={() => download(r)} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-input px-2.5 text-xs">
                <Download className="size-3.5" /> Download scorecard
              </button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );

  const trainee = ws.trainees.find((t) => t.id === traineeId);

  return (
    <div className="space-y-4">
      {trend.length > 0 && (
        <Panel title="Connect scorecard trend" description="Previous session → latest session">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {trend.map((t) => (
              <Kpi key={t.label} label={t.label} value={`${t.previous ?? "—"} → ${t.current ?? "—"}`} />
            ))}
          </div>
        </Panel>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {list("Mentor connects", mentorRows)}
        {list("Buddy connects", buddyRows)}
      </div>

      {canReview && evaluatorMemberId && trainee && (evaluatorRole === "mentor" || evaluatorRole === "buddy" || evaluatorRole === "admin") && (
        <Panel
          title="Record a connect scorecard"
          action={
            <button onClick={() => setShowForm(!showForm)} className="h-9 rounded-lg border border-input px-3 text-sm">
              {showForm ? "Close" : "New scorecard"}
            </button>
          }
        >
          {showForm ? (
            <ScorecardForm
              traineeId={traineeId}
              traineeMemberId={traineeMemberId}
              traineeName={traineeName}
              evaluatorMemberId={evaluatorMemberId}
              participantRole={evaluatorRole === "buddy" ? "buddy" : "mentor"}
              defaultSessionNumber={(evaluatorRole === "buddy" ? buddyRows.length : mentorRows.length) + 1}
              teamName={batchName}
              onSaved={() => setShowForm(false)}
            />
          ) : (
            <p className="text-sm text-muted-foreground">Structured 1–5 evaluation using the organisation's connect scorecard format.</p>
          )}
        </Panel>
      )}
    </div>
  );
}
