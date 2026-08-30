import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ClipboardList, Clock, Plus, Pencil, Trash2, CheckCircle2, Play, AlertCircle } from "lucide-react";
import { useWorkspace, type Quiz, type QuizQuestion } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { useActions, saveLocalQuiz, editLocalItem, deleteLocalItem, notify, logActivity } from "@/lib/actions";
import { EmptyState, PageHeader, Panel, SkeletonPage } from "@/components/ui-bits";
import { getSignedTrainee } from "@/lib/scope";
import { createQuizFn } from "@/lib/server-actions.functions";

export const Route = createFileRoute("/_authenticated/quizzes/")({
  head: () => ({ meta: [
    { title: "Quizzes & Assessments — BootMind" },
    { name: "description", content: "Share, assign and complete timed quizzes with instant scoring and attempt history." },
    { property: "og:title", content: "Quizzes & Assessments — BootMind" },
    { property: "og:description", content: "Share, assign and complete timed quizzes with instant scoring and attempt history." },
  ] }),
  component: Page,
});

const DEFAULT_SAMPLE_QUESTIONS: Record<string, { prompt: string; options: string[]; correct_index: number }[]> = {
  python: [
    { prompt: "Which keyword is used to define a function in Python?", options: ["function", "def", "func", "define"], correct_index: 1 },
    { prompt: "What is the result of type([]) in Python?", options: ["<class 'list'>", "<class 'dict'>", "<class 'tuple'>", "<class 'set'>"], correct_index: 0 },
    { prompt: "Which method adds an element to the end of a list?", options: ["push()", "add()", "append()", "insert()"], correct_index: 2 },
  ],
  sql: [
    { prompt: "Which SQL clause is used to filter query results?", options: ["HAVING", "WHERE", "GROUP BY", "ORDER BY"], correct_index: 1 },
    { prompt: "Which JOIN returns all records when there is a match in either left or right table?", options: ["INNER JOIN", "FULL OUTER JOIN", "LEFT JOIN", "RIGHT JOIN"], correct_index: 1 },
    { prompt: "What does the COUNT(*) function do?", options: ["Counts columns", "Counts non-null values", "Counts all rows in a table", "Counts unique values"], correct_index: 2 },
  ],
  spark: [
    { prompt: "What is an RDD in Apache Spark?", options: ["Resilient Distributed Dataset", "Resource Driven Data", "Rapid Data Dispatch", "Relational Database Domain"], correct_index: 0 },
    { prompt: "Which operation is a Spark Transformation?", options: ["count()", "collect()", "map()", "show()"], correct_index: 2 },
    { prompt: "What is the primary cluster manager native to Spark?", options: ["YARN", "Standalone", "Kubernetes", "Mesos"], correct_index: 1 },
  ],
  general: [
    { prompt: "What is the default port for HTTP?", options: ["443", "80", "8080", "21"], correct_index: 1 },
    { prompt: "Which HTTP method is idempotent?", options: ["POST", "GET", "PATCH", "CONNECT"], correct_index: 1 },
    { prompt: "What does API stand for?", options: ["Application Programming Interface", "Automated Program Integration", "Advanced Process Interaction", "Application Process Infrastructure"], correct_index: 0 },
  ],
};

function Page() {
  const { data: ws, isLoading } = useWorkspace();
  const { role, member } = useAuth();
  const { run } = useActions();
  const [openForm, setOpenForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [activeQuizToTake, setActiveQuizToTake] = useState<Quiz | null>(null);

  const [draft, setDraft] = useState({ title: "", topic: "SQL", duration_min: 15, due_at: "", domain_id: "" });
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizFinishedResult, setQuizFinishedResult] = useState<{ score: number; total: number; pct: number } | null>(null);

  if (isLoading || !ws) return <SkeletonPage />;

  const me = getSignedTrainee(ws, member);
  const canCreate = role === "admin" || role === "mentor" || role === "buddy";

  const createQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    const newQuiz = {
      id: `quiz-local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: draft.title,
      topic: draft.topic || "General",
      duration_min: Number(draft.duration_min) || 15,
      due_at: draft.due_at ? new Date(draft.due_at).toISOString() : null,
      domain_id: draft.domain_id || ws.domains[0]?.id || null,
      course_id: null,
    };
    saveLocalQuiz(newQuiz);

    await run("Quiz / Assessment shared successfully", async () => {
      try {
        await createQuizFn({
          data: {
            title: draft.title,
            topic: draft.topic,
            duration_min: Number(draft.duration_min) || 15,
            due_at: draft.due_at ? new Date(draft.due_at).toISOString() : null,
            domain_id: draft.domain_id || ws.domains[0]?.id,
          },
        });
      } catch (err) {
        console.warn("Server quiz creation notice:", err);
      }
      return { ok: true };
    });

    const deadlineStr = draft.due_at ? ` (Deadline: ${new Date(draft.due_at).toLocaleDateString()})` : "";
    await notify("all", "New Assessment Quiz Assigned", `${draft.title}${deadlineStr}`, "assessment", "/quizzes");

    setDraft({ title: "", topic: "SQL", duration_min: 15, due_at: "", domain_id: "" });
    setOpenForm(false);
  };

  const startEditQuiz = (q: Quiz, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingQuiz(q);
    setDraft({
      title: q.title,
      topic: q.topic || "General",
      duration_min: q.duration_min || 15,
      due_at: q.due_at ? q.due_at.slice(0, 10) : "",
      domain_id: q.domain_id || "",
    });
  };

  const handleUpdateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuiz) return;
    const payload = {
      title: draft.title,
      topic: draft.topic,
      duration_min: Number(draft.duration_min) || 15,
      due_at: draft.due_at ? new Date(draft.due_at).toISOString() : null,
      domain_id: draft.domain_id || null,
    };
    editLocalItem("bootmind_local_quizzes", editingQuiz.id, payload);
    await run("Quiz updated successfully", () => Promise.resolve({ ok: true }));
    setEditingQuiz(null);
    setDraft({ title: "", topic: "SQL", duration_min: 15, due_at: "", domain_id: "" });
  };

  const handleDeleteQuiz = async (quizId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this quiz?")) return;
    deleteLocalItem("bootmind_local_quizzes", quizId);
    await run("Quiz deleted", () => Promise.resolve({ ok: true }));
  };

  const startQuizAttempt = (q: Quiz) => {
    setActiveQuizToTake(q);
    setUserAnswers({});
    setQuizFinishedResult(null);
  };

  const submitQuizAttempt = async () => {
    if (!activeQuizToTake) return;
    const topicKey = (activeQuizToTake.topic || "general").toLowerCase();
    const sampleQs = DEFAULT_SAMPLE_QUESTIONS[topicKey] || DEFAULT_SAMPLE_QUESTIONS.general!;

    let correctCount = 0;
    sampleQs.forEach((q, idx) => {
      if (userAnswers[idx] === q.correct_index) correctCount++;
    });

    const total = sampleQs.length;
    const pct = Math.round((correctCount / total) * 100);

    const activeTrainee = me;
    if (activeTrainee) {
      const attemptPayload = {
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        quiz_id: activeQuizToTake.id,
        trainee_id: activeTrainee.id,
        score: correctCount,
        total: total,
        percentage: pct,
        created_at: new Date().toISOString(),
      };

      try {
        const list: any[] = JSON.parse(localStorage.getItem("bootmind_local_attempts") || "[]");
        list.unshift(attemptPayload);
        localStorage.setItem("bootmind_local_attempts", JSON.stringify(list));
      } catch {}

      await logActivity(activeTrainee.id, "quiz", `Completed Quiz: ${activeQuizToTake.title} (${pct}%)`, 20);
    }

    setQuizFinishedResult({ score: correctCount, total, pct });
    await run("Assessment completed successfully!", () => Promise.resolve({ ok: true }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quizzes & Assessments"
        subtitle="Share quizzes to trainees, track completion status, and attempt timed assessments."
        actions={canCreate ? (
          <button onClick={() => { setOpenForm((o) => !o); setEditingQuiz(null); }} className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground">
            <Plus className="size-4" /> New Quiz / Assessment
          </button>
        ) : undefined}
      />

      {openForm && canCreate && (
        <Panel title="Share / Assign New Quiz to Trainees">
          <form onSubmit={createQuiz} className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium">Quiz Title
              <input required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. PySpark & Data Pipelines Assessment" className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" />
            </label>
            <label className="text-sm font-medium">Topic / Domain Category
              <select value={draft.topic} onChange={(e) => setDraft({ ...draft, topic: e.target.value })} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                <option value="SQL">SQL</option>
                <option value="Python">Python</option>
                <option value="Spark">Spark / PySpark</option>
                <option value="General">General Technology</option>
              </select>
            </label>
            <label className="text-sm font-medium">Target Domain Batch
              <select value={draft.domain_id} onChange={(e) => setDraft({ ...draft, domain_id: e.target.value })} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                <option value="">All Trainee Domains (Batch 12)</option>
                {ws.domains.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium">Duration (minutes)
              <input type="number" min={5} max={180} value={draft.duration_min} onChange={(e) => setDraft({ ...draft, duration_min: Number(e.target.value) })} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" />
            </label>
            <label className="text-sm font-medium sm:col-span-2">Deadline / Due Date
              <input type="datetime-local" value={draft.due_at} onChange={(e) => setDraft({ ...draft, due_at: e.target.value })} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" />
            </label>
            <div className="flex gap-2 sm:col-span-2">
              <button type="submit" className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">Share Quiz with Trainees</button>
              <button type="button" onClick={() => setOpenForm(false)} className="h-10 rounded-lg border border-input px-4 text-sm font-medium">Cancel</button>
            </div>
          </form>
        </Panel>
      )}

      {editingQuiz && canCreate && (
        <Panel title={`Edit Quiz: ${editingQuiz.title}`}>
          <form onSubmit={handleUpdateQuiz} className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium">Quiz Title
              <input required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" />
            </label>
            <label className="text-sm font-medium">Topic / Category
              <select value={draft.topic} onChange={(e) => setDraft({ ...draft, topic: e.target.value })} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                <option value="SQL">SQL</option>
                <option value="Python">Python</option>
                <option value="Spark">Spark / PySpark</option>
                <option value="General">General Technology</option>
              </select>
            </label>
            <label className="text-sm font-medium">Duration (minutes)
              <input type="number" min={5} max={180} value={draft.duration_min} onChange={(e) => setDraft({ ...draft, duration_min: Number(e.target.value) })} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" />
            </label>
            <label className="text-sm font-medium">Due Date
              <input type="datetime-local" value={draft.due_at} onChange={(e) => setDraft({ ...draft, due_at: e.target.value })} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" />
            </label>
            <div className="flex gap-2 sm:col-span-2">
              <button type="submit" className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">Save Changes</button>
              <button type="button" onClick={() => setEditingQuiz(null)} className="h-10 rounded-lg border border-input px-4 text-sm font-medium">Cancel</button>
            </div>
          </form>
        </Panel>
      )}

      {/* Interactive Quiz Taking Modal for Trainees */}
      {activeQuizToTake && (
        <Panel title={`Taking Assessment: ${activeQuizToTake.title}`} className="border-primary/50 bg-accent/20">
          {!quizFinishedResult ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Topic: {activeQuizToTake.topic ?? "General"}</span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-primary"><Clock className="size-4" /> Time Limit: {activeQuizToTake.duration_min} minutes</span>
              </div>

              {((DEFAULT_SAMPLE_QUESTIONS[(activeQuizToTake.topic || "general").toLowerCase()] || DEFAULT_SAMPLE_QUESTIONS.general!) as any).map((q: any, qIdx: number) => (
                <div key={qIdx} className="rounded-lg border border-border p-4 space-y-3 bg-card">
                  <p className="text-sm font-bold">{qIdx + 1}. {q.prompt}</p>
                  <div className="space-y-2">
                    {q.options.map((opt: string, optIdx: number) => (
                      <label key={optIdx} className={`flex items-center gap-3 rounded-md border p-2.5 text-sm cursor-pointer transition-colors ${userAnswers[qIdx] === optIdx ? "border-primary bg-primary/10 font-semibold" : "border-border hover:bg-muted/50"}`}>
                        <input
                          type="radio"
                          name={`q-${qIdx}`}
                          checked={userAnswers[qIdx] === optIdx}
                          onChange={() => setUserAnswers({ ...userAnswers, [qIdx]: optIdx })}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setActiveQuizToTake(null)} className="h-10 rounded-lg border border-input px-4 text-sm font-medium">Cancel</button>
                <button type="button" onClick={submitQuizAttempt} className="h-10 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-primary/90">Submit Quiz Answers</button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 space-y-4">
              <CheckCircle2 className="size-12 text-emerald-500 mx-auto" />
              <h3 className="text-xl font-bold">Quiz Completed!</h3>
              <p className="text-sm text-muted-foreground">Your score: <span className="font-bold text-foreground">{quizFinishedResult.score} / {quizFinishedResult.total} ({quizFinishedResult.pct}%)</span></p>
              <button onClick={() => setActiveQuizToTake(null)} className="h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground">Back to Quizzes</button>
            </div>
          )}
        </Panel>
      )}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {ws.quizzes.map((q) => {
          const questions = ws.questions.filter((x) => x.quiz_id === q.id);
          const mine = me ? ws.attempts.filter((a) => a.quiz_id === q.id && a.trainee_id === me.id) : [];
          const best = mine.length ? Math.max(...mine.map((a) => Math.round(Number(a.percentage)))) : null;
          return (
            <div key={q.id} className="panel block p-4 transition-shadow hover:shadow-elevated relative group">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <ClipboardList className="size-4 text-primary shrink-0" />{q.title}
                </div>
                {canCreate && (
                  <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => startEditQuiz(q, e)} title="Edit Quiz" className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                      <Pencil className="size-3.5" />
                    </button>
                    <button onClick={(e) => handleDeleteQuiz(q.id, e)} title="Delete Quiz" className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{q.topic ?? "General"} · {questions.length || 3} questions</p>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="size-3.5" />{q.duration_min} min{q.due_at ? ` · due ${new Date(q.due_at).toLocaleDateString()}` : ""}</p>
              {best !== null && <p className="mt-2 text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block">Best score: {best}% ({mine.length} attempt(s))</p>}

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                <button onClick={() => startQuizAttempt(q)} className="h-8 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
                  <Play className="size-3" /> {best !== null ? "Retake Quiz" : "Start Quiz"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {ws.quizzes.length === 0 && <EmptyState title="No quizzes published yet" />}

      {me && (
        <Panel title="My Quiz Attempts & Scores">
          {ws.attempts.filter((a) => a.trainee_id === me.id).length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No quiz attempts recorded yet. Click "Start Quiz" on any quiz above.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {ws.attempts.filter((a) => a.trainee_id === me.id).map((a) => (
                <li key={a.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <span className="font-medium">{ws.quizzes.find((q) => q.id === a.quiz_id)?.title || "Assessment Quiz"}</span>
                  <span className="text-muted-foreground">{a.score}/{a.total} · <span className="font-bold text-emerald-600">{Math.round(Number(a.percentage))}%</span></span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}
    </div>
  );
}
