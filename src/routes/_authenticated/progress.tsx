import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { CheckCircle2, Clock, Flame, BookOpen, Trophy } from "lucide-react";
import { useWorkspace } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { PageHeader, Panel, SkeletonPage, Kpi, Meter, StatusPill } from "@/components/ui-bits";
import { getSignedTrainee } from "@/lib/scope";

function getCourseEstimatedHours(c: any): number {
  if (c.estimated_hours && c.estimated_hours !== 8) return c.estimated_hours;
  const text = `${c.title || ""} ${c.description || ""}`;
  const match = text.match(/(\d+)\s*(hours?|hrs?|h)\b/i);
  if (match) {
    return parseInt(match[1], 10);
  }
  const lower = (c.title || "").toLowerCase();
  if (lower.includes("aws") || lower.includes("5 hours")) return 5;
  if (lower.includes("pyspark") || lower.includes("spark")) return 12;
  if (lower.includes("databricks") || lower.includes("azure")) return 14;
  if (lower.includes("python") || lower.includes("bootcamp")) return 15;
  if (lower.includes("sql") || lower.includes("warehousing")) return 10;
  if (lower.includes("cognitive") || lower.includes("ai")) return 12;
  if (lower.includes("consulting") || lower.includes("analytics")) return 10;
  if (lower.includes("healthcare")) return 8;
  return c.estimated_hours || 6;
}

export const Route = createFileRoute("/_authenticated/progress")({
  head: () => ({ meta: [
    { title: "My Progress — BootMind" },
    { name: "description", content: "Track module completion, task submissions, quiz scores, and learning hours." },
    { property: "og:title", content: "My Progress — BootMind" },
    { property: "og:description", content: "Track module completion, task submissions, quiz scores, and learning hours." },
  ] }),
  component: Page,
});

function Page() {
  const { data: ws, isLoading } = useWorkspace();
  const { role, member } = useAuth();

  const me = useMemo(() => {
    if (!ws || !member) return null;
    return getSignedTrainee(ws, member);
  }, [ws, member]);

  const myDomain = useMemo(() => ws?.domains.find((d) => d.id === me?.domain_id), [ws, me]);
  const myCourses = useMemo(() => ws?.courses.filter((c) => !me || c.domain_id === me.domain_id) ?? [], [ws, me]);

  const myModules = useMemo(() => {
    if (!ws) return [];
    const courseIds = new Set(myCourses.map((c) => c.id));
    return ws.modules.filter((m) => courseIds.has(m.course_id));
  }, [ws, myCourses]);

  const doneModules = useMemo(() => {
    if (!ws || !me) return [];
    return myModules.filter((m) => ws.progress.some((p) => p.trainee_id === me.id && p.module_id === m.id));
  }, [ws, me, myModules]);

  const completedCoursesCount = useMemo(() => {
    if (!ws || !me || !myCourses.length) return 0;
    const completions = ws.courseCompletions || [];
    return myCourses.filter((c) =>
      completions.some((cc) => (cc.trainee_id === me.id || cc.trainee_id === me.member_id) && cc.course_id === c.id)
    ).length;
  }, [ws, me, myCourses]);

  const pct = useMemo(() => {
    if (!myCourses.length) return 0;
    if (myModules.length > 0) {
      return Math.round((doneModules.length / myModules.length) * 100);
    }
    return Math.round((completedCoursesCount / myCourses.length) * 100);
  }, [myCourses, myModules, doneModules, completedCoursesCount]);

  const myTasks = useMemo(() => ws?.tasks.filter((t) => !t.domain_id || (me && t.domain_id === me.domain_id)) ?? [], [ws, me]);
  const mySubmissions = useMemo(() => (me && ws ? ws.submissions.filter((s) => s.trainee_id === me.id) : []), [ws, me]);
  const myQuizzes = useMemo(() => (me && ws ? ws.attempts.filter((a) => a.trainee_id === me.id) : []), [ws, me]);
  const myCoding = useMemo(() => (me && ws ? ws.codingAttempts.filter((a) => a.trainee_id === me.id) : []), [ws, me]);

  if (isLoading || !ws) return <SkeletonPage />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={role === "trainee" ? "My Learning Progress" : "Trainee Progress Analytics"}
        subtitle={`Tracking domain learning path, module completions, and task submissions for ${myDomain?.name ?? "Bootcamp"}.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Course Completion" value={`${pct}%`} icon={<Trophy className="size-4" />} tone="success" />
        <Kpi label="Assigned Courses" value={`${completedCoursesCount} / ${myCourses.length} Done`} icon={<CheckCircle2 className="size-4" />} />
        <Kpi label="Active Batch" value="Batch 12" icon={<Clock className="size-4" />} tone="neutral" />
        <Kpi label="Assigned Domain" value={myDomain?.name ?? "Data Engineering"} icon={<BookOpen className="size-4" />} tone="neutral" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Overall Learning Path Progress">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm font-semibold mb-1">
                <span>{myDomain?.name ?? "Domain Training Path"}</span>
                <span className="text-primary">{pct}% Complete</span>
              </div>
              <Meter value={pct} />
            </div>

            <div className="space-y-2 pt-2 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Enrolled Courses ({myCourses.length})</p>
              {myCourses.map((c) => {
                const mods = ws.modules.filter((m) => m.course_id === c.id);
                const done = me ? mods.filter((m) => ws.progress.some((p) => p.trainee_id === me.id && p.module_id === m.id)).length : 0;
                const isCompleted = me
                  ? (ws.courseCompletions || []).some(
                      (cc) => (cc.trainee_id === me.id || cc.trainee_id === me.member_id) && cc.course_id === c.id
                    )
                  : false;
                const cPct = isCompleted ? 100 : mods.length ? Math.round((done / mods.length) * 100) : 0;
                return (
                  <Link key={c.id} to="/courses/$id" params={{ id: c.id }} className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="text-sm font-semibold flex items-center gap-2">
                        <BookOpen className="size-4 text-primary" /> {c.title}
                      </p>
                    </div>
                    {isCompleted || cPct === 100 ? (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                        100% ✓
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-foreground bg-accent px-2.5 py-1 rounded-full">{cPct}%</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </Panel>

        <Panel
          title={`Task & Assessment Submissions (${myTasks.length})`}
          action={
            <Link to="/tasks" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              Open Task Board ↗
            </Link>
          }
        >
          <div className="max-h-[520px] overflow-y-auto pr-1 space-y-3">
            {myTasks.map((t) => {
              const sub = mySubmissions.find((s) => s.task_id === t.id);
              const st = sub?.status ?? "not_started";
              return (
                <div key={t.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 hover:bg-muted/30 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate">{t.title}</p>
                    <p className="text-xs text-muted-foreground capitalize mt-0.5">{t.kind} · {t.priority} priority</p>
                  </div>
                  <StatusPill status={st} />
                </div>
              );
            })}
            {myTasks.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No tasks assigned yet.</p>}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-1">
        <Panel title="LeetCode & Algorithmic Practice Performance">
          <div className="space-y-2 text-sm">
            {myCoding.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="font-medium">{ws.problems.find((x) => x.id === c.problem_id)?.title ?? "Coding Challenge"}</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.passed ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`}>
                  {c.passed ? "Passed ✓" : "Attempted"}
                </span>
              </div>
            ))}
            {myCoding.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Complete LeetCode & HackerRank assessments under Tasks to track your algorithmic practice.</p>}
          </div>
        </Panel>
      </div>
    </div>
  );
}
