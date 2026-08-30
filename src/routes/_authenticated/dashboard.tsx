import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import {
  Users, BookOpen, ClipboardList, BarChart3, CalendarClock, AlertTriangle, CheckCircle2, Clock,
  ArrowUpRight, Shield, Award, Search, Sparkles, Activity, FileSpreadsheet, ChevronRight, PieChart as PieIcon,
  TrendingUp, Layers, Target, UserCheck, Check, MessageSquare, ExternalLink, Flame, Download,
} from "lucide-react";
import { useWorkspace } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { visibleTrainees } from "@/lib/scope";
import { statusLabel, type Status } from "@/lib/analytics";
import { Initials, Meter, PageHeader, Panel, SkeletonPage, StatusPill, Kpi, EmptyState } from "@/components/ui-bits";
import { exportOverviewDashboard } from "@/lib/excel";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Overview & Dashboard — BootMind" },
      { name: "description", content: "Enterprise learning intelligence, batch performance tracking, domain analytics, and trainee risk monitoring." },
      { property: "og:title", content: "Overview & Dashboard — BootMind" },
      { property: "og:description", content: "Enterprise learning intelligence, batch performance tracking, domain analytics, and trainee risk monitoring." },
    ],
  }),
  component: DashboardPage,
});

function BatchHealthDonutChart({ onTrack, atRisk, behind, total }: { onTrack: number; atRisk: number; behind: number; total: number }) {
  const safeTotal = total || 1;
  const onTrackPct = (onTrack / safeTotal) * 100;
  const atRiskPct = (atRisk / safeTotal) * 100;
  const behindPct = (behind / safeTotal) * 100;

  const circum = 251.2; // 2 * Math.PI * 40

  const dashOnTrack = (onTrackPct * circum) / 100;
  const dashAtRisk = (atRiskPct * circum) / 100;
  const dashBehind = (behindPct * circum) / 100;

  const offsetAtRisk = -dashOnTrack;
  const offsetBehind = -(dashOnTrack + dashAtRisk);

  return (
    <div className="relative flex flex-col items-center justify-center py-2">
      <div className="relative size-48">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90">
          <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-muted/30" />

          {onTrack > 0 && (
            <circle
              cx="50" cy="50" r="40"
              fill="transparent"
              stroke="#10b981"
              strokeWidth="12"
              strokeDasharray={`${dashOnTrack} ${circum}`}
              strokeDashoffset="0"
              className="transition-all duration-700"
            />
          )}

          {atRisk > 0 && (
            <circle
              cx="50" cy="50" r="40"
              fill="transparent"
              stroke="#f59e0b"
              strokeWidth="12"
              strokeDasharray={`${dashAtRisk} ${circum}`}
              strokeDashoffset={offsetAtRisk}
              className="transition-all duration-700"
            />
          )}

          {behind > 0 && (
            <circle
              cx="50" cy="50" r="40"
              fill="transparent"
              stroke="#ef4444"
              strokeWidth="12"
              strokeDasharray={`${dashBehind} ${circum}`}
              strokeDashoffset={offsetBehind}
              className="transition-all duration-700"
            />
          )}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black text-foreground">{total}</span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Trainees</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 w-full pt-3 border-t border-border/60 text-center">
        <div className="rounded-lg bg-emerald-500/10 p-2 border border-emerald-500/20">
          <p className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">On Track</p>
          <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{onTrack}</p>
          <p className="text-[10px] text-muted-foreground">{Math.round(onTrackPct)}%</p>
        </div>

        <div className="rounded-lg bg-amber-500/10 p-2 border border-amber-500/20">
          <p className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400">At Risk</p>
          <p className="text-lg font-black text-amber-600 dark:text-amber-400">{atRisk}</p>
          <p className="text-[10px] text-muted-foreground">{Math.round(atRiskPct)}%</p>
        </div>

        <div className="rounded-lg bg-rose-500/10 p-2 border border-rose-500/20">
          <p className="text-[10px] font-bold uppercase text-rose-600 dark:text-rose-400">Behind</p>
          <p className="text-lg font-black text-rose-600 dark:text-rose-400">{behind}</p>
          <p className="text-[10px] text-muted-foreground">{Math.round(behindPct)}%</p>
        </div>
      </div>
    </div>
  );
}

function DomainPerformanceBarChart({ domains }: { domains: { name: string; progress: number; quiz: number; count: number }[] }) {
  return (
    <div className="space-y-3.5 py-1">
      {domains.map((d) => (
        <div key={d.name} className="space-y-2 rounded-lg border border-border/60 bg-muted/20 p-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-foreground">{d.name} <span className="text-muted-foreground text-[11px]">({d.count} trainees)</span></span>
            <span className="text-muted-foreground text-[11px]">Avg Progress: <strong className="text-foreground">{d.progress}%</strong></span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-20 text-[10px] font-bold text-muted-foreground uppercase">Course %</span>
              <div className="relative h-2.5 flex-1 rounded-full bg-muted/60 overflow-hidden">
                <div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${d.progress}%` }} />
              </div>
              <span className="w-8 text-right text-[11px] font-bold text-blue-600 dark:text-blue-400">{d.progress}%</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-20 text-[10px] font-bold text-muted-foreground uppercase">Quiz Avg</span>
              <div className="relative h-2.5 flex-1 rounded-full bg-muted/60 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${d.quiz}%` }} />
              </div>
              <span className="w-8 text-right text-[11px] font-bold text-emerald-600 dark:text-emerald-400">{d.quiz}%</span>
            </div>
          </div>
        </div>
      ))}

      <div className="mt-2 flex items-center justify-center gap-6 pt-2 border-t border-border/60 text-xs font-semibold">
        <span className="flex items-center gap-2 text-muted-foreground">
          <span className="size-3 rounded bg-blue-500" /> Course Progress %
        </span>
        <span className="flex items-center gap-2 text-muted-foreground">
          <span className="size-3 rounded bg-emerald-500" /> Quiz Average %
        </span>
      </div>
    </div>
  );
}

function TraineePersonalDashboardView({ ws, member }: { ws: any; member: any }) {
  const memberEmpId = String((member as any)?.employee_id || (member as any)?.id || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const memberName = String(member?.full_name || "").toLowerCase().trim();

  const myTrainee = ws.trainees.find((t: any) => {
    if (t.member_id === member?.id) return true;
    const tMember = ws.members.find((m: any) => m.id === t.member_id);
    const tEmpId = String((tMember as any)?.employee_id || t.id || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    if (memberEmpId && tEmpId && (memberEmpId.includes(tEmpId) || tEmpId.includes(memberEmpId))) return true;
    if (tMember && memberName && tMember.full_name.toLowerCase().trim() === memberName) return true;
    return false;
  }) || ws.trainees.find((t: any) => t.id === "t-seed-ci258") || ws.trainees[0];

  const domain = ws.domains.find((d: any) => d.id === myTrainee?.domain_id);
  const mentor = ws.members.find((m: any) => m.id === myTrainee?.mentor_member_id);

  const myCourses = ws.courses.filter((c: any) =>
    !c.domain_id || c.domain_id === myTrainee?.domain_id || c.trainee_id === myTrainee?.id
  );

  const myTasks = ws.tasks.filter((t: any) => {
    if (t.trainee_id) return t.trainee_id === myTrainee?.id;
    return !t.domain_id || t.domain_id === "" || (myTrainee?.domain_id && t.domain_id.split(",").includes(myTrainee.domain_id));
  });

  const completions = ws.courseCompletions.filter((cc: any) =>
    cc.trainee_id === myTrainee?.id || cc.trainee_id === myTrainee?.member_id
  );
  const completedCourseIds = new Set(completions.map((cc: any) => cc.course_id));

  const totalCoursesCount = myCourses.length || 1;
  const finishedCoursesCount = myCourses.filter((c: any) => completedCourseIds.has(c.id)).length;
  const progressPct = Math.round((finishedCoursesCount / totalCoursesCount) * 100);

  const mySubmissions = ws.submissions.filter((s: any) => s.trainee_id === myTrainee?.id);
  const completedTaskIds = new Set(
    mySubmissions
      .filter((s: any) => (s.status === "submitted" || s.status === "reviewed" || s.status === "completed") && myTasks.some((t: any) => t.id === s.task_id))
      .map((s: any) => s.task_id)
  );

  const quizAttempts = ws.attempts.filter((a: any) => a.trainee_id === myTrainee?.id);
  const quizAvg = quizAttempts.length
    ? Math.round(quizAttempts.reduce((s: number, a: any) => s + Number(a.percentage), 0) / quizAttempts.length)
    : 85;

  return (
    <div className="space-y-6">
      {/* Personal Welcome Banner */}
      <div className="rounded-xl border border-border/80 bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Initials name={member?.full_name || "Trainee"} className="size-12 text-sm font-bold shadow-sm" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">{member?.full_name || "Trainee"}</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="size-3" /> On Track
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 flex flex-wrap items-center gap-2">
                <span>ID: <strong>{(member as any)?.employee_id || myTrainee?.id || "CI258"}</strong></span>
                <span>·</span>
                <span>Domain: <strong className="text-primary">{domain?.name || "Data Engineering"}</strong></span>
                <span>·</span>
                <span>Batch 12</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/courses"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
            >
              <BookOpen className="size-3.5" /> Continue My Courses
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Personal KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="My Course Progress" value={`${progressPct}%`} tone="primary" sub={`${finishedCoursesCount} of ${myCourses.length} tracks completed`} />
        <Kpi label="Completed Courses" value={`${finishedCoursesCount} / ${myCourses.length}`} tone="success" sub="Domain curriculum tracks" />
        <Kpi label="Domain Track" value={domain?.name || "Data Engineering"} tone="neutral" sub="Enrolled curriculum" />
        <Kpi label="Assigned Tasks" value={`${completedTaskIds.size} / ${myTasks.length} Done`} tone="neutral" sub="Completed assignments" />
      </div>

      {/* Grid: Active Learning Paths & Assigned Tasks */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: My Allocated Courses & Learning Paths */}
        <div className="lg:col-span-7">
          <Panel
            title="My Allocated Courses & Learning Paths"
            description={`Course tracks assigned to your domain (${domain?.name || "Data Engineering"})`}
            action={
              <Link to="/courses" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                View All Courses <ChevronRight className="size-3" />
              </Link>
            }
          >
            {myCourses.length === 0 ? (
              <EmptyState title="No courses allocated yet" hint="Your domain learning path courses will appear here." />
            ) : (
              <div className="space-y-3">
                {myCourses.map((c: any) => {
                  const isDone = completedCourseIds.has(c.id);
                  return (
                    <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/70 p-3.5 hover:bg-muted/30 transition-colors">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <BookOpen className="size-4 text-primary shrink-0" />
                          <p className="font-bold text-sm text-foreground truncate">{c.title}</p>
                          {isDone ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              ✓ Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                              In Progress
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{c.description}</p>
                      </div>

                      <Link
                        to="/courses/$id"
                        params={{ id: c.id }}
                        className="inline-flex h-8 items-center gap-1 rounded-md bg-muted px-3 text-xs font-bold text-foreground hover:bg-primary hover:text-primary-foreground transition-all shrink-0"
                      >
                        {isDone ? "Review Course" : "Launch Path ➔"}
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>
        </div>

        {/* Right Column: My Assigned Tasks & Mentor Support */}
        <div className="lg:col-span-5 space-y-6">
          {/* Assigned Tasks Card */}
          <Panel
            title="My Assigned Tasks & Assessments"
            description="Work items assigned by Admin & Mentor"
            action={
              <Link to="/tasks" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                Open Task Board <ChevronRight className="size-3" />
              </Link>
            }
          >
            {myTasks.length === 0 ? (
              <EmptyState title="No open tasks" hint="You are all caught up on your assignments!" />
            ) : (
              <div className="max-h-[380px] overflow-y-auto pr-1 space-y-2.5">
                {myTasks.map((t: any) => {
                  const isSubmitted = completedTaskIds.has(t.id);
                  return (
                    <div key={t.id} className="flex items-center justify-between gap-2 rounded-lg border border-border/60 p-3 bg-muted/20">
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-foreground truncate">{t.title}</p>
                        <p className="text-[11px] text-muted-foreground capitalize mt-0.5">
                          {t.kind} · {t.priority} priority
                        </p>
                      </div>

                      {isSubmitted ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                          ✓ Submitted
                        </span>
                      ) : (
                        <Link
                          to="/tasks"
                          className="inline-flex h-7 items-center gap-1 rounded bg-primary px-2.5 text-[11px] font-bold text-primary-foreground hover:bg-primary/90 shrink-0"
                        >
                          Submit Work
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>

          {/* Mentor & Buddy Support Card */}
          <Panel title="My Mentor & Buddy Support" description="Direct guidance & 1-on-1 feedback">
            <div className="flex items-center gap-3.5 rounded-lg border border-border/80 bg-muted/30 p-3.5">
              <Initials name={mentor?.full_name || "Mentor"} className="size-10 text-xs font-bold shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm text-foreground">{mentor?.full_name || "Assigned Mentor & Buddy"}</p>
                <p className="text-xs text-muted-foreground">{mentor?.title || "Senior Technical Mentor & Peer Buddy"}</p>
                <p className="text-[11px] text-primary font-medium mt-0.5">{mentor?.email || "mentor@agilisium.com"}</p>
              </div>

              <Link
                to="/meetups"
                className="inline-flex h-8 items-center gap-1 rounded-md bg-primary/10 text-primary border border-primary/20 px-2.5 text-xs font-bold hover:bg-primary hover:text-primary-foreground transition-all shrink-0"
              >
                <CalendarClock className="size-3.5" /> Schedule 📅
              </Link>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function DashboardPage() {
  const { data: ws, isLoading } = useWorkspace();
  const { role, member } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const trainees = useMemo(() => {
    if (!ws) return [];
    return visibleTrainees(ws, role, member?.id);
  }, [ws, role, member]);

  const filteredTrainees = useMemo(() => {
    return trainees.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          t.name.toLowerCase().includes(q) ||
          (t.employeeId && t.employeeId.toLowerCase().includes(q)) ||
          t.domainName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [trainees, statusFilter, search]);

  if (isLoading || !ws || !mounted) return <SkeletonPage />;

  // Render Trainee Personal Dashboard if logged in user is a Trainee!
  if (role === "trainee") {
    return <TraineePersonalDashboardView ws={ws} member={member} />;
  }

  // Otherwise render Cohort Analytics Dashboard for Admin, Mentor, Buddy!
  const totalTrainees = trainees.length;
  const onTrackCount = trainees.filter((t) => t.status === "on_track").length;
  const atRiskCount = trainees.filter((t) => t.status === "at_risk").length;
  const behindCount = trainees.filter((t) => t.status === "behind").length;

  const avgProgress = totalTrainees > 0
    ? Math.round(trainees.reduce((acc, t) => acc + t.progress, 0) / totalTrainees)
    : 0;

  const domains = ws.domains || [];

  const domainChartData = domains.map((d) => {
    const domTrainees = trainees.filter((t) => t.domainId === d.id);
    const domAvgProg = domTrainees.length > 0
      ? Math.round(domTrainees.reduce((sum, t) => sum + t.progress, 0) / domTrainees.length)
      : 0;
    const domAvgQuiz = domTrainees.length > 0
      ? Math.round(domTrainees.reduce((sum, t) => sum + t.quizAvg, 0) / domTrainees.length)
      : 0;

    return {
      name: d.name,
      progress: domAvgProg,
      quiz: domAvgQuiz,
      count: domTrainees.length,
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Learning Intelligence Dashboard"
        description={
          role === "mentor" || role === "buddy"
            ? `Overview of your assigned trainees (${totalTrainees}), pending task submissions, and learning milestones.`
            : `Comprehensive bootcamp analytics for Batch 12 across ${domains.length} domains and ${totalTrainees} trainees.`
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            {ws && (
              <button
                onClick={() => exportOverviewDashboard(ws)}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 text-xs font-bold text-white hover:bg-emerald-700 transition-all shadow-sm"
              >
                <Download className="size-3.5" /> Export Overview Excel
              </button>
            )}
            <Link
              to="/reports"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-input bg-background px-3 text-xs font-semibold hover:bg-muted transition-colors shadow-sm"
            >
              <FileSpreadsheet className="size-3.5 text-primary" /> Reports & Analytics
            </Link>
            {role === "admin" && (
              <Link
                to="/bootcamps"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
              >
                <Shield className="size-3.5" /> Manage Batches
              </Link>
            )}
          </div>
        }
      />

      {/* Primary KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Active Trainees" value={totalTrainees} sub="Assigned cohort" />
        <Kpi label="Average Progress" value={`${avgProgress}%`} tone="primary" sub="Course completion" />
        <Kpi label="On Track" value={onTrackCount} tone="success" sub={`${Math.round((onTrackCount / (totalTrainees || 1)) * 100)}% of cohort`} />
        <Kpi label="Attention Needed" value={atRiskCount + behindCount} tone={atRiskCount + behindCount > 0 ? "warning" : "neutral"} sub={`${atRiskCount} at risk · ${behindCount} behind`} />
      </div>

      {/* Visual Analytics Grid: Batch Health Donut Chart & Domain Performance Bar Chart */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Pie / Donut Chart Card: Overall Batch Health */}
        <div className="lg:col-span-5">
          <Panel
            title="Overall Batch Health Distribution"
            description="Live status breakdown of trainees in Batch 12"
          >
            <BatchHealthDonutChart
              onTrack={onTrackCount}
              atRisk={atRiskCount}
              behind={behindCount}
              total={totalTrainees}
            />
          </Panel>
        </div>

        {/* Bar Chart Card: Domain Progress Comparison */}
        <div className="lg:col-span-7">
          <Panel
            title="Domain Progress & Quiz Average Comparison"
            description="Comparing course progress % and quiz averages across domains"
          >
            <DomainPerformanceBarChart domains={domainChartData} />
          </Panel>
        </div>
      </div>

      {/* Domain Cards Row */}
      <div className="grid gap-4 md:grid-cols-3">
        {domains
          .filter((d) => {
            if (role === "admin") return true;
            return trainees.some((t) => t.domainId === d.id);
          })
          .map((d) => {
          const domainTrainees = trainees.filter((t) => t.domainId === d.id);
          const domAvg = domainTrainees.length > 0
            ? Math.round(domainTrainees.reduce((acc, t) => acc + t.progress, 0) / domainTrainees.length)
            : 0;
          const domOnTrack = domainTrainees.filter((t) => t.status === "on_track").length;
          const domCourses = ws.courses.filter((c) => c.domain_id === d.id).length;

          return (
            <Panel key={d.id} title={d.name} description={`${domainTrainees.length} trainees · ${domCourses} courses`}>
              <div className="mt-2 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-muted-foreground">Domain Progress</span>
                  <span className="text-foreground">{domAvg}%</span>
                </div>
                <Meter value={domAvg} className="h-2" />

                <div className="mt-4 flex items-center justify-between text-xs pt-2 border-t border-border/60">
                  <span className="text-muted-foreground">Status Health</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {domOnTrack} / {domainTrainees.length} On Track
                  </span>
                </div>

                <div className="mt-2 pt-1 flex justify-end">
                  <Link
                    to="/trainees"
                    search={{ domain: d.id }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    View Domain Trainees <ChevronRight className="size-3" />
                  </Link>
                </div>
              </div>
            </Panel>
          );
        })}
      </div>

      {/* Main Trainees Monitoring Panel */}
      <Panel
        title="Cohort Trainee Performance & Health"
        description="Real-time tracking of modules, task completion, and mentor assignments."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search name, ID, domain..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-44 rounded-lg border border-input bg-background pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-8 rounded-lg border border-input bg-background px-2 text-xs font-semibold"
            >
              <option value="all">All Statuses</option>
              <option value="on_track">On Track</option>
              <option value="at_risk">At Risk</option>
              <option value="behind">Behind</option>
            </select>
          </div>
        }
      >
        {filteredTrainees.length === 0 ? (
          <EmptyState title="No trainees found" hint="Try adjusting your search query or status filter." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/80 text-muted-foreground uppercase text-[10px] tracking-wider bg-muted/30">
                  <th className="py-2.5 px-3">Trainee</th>
                  <th className="py-2.5 px-3">Domain</th>
                  <th className="py-2.5 px-3">Health Status</th>
                  <th className="py-2.5 px-3">Course Progress</th>
                  <th className="py-2.5 px-3">Quiz Avg</th>
                  <th className="py-2.5 px-3">Mentor / Buddy</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 font-medium">
                {filteredTrainees.map((t) => (
                  <tr key={t.traineeId} className="hover:bg-muted/40 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <Initials name={t.name} className="size-7 text-[10px] shrink-0" />
                        <div>
                          <p className="font-bold text-foreground hover:text-primary leading-tight">{t.name}</p>
                          <p className="text-[10px] text-muted-foreground">{t.employeeId || "Trainee"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary border border-primary/20">
                        {t.domainName}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusPill status={t.status} />
                    </td>
                    <td className="py-2.5 px-3 w-40">
                      <div className="flex items-center gap-2">
                        <Meter value={t.progress} className="h-1.5 w-20" />
                        <span className="font-bold text-foreground">{t.progress}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-semibold">
                      {t.quizAvg > 0 ? `${t.quizAvg}%` : "N/A"}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-muted-foreground">
                      <p><strong className="text-foreground">M:</strong> {t.mentorName || "Unassigned"}</p>
                      <p><strong className="text-foreground">B:</strong> {t.buddyName || "Unassigned"}</p>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Link
                        to="/trainees"
                        search={{ q: t.name }}
                        className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[11px] font-bold text-foreground hover:bg-primary hover:text-primary-foreground transition-all"
                      >
                        View Profile <ArrowUpRight className="size-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
