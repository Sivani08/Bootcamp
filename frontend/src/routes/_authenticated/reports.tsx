import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Download, Users, BarChart2, CheckCircle2, Layers, FileText, ChevronRight, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useWorkspace } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { PageHeader, Panel, SkeletonPage, Kpi, Initials } from "@/components/ui-bits";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({ meta: [
    { title: "Reports — BootMind" },
    { name: "description", content: "Daily batch reports, weekly summaries, monthly analytics and trainee intelligence." },
    { property: "og:title", content: "Reports — BootMind" },
    { property: "og:description", content: "Daily batch reports, weekly summaries, monthly analytics and trainee intelligence." },
  ] }),
  component: Page,
});

interface ReportCardItem {
  id: string;
  title: string;
  subtitle: string;
}

const GENERATED_REPORTS: ReportCardItem[] = [
  { id: "daily-1", title: "Daily batch report — Jul 28, 2026", subtitle: "Auto-generated at 6:00 AM" },
  { id: "weekly-1", title: "Weekly summary — Week 30", subtitle: "Auto-generated Jul 27, 2026" },
  { id: "monthly-1", title: "Monthly summary — June 2026", subtitle: "Auto-generated Jul 1, 2026" },
  { id: "batch12-1", title: "Batch 12 Domain Performance & Trainee Analytics Report", subtitle: "Auto-generated live snapshot" },
];

function Page() {
  const { data: ws, isLoading } = useWorkspace();
  const { role } = useAuth();
  const [expandedId, setExpandedId] = useState<string | null>("daily-1");

  const reportData = useMemo(() => {
    if (!ws) return [];
    return ws.trainees.map((t) => {
      const member = ws.members.find((m) => m.id === t.member_id);
      const domain = ws.domains.find((d) => d.id === t.domain_id);
      const batch = ws.batches.find((b) => b.id === t.batch_id);
      const subs = ws.submissions.filter((s) => s.trainee_id === t.id);
      const feedbacks = ws.feedback.filter((f) => f.trainee_id === t.id);
      const latestFb = feedbacks[0];

      return {
        id: t.id,
        name: member?.full_name ?? "Trainee",
        employeeId: (member as any)?.employee_id ?? "—",
        email: member?.email ?? "",
        domainName: domain?.name ?? "General",
        batchName: batch?.name ?? "Batch 12",
        learningHours: t.learning_hours ?? 0,
        submissionsCount: subs.length,
        streakDays: t.streak_days ?? 0,
        feedbackRating: latestFb ? `${latestFb.rating}/5` : "—",
      };
    });
  }, [ws]);

  if (isLoading || !ws) return <SkeletonPage />;

  const deTrainees = reportData.filter((r) => r.domainName.toLowerCase().includes("data engineering") || r.domainName.toLowerCase().includes("de"));
  const ctTrainees = reportData.filter((r) => r.domainName.toLowerCase().includes("cognitive") || r.domainName.toLowerCase().includes("ct"));
  const dcgTrainees = reportData.filter((r) => r.domainName.toLowerCase().includes("consulting") || r.domainName.toLowerCase().includes("dcg"));

  const exportCSV = (title: string) => {
    if (reportData.length === 0) {
      toast.error("No data to export.");
      return;
    }
    const headers = ["Employee ID", "Full Name", "Email", "Domain", "Batch", "Learning Hours", "Submissions", "Streak (Days)", "Feedback Rating"];
    const rows = reportData.map((r) => [
      `"${r.employeeId}"`,
      `"${r.name}"`,
      `"${r.email}"`,
      `"${r.domainName}"`,
      `"${r.batchName}"`,
      r.learningHours,
      r.submissionsCount,
      r.streakDays,
      `"${r.feedbackRating}"`,
    ]);
    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.replace(/[^a-z0-9]/gi, "_")}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    toast.success("CSV Report downloaded successfully!");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" subtitle="Daily batch summaries, weekly analytics and exportable intelligence." />

      {/* Top Banner Box matching user reference screenshot */}
      <div className="rounded-xl border border-border/80 bg-card/60 p-5 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500">
            <FileText className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Reports</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Prototype view — full CRUD screens are the next build phase.</p>
          </div>
        </div>
      </div>

      {/* Report Cards Stack matching user reference screenshot */}
      <div className="space-y-3">
        {GENERATED_REPORTS.map((report) => {
          const isExpanded = expandedId === report.id;
          return (
            <div key={report.id} className="rounded-xl border border-border/80 bg-card transition-colors overflow-hidden">
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : report.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500">
                    <FileText className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{report.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{report.subtitle}</p>
                  </div>
                </div>
                {isExpanded ? <ChevronDown className="size-5 text-muted-foreground" /> : <ChevronRight className="size-5 text-muted-foreground" />}
              </button>

              {isExpanded && (
                <div className="border-t border-border/70 p-5 bg-background/50 space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Report Metrics & Cohort Intelligence</span>
                    </div>
                    <button
                      onClick={() => exportCSV(report.title)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-input bg-background px-3 text-xs font-bold hover:bg-muted transition-colors"
                    >
                      <Download className="size-4" /> Download Report (CSV)
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Kpi label="Total Enrolled" value={reportData.length} icon={<Users className="size-4" />} />
                    <Kpi label="DE (Data Eng)" value={deTrainees.length} icon={<Layers className="size-4" />} tone="success" />
                    <Kpi label="CT (Cognitive Tech)" value={ctTrainees.length} icon={<BarChart2 className="size-4" />} tone="warning" />
                    <Kpi label="DCG (Domain Consulting)" value={dcgTrainees.length} icon={<CheckCircle2 className="size-4" />} tone="neutral" />
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-muted/50">
                        <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground">
                          <th className="py-2.5 px-3 font-medium">Trainee &amp; Emp ID</th>
                          <th className="py-2.5 px-3 font-medium">Domain</th>
                          <th className="py-2.5 px-3 font-medium">Batch</th>
                          <th className="py-2.5 px-3 font-medium">Submissions</th>
                          <th className="py-2.5 px-3 font-medium">Rating</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {reportData.map((r) => (
                          <tr key={r.id} className="hover:bg-muted/40 transition-colors">
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2">
                                <Initials name={r.name} />
                                <div>
                                  <span className="font-bold flex items-center gap-1">
                                    {r.name}
                                    <span className="rounded bg-muted px-1 py-0.2 text-[9px] font-mono text-muted-foreground">{r.employeeId}</span>
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 font-medium">{r.domainName}</td>
                            <td className="py-2.5 px-3 text-muted-foreground">{r.batchName}</td>
                            <td className="py-2.5 px-3">{r.submissionsCount} task(s)</td>
                            <td className="py-2.5 px-3 font-bold text-emerald-600">{r.feedbackRating}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
