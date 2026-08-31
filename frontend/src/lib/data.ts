import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ensureInitialTrainees, COMMON_14_DAYS_ASSESSMENTS, SEED_MODULES, INITIAL_SAMPLE_QUIZZES, INITIAL_SAMPLE_QUESTIONS, INITIAL_SAMPLE_PROBLEMS, MONALISA_ASSESSMENT_SUBMISSIONS, SANDHIYA_ASSESSMENT_SUBMISSIONS, SRINITHI_ASSESSMENT_SUBMISSIONS, ANANYA_ASSESSMENT_SUBMISSIONS, JAYASHREE_ASSESSMENT_SUBMISSIONS, PRIYATHARSHINI_ASSESSMENT_SUBMISSIONS, BHUVANA_ASSESSMENT_SUBMISSIONS, LINGESH_ASSESSMENT_SUBMISSIONS, LAKSHAN_ASSESSMENT_SUBMISSIONS, YAVVNA_ASSESSMENT_SUBMISSIONS, ARUNA_ASSESSMENT_SUBMISSIONS, SHANDRAKALA_ASSESSMENT_SUBMISSIONS, JAGAN_ASSESSMENT_SUBMISSIONS, JEYAKRISHNAN_ASSESSMENT_SUBMISSIONS, SIVAKUMAR_ASSESSMENT_SUBMISSIONS, KARTHICK_ASSESSMENT_SUBMISSIONS, KARTHIK_THIYAGARAJAN_ASSESSMENT_SUBMISSIONS, NITHISH_BALAJI_ASSESSMENT_SUBMISSIONS, LAKSHMI_KULLAYAMMA_ASSESSMENT_SUBMISSIONS, AKANKSHA_SREE_ASSESSMENT_SUBMISSIONS, AJAY_KUMAR_ASSESSMENT_SUBMISSIONS, BHANU_VARDHANREDDY_ASSESSMENT_SUBMISSIONS, SANJAY_ASSESSMENT_SUBMISSIONS, JANARTHANAN_ASSESSMENT_SUBMISSIONS, SHIVA_PRASHANTH_ASSESSMENT_SUBMISSIONS, JEEVANANTHAM_ASSESSMENT_SUBMISSIONS, SIVANI_ASSESSMENT_SUBMISSIONS, INITIAL_SAMPLE_MEETINGS } from "./seed-trainees";
import type { ScorecardRow } from "./scorecard";
export type { ScorecardRow };

export interface Bootcamp { id: string; name: string; description: string | null; starts_on: string | null; ends_on: string | null }
export interface Batch { id: string; bootcamp_id: string; name: string }
export interface Domain { id: string; batch_id: string; name: string; color: string | null }
export interface Member { id: string; user_id: string | null; full_name: string; email: string; role: "admin" | "mentor" | "buddy" | "trainee"; title: string | null }
export interface Trainee {
  id: string; member_id: string; batch_id: string; domain_id: string;
  mentor_member_id: string | null; buddy_member_id: string | null;
  learning_hours: number; streak_days: number; longest_streak: number; last_active_at: string | null;
}
export interface Course { id: string; domain_id: string; title: string; description: string | null; order_index: number; estimated_hours: number | null; trainee_id?: string | null; created_by_member_id?: string | null }
export interface Module { id: string; course_id: string; title: string; kind: string; content: string | null; duration_min: number; order_index: number }
export interface Task {
  id: string; title: string; description: string | null; kind: string; course_id: string | null; module_id: string | null;
  domain_id: string | null; batch_id: string | null; trainee_id: string | null; priority: string; submission_type: string; due_at: string | null;
  created_by_member_id?: string | null;
}
export interface Quiz { id: string; title: string; course_id: string | null; domain_id: string | null; topic: string | null; duration_min: number; due_at: string | null }
export interface QuizQuestion { id: string; quiz_id: string; prompt: string; options: string[]; correct_index: number; marks: number; topic: string | null; order_index: number }
export interface CodingProblem { id: string; domain_id: string | null; title: string; difficulty: string; topic: string | null; prompt: string; starter_code: string | null; expected_output: string | null }
export interface ModuleProgress { id: string; trainee_id: string; module_id: string; status: string; minutes: number; completed_at: string | null }
export interface TaskSubmission { id: string; task_id: string; trainee_id: string; status: string; content: string | null; score: number | null; submitted_at: string | null; updated_at: string }
export interface QuizAttempt { id: string; quiz_id: string; trainee_id: string; score: number; total: number; percentage: number; created_at: string }
export interface CodingAttempt { id: string; problem_id: string; trainee_id: string; code: string | null; passed: boolean; created_at: string }
export interface ActivityLog { id: string; trainee_id: string; type: string; description: string; minutes: number; created_at: string }
export interface Meeting { id: string; trainee_id: string; with_member_id: string; kind: "mentor" | "buddy"; requested_for: string; reason: string | null; message: string | null; response_note: string | null; status: string; created_at: string }
export interface Feedback { id: string; trainee_id: string; from_member_id: string; kind: string; category: string; rating: number; comments: string | null; created_at: string }
export interface Idea { id: string; trainee_id: string; title: string; category: string; description: string; status: string; admin_response: string | null; created_at: string }
export interface Notification { id: string; member_id: string; title: string; body: string | null; category: string; read: boolean; created_at: string }
export interface CourseCompletion { id: string; course_id: string; trainee_id: string; status: string; completed_at: string }

export interface Workspace {
  bootcamps: Bootcamp[]; batches: Batch[]; domains: Domain[]; members: Member[]; trainees: Trainee[];
  courses: Course[]; modules: Module[]; tasks: Task[]; quizzes: Quiz[]; questions: QuizQuestion[];
  problems: CodingProblem[]; progress: ModuleProgress[]; submissions: TaskSubmission[];
  attempts: QuizAttempt[]; codingAttempts: CodingAttempt[]; activity: ActivityLog[];
  meetings: Meeting[]; feedback: Feedback[]; ideas: Idea[]; notifications: Notification[];
  scorecards: ScorecardRow[]; courseCompletions: CourseCompletion[];
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const db = supabase as any;

async function all<T>(table: string, columns = "*", order?: string): Promise<T[]> {
  try {
    let q = db.from(table).select(columns).limit(5000);
    if (order) q = q.order(order, { ascending: false });
    const { data, error } = await q;
    if (error) {
      console.warn(`Query table '${table}' notice:`, error.message);
      return [];
    }
    return (data ?? []) as T[];
  } catch (err) {
    console.warn(`Query table '${table}' exception:`, err);
    return [];
  }
}

export const initialSampleNotifications: Notification[] = [
  {
    id: "notif-seed-task-1",
    member_id: "all",
    title: "Task Due Reminder: PySpark Data Pipeline Implementation",
    body: "Task assignment due by tomorrow 5:00 PM. Please push code to repository.",
    category: "task",
    read: false,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "notif-seed-assessment-1",
    member_id: "all",
    title: "Assessment Reminder: SQL & Data Warehousing Quiz",
    body: "Batch 12 assessment quiz is active. Complete 15 multiple-choice questions.",
    category: "assessment",
    read: false,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: "notif-seed-course-1",
    member_id: "all",
    title: "Course Reminder: Advanced PySpark & Data Engineering Module",
    body: "Next module in Data Engineering Learning Path unlocked. Estimated 4 hours.",
    category: "course",
    read: false,
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: "notif-seed-mentor-1",
    member_id: "all",
    title: "Mentor Connect Reminder: 1-on-1 Code Review Session",
    body: "Scheduled 1-on-1 Mentor Connect session today at 3:00 PM.",
    category: "connect",
    read: false,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: "notif-seed-buddy-1",
    member_id: "all",
    title: "Buddy Connect Reminder: Daily Standup & Doubts Sync",
    body: "Daily Buddy Connect meeting scheduled today at 4:30 PM.",
    category: "connect",
    read: false,
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
];

export function getFallbackWorkspace(): Workspace {
  const readLocal = <T>(key: string): T[] => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
  };
  const localMembers = readLocal<Member>("bootmind_local_members");
  const localTrainees = readLocal<Trainee>("bootmind_local_trainees");
  const localBatches = readLocal<Batch>("bootmind_local_batches");
  const localCourses = readLocal<Course>("bootmind_local_courses");
  const localFeedback = readLocal<Feedback>("bootmind_local_feedback");
  const localIdeas = readLocal<Idea>("bootmind_local_ideas");
  const localTasks = readLocal<Task>("bootmind_local_tasks");
  const localSubmissions = readLocal<TaskSubmission>("bootmind_local_submissions");
  const localProblems = readLocal<CodingProblem>("bootmind_local_problems");
  const localQuizzes = readLocal<Quiz>("bootmind_local_quizzes");
  const localActivity = readLocal<ActivityLog>("bootmind_local_activity");
  const localNotifications = readLocal<Notification>("bootmind_local_notifications");
  const localCompletions = readLocal<CourseCompletion>("bootmind_local_course_completions");

  const guaranteed = ensureInitialTrainees(localMembers, localTrainees, [], localBatches);

  const initialSampleFeedback: Feedback[] = guaranteed.trainees.slice(0, 5).map((t, idx) => ({
    id: `fb-seed-${t.id}`,
    trainee_id: t.id,
    from_member_id: guaranteed.members.find((m) => m.role === "admin")?.id || "admin-member",
    kind: idx % 2 === 0 ? "mentor" : "buddy",
    category: idx % 2 === 0 ? "Technical skills" : "Consistency",
    rating: 4 + (idx % 2),
    comments: idx % 2 === 0 ? "Consistently delivers quality code and active participation in domain tasks." : "Good progress on daily learning hours and proactive communication.",
    created_at: new Date(Date.now() - 86400000 * (idx + 1)).toISOString(),
  }));


  const deletedNotifIds = new Set<string>();
  if (typeof window !== "undefined") {
    try {
      const list: string[] = JSON.parse(localStorage.getItem("bootmind_deleted_notifications") || "[]");
      list.forEach((id) => deletedNotifIds.add(id));
    } catch {}
  }

  const deletedFbIds = new Set<string>();
  if (typeof window !== "undefined") {
    try {
      const list: string[] = JSON.parse(localStorage.getItem("bootmind_deleted_feedback") || "[]");
      list.forEach((id) => deletedFbIds.add(id));
    } catch {}
  }

  const deletedIdeaIds = new Set<string>();
  if (typeof window !== "undefined") {
    try {
      const list: string[] = JSON.parse(localStorage.getItem("bootmind_deleted_ideas") || "[]");
      list.forEach((id) => deletedIdeaIds.add(id));
    } catch {}
  }

  const rawNotifications = localNotifications.length > 0 ? localNotifications : initialSampleNotifications;
  const mergedNotifications = rawNotifications.filter((n) => n && !deletedNotifIds.has(n.id));

  const rawFeedback = localFeedback.length > 0 ? localFeedback : initialSampleFeedback;
  const mergedFeedback = rawFeedback.filter((f) => f && !deletedFbIds.has(f.id));

  const mergedIdeas = localIdeas.filter((i) => i && !deletedIdeaIds.has(i.id));

  const localMeetings = readLocal<Meeting>("bootmind_local_meetings");
  const mergedMeetings = [...INITIAL_SAMPLE_MEETINGS, ...localMeetings.filter((l) => !INITIAL_SAMPLE_MEETINGS.some((sm) => sm.id === l.id))];
  const localModules = readLocal<Module>("bootmind_local_modules");
  const localProgress = readLocal<ModuleProgress>("bootmind_local_progress");

  const deletedCourseIds = new Set<string>();
  if (typeof window !== "undefined") {
    try {
      const list: string[] = JSON.parse(localStorage.getItem("bootmind_deleted_courses") || "[]");
      list.forEach((id) => deletedCourseIds.add(id));
    } catch {}
  }

  const fallbackCourses = [...localCourses, ...(guaranteed.seedCourses || []).filter((sc) => !localCourses.some((c) => c.id === sc.id))].filter((c) => c && !deletedCourseIds.has(c.id));
  const fallbackModules = [...localModules, ...SEED_MODULES.filter((sm) => !localModules.some((m) => m.id === sm.id))];
  const fallbackQuizzes = [...localQuizzes, ...INITIAL_SAMPLE_QUIZZES.filter((sq) => !localQuizzes.some((q) => q.id === sq.id))];
  const fallbackProblems = [...localProblems, ...INITIAL_SAMPLE_PROBLEMS.filter((sp) => !localProblems.some((p) => p.id === sp.id))];

  return {
    bootcamps: [{ id: "bc1", name: "Enterprise Bootcamp", description: "Batch 12 Training", starts_on: null, ends_on: null }],
    batches: guaranteed.batches,
    domains: guaranteed.domains,
    members: guaranteed.members,
    trainees: guaranteed.trainees,
    courses: fallbackCourses,
    modules: fallbackModules,
    tasks: [...COMMON_14_DAYS_ASSESSMENTS, ...localTasks.filter((lt) => !COMMON_14_DAYS_ASSESSMENTS.some((c) => c.id === lt.id))],
    quizzes: fallbackQuizzes,
    questions: INITIAL_SAMPLE_QUESTIONS,
    problems: fallbackProblems,
    progress: localProgress,
    submissions: [
      ...MONALISA_ASSESSMENT_SUBMISSIONS,
      ...SANDHIYA_ASSESSMENT_SUBMISSIONS,
      ...SRINITHI_ASSESSMENT_SUBMISSIONS,
      ...ANANYA_ASSESSMENT_SUBMISSIONS,
      ...JAYASHREE_ASSESSMENT_SUBMISSIONS,
      ...PRIYATHARSHINI_ASSESSMENT_SUBMISSIONS,
      ...BHUVANA_ASSESSMENT_SUBMISSIONS,
      ...LINGESH_ASSESSMENT_SUBMISSIONS,
      ...LAKSHAN_ASSESSMENT_SUBMISSIONS,
      ...YAVVNA_ASSESSMENT_SUBMISSIONS,
      ...ARUNA_ASSESSMENT_SUBMISSIONS,
      ...SHANDRAKALA_ASSESSMENT_SUBMISSIONS,
      ...JAGAN_ASSESSMENT_SUBMISSIONS,
      ...JEYAKRISHNAN_ASSESSMENT_SUBMISSIONS,
      ...SIVAKUMAR_ASSESSMENT_SUBMISSIONS,
      ...KARTHICK_ASSESSMENT_SUBMISSIONS,
      ...KARTHIK_THIYAGARAJAN_ASSESSMENT_SUBMISSIONS,
      ...NITHISH_BALAJI_ASSESSMENT_SUBMISSIONS,
      ...LAKSHMI_KULLAYAMMA_ASSESSMENT_SUBMISSIONS,
      ...AKANKSHA_SREE_ASSESSMENT_SUBMISSIONS,
      ...AJAY_KUMAR_ASSESSMENT_SUBMISSIONS,
      ...BHANU_VARDHANREDDY_ASSESSMENT_SUBMISSIONS,
      ...SANJAY_ASSESSMENT_SUBMISSIONS,
      ...JANARTHANAN_ASSESSMENT_SUBMISSIONS,
      ...SHIVA_PRASHANTH_ASSESSMENT_SUBMISSIONS,
      ...JEEVANANTHAM_ASSESSMENT_SUBMISSIONS,
      ...SIVANI_ASSESSMENT_SUBMISSIONS,
      ...localSubmissions.filter(
        (ls) =>
          !MONALISA_ASSESSMENT_SUBMISSIONS.some((m) => m.id === ls.id) &&
          !SANDHIYA_ASSESSMENT_SUBMISSIONS.some((s) => s.id === ls.id) &&
          !SRINITHI_ASSESSMENT_SUBMISSIONS.some((s) => s.id === ls.id) &&
          !ANANYA_ASSESSMENT_SUBMISSIONS.some((a) => a.id === ls.id) &&
          !JAYASHREE_ASSESSMENT_SUBMISSIONS.some((j) => j.id === ls.id) &&
          !PRIYATHARSHINI_ASSESSMENT_SUBMISSIONS.some((p) => p.id === ls.id) &&
          !BHUVANA_ASSESSMENT_SUBMISSIONS.some((b) => b.id === ls.id) &&
          !LINGESH_ASSESSMENT_SUBMISSIONS.some((l) => l.id === ls.id) &&
          !LAKSHAN_ASSESSMENT_SUBMISSIONS.some((lk) => lk.id === ls.id) &&
          !YAVVNA_ASSESSMENT_SUBMISSIONS.some((y) => y.id === ls.id) &&
          !ARUNA_ASSESSMENT_SUBMISSIONS.some((ar) => ar.id === ls.id) &&
          !SHANDRAKALA_ASSESSMENT_SUBMISSIONS.some((sh) => sh.id === ls.id) &&
          !JAGAN_ASSESSMENT_SUBMISSIONS.some((jg) => jg.id === ls.id) &&
          !JEYAKRISHNAN_ASSESSMENT_SUBMISSIONS.some((jk) => jk.id === ls.id) &&
          !SIVAKUMAR_ASSESSMENT_SUBMISSIONS.some((sv) => sv.id === ls.id) &&
          !KARTHICK_ASSESSMENT_SUBMISSIONS.some((k) => k.id === ls.id) &&
          !KARTHIK_THIYAGARAJAN_ASSESSMENT_SUBMISSIONS.some((kt) => kt.id === ls.id) &&
          !NITHISH_BALAJI_ASSESSMENT_SUBMISSIONS.some((nb) => nb.id === ls.id) &&
          !LAKSHMI_KULLAYAMMA_ASSESSMENT_SUBMISSIONS.some((lkm) => lkm.id === ls.id) &&
          !AKANKSHA_SREE_ASSESSMENT_SUBMISSIONS.some((ak) => ak.id === ls.id) &&
          !AJAY_KUMAR_ASSESSMENT_SUBMISSIONS.some((aj) => aj.id === ls.id) &&
          !BHANU_VARDHANREDDY_ASSESSMENT_SUBMISSIONS.some((bv) => bv.id === ls.id) &&
          !SANJAY_ASSESSMENT_SUBMISSIONS.some((sj) => sj.id === ls.id) &&
          !JANARTHANAN_ASSESSMENT_SUBMISSIONS.some((jn) => jn.id === ls.id) &&
          !SHIVA_PRASHANTH_ASSESSMENT_SUBMISSIONS.some((sp) => sp.id === ls.id) &&
          !JEEVANANTHAM_ASSESSMENT_SUBMISSIONS.some((jv) => jv.id === ls.id) &&
          !SIVANI_ASSESSMENT_SUBMISSIONS.some((sv) => sv.id === ls.id)
      ),
    ],
    attempts: [],
    codingAttempts: [],
    activity: localActivity,
    meetings: mergedMeetings,
    feedback: mergedFeedback,
    ideas: mergedIdeas,
    notifications: mergedNotifications,
    scorecards: [],
    courseCompletions: localCompletions,
  };
}

export const workspaceQueryKey = ["bootmind-workspace"];

export async function fetchWorkspace(): Promise<Workspace> {
  try {
    const [
      bootcamps, batches, domains, members, trainees, courses, modules, tasks, quizzes, questions,
      problems, progress, submissions, attempts, codingAttempts, activity, meetings, feedback, ideas, notifications, scorecards,
    ] = await Promise.all([
      all<Bootcamp>("bootcamps"),
      all<Batch>("batches"),
      all<Domain>("domains"),
      all<Member>("members"),
      all<Trainee>("trainees"),
      all<Course>("courses"),
      all<Module>("modules"),
      all<Task>("tasks"),
      all<Quiz>("quizzes"),
      all<QuizQuestion>("quiz_questions"),
      all<CodingProblem>("coding_problems"),
      all<ModuleProgress>("module_progress"),
      all<TaskSubmission>("task_submissions"),
      all<QuizAttempt>("quiz_attempts"),
      all<CodingAttempt>("coding_attempts"),
      all<ActivityLog>("activity_logs", "*", "created_at"),
      all<Meeting>("meetings", "*", "created_at"),
      all<Feedback>("feedback", "*", "created_at"),
      all<Idea>("ideas", "*", "created_at"),
      all<Notification>("notifications", "*", "created_at"),
      all<ScorecardRow>("connect_scorecards", "*", "created_at"),
    ]);

    function readLocal<T>(key: string): T[] {
      if (typeof window === "undefined") return [];
      try {
        return JSON.parse(localStorage.getItem(key) || "[]");
      } catch {
        return [];
      }
    }

    const localTasks = readLocal<Task>("bootmind_local_tasks");
    const localSubmissions = readLocal<TaskSubmission>("bootmind_local_submissions");
    const localProblems = readLocal<CodingProblem>("bootmind_local_problems");
    const localQuizzes = readLocal<Quiz>("bootmind_local_quizzes");
    const localActivity = readLocal<ActivityLog>("bootmind_local_activity");
    const localNotifications = readLocal<Notification>("bootmind_local_notifications");
    const localMembers = readLocal<Member>("bootmind_local_members");
    const localTrainees = readLocal<Trainee>("bootmind_local_trainees");
    const localAssignments = readLocal<{ id: string; mentor_member_id: string | null; buddy_member_id: string | null }>("bootmind_local_assignments");

    const localBatches = readLocal<Batch>("bootmind_local_batches");
    const localCourses = readLocal<Course>("bootmind_local_courses");
    const localFeedback = readLocal<Feedback>("bootmind_local_feedback");
    const localIdeas = readLocal<Idea>("bootmind_local_ideas");

    let rawMembers = [...localMembers, ...(members || []).filter((m) => m && !localMembers.some((l) => l.id === m.id))];
    let rawTrainees = [...localTrainees, ...(trainees || []).filter((t) => t && !localTrainees.some((l) => l.id === t.id))];

    const guaranteed = ensureInitialTrainees(rawMembers, rawTrainees, domains || [], [...localBatches, ...(batches || []).filter((b) => b && !localBatches.some((l) => l.id === b.id))]);
    const mergedMembers = guaranteed.members;
    let mergedTrainees = guaranteed.trainees;
    const mergedDomains = guaranteed.domains;
    const mergedBatches = guaranteed.batches;

    const deletedCourseIds = new Set<string>();
    if (typeof window !== "undefined") {
      try {
        const list: string[] = JSON.parse(localStorage.getItem("bootmind_deleted_courses") || "[]");
        list.forEach((id) => deletedCourseIds.add(id));
      } catch {}
    }

    const rawCourses = [...localCourses, ...(courses || []).filter((c) => c && !localCourses.some((l) => l.id === c.id))];
    const allCourses = [...rawCourses, ...(guaranteed.seedCourses || []).filter((sc) => !rawCourses.some((c) => c.id === sc.id))];
    const mergedCourses = allCourses.filter((c) => c && !deletedCourseIds.has(c.id));

    if (localAssignments.length > 0) {
      const assignmentMap = new Map(localAssignments.map((a) => [a.id, a]));
      mergedTrainees = mergedTrainees.map((t) => {
        const override = assignmentMap.get(t.id);
        if (override && override.mentor_member_id && override.buddy_member_id) {
          return { ...t, mentor_member_id: override.mentor_member_id, buddy_member_id: override.buddy_member_id };
        }
        return t;
      });
    }

    const initialSampleFeedback: Feedback[] = mergedTrainees.slice(0, 5).map((t, idx) => ({
      id: `fb-seed-${t.id}`,
      trainee_id: t.id,
      from_member_id: mergedMembers.find((m) => m.role === "admin")?.id || "admin-member",
      kind: idx % 2 === 0 ? "mentor" : "buddy",
      category: idx % 2 === 0 ? "Technical skills" : "Consistency",
      rating: 4 + (idx % 2),
      comments: idx % 2 === 0 ? "Consistently delivers quality code and active participation in domain tasks." : "Good progress on daily learning hours and proactive communication.",
      created_at: new Date(Date.now() - 86400000 * (idx + 1)).toISOString(),
    }));

    const deletedFbIds = new Set<string>();
    if (typeof window !== "undefined") {
      try {
        const list: string[] = JSON.parse(localStorage.getItem("bootmind_deleted_feedback") || "[]");
        list.forEach((id) => deletedFbIds.add(id));
      } catch {}
    }

    const combinedFeedbackList = [...localFeedback, ...(feedback || []).filter((f) => f && !localFeedback.some((l) => l.id === f.id))];
    const rawFeedback = combinedFeedbackList.length > 0 ? combinedFeedbackList : initialSampleFeedback;
    const mergedFeedback = rawFeedback.filter((f) => f && !deletedFbIds.has(f.id));
    const deletedIdeaIds = new Set<string>();
    if (typeof window !== "undefined") {
      try {
        const list: string[] = JSON.parse(localStorage.getItem("bootmind_deleted_ideas") || "[]");
        list.forEach((id) => deletedIdeaIds.add(id));
      } catch {}
    }
    const combinedIdeas = [...localIdeas, ...(ideas || []).filter((i) => i && !localIdeas.some((l) => l.id === i.id))];
    const mergedIdeas = combinedIdeas.filter((i) => i && !deletedIdeaIds.has(i.id));

    const localMeetings = readLocal<Meeting>("bootmind_local_meetings");
    const mergedMeetings = [...localMeetings, ...(meetings || []).filter((m) => m && !localMeetings.some((l) => l.id === m.id))];

    const mergedTasks = [
      ...COMMON_14_DAYS_ASSESSMENTS,
      ...localTasks.filter((lt) => !COMMON_14_DAYS_ASSESSMENTS.some((c) => c.id === lt.id)),
      ...(tasks || []).filter((t) => t && !localTasks.some((l) => l.id === t.id) && !COMMON_14_DAYS_ASSESSMENTS.some((c) => c.id === t.id)),
    ];
    const mergedSubmissions = [
      ...MONALISA_ASSESSMENT_SUBMISSIONS,
      ...SANDHIYA_ASSESSMENT_SUBMISSIONS,
      ...SRINITHI_ASSESSMENT_SUBMISSIONS,
      ...ANANYA_ASSESSMENT_SUBMISSIONS,
      ...JAYASHREE_ASSESSMENT_SUBMISSIONS,
      ...PRIYATHARSHINI_ASSESSMENT_SUBMISSIONS,
      ...BHUVANA_ASSESSMENT_SUBMISSIONS,
      ...LINGESH_ASSESSMENT_SUBMISSIONS,
      ...LAKSHAN_ASSESSMENT_SUBMISSIONS,
      ...YAVVNA_ASSESSMENT_SUBMISSIONS,
      ...ARUNA_ASSESSMENT_SUBMISSIONS,
      ...SHANDRAKALA_ASSESSMENT_SUBMISSIONS,
      ...JAGAN_ASSESSMENT_SUBMISSIONS,
      ...JEYAKRISHNAN_ASSESSMENT_SUBMISSIONS,
      ...SIVAKUMAR_ASSESSMENT_SUBMISSIONS,
      ...KARTHICK_ASSESSMENT_SUBMISSIONS,
      ...KARTHIK_THIYAGARAJAN_ASSESSMENT_SUBMISSIONS,
      ...NITHISH_BALAJI_ASSESSMENT_SUBMISSIONS,
      ...LAKSHMI_KULLAYAMMA_ASSESSMENT_SUBMISSIONS,
      ...AKANKSHA_SREE_ASSESSMENT_SUBMISSIONS,
      ...AJAY_KUMAR_ASSESSMENT_SUBMISSIONS,
      ...BHANU_VARDHANREDDY_ASSESSMENT_SUBMISSIONS,
      ...SANJAY_ASSESSMENT_SUBMISSIONS,
      ...JANARTHANAN_ASSESSMENT_SUBMISSIONS,
      ...SHIVA_PRASHANTH_ASSESSMENT_SUBMISSIONS,
      ...JEEVANANTHAM_ASSESSMENT_SUBMISSIONS,
      ...SIVANI_ASSESSMENT_SUBMISSIONS,
      ...localSubmissions.filter(
        (ls) =>
          !MONALISA_ASSESSMENT_SUBMISSIONS.some((m) => m.id === ls.id) &&
          !SANDHIYA_ASSESSMENT_SUBMISSIONS.some((s) => s.id === ls.id) &&
          !SRINITHI_ASSESSMENT_SUBMISSIONS.some((s) => s.id === ls.id) &&
          !ANANYA_ASSESSMENT_SUBMISSIONS.some((a) => a.id === ls.id) &&
          !JAYASHREE_ASSESSMENT_SUBMISSIONS.some((j) => j.id === ls.id) &&
          !PRIYATHARSHINI_ASSESSMENT_SUBMISSIONS.some((p) => p.id === ls.id) &&
          !BHUVANA_ASSESSMENT_SUBMISSIONS.some((b) => b.id === ls.id) &&
          !LINGESH_ASSESSMENT_SUBMISSIONS.some((l) => l.id === ls.id) &&
          !LAKSHAN_ASSESSMENT_SUBMISSIONS.some((lk) => lk.id === ls.id) &&
          !YAVVNA_ASSESSMENT_SUBMISSIONS.some((y) => y.id === ls.id) &&
          !ARUNA_ASSESSMENT_SUBMISSIONS.some((ar) => ar.id === ls.id) &&
          !SHANDRAKALA_ASSESSMENT_SUBMISSIONS.some((sh) => sh.id === ls.id) &&
          !JAGAN_ASSESSMENT_SUBMISSIONS.some((jg) => jg.id === ls.id) &&
          !JEYAKRISHNAN_ASSESSMENT_SUBMISSIONS.some((jk) => jk.id === ls.id) &&
          !SIVAKUMAR_ASSESSMENT_SUBMISSIONS.some((sv) => sv.id === ls.id) &&
          !KARTHICK_ASSESSMENT_SUBMISSIONS.some((k) => k.id === ls.id) &&
          !KARTHIK_THIYAGARAJAN_ASSESSMENT_SUBMISSIONS.some((kt) => kt.id === ls.id) &&
          !NITHISH_BALAJI_ASSESSMENT_SUBMISSIONS.some((nb) => nb.id === ls.id) &&
          !LAKSHMI_KULLAYAMMA_ASSESSMENT_SUBMISSIONS.some((lkm) => lkm.id === ls.id) &&
          !AKANKSHA_SREE_ASSESSMENT_SUBMISSIONS.some((ak) => ak.id === ls.id) &&
          !AJAY_KUMAR_ASSESSMENT_SUBMISSIONS.some((aj) => aj.id === ls.id) &&
          !BHANU_VARDHANREDDY_ASSESSMENT_SUBMISSIONS.some((bv) => bv.id === ls.id) &&
          !SANJAY_ASSESSMENT_SUBMISSIONS.some((sj) => sj.id === ls.id) &&
          !JANARTHANAN_ASSESSMENT_SUBMISSIONS.some((jn) => jn.id === ls.id) &&
          !SHIVA_PRASHANTH_ASSESSMENT_SUBMISSIONS.some((sp) => sp.id === ls.id) &&
          !JEEVANANTHAM_ASSESSMENT_SUBMISSIONS.some((jv) => jv.id === ls.id) &&
          !SIVANI_ASSESSMENT_SUBMISSIONS.some((sv) => sv.id === ls.id)
      ),
      ...(submissions || []).filter(
        (s) =>
          s &&
          !localSubmissions.some((l) => l.id === s.id) &&
          !MONALISA_ASSESSMENT_SUBMISSIONS.some((m) => m.id === s.id) &&
          !SANDHIYA_ASSESSMENT_SUBMISSIONS.some((m) => m.id === s.id) &&
          !SRINITHI_ASSESSMENT_SUBMISSIONS.some((m) => m.id === s.id) &&
          !ANANYA_ASSESSMENT_SUBMISSIONS.some((m) => m.id === s.id) &&
          !JAYASHREE_ASSESSMENT_SUBMISSIONS.some((m) => m.id === s.id) &&
          !PRIYATHARSHINI_ASSESSMENT_SUBMISSIONS.some((m) => m.id === s.id) &&
          !BHUVANA_ASSESSMENT_SUBMISSIONS.some((m) => m.id === s.id) &&
          !LINGESH_ASSESSMENT_SUBMISSIONS.some((m) => m.id === s.id) &&
          !LAKSHAN_ASSESSMENT_SUBMISSIONS.some((m) => m.id === s.id) &&
          !YAVVNA_ASSESSMENT_SUBMISSIONS.some((m) => m.id === s.id) &&
          !ARUNA_ASSESSMENT_SUBMISSIONS.some((m) => m.id === s.id) &&
          !SHANDRAKALA_ASSESSMENT_SUBMISSIONS.some((m) => m.id === s.id) &&
          !JAGAN_ASSESSMENT_SUBMISSIONS.some((m) => m.id === s.id) &&
          !JEYAKRISHNAN_ASSESSMENT_SUBMISSIONS.some((m) => m.id === s.id) &&
          !SIVAKUMAR_ASSESSMENT_SUBMISSIONS.some((m) => m.id === s.id) &&
          !KARTHICK_ASSESSMENT_SUBMISSIONS.some((m) => m.id === s.id) &&
          !KARTHIK_THIYAGARAJAN_ASSESSMENT_SUBMISSIONS.some((m) => m.id === s.id) &&
          !NITHISH_BALAJI_ASSESSMENT_SUBMISSIONS.some((m) => m.id === s.id) &&
          !LAKSHMI_KULLAYAMMA_ASSESSMENT_SUBMISSIONS.some((m) => m.id === s.id) &&
          !AKANKSHA_SREE_ASSESSMENT_SUBMISSIONS.some((m) => m.id === s.id) &&
          !AJAY_KUMAR_ASSESSMENT_SUBMISSIONS.some((m) => m.id === s.id) &&
          !BHANU_VARDHANREDDY_ASSESSMENT_SUBMISSIONS.some((m) => m.id === s.id) &&
          !SANJAY_ASSESSMENT_SUBMISSIONS.some((m) => m.id === s.id) &&
          !JANARTHANAN_ASSESSMENT_SUBMISSIONS.some((m) => m.id === s.id) &&
          !SHIVA_PRASHANTH_ASSESSMENT_SUBMISSIONS.some((m) => m.id === s.id) &&
          !JEEVANANTHAM_ASSESSMENT_SUBMISSIONS.some((m) => m.id === s.id) &&
          !SIVANI_ASSESSMENT_SUBMISSIONS.some((m) => m.id === s.id)
      ),
    ];
    const rawProblems = [...localProblems, ...(problems || []).filter((p) => p && !localProblems.some((l) => l.id === p.id))];
    const mergedProblems = [...rawProblems, ...INITIAL_SAMPLE_PROBLEMS.filter((sp) => !rawProblems.some((p) => p.id === sp.id))];

    const rawQuizzes = [...localQuizzes, ...(quizzes || []).filter((q) => q && !localQuizzes.some((l) => l.id === q.id))];
    const mergedQuizzes = [...rawQuizzes, ...INITIAL_SAMPLE_QUIZZES.filter((sq) => !rawQuizzes.some((q) => q.id === sq.id))];

    const mergedQuestions = [...(questions || []), ...INITIAL_SAMPLE_QUESTIONS.filter((sq) => !(questions || []).some((q) => q.id === sq.id))];

    const mergedActivity = [...localActivity, ...(activity || []).filter((a) => a && !localActivity.some((l) => l.id === a.id))];
    const deletedNotifIds = new Set<string>();
    if (typeof window !== "undefined") {
      try {
        const list: string[] = JSON.parse(localStorage.getItem("bootmind_deleted_notifications") || "[]");
        list.forEach((id) => deletedNotifIds.add(id));
      } catch {}
    }

    const combinedNotificationsList = [...localNotifications, ...(notifications || []).filter((n) => n && !localNotifications.some((l) => l.id === n.id))];
    const rawNotifications = combinedNotificationsList.length > 0 ? combinedNotificationsList : initialSampleNotifications;
    const mergedNotifications = rawNotifications.filter((n) => n && !deletedNotifIds.has(n.id));

    const localModules = readLocal<Module>("bootmind_local_modules");
    const localProgress = readLocal<ModuleProgress>("bootmind_local_progress");
    const rawModules = [...localModules, ...(modules || []).filter((m) => m && !localModules.some((l) => l.id === m.id))];
    const mergedModules = [...rawModules, ...SEED_MODULES.filter((sm) => !rawModules.some((m) => m.id === sm.id))];
    const mergedProgress = [...localProgress, ...(progress || []).filter((p) => p && !localProgress.some((l) => l.id === p.id))];

    return {
      bootcamps: bootcamps || [], batches: mergedBatches, domains: mergedDomains,
      members: mergedMembers,
      trainees: mergedTrainees,
      courses: mergedCourses, modules: mergedModules,
      tasks: mergedTasks, quizzes: mergedQuizzes, questions: mergedQuestions,
      problems: mergedProblems, progress: mergedProgress, submissions: mergedSubmissions,
      attempts: attempts || [], codingAttempts: codingAttempts || [], activity: mergedActivity, meetings: [...mergedMeetings, ...(meetings || []).filter((m) => m && !mergedMeetings.some((l) => l.id === m.id))], feedback: mergedFeedback, ideas: mergedIdeas,
      notifications: mergedNotifications, scorecards: scorecards || [], courseCompletions: readLocal<CourseCompletion>("bootmind_local_course_completions"),
    };
  } catch (err) {
    console.warn("fetchWorkspace fail-safe exception:", err);
    return getFallbackWorkspace();
  }
}

export function useWorkspace() {
  return useQuery({
    queryKey: workspaceQueryKey,
    queryFn: fetchWorkspace,
    staleTime: 15_000,
    placeholderData: (previousData) => previousData ?? getFallbackWorkspace(),
  });
}
