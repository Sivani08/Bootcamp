import type { Workspace } from "./data";

export type Status = "on_track" | "at_risk" | "behind";

export interface TraineeMetrics {
  traineeId: string;
  memberId: string;
  name: string;
  email: string;
  employeeId?: string | null;
  batchName: string;
  domainName: string;
  batchId: string;
  domainId: string;
  mentorName: string;
  buddyName: string;
  mentorId: string | null;
  buddyId: string | null;
  modulesCompleted: number;
  modulesTotal: number;
  progress: number;
  quizAvg: number;
  assignmentAvg: number;
  codingAccuracy: number;
  taskCompletion: number;
  tasksCompleted: number;
  tasksPending: number;
  learningHours: number;
  streak: number;
  longestStreak: number;
  consistency: number;
  health: number;
  status: Status;
  statusReason: string;
  strongTopics: string[];
  weakTopics: string[];
  mentorMeetups: number;
  buddyMeetups: number;
  lastActive: string | null;
  currentCourse: string | null;
  recommendations: { action: string; topic: string; reason: string }[];
  prediction: string;
}

const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 100) : 0);
export const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

function statusFrom(health: number): Status {
  if (health >= 70) return "on_track";
  if (health >= 50) return "at_risk";
  return "behind";
}

export function statusLabel(s: Status) {
  return s === "on_track" ? "On Track" : s === "at_risk" ? "At Risk" : "Behind";
}

function daysAgo(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

export function computeMetrics(ws: Workspace, traineeId: string): TraineeMetrics | null {
  const t = ws.trainees.find((x) => x.id === traineeId);
  if (!t) return null;
  const member = ws.members.find((m) => m.id === t.member_id);
  const batch = ws.batches.find((b) => b.id === t.batch_id);
  const domain = ws.domains.find((d) => d.id === t.domain_id);
  const mentor = ws.members.find((m) => m.id === t.mentor_member_id);
  const buddy = ws.members.find((m) => m.id === t.buddy_member_id);

  const courses = ws.courses.filter((c) => c.domain_id === t.domain_id || c.domain_id === "all_domains" || c.domain_id === "all").sort((a, b) => a.order_index - b.order_index);
  const courseIds = new Set(courses.map((c) => c.id));
  const modules = ws.modules.filter((m) => courseIds.has(m.course_id));
  const progress = ws.progress.filter((p) => p.trainee_id === traineeId);
  const doneModuleIds = new Set(progress.map((p) => p.module_id));

  const completedCourseIds = new Set(
    (ws.courseCompletions || [])
      .filter((cc) => cc.trainee_id === traineeId || cc.trainee_id === t.member_id)
      .map((cc) => cc.course_id)
  );
  const completedCoursesCount = courses.filter((c) => completedCourseIds.has(c.id)).length;

  const modulesCompleted = modules.length
    ? modules.filter((m) => doneModuleIds.has(m.id)).length
    : completedCoursesCount;

  const attempts = ws.attempts.filter((a) => a.trainee_id === traineeId);
  const quizAvg = attempts.length
    ? Math.round(attempts.reduce((s, a) => s + Number(a.percentage), 0) / attempts.length)
    : 0;

  const tasks = ws.tasks.filter((x) => x.domain_id === t.domain_id || x.trainee_id === traineeId);
  const subs = ws.submissions.filter((s) => s.trainee_id === traineeId);
  const doneSubs = subs.filter((s) => s.status === "completed" || s.status === "reviewed" || s.status === "submitted");
  const assignmentTaskIds = new Set(tasks.filter((x) => x.kind === "assignment").map((x) => x.id));
  const assignmentScores = doneSubs.filter((s) => assignmentTaskIds.has(s.task_id) && s.score != null);
  const assignmentAvg = assignmentScores.length
    ? Math.round(assignmentScores.reduce((s, x) => s + Number(x.score), 0) / assignmentScores.length)
    : 0;

  const codeAttempts = ws.codingAttempts.filter((a) => a.trainee_id === traineeId);
  const codingAccuracy = pct(codeAttempts.filter((a) => a.passed).length, codeAttempts.length);

  const taskCompletion = pct(doneSubs.length, tasks.length);
  const activity = ws.activity.filter((a) => a.trainee_id === traineeId);
  const activityMinutes = activity.reduce((s, a) => s + a.minutes, 0);
  const moduleMinutes = progress.reduce((s, p) => s + p.minutes, 0);
  const learningHours = Math.round(((activityMinutes + moduleMinutes) / 60) * 10) / 10;

  const activeDays = new Set(activity.filter((a) => daysAgo(a.created_at) <= 13).map((a) => a.created_at.slice(0, 10)));
  const consistency = pct(activeDays.size, 14);

  const progressPct = modules.length > 0
    ? pct(modulesCompleted, modules.length)
    : courses.length > 0
    ? Math.round((completedCoursesCount / courses.length) * 100)
    : 0;
  const health = clamp(
    progressPct * 0.25 +
      quizAvg * 0.2 +
      assignmentAvg * 0.15 +
      codingAccuracy * 0.15 +
      taskCompletion * 0.15 +
      consistency * 0.1,
  );
  const status = statusFrom(health);

  // topic strengths from quizzes + coding
  const topicScore = new Map<string, { hit: number; n: number }>();
  for (const a of attempts) {
    const quiz = ws.quizzes.find((q) => q.id === a.quiz_id);
    const topic = quiz?.topic ?? quiz?.title ?? "General";
    const prev = topicScore.get(topic) ?? { hit: 0, n: 0 };
    topicScore.set(topic, { hit: prev.hit + Number(a.percentage), n: prev.n + 1 });
  }
  for (const a of codeAttempts) {
    const p = ws.problems.find((x) => x.id === a.problem_id);
    const topic = p?.topic ?? "Coding";
    const prev = topicScore.get(topic) ?? { hit: 0, n: 0 };
    topicScore.set(topic, { hit: prev.hit + (a.passed ? 100 : 0), n: prev.n + 1 });
  }
  const ranked = [...topicScore.entries()]
    .map(([topic, v]) => ({ topic, score: Math.round(v.hit / v.n) }))
    .sort((a, b) => b.score - a.score);
  const strongTopics = ranked.filter((r) => r.score >= 70).slice(0, 3).map((r) => r.topic);
  const weakTopics = ranked.filter((r) => r.score < 70).slice(-3).map((r) => r.topic);

  const meetings = ws.meetings.filter((m) => m.trainee_id === traineeId && m.status === "completed");
  const currentCourse =
    courses.find((c) => {
      const mods = modules.filter((m) => m.course_id === c.id);
      return mods.some((m) => !doneModuleIds.has(m.id));
    })?.title ?? null;

  const reasons: string[] = [];
  if (progressPct < 50) reasons.push(`course progress is ${progressPct}%`);
  if (quizAvg < 60 && attempts.length) reasons.push(`quiz average is ${quizAvg}%`);
  if (codingAccuracy < 60 && codeAttempts.length) reasons.push(`coding accuracy is ${codingAccuracy}%`);
  if (consistency < 50) reasons.push(`active on only ${activeDays.size} of the last 14 days`);
  if (taskCompletion < 50) reasons.push(`${tasks.length - doneSubs.length} assigned items are still open`);
  const statusReason =
    status === "on_track"
      ? `Steady progress: ${progressPct}% course completion, ${quizAvg}% quiz average and activity on ${activeDays.size} of the last 14 days.`
      : `Flagged because ${reasons.slice(0, 3).join(", ")}.`;

  const recommendations = ranked
    .filter((r) => r.score < 75)
    .slice(-3)
    .map((r) => ({
      action: r.score < 50 ? "Practice" : "Revisit",
      topic: r.topic,
      reason: `Measured accuracy is ${r.score}% across ${topicScore.get(r.topic)?.n ?? 0} recorded attempts.`,
    }));

  const remaining = modules.length - modulesCompleted;
  const perDay = activeDays.size ? progress.length / Math.max(1, activeDays.size) : 0;
  const prediction =
    remaining === 0
      ? "All modules in this track are complete."
      : perDay > 0
        ? `At the current pace of ${perDay.toFixed(1)} modules per active day, ${remaining} remaining modules take about ${Math.ceil(remaining / perDay)} active days.`
        : "No recent learning activity recorded, so no completion pace can be measured yet.";

  return {
    traineeId,
    memberId: t.member_id,
    name: member?.full_name ?? "Unknown",
    email: member?.email ?? "",
    employeeId: (member as any)?.employee_id || (t as any)?.employee_id || null,
    batchName: batch?.name ?? "—",
    domainName: domain?.name ?? "—",
    batchId: t.batch_id,
    domainId: t.domain_id,
    mentorName: mentor?.full_name ?? "Unassigned",
    buddyName: buddy?.full_name ?? "Unassigned",
    mentorId: t.mentor_member_id,
    buddyId: t.buddy_member_id,
    modulesCompleted,
    modulesTotal: modules.length || courses.length || 1,
    progress: progressPct,
    quizAvg,
    assignmentAvg,
    codingAccuracy,
    taskCompletion,
    tasksCompleted: doneSubs.length,
    tasksPending: Math.max(0, tasks.length - doneSubs.length),
    learningHours,
    streak: t.streak_days,
    longestStreak: t.longest_streak,
    consistency,
    health,
    status,
    statusReason,
    strongTopics,
    weakTopics,
    mentorMeetups: meetings.filter((m) => m.kind === "mentor").length,
    buddyMeetups: meetings.filter((m) => m.kind === "buddy").length,
    lastActive: t.last_active_at,
    currentCourse,
    recommendations,
    prediction,
  };
}

export function allMetrics(ws: Workspace): TraineeMetrics[] {
  return ws.trainees
    .map((t) => computeMetrics(ws, t.id))
    .filter((x): x is TraineeMetrics => Boolean(x))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export interface Summary {
  total: number;
  activeToday: number;
  batches: number;
  domains: number;
  avgProgress: number;
  avgQuiz: number;
  avgAssignment: number;
  avgCoding: number;
  avgHours: number;
  onTrack: number;
  atRisk: number;
  behind: number;
}

const avg = (arr: number[]) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0);

export function summarize(ws: Workspace, rows: TraineeMetrics[]): Summary {
  const today = new Date().toISOString().slice(0, 10);
  const activeToday = new Set(
    ws.activity.filter((a) => a.created_at.slice(0, 10) === today).map((a) => a.trainee_id),
  );
  return {
    total: rows.length,
    activeToday: rows.filter((r) => activeToday.has(r.traineeId)).length,
    batches: new Set(rows.map((r) => r.batchId)).size,
    domains: new Set(rows.map((r) => r.domainId)).size,
    avgProgress: avg(rows.map((r) => r.progress)),
    avgQuiz: avg(rows.map((r) => r.quizAvg)),
    avgAssignment: avg(rows.map((r) => r.assignmentAvg)),
    avgCoding: avg(rows.map((r) => r.codingAccuracy)),
    avgHours: avg(rows.map((r) => r.learningHours)),
    onTrack: rows.filter((r) => r.status === "on_track").length,
    atRisk: rows.filter((r) => r.status === "at_risk").length,
    behind: rows.filter((r) => r.status === "behind").length,
  };
}

export function weeklyActivity(ws: Workspace, traineeIds: Set<string>) {
  const out: { day: string; minutes: number; sessions: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000);
    const key = d.toISOString().slice(0, 10);
    const rows = ws.activity.filter((a) => traineeIds.has(a.trainee_id) && a.created_at.slice(0, 10) === key);
    out.push({
      day: d.toLocaleDateString(undefined, { day: "2-digit", month: "short" }),
      minutes: rows.reduce((s, a) => s + a.minutes, 0),
      sessions: rows.length,
    });
  }
  return out;
}

export function quizTrend(ws: Workspace, traineeIds: Set<string>) {
  const rows = ws.attempts
    .filter((a) => traineeIds.has(a.trainee_id))
    .slice()
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  const buckets = new Map<string, number[]>();
  for (const r of rows) {
    const key = r.created_at.slice(0, 10);
    buckets.set(key, [...(buckets.get(key) ?? []), Number(r.percentage)]);
  }
  return [...buckets.entries()].slice(-10).map(([day, vals]) => ({
    day: new Date(day).toLocaleDateString(undefined, { day: "2-digit", month: "short" }),
    score: avg(vals),
  }));
}
