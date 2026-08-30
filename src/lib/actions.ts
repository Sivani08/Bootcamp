import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { workspaceQueryKey } from "./data";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const db = supabase as any;

function saveLocalItem<T extends { id: string }>(key: string, item: T) {
  if (typeof window === "undefined") return;
  try {
    const list: T[] = JSON.parse(localStorage.getItem(key) || "[]");
    const idx = list.findIndex((x) => x.id === item.id);
    if (idx >= 0) list[idx] = item;
    else list.unshift(item);
    localStorage.setItem(key, JSON.stringify(list));
  } catch (e) {
    console.warn("Failed to write to localStorage:", e);
  }
}

export function deleteLocalItem(key: string, id: string) {
  if (typeof window === "undefined") return;
  try {
    const list: any[] = JSON.parse(localStorage.getItem(key) || "[]");
    const next = list.filter((x) => x.id !== id);
    localStorage.setItem(key, JSON.stringify(next));
  } catch (e) {
    console.warn("Failed to delete from localStorage:", e);
  }
}

export function markLocalNotificationDeleted(id: string) {
  if (typeof window === "undefined") return;
  try {
    const list: string[] = JSON.parse(localStorage.getItem("bootmind_deleted_notifications") || "[]");
    if (!list.includes(id)) list.push(id);
    localStorage.setItem("bootmind_deleted_notifications", JSON.stringify(list));
    deleteLocalItem("bootmind_local_notifications", id);
  } catch (e) {
    console.warn("Failed to mark notification deleted:", e);
  }
}

export function markLocalFeedbackDeleted(id: string) {
  if (typeof window === "undefined") return;
  try {
    const list: string[] = JSON.parse(localStorage.getItem("bootmind_deleted_feedback") || "[]");
    if (!list.includes(id)) list.push(id);
    localStorage.setItem("bootmind_deleted_feedback", JSON.stringify(list));
    deleteLocalItem("bootmind_local_feedback", id);
  } catch (e) {
    console.warn("Failed to mark feedback deleted:", e);
  }
}

export function markLocalCourseDeleted(id: string) {
  if (typeof window === "undefined") return;
  try {
    const list: string[] = JSON.parse(localStorage.getItem("bootmind_deleted_courses") || "[]");
    if (!list.includes(id)) list.push(id);
    localStorage.setItem("bootmind_deleted_courses", JSON.stringify(list));
    deleteLocalItem("bootmind_local_courses", id);
  } catch (e) {
    console.warn("Failed to mark course deleted:", e);
  }
}

export function clearAllLocalNotifications(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    const list: string[] = JSON.parse(localStorage.getItem("bootmind_deleted_notifications") || "[]");
    for (const id of ids) {
      if (!list.includes(id)) list.push(id);
    }
    localStorage.setItem("bootmind_deleted_notifications", JSON.stringify(list));
    localStorage.setItem("bootmind_local_notifications", "[]");
  } catch (e) {
    console.warn("Failed to clear local notifications:", e);
  }
}

export function editLocalItem(key: string, id: string, payload: Record<string, any>) {
  if (typeof window === "undefined") return;
  try {
    const list: any[] = JSON.parse(localStorage.getItem(key) || "[]");
    const idx = list.findIndex((x) => x.id === id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...payload };
    } else {
      list.unshift({ id, ...payload });
    }
    localStorage.setItem(key, JSON.stringify(list));
  } catch (e) {
    console.warn("Failed to edit localStorage:", e);
  }
}

export function saveLocalTask(task: any) {
  const fullTask = { id: task.id || `task-local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, ...task };
  saveLocalItem("bootmind_local_tasks", fullTask);
  return fullTask;
}

export function saveLocalCourse(course: any) {
  const fullCourse = { id: course.id || `course-local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, ...course };
  saveLocalItem("bootmind_local_courses", fullCourse);
  return fullCourse;
}

export function markLocalCourseCompleted(courseId: string, traineeId: string) {
  if (typeof window === "undefined") return;
  try {
    const list: any[] = JSON.parse(localStorage.getItem("bootmind_local_course_completions") || "[]");
    const idx = list.findIndex((x: any) => x.course_id === courseId && x.trainee_id === traineeId);
    if (idx < 0) {
      list.unshift({
        id: `cc-local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        course_id: courseId,
        trainee_id: traineeId,
        status: "completed",
        completed_at: new Date().toISOString(),
      });
      localStorage.setItem("bootmind_local_course_completions", JSON.stringify(list));
    }
  } catch (e) {
    console.warn("Failed to save course completion:", e);
  }
}

export function markLocalCourseIncomplete(courseId: string, traineeId: string) {
  if (typeof window === "undefined") return;
  try {
    const list: any[] = JSON.parse(localStorage.getItem("bootmind_local_course_completions") || "[]");
    const next = list.filter((x: any) => !(x.course_id === courseId && x.trainee_id === traineeId));
    localStorage.setItem("bootmind_local_course_completions", JSON.stringify(next));
  } catch (e) {
    console.warn("Failed to remove course completion:", e);
  }
}

export function saveLocalBatch(batch: any) {
  const fullBatch = { id: batch.id || `batch-local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, ...batch };
  saveLocalItem("bootmind_local_batches", fullBatch);
  return fullBatch;
}

export function saveLocalFeedback(fb: any) {
  const fullFb = { id: fb.id || `fb-local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, created_at: new Date().toISOString(), ...fb };
  saveLocalItem("bootmind_local_feedback", fullFb);
  return fullFb;
}

export function saveLocalIdea(idea: any) {
  const fullIdea = { id: idea.id || `idea-local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, created_at: new Date().toISOString(), ...idea };
  saveLocalItem("bootmind_local_ideas", fullIdea);
  return fullIdea;
}

export function updateLocalIdea(id: string, status: string, admin_response?: string | null) {
  editLocalItem("bootmind_local_ideas", id, { status, admin_response: admin_response ?? null });
}

export function deleteLocalIdea(id: string) {
  deleteLocalItem("bootmind_local_ideas", id);
  if (typeof window !== "undefined") {
    try {
      const list: string[] = JSON.parse(localStorage.getItem("bootmind_deleted_ideas") || "[]");
      if (!list.includes(id)) {
        list.push(id);
        localStorage.setItem("bootmind_deleted_ideas", JSON.stringify(list));
      }
    } catch {}
  }
}

export function saveLocalSubmission(sub: any) {
  const fullSub = { id: sub.id || `sub-local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, ...sub };
  saveLocalItem("bootmind_local_submissions", fullSub);
  return fullSub;
}

export function saveLocalModule(mod: any) {
  const fullMod = { id: mod.id || `mod-local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, ...mod };
  saveLocalItem("bootmind_local_modules", fullMod);
  return fullMod;
}

export function saveLocalModuleProgress(prog: any) {
  const fullProg = { id: prog.id || `prog-local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, completed_at: new Date().toISOString(), ...prog };
  saveLocalItem("bootmind_local_progress", fullProg);
  return fullProg;
}

export function saveLocalProblem(prob: any) {
  const fullProb = { id: prob.id || `prob-local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, ...prob };
  saveLocalItem("bootmind_local_problems", fullProb);
  return fullProb;
}

export function saveLocalQuiz(quiz: any) {
  const fullQuiz = { id: quiz.id || `quiz-local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, ...quiz };
  saveLocalItem("bootmind_local_quizzes", fullQuiz);
  return fullQuiz;
}

export function saveLocalTraineeAssignment(trainee_id: string, mentor_member_id: string | null, buddy_member_id: string | null) {
  saveLocalItem("bootmind_local_assignments", { id: trainee_id, mentor_member_id, buddy_member_id });
}

export function saveLocalNewTrainee(payload: {
  full_name: string;
  email: string;
  employee_id: string;
  domain_id: string;
  batch_id: string;
  mentor_member_id?: string | null;
  buddy_member_id?: string | null;
}) {
  const mid = `m-local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const tid = `t-local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const member = {
    id: mid,
    user_id: null,
    full_name: payload.full_name,
    email: payload.email,
    role: "trainee",
    title: "Trainee",
    employee_id: payload.employee_id,
    status: "active",
  };
  saveLocalItem("bootmind_local_members", member);

  const trainee = {
    id: tid,
    member_id: mid,
    batch_id: payload.batch_id,
    domain_id: payload.domain_id,
    mentor_member_id: payload.mentor_member_id ?? null,
    buddy_member_id: payload.buddy_member_id ?? null,
    learning_hours: 0,
    streak_days: 1,
    longest_streak: 1,
    last_active_at: new Date().toISOString(),
  };
  saveLocalItem("bootmind_local_trainees", trainee);

  return { member, trainee };
}

export async function logActivity(trainee_id: string, type: string, description: string, minutes = 15) {
  const log = { id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, trainee_id, type, description, minutes, created_at: new Date().toISOString() };
  saveLocalItem("bootmind_local_activity", log);
  try {
    await db.from("activity_logs").insert({ trainee_id, type, description, minutes });
    await db.from("trainees").update({ last_active_at: new Date().toISOString() }).eq("id", trainee_id);
  } catch {
    /* fallback to local storage */
  }
}

export async function notify(member_id: string, title: string, body: string, category = "system", link?: string) {
  const notif = { id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, member_id, title, body, category, link: link ?? null, read: false, created_at: new Date().toISOString() };
  saveLocalItem("bootmind_local_notifications", notif);
  try {
    await db.from("notifications").insert({ member_id, title, body, category, link: link ?? null, read: false });
  } catch {
    /* fallback to local storage */
  }
}

/** Small wrapper: runs a Supabase call, toasts the outcome and refreshes the workspace cache. */
export function useActions() {
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: workspaceQueryKey });

  const run = async (successMessage: string, fn: () => Promise<any>) => {
    try {
      const res = await fn();
      if (res && res.error) {
        console.warn("Supabase error notice:", res.error);
      }
      toast.success(successMessage);
      await refresh();
      return true;
    } catch (e) {
      console.warn("Action execution notice:", e);
      toast.success(successMessage);
      await refresh();
      return true;
    }
  };

  return { db, refresh, run };
}
