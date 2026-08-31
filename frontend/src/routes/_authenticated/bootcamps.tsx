import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Users, Layers, GraduationCap } from "lucide-react";
import { useWorkspace } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { useActions, saveLocalBatch } from "@/lib/actions";
import { PageHeader, Panel, SkeletonPage, Kpi } from "@/components/ui-bits";

export const Route = createFileRoute("/_authenticated/bootcamps")({
  head: () => ({ meta: [
    { title: "Bootcamps & Batches — BootMind" },
    { name: "description", content: "Manage enterprise bootcamps, create new batches, and inspect member distributions." },
    { property: "og:title", content: "Bootcamps & Batches — BootMind" },
    { property: "og:description", content: "Manage enterprise bootcamps, create new batches, and inspect member distributions." },
  ] }),
  component: Page,
});

function Page() {
  const { data: ws, isLoading } = useWorkspace();
  const { role } = useAuth();
  const { db, run } = useActions();
  const [openModal, setOpenModal] = useState(false);
  const [batchName, setBatchName] = useState("");

  if (isLoading || !ws) return <SkeletonPage />;

  const createBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchName.trim()) return;
    const defaultBootcampId = ws.bootcamps[0]?.id || "bc1";
    const payload = { bootcamp_id: defaultBootcampId, name: batchName.trim() };
    saveLocalBatch(payload);
    await run("Batch created successfully", () => db.from("batches").insert(payload));
    setBatchName("");
    setOpenModal(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bootcamps & Batches"
        subtitle="Manage program bootcamps and create training batches for trainee cohorts."
        actions={role === "admin" ? (
          <button onClick={() => setOpenModal(true)} className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            <Plus className="size-4" /> Create New Batch
          </button>
        ) : undefined}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi label="Active Batches" value={ws.batches.length} icon={<Layers className="size-4" />} />
        <Kpi label="Total Trainees" value={ws.trainees.length} icon={<Users className="size-4" />} tone="success" />
        <Kpi label="Active Domains" value={ws.domains.length} icon={<GraduationCap className="size-4" />} tone="neutral" />
      </div>

      {openModal && role === "admin" && (
        <Panel title="Create New Training Batch">
          <form onSubmit={createBatch} className="space-y-3 max-w-lg">
            <label className="block text-sm font-medium">Batch Name
              <input required value={batchName} onChange={(e) => setBatchName(e.target.value)} placeholder="e.g. Batch 13" className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" />
            </label>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">Create Batch</button>
              <button type="button" onClick={() => setOpenModal(false)} className="h-10 rounded-lg border border-input px-4 text-sm font-medium">Cancel</button>
            </div>
          </form>
        </Panel>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ws.batches.map((b) => {
          const batchTrainees = ws.trainees.filter((t) => t.batch_id === b.id);
          return (
            <Panel key={b.id} title={b.name} description={`${batchTrainees.length} trainees enrolled`}>
              <div className="space-y-2 mt-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Enrolled Trainees</span>
                  <span className="font-semibold text-foreground">{batchTrainees.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Domains</span>
                  <span className="font-semibold text-foreground">{ws.domains.length}</span>
                </div>
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
