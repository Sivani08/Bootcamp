import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Play, CheckCircle2, XCircle, Pencil, Trash2 } from "lucide-react";
import { useWorkspace, type CodingProblem } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { useActions, logActivity, saveLocalProblem, editLocalItem, deleteLocalItem } from "@/lib/actions";
import { EmptyState, Kpi, PageHeader, Panel, SkeletonPage } from "@/components/ui-bits";
import { createCodingProblemFn } from "@/lib/server-actions.functions";

export const Route = createFileRoute("/_authenticated/coding")({
  head: () => ({ meta: [
    { title: "Coding Practice — BootMind" },
    { name: "description", content: "Solve JavaScript coding problems in the browser, run them and record pass/fail attempts." },
    { property: "og:title", content: "Coding Practice — BootMind" },
    { property: "og:description", content: "Solve JavaScript coding problems in the browser, run them and record pass/fail attempts." },
  ] }),
  component: Page,
});

function runCode(code: string): { output: string; error: boolean } {
  const lines: string[] = [];
  try {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
    const fn = new Function("console", `"use strict";\n${code}`);
    fn({ log: (...args: unknown[]) => lines.push(args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ")) });
    return { output: lines.join("\n"), error: false };
  } catch (e) {
    return { output: e instanceof Error ? e.message : "Error", error: true };
  }
}

function Page() {
  const { data: ws, isLoading } = useWorkspace();
  const { role, member } = useAuth();
  const { db, run } = useActions();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState<string | null>(null);
  const [passed, setPassed] = useState<boolean | null>(null);
  const [difficulty, setDifficulty] = useState("all");
  const [openForm, setOpenForm] = useState(false);
  const [editingProblem, setEditingProblem] = useState<CodingProblem | null>(null);
  const [draft, setDraft] = useState({ title: "", difficulty: "easy", topic: "Python", prompt: "", expected_output: "", starter_code: "" });

  if (isLoading || !ws) return <SkeletonPage />;
  const me = ws.trainees.find((t) => t.member_id === member?.id);
  const canCreate = role === "admin" || role === "mentor" || role === "buddy";
  const problems = ws.problems.filter((p) => difficulty === "all" || p.difficulty === difficulty);
  const active = ws.problems.find((p) => p.id === activeId) ?? null;
  const mine = me ? ws.codingAttempts.filter((a) => a.trainee_id === me.id) : [];

  const createProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    const newProb = {
      id: `prob-local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: draft.title,
      difficulty: draft.difficulty,
      topic: draft.topic,
      prompt: draft.prompt,
      expected_output: draft.expected_output || null,
      starter_code: draft.starter_code || "def solve():\n    return None",
      domain_id: ws.domains[0]?.id || null,
    };
    saveLocalProblem(newProb);

    await run("Coding problem published", async () => {
      try {
        await createCodingProblemFn({
          data: {
            title: draft.title,
            difficulty: draft.difficulty,
            topic: draft.topic,
            prompt: draft.prompt,
            expected_output: draft.expected_output,
            starter_code: draft.starter_code || "def solve():\n    return None",
            domain_id: ws.domains[0]?.id,
          },
        });
      } catch (err) {
        console.warn("Server problem creation notice:", err);
      }
      return { ok: true };
    });

    setDraft({ title: "", difficulty: "easy", topic: "Python", prompt: "", expected_output: "", starter_code: "" });
    setOpenForm(false);
  };

  const startEditProblem = (p: CodingProblem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingProblem(p);
    setDraft({
      title: p.title,
      difficulty: p.difficulty || "easy",
      topic: p.topic || "General",
      prompt: p.prompt || "",
      expected_output: p.expected_output || "",
      starter_code: p.starter_code || "",
    });
  };

  const handleUpdateProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProblem) return;
    const payload = {
      title: draft.title,
      difficulty: draft.difficulty,
      topic: draft.topic,
      prompt: draft.prompt,
      expected_output: draft.expected_output || null,
      starter_code: draft.starter_code,
    };
    editLocalItem("bootmind_local_problems", editingProblem.id, payload);
    await run("Coding problem updated", () => Promise.resolve({ ok: true }));
    setEditingProblem(null);
    setDraft({ title: "", difficulty: "easy", topic: "Python", prompt: "", expected_output: "", starter_code: "" });
  };

  const handleDeleteProblem = async (probId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to remove this problem?")) return;
    deleteLocalItem("bootmind_local_problems", probId);
    if (activeId === probId) setActiveId(null);
    await run("Problem removed", () => Promise.resolve({ ok: true }));
  };

  const open = (id: string) => {
    const p = ws.problems.find((x) => x.id === id);
    setActiveId(id);
    setCode(p?.starter_code ?? "// write your solution and console.log the result\n");
    setOutput(null);
    setPassed(null);
  };

  const execute = async () => {
    if (!active) return;
    const res = runCode(code);
    const ok = !res.error && (active.expected_output ?? "").trim() !== "" && res.output.trim() === (active.expected_output ?? "").trim();
    setOutput(res.output);
    setPassed(ok);
    if (me) {
      await run(ok ? "All checks passed" : "Attempt recorded", () =>
        db.from("coding_attempts").insert({ problem_id: active.id, trainee_id: me.id, code, passed: ok, output: res.output }),
      );
      await logActivity(me.id, "coding", `${ok ? "Solved" : "Attempted"}: ${active.title}`, 20);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coding practice"
        subtitle="Write code or access LeetCode challenges, run solutions and track completion."
        actions={canCreate ? (
          <button onClick={() => { setOpenForm((o) => !o); setEditingProblem(null); }} className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground">
            + New problem / link
          </button>
        ) : undefined}
      />

      {openForm && canCreate && (
        <Panel title="Publish coding problem or LeetCode challenge">
          <form onSubmit={createProblem} className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium">Title
              <input required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Two Sum / SQL Window Functions" className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" />
            </label>
            <label className="text-sm font-medium">Difficulty
              <select value={draft.difficulty} onChange={(e) => setDraft({ ...draft, difficulty: e.target.value })} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
              </select>
            </label>
            <label className="text-sm font-medium">Topic
              <input value={draft.topic} onChange={(e) => setDraft({ ...draft, topic: e.target.value })} placeholder="e.g. Arrays, Python, SQL" className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" />
            </label>
            <label className="text-sm font-medium">Expected Output (if auto-checked)
              <input value={draft.expected_output} onChange={(e) => setDraft({ ...draft, expected_output: e.target.value })} placeholder="e.g. 5 or [1,2,3]" className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" />
            </label>
            <label className="text-sm font-medium sm:col-span-2">Prompt / LeetCode Problem Link
              <textarea required value={draft.prompt} onChange={(e) => setDraft({ ...draft, prompt: e.target.value })} rows={3} placeholder="Describe problem or paste LeetCode URL e.g. https://leetcode.com/problems/..." className="mt-1 w-full rounded-lg border border-input bg-background p-3 text-sm" />
            </label>
            <div className="flex gap-2 sm:col-span-2">
              <button type="submit" className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">Publish problem</button>
              <button type="button" onClick={() => setOpenForm(false)} className="h-10 rounded-lg border border-input px-4 text-sm font-medium">Cancel</button>
            </div>
          </form>
        </Panel>
      )}

      {editingProblem && canCreate && (
        <Panel title={`Edit Problem: ${editingProblem.title}`}>
          <form onSubmit={handleUpdateProblem} className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium">Title
              <input required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" />
            </label>
            <label className="text-sm font-medium">Difficulty
              <select value={draft.difficulty} onChange={(e) => setDraft({ ...draft, difficulty: e.target.value })} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
              </select>
            </label>
            <label className="text-sm font-medium">Topic
              <input value={draft.topic} onChange={(e) => setDraft({ ...draft, topic: e.target.value })} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" />
            </label>
            <label className="text-sm font-medium">Expected Output
              <input value={draft.expected_output} onChange={(e) => setDraft({ ...draft, expected_output: e.target.value })} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" />
            </label>
            <label className="text-sm font-medium sm:col-span-2">Prompt / Instructions
              <textarea required value={draft.prompt} onChange={(e) => setDraft({ ...draft, prompt: e.target.value })} rows={3} className="mt-1 w-full rounded-lg border border-input bg-background p-3 text-sm" />
            </label>
            <div className="flex gap-2 sm:col-span-2">
              <button type="submit" className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">Save Problem Changes</button>
              <button type="button" onClick={() => setEditingProblem(null)} className="h-10 rounded-lg border border-input px-4 text-sm font-medium">Cancel</button>
            </div>
          </form>
        </Panel>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi label="Problems" value={ws.problems.length} />
        <Kpi label="My attempts" value={mine.length} />
        <Kpi label="Accuracy" value={`${mine.length ? Math.round((mine.filter((a) => a.passed).length / mine.length) * 100) : 0}%`} tone="success" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Panel
          title="Problems"
          action={
            <select aria-label="Difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="h-9 rounded-lg border border-input bg-background px-2 text-sm">
              <option value="all">All</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
            </select>
          }
        >
          <ul className="space-y-2">
            {problems.map((p) => {
              const solved = mine.some((a) => a.problem_id === p.id && a.passed);
              return (
                <li key={p.id}>
                  <div className={`w-full rounded-lg border p-3 flex items-center justify-between gap-2 ${activeId === p.id ? "border-primary bg-accent" : "border-border hover:bg-muted"}`}>
                    <button onClick={() => open(p.id)} className="flex-1 text-left">
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">{p.title}</span>
                        {solved && <CheckCircle2 className="size-4 text-success" />}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground capitalize">{p.difficulty} · {p.topic ?? "General"}</span>
                    </button>
                    {canCreate && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={(e) => startEditProblem(p, e)} title="Edit Problem" className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                          <Pencil className="size-3.5" />
                        </button>
                        <button onClick={(e) => handleDeleteProblem(p.id, e)} title="Delete Problem" className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          {problems.length === 0 && <EmptyState title="No problems for this filter" />}
        </Panel>

        <Panel title={active?.title ?? "Select a problem"} description={active?.prompt ?? undefined}>
          {active ? (
            <div className="space-y-3">
              <textarea value={code} onChange={(e) => setCode(e.target.value)} rows={14} spellCheck={false}
                className="w-full rounded-lg border border-input bg-muted/40 p-3 font-mono text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={execute} className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                  <Play className="size-4" /> Run &amp; submit
                </button>
                {passed != null && (
                  <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${passed ? "text-success" : "text-destructive"}`}>
                    {passed ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
                    {passed ? "Passed" : "Output does not match expected"}
                  </span>
                )}
              </div>
              {output != null && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><p className="mb-1 text-xs font-medium text-muted-foreground uppercase">Your output</p>
                    <pre className="min-h-16 rounded-lg bg-muted p-3 text-xs whitespace-pre-wrap">{output || "(no output)"}</pre></div>
                  <div><p className="mb-1 text-xs font-medium text-muted-foreground uppercase">Expected</p>
                    <pre className="min-h-16 rounded-lg bg-muted p-3 text-xs whitespace-pre-wrap">{active.expected_output ?? "—"}</pre></div>
                </div>
              )}
            </div>
          ) : (
            <EmptyState title="Pick a problem to start coding" hint="Solutions run locally in your browser." />
          )}
        </Panel>
      </div>
    </div>
  );
}
