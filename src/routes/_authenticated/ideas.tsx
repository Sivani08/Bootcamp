import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Lightbulb, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { useWorkspace } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { useActions, saveLocalIdea, updateLocalIdea, deleteLocalIdea } from "@/lib/actions";
import { EmptyState, Kpi, PageHeader, Panel, SkeletonPage } from "@/components/ui-bits";
import { getSignedTrainee } from "@/lib/scope";

export const Route = createFileRoute("/_authenticated/ideas")({
  head: () => ({ meta: [
    { title: "Idea Box — BootMind" },
    { name: "description", content: "Trainees submit project pitches & improvement ideas; admins review, approve or reject them." },
    { property: "og:title", content: "Idea Box — BootMind" },
    { property: "og:description", content: "Trainees submit project pitches & improvement ideas; admins review, approve or reject them." },
  ] }),
  component: Page,
});

function Page() {
  const { data: ws, isLoading } = useWorkspace();
  const { role, member } = useAuth();
  const { db, run } = useActions();
  const [form, setForm] = useState({ title: "", category: "Project Pitch", description: "" });
  const [responses, setResponses] = useState<Record<string, string>>({});

  if (isLoading || !ws) return <SkeletonPage />;
  const me = getSignedTrainee(ws, member);
  const rows = ws.ideas
    .filter((i) => role === "admin" || i.trainee_id === me?.id)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tid = me?.id;
    if (!tid) return;
    const payload = {
      trainee_id: tid,
      title: form.title.trim(),
      category: form.category,
      description: form.description.trim(),
      status: "new",
    };
    saveLocalIdea(payload);

    const ok = await run("Idea submitted successfully", () => db.from("ideas").insert(payload));
    if (ok) setForm({ title: "", category: "Project Pitch", description: "" });
  };

  const decide = async (id: string, status: "accepted" | "rejected" | "implemented", traineeMemberId: string) => {
    const adminNote = responses[id] ?? (status === "accepted" ? "Approved by Admin" : status === "rejected" ? "Rejected by Admin" : "Implemented");
    updateLocalIdea(id, status, adminNote);

    const ok = await run(`Idea ${status === "accepted" ? "Approved" : status === "rejected" ? "Rejected" : "Updated"}`, () =>
      db.from("ideas").update({ status, admin_response: adminNote }).eq("id", id),
    );
    if (ok) await notify(traineeMemberId, `Your idea pitch was ${status}`, adminNote, "idea", "/ideas");
  };

  const handleDeleteIdea = async (ideaId: string, title: string) => {
    if (confirm(`Are you sure you want to delete idea pitch "${title}"?`)) {
      deleteLocalIdea(ideaId);
      await run("Idea deleted successfully", async () => {
        try {
          await db.from("ideas").delete().eq("id", ideaId);
        } catch (e) {
          console.warn("Server idea delete notice:", e);
        }
        return { ok: true };
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Idea Box & Project Pitches" subtitle="Trainees submit project pitches and ideas; Admin manages approvals and rejections." />

      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi label="Total Submissions" value={rows.length} icon={<Lightbulb className="size-4" />} />
        <Kpi label="Approved / Accepted" value={rows.filter((i) => i.status === "accepted" || i.status === "implemented").length} tone="success" />
        <Kpi label="Pending Review" value={rows.filter((i) => i.status === "new" || i.status === "under_review").length} tone="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        {(role === "trainee" || true) && (
          <Panel title="Submit a Project Pitch or Idea">
            <form onSubmit={submit} className="space-y-3">
              <label className="block text-sm font-medium">Idea / Project Title
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. AI-powered Clinical Data Parser" className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" />
              </label>
              <label className="block text-sm font-medium">Category
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                  {["Project Pitch", "Learning experience", "Curriculum", "Tooling", "Community"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label className="block text-sm font-medium">Describe your Idea / Pitch
                <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Outline problem statement, tech stack, and goals..." className="mt-1 w-full rounded-lg border border-input bg-background p-3 text-sm" />
              </label>
              <button className="h-10 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90">Submit Idea Pitch</button>
            </form>
          </Panel>
        )}

        <Panel title="All Trainee Pitches & Ideas" className="lg:col-span-2">
          {rows.length === 0 ? (
            <EmptyState title="No ideas submitted yet" hint="Be the first to pitch a project or submit an idea." />
          ) : (
            <ul className="space-y-3">
              {rows.map((i) => {
                const t = ws.trainees.find((x) => x.id === i.trainee_id);
                const who = ws.members.find((x) => x.id === t?.member_id)?.full_name ?? "Trainee";
                const traineeMemberId = t?.member_id ?? "";
                const canDelete = role === "admin" || i.trainee_id === me?.id;

                let statusBadgeClass = "border-border text-muted-foreground bg-muted/40";
                if (i.status === "accepted" || i.status === "implemented") statusBadgeClass = "border-success/40 bg-success/10 text-success font-medium";
                else if (i.status === "rejected") statusBadgeClass = "border-destructive/40 bg-destructive/10 text-destructive font-medium";
                else if (i.status === "new" || i.status === "under_review") statusBadgeClass = "border-warning/40 bg-warning/10 text-warning font-medium";

                return (
                  <li key={i.id} className="rounded-lg border border-border p-3 space-y-2 relative group hover:border-border/80 transition-all">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{i.title}</p>
                        <p className="text-xs text-muted-foreground">{i.category} · pitched by <span className="font-medium text-foreground">{who}</span> · {new Date(i.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full border px-2.5 py-1 text-xs capitalize ${statusBadgeClass}`}>{i.status.replace("_", " ")}</span>
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteIdea(i.id, i.title)}
                            title="Delete idea pitch"
                            className="p-1.5 rounded-lg border border-transparent hover:border-destructive/30 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">{i.description}</p>
                    {i.admin_response && <p className="rounded-md bg-muted p-2 text-xs font-medium">Admin Response: {i.admin_response}</p>}

                    {role === "admin" && (
                      <div className="mt-3 pt-2 border-t border-border/60">
                        {i.status === "new" || i.status === "under_review" ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <input
                              placeholder="Admin review notes / feedback..."
                              value={responses[i.id] ?? ""}
                              onChange={(e) => setResponses({ ...responses, [i.id]: e.target.value })}
                              className="h-9 flex-1 min-w-[200px] rounded-lg border border-input bg-background px-3 text-xs"
                            />
                            <button
                              onClick={() => decide(i.id, "accepted", traineeMemberId)}
                              className="inline-flex h-9 items-center gap-1 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition-all"
                            >
                              <CheckCircle className="size-3.5" /> Approve (Accept)
                            </button>
                            <button
                              onClick={() => decide(i.id, "rejected", traineeMemberId)}
                              className="inline-flex h-9 items-center gap-1 rounded-lg border border-destructive/30 bg-destructive/10 px-3 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-all"
                            >
                              <XCircle className="size-3.5" /> Reject
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                              <CheckCircle className="size-3.5 text-emerald-500" />
                              Decision Recorded: {i.status === "accepted" || i.status === "implemented" ? "Approved" : "Rejected"}
                            </span>
                            <button
                              onClick={() => decide(i.id, "under_review", traineeMemberId)}
                              className="text-[11px] text-muted-foreground hover:text-foreground underline"
                            >
                              Change Decision / Re-evaluate ↺
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
