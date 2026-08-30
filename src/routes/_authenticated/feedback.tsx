import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Star, Trash2 } from "lucide-react";
import { useWorkspace } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { useActions, notify, saveLocalFeedback, deleteLocalItem, markLocalFeedbackDeleted } from "@/lib/actions";
import { visibleTrainees } from "@/lib/scope";
import { EmptyState, Kpi, PageHeader, Panel, SkeletonPage } from "@/components/ui-bits";

export const Route = createFileRoute("/_authenticated/feedback")({
  head: () => ({ meta: [
    { title: "Feedback — BootMind" },
    { name: "description", content: "Structured mentor and buddy feedback with ratings across learning, communication and consistency." },
    { property: "og:title", content: "Feedback — BootMind" },
    { property: "og:description", content: "Structured mentor and buddy feedback with ratings across learning, communication and consistency." },
  ] }),
  component: Page,
});

const CATEGORIES = ["Technical skills", "Communication", "Consistency", "Problem solving", "Collaboration"];

function Page() {
  const { data: ws, isLoading } = useWorkspace();
  const { role, member } = useAuth();
  const { db, run } = useActions();
  const [traineeId, setTraineeId] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]!);
  const [rating, setRating] = useState(4);
  const [comments, setComments] = useState("");

  const me = useMemo(() => {
    if (!ws) return null;
    return ws.trainees.find((t) => t.member_id === member?.id || (member as any)?.employee_id?.toLowerCase() === t.member_id?.toLowerCase()) ?? null;
  }, [ws, member]);

  const scope = useMemo(() => (ws ? visibleTrainees(ws, role, member?.id) : []), [ws, role, member]);

  const rows = useMemo(() => {
    if (!ws) return [];
    return ws.feedback
      .filter((f) => {
        if (role === "admin") return true;
        if (role === "trainee") {
          return f.trainee_id === me?.id || f.trainee_id === member?.id;
        }
        return scope.some((s) => s.traineeId === f.trainee_id) || f.from_member_id === member?.id;
      })
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  }, [ws, role, member, me, scope]);

  if (isLoading || !ws) return <SkeletonPage />;

  const avg = rows.length ? (rows.reduce((s, f) => s + f.rating, 0) / rows.length).toFixed(1) : "—";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tid = traineeId || scope[0]?.traineeId;
    if (!tid || !member) return;

    const payload = {
      trainee_id: tid,
      from_member_id: member.id,
      kind: role === "buddy" ? "buddy" : role === "mentor" ? "mentor" : "admin",
      category,
      rating,
      comments: comments.trim(),
    };
    saveLocalFeedback(payload);

    const ok = await run("Feedback shared successfully", () => db.from("feedback").insert(payload));
    if (ok) {
      setComments("");
      const t = ws.trainees.find((x) => x.id === tid);
      if (t) await notify(t.member_id, "New feedback received", `${category} · ${rating}/5`, "feedback", "/feedback");
    }
  };

  const deleteFeedback = async (id: string) => {
    if (!confirm("Are you sure you want to delete this feedback entry?")) return;
    markLocalFeedbackDeleted(id);
    await run("Feedback entry deleted", () => db.from("feedback").delete().eq("id", id));
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Feedback History & Ratings" subtitle={role === "trainee" ? "What your mentor and buddy shared about your progress." : "Give structured, rated feedback to your trainees."} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi label="Feedback Entries" value={rows.length} />
        <Kpi label="Average rating" value={`${avg}/5`} tone="success" />
        <Kpi label="This month" value={rows.filter((f) => new Date(f.created_at).getMonth() === new Date().getMonth()).length} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        {role !== "trainee" && (
          <Panel title="Share feedback">
            <form onSubmit={submit} className="space-y-3">
              <label className="block text-sm font-medium">Trainee
                <select value={traineeId} onChange={(e) => setTraineeId(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                  {scope.map((s) => <option key={s.traineeId} value={s.traineeId}>{s.name}</option>)}
                </select>
              </label>
              <label className="block text-sm font-medium">Category
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              <fieldset>
                <legend className="text-sm font-medium">Rating</legend>
                <div className="mt-1 flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} star`} aria-pressed={rating === n} className="p-1">
                      <Star className={`size-5 ${n <= rating ? "fill-warning text-warning" : "text-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="block text-sm font-medium">Comments
                <textarea required value={comments} onChange={(e) => setComments(e.target.value)} rows={4} placeholder="Detailed notes for the trainee..." className="mt-1 w-full rounded-lg border border-input bg-background p-3 text-sm" />
              </label>
              <button className="h-10 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90">Submit feedback</button>
            </form>
          </Panel>
        )}

        <Panel title="Feedback History" className={role !== "trainee" ? "" : "lg:col-span-2"}>
          {rows.length === 0 ? (
            <EmptyState title="No feedback yet" hint="Ratings and comments will appear here as soon as submitted." />
          ) : (
            <ul className="space-y-3">
              {rows.map((f) => {
                const t = ws.trainees.find((x) => x.id === f.trainee_id);
                const to = ws.members.find((x) => x.id === t?.member_id)?.full_name ?? (t ? "Trainee" : "All Trainees");
                const from = ws.members.find((x) => x.id === f.from_member_id)?.full_name ?? "Admin / Mentor";
                const canDelete = role === "admin" || f.from_member_id === member?.id;

                return (
                  <li key={f.id} className="rounded-lg border border-border p-3.5 space-y-1 bg-card">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-bold text-foreground">{f.category}</p>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`size-3.5 ${n <= f.rating ? "fill-warning text-warning" : "text-muted-foreground/40"}`} />)}
                        </span>
                        {canDelete && (
                          <button
                            onClick={() => deleteFeedback(f.id)}
                            title="Delete feedback entry"
                            className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors ml-1"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    {f.comments && <p className="mt-1 text-sm text-muted-foreground leading-relaxed">“{f.comments}”</p>}
                    <p className="mt-2 text-xs text-muted-foreground">
                      Given by <span className="font-medium text-foreground">{from}</span> to <span className="font-medium text-foreground">{to}</span> · <span className="capitalize font-medium">{f.kind}</span> · {new Date(f.created_at).toLocaleDateString()}
                    </p>
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
