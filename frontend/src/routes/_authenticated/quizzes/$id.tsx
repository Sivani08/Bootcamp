import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Clock } from "lucide-react";
import { useWorkspace } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { useActions, logActivity } from "@/lib/actions";
import { EmptyState, Panel, SkeletonPage } from "@/components/ui-bits";

export const Route = createFileRoute("/_authenticated/quizzes/$id")({
  head: () => ({ meta: [
    { title: "Take quiz — BootMind" },
    { name: "description", content: "Answer the questions, submit and see your score with a per-question breakdown." },
    { property: "og:title", content: "Take quiz — BootMind" },
    { property: "og:description", content: "Answer the questions, submit and see your score with a per-question breakdown." },
  ] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const { data: ws, isLoading } = useWorkspace();
  const { member } = useAuth();
  const { db, run } = useActions();
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{ score: number; total: number; pct: number } | null>(null);
  const [left, setLeft] = useState<number | null>(null);

  const quiz = ws?.quizzes.find((q) => q.id === id);
  const questions = (ws?.questions ?? []).filter((q) => q.quiz_id === id).sort((a, b) => a.order_index - b.order_index);

  useEffect(() => {
    if (!quiz || result) return;
    setLeft((l) => l ?? quiz.duration_min * 60);
    const t = setInterval(() => setLeft((l) => (l && l > 0 ? l - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [quiz, result]);

  if (isLoading || !ws) return <SkeletonPage />;
  if (!quiz) return <EmptyState title="Quiz not found" />;

  const me = ws.trainees.find((t) => t.member_id === member?.id);

  const submit = async () => {
    let score = 0;
    let total = 0;
    for (const q of questions) {
      total += q.marks;
      if (answers[q.id] === q.correct_index) score += q.marks;
    }
    const pct = total ? Math.round((score / total) * 100) : 0;
    setResult({ score, total, pct });
    if (me) {
      const ok = await run(`Scored ${pct}%`, () =>
        db.from("quiz_attempts").insert({ quiz_id: quiz.id, trainee_id: me.id, score, total, percentage: pct, answers }),
      );
      if (ok) await logActivity(me.id, "quiz", `Attempted quiz: ${quiz.title} (${pct}%)`, quiz.duration_min);
    }
  };

  const mm = left != null ? String(Math.floor(left / 60)).padStart(2, "0") : "--";
  const ss = left != null ? String(left % 60).padStart(2, "0") : "--";

  return (
    <div className="space-y-6">
      <Link to="/quizzes" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All quizzes
      </Link>

      <div className="panel flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{quiz.title}</h1>
          <p className="text-sm text-muted-foreground">{questions.length} questions · {quiz.topic ?? "General"}</p>
        </div>
        {!result && (
          <span className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium">
            <Clock className="size-4" /> {mm}:{ss}
          </span>
        )}
      </div>

      {result ? (
        <Panel title={`You scored ${result.pct}%`} description={`${result.score} of ${result.total} marks`}>
          <ul className="space-y-3">
            {questions.map((q, i) => {
              const picked = answers[q.id];
              const right = picked === q.correct_index;
              return (
                <li key={q.id} className={`rounded-lg border p-3 ${right ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"}`}>
                  <p className="text-sm font-medium">{i + 1}. {q.prompt}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Your answer: {picked != null ? q.options[picked] : "—"} · Correct: {q.options[q.correct_index]}
                  </p>
                </li>
              );
            })}
          </ul>
          <button onClick={() => void router.navigate({ to: "/quizzes" })} className="mt-4 h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">Back to quizzes</button>
        </Panel>
      ) : (
        <Panel>
          <ol className="space-y-4">
            {questions.map((q, i) => (
              <li key={q.id} className="rounded-lg border border-border p-4">
                <p className="text-sm font-medium">{i + 1}. {q.prompt} <span className="text-xs text-muted-foreground">({q.marks} marks)</span></p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {q.options.map((opt, oi) => (
                    <button key={oi} type="button" onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                      aria-pressed={answers[q.id] === oi}
                      className={`rounded-lg border p-3 text-left text-sm ${answers[q.id] === oi ? "border-primary bg-accent" : "border-border hover:bg-muted"}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ol>
          <button onClick={submit} disabled={Object.keys(answers).length === 0}
            className="mt-4 h-10 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
            Submit quiz
          </button>
        </Panel>
      )}
    </div>
  );
}
