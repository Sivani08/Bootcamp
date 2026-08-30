import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://keqxyvqzdjxuwjnupbhi.supabase.co";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_sXim4Fye0MujePpTCIsMow_X-WrJPz7";

  return createClient(url, key, {
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

export const insertTaskFn = createServerFn()
  .validator((data: { title: string; description: string; kind: string; priority: string; domain_id?: string; due_at?: string | null }) => data)
  .handler(async ({ data }) => {
    try {
      const supabase = getAdminClient();
      const { data: res, error } = await supabase.from("tasks").insert({
        title: data.title,
        description: data.description,
        kind: data.kind,
        priority: data.priority,
        domain_id: data.domain_id || null,
        submission_type: "file",
        due_at: data.due_at || null,
      }).select();

      if (error) {
        console.error("[insertTaskFn] error:", error);
        return { ok: false, error: error.message };
      }
      return { ok: true, data: res };
    } catch (e) {
      console.error("[insertTaskFn] catch:", e);
      return { ok: false, error: e instanceof Error ? e.message : "Failed to insert task" };
    }
  });

export const submitTaskFn = createServerFn()
  .validator((data: { taskId: string; traineeId: string; existingId?: string; content: string }) => data)
  .handler(async ({ data }) => {
    try {
      const supabase = getAdminClient();
      const payload = {
        task_id: data.taskId,
        trainee_id: data.traineeId,
        status: "submitted",
        content: data.content,
        submitted_at: new Date().toISOString(),
      };

      let res, error;
      if (data.existingId) {
        ({ data: res, error } = await supabase.from("task_submissions").update(payload).eq("id", data.existingId).select());
      } else {
        ({ data: res, error } = await supabase.from("task_submissions").insert(payload).select());
      }

      if (error) {
        console.error("[submitTaskFn] error:", error);
        return { ok: false, error: error.message };
      }
      return { ok: true, data: res };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Failed to submit work" };
    }
  });

export const reviewTaskFn = createServerFn()
  .validator((data: { submissionId: string; score: number }) => data)
  .handler(async ({ data }) => {
    try {
      const supabase = getAdminClient();
      const { data: res, error } = await supabase.from("task_submissions").update({
        status: "reviewed",
        score: data.score,
      }).eq("id", data.submissionId).select();

      if (error) return { ok: false, error: error.message };
      return { ok: true, data: res };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Failed to save review" };
    }
  });

export const createCodingProblemFn = createServerFn()
  .validator((data: { title: string; difficulty: string; topic: string; prompt: string; expected_output?: string; starter_code?: string; domain_id?: string }) => data)
  .handler(async ({ data }) => {
    try {
      const supabase = getAdminClient();
      const { data: res, error } = await supabase.from("coding_problems").insert({
        title: data.title,
        difficulty: data.difficulty,
        topic: data.topic,
        prompt: data.prompt,
        expected_output: data.expected_output || null,
        starter_code: data.starter_code || "def solve():\n    return None",
        domain_id: data.domain_id || null,
      }).select();

      if (error) return { ok: false, error: error.message };
      return { ok: true, data: res };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Failed to publish problem" };
    }
  });

export const createQuizFn = createServerFn()
  .validator((data: { title: string; topic: string; duration_min: number; due_at?: string | null; domain_id?: string }) => data)
  .handler(async ({ data }) => {
    try {
      const supabase = getAdminClient();
      const { data: res, error } = await supabase.from("quizzes").insert({
        title: data.title,
        topic: data.topic,
        duration_min: data.duration_min,
        due_at: data.due_at || null,
        domain_id: data.domain_id || null,
      }).select();

      if (error) return { ok: false, error: error.message };
      return { ok: true, data: res };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Failed to publish quiz" };
    }
  });
