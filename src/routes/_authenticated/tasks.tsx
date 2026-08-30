import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, BookOpen, ChevronDown, CheckCircle2, Clock, FileText, Download, Award, Bell, User } from "lucide-react";
import { toast } from "sonner";
import { useWorkspace, type Task } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { useActions, logActivity, notify, saveLocalTask, saveLocalSubmission, editLocalItem, deleteLocalItem } from "@/lib/actions";
import { visibleTrainees, getSignedTrainee } from "@/lib/scope";
import { EmptyState, Kpi, PageHeader, Panel, SkeletonPage, Initials, Meter } from "@/components/ui-bits";
import { insertTaskFn, submitTaskFn, reviewTaskFn } from "@/lib/server-actions.functions";

export const Route = createFileRoute("/_authenticated/tasks")({
  head: () => ({ meta: [
    { title: "Tasks & Assessments — BootMind" },
    { name: "description", content: "Assign, submit and review bootcamp tasks and assignments with live status tracking." },
    { property: "og:title", content: "Tasks & Assessments — BootMind" },
    { property: "og:description", content: "Assign, submit and review bootcamp tasks and assignments with live status tracking." },
  ] }),
  component: Page,
});

function Page() {
  const { data: ws, isLoading } = useWorkspace();
  const { role, member } = useAuth();
  const { refresh, run } = useActions();
  const [openForm, setOpenForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [draft, setDraft] = useState({ title: "", description: "", kind: "task", priority: "medium", domain_id: "", trainee_id: "", due_at: "" });
  const [answerFor, setAnswerFor] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [fileData, setFileData] = useState<{ name: string; url: string; size: number } | null>(null);
  const [filter, setFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState<"all" | "admin" | "mentor_buddy">("all");
  const [typeCategory, setTypeCategory] = useState<"assessments" | "tasks" | "all">("assessments");

  const startEditTask = (t: Task) => {
    setEditingTask(t);
    setDraft({
      title: t.title,
      description: t.description || "",
      kind: t.kind || "task",
      priority: t.priority || "medium",
      domain_id: t.domain_id || "",
      trainee_id: t.trainee_id || "",
      due_at: t.due_at ? t.due_at.slice(0, 10) : "",
    });
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    const payload = {
      title: draft.title,
      description: draft.description,
      kind: draft.kind,
      priority: draft.priority,
      domain_id: draft.domain_id || null,
      trainee_id: draft.trainee_id || null,
      due_at: draft.due_at ? new Date(draft.due_at).toISOString() : null,
      created_by_member_id: editingTask.created_by_member_id || member?.id || null,
    };
    editLocalItem("bootmind_local_tasks", editingTask.id, payload);
    await run("Task updated successfully", async () => {
      try {
        await insertTaskFn({ data: { id: editingTask.id, ...payload } as any });
      } catch {}
      return { ok: true };
    });
    setEditingTask(null);
    setDraft({ title: "", description: "", kind: "task", priority: "medium", domain_id: "", trainee_id: "", due_at: "" });
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to remove this task?")) return;
    deleteLocalItem("bootmind_local_tasks", taskId);
    await run("Task removed", async () => {
      refresh();
      return { ok: true };
    });
  };

  const me = useMemo(() => {
    if (!ws || !member) return null;
    return getSignedTrainee(ws, member);
  }, [ws, member]);

  if (isLoading || !ws) return <SkeletonPage />;

  const canCreate = role === "admin" || role === "mentor" || role === "buddy";
  const scopeTrainees = visibleTrainees(ws, role, member?.id);
  const domainIds = new Set(scopeTrainees.map((t) => t.domainId));

  const isMentorBuddyTask = (t: Task) => {
    if (t.trainee_id && t.trainee_id !== "") return true;
    if (t.created_by_member_id) {
      const creator = ws.members.find((m) => m.id === t.created_by_member_id);
      if (creator?.role === "mentor" || creator?.role === "buddy") return true;
    }
    return false;
  };

  const tasks = ws.tasks.filter((t) => {
    if (role === "admin") return true;
    if (role === "trainee") {
      if (t.trainee_id && t.trainee_id !== "") {
        return me && t.trainee_id === me.id;
      }
      return !t.domain_id || t.domain_id === "" || (me && t.domain_id.split(",").includes(me.domain_id));
    }
    // For Mentor / Buddy: EXCLUDE admin tasks! Only show tasks created by this mentor/buddy or targeted to their assigned trainees!
    return (
      t.created_by_member_id === member?.id ||
      (t.trainee_id && scopeTrainees.some((s) => s.traineeId === t.trainee_id))
    );
  });

  const subFor = useCallback(
    (taskId: string, traineeId?: string) =>
      ws.submissions.find((s) => s.task_id === taskId && s.trainee_id === (traineeId ?? me?.id)),
    [ws.submissions, me]
  );

  const isAssessment = (t: Task) =>
    t.kind === "assessment" ||
    t.kind === "quiz" ||
    t.kind === "leetcode" ||
    t.title.toLowerCase().includes("assessment") ||
    t.title.toLowerCase().includes("day ");

  const isTaskSubmitted = useCallback(
    (taskId: string) => {
      if (role === "trainee" && me) {
        const s = subFor(taskId);
        return s?.status === "submitted" || s?.status === "reviewed" || s?.status === "completed";
      }
      // For Admin, Mentor, Buddy:
      // A task/assessment is submitted if any trainees have submitted work for it!
      return ws.submissions.some(
        (s) => s.task_id === taskId && (s.status === "submitted" || s.status === "reviewed" || s.status === "completed")
      );
    },
    [role, me, subFor, ws.submissions]
  );

  const totalAssessmentsList = useMemo(() => tasks.filter((t) => isAssessment(t)), [tasks]);
  const totalTasksList = useMemo(() => tasks.filter((t) => !isAssessment(t)), [tasks]);

  const submittedAssessmentsCount = useMemo(
    () => totalAssessmentsList.filter((t) => isTaskSubmitted(t.id)).length,
    [totalAssessmentsList, isTaskSubmitted]
  );

  const fullySubmittedAssessmentsCount = useMemo(
    () =>
      totalAssessmentsList.filter((t) => {
        const targets = scopeTrainees.filter((s) => !t.domain_id || t.domain_id === "" || s.domainId === t.domain_id);
        const targetIds = new Set(targets.map((st) => st.traineeId));
        const subs = ws.submissions.filter((s) => s.task_id === t.id && targetIds.has(s.trainee_id));
        return subs.length >= (targets.length || 1);
      }).length,
    [totalAssessmentsList, scopeTrainees, ws.submissions]
  );

  const pendingAssessmentsCount = totalAssessmentsList.length - submittedAssessmentsCount;

  const submittedTasksCount = useMemo(
    () => totalTasksList.filter((t) => isTaskSubmitted(t.id)).length,
    [totalTasksList, isTaskSubmitted]
  );
  const pendingTasksCount = totalTasksList.length - submittedTasksCount;

  const assessmentTasksCount = totalAssessmentsList.length;
  const learningTasksCount = totalTasksList.length;

  const shown = tasks.filter((t) => {
    if (typeCategory === "assessments" && !isAssessment(t)) return false;
    if (typeCategory === "tasks" && isAssessment(t)) return false;

    if (sourceFilter === "admin" && isMentorBuddyTask(t)) return false;
    if (sourceFilter === "mentor_buddy" && !isMentorBuddyTask(t)) return false;
    if (filter === "all") return true;
    const submitted = isTaskSubmitted(t.id);
    if (filter === "open") return !submitted;
    if (filter === "submitted" || filter === "completed") return submitted;
    return true;
  });

  const adminTasksCount = tasks.filter((t) => !isMentorBuddyTask(t)).length;
  const mentorBuddyTasksCount = tasks.filter((t) => isMentorBuddyTask(t)).length;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const blobUrl = URL.createObjectURL(file);
    setFileData({
      name: file.name,
      url: blobUrl,
      size: file.size,
    });
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const isAssessmentDraft = draft.kind === "assessment" || draft.kind === "quiz" || draft.kind === "leetcode";
    const targetDomain = draft.domain_id ? draft.domain_id : null;
    const newTask = {
      id: `task-local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: draft.title,
      description: draft.description,
      kind: draft.kind,
      priority: draft.priority,
      domain_id: targetDomain,
      trainee_id: draft.trainee_id || null,
      submission_type: "file",
      due_at: draft.due_at ? new Date(draft.due_at).toISOString() : null,
      created_by_member_id: member?.id || null,
    };
    saveLocalTask(newTask);

    await run(`${isAssessmentDraft ? "Assessment" : "Task"} assigned successfully 🎉`, async () => {
      try {
        await insertTaskFn({
          data: {
            title: draft.title,
            description: draft.description,
            kind: draft.kind,
            priority: draft.priority,
            domain_id: targetDomain || undefined,
            due_at: draft.due_at ? new Date(draft.due_at).toISOString() : null,
          },
        });
      } catch (err) {
        console.warn("Server insert notice:", err);
      }
      return { ok: true };
    });

    if (role === "mentor" || role === "buddy") {
      if (draft.trainee_id) {
        const targeted = scopeTrainees.find((st) => st.traineeId === draft.trainee_id);
        if (targeted) {
          await notify(targeted.memberId, `New ${isAssessmentDraft ? "Assessment" : "Task"} Assigned 📝`, `Your ${role} assigned work specifically to you: "${draft.title}"`, "task", "/tasks");
        }
      } else {
        for (const t of scopeTrainees) {
          await notify(t.memberId, `New ${isAssessmentDraft ? "Assessment" : "Task"} Assigned 📝`, `Your ${role} assigned work to you: "${draft.title}"`, "task", "/tasks");
        }
      }
    } else {
      if (draft.trainee_id) {
        const targeted = scopeTrainees.find((st) => st.traineeId === draft.trainee_id);
        if (targeted) {
          await notify(targeted.memberId, `New ${isAssessmentDraft ? "Assessment" : "Task"} Assigned 📝`, `Admin assigned work specifically to you: "${draft.title}"`, "task", "/tasks");
        }
      } else {
        for (const t of scopeTrainees.filter((s) => !targetDomain || s.domainId === targetDomain)) {
          await notify(t.memberId, `New ${isAssessmentDraft ? "Assessment" : "Task"} Assigned`, draft.title, "task", "/tasks");
        }
      }
    }

    setDraft({ title: "", description: "", kind: "task", priority: "medium", domain_id: "", trainee_id: "", due_at: "" });
    setOpenForm(false);
  };

  const submitWork = async (taskId: string, title: string, isAssessmentItem: boolean) => {
    const activeTrainee = me || ws.trainees[0];
    if (!activeTrainee) return;

    if (!answer.trim() && !fileData) {
      toast.error(`Cannot submit empty ${isAssessmentItem ? "assessment" : "task"}. Please enter your answer or upload a file before submitting.`);
      return;
    }

    const existing = subFor(taskId, activeTrainee.id);
    const submissionContent = JSON.stringify({
      text: answer,
      file: fileData ? { name: fileData.name, url: fileData.url, size: fileData.size } : null,
    });

    const newSub = {
      id: existing?.id || `sub-local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      task_id: taskId,
      trainee_id: activeTrainee.id,
      status: "submitted",
      content: submissionContent,
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    saveLocalSubmission(newSub);

    await run(`${isAssessmentItem ? "Assessment" : "Task"} submitted successfully 🎉`, async () => {
      try {
        await submitTaskFn({
          data: {
            taskId,
            traineeId: activeTrainee.id,
            existingId: existing?.id,
            content: submissionContent,
          },
        });
      } catch (err) {
        console.warn("Server submit notice:", err);
      }
      return { ok: true };
    });

    setAnswer("");
    setFileData(null);
    setAnswerFor(null);
    await logActivity(activeTrainee.id, "task", `Completed ${isAssessmentItem ? "Assessment" : "Task"}: ${title}`, 30);
  };

  const review = async (submissionId: string, score: number) => {
    const existing = ws.submissions.find((s) => s.id === submissionId);
    if (existing) {
      saveLocalSubmission({ ...existing, status: "reviewed", score });
    }

    await run("Review saved", async () => {
      try {
        await reviewTaskFn({ data: { submissionId, score } });
      } catch (err) {
        console.warn("Server review notice:", err);
      }
      return { ok: true };
    });
  };

  const pending = tasks.filter((t) => !subFor(t.id) || subFor(t.id)?.status === "in_progress").length;

  const renderDescriptionWithLinks = (text: string | null) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
    const lines = text.split("\n");
    return (
      <div className="space-y-1.5 pt-1">
        {lines.map((line, lIdx) => {
          const parts = line.split(urlRegex);
          return (
            <div key={lIdx} className="leading-relaxed">
              {parts.map((part, i) => {
                if (!part) return null;
                if (part.match(/^(https?:\/\/|www\.)/i)) {
                  const href = part.startsWith("www.") ? `https://${part}` : part;
                  const isLeetCode = part.toLowerCase().includes("leetcode.com");
                  const isHackerRank = part.toLowerCase().includes("hackerrank.com");
                  const isUdemy = part.toLowerCase().includes("udemy.com");

                  let badgeLabel = "Open Problem Link ↗";
                  let badgeClass = "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20";

                  if (isLeetCode) {
                    badgeLabel = "⚡ Open LeetCode Problem ↗";
                    badgeClass = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20";
                  } else if (isHackerRank) {
                    badgeLabel = "🟢 Open HackerRank Challenge ↗";
                    badgeClass = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20";
                  } else if (isUdemy) {
                    badgeLabel = "🎓 Launch Udemy Course ↗";
                    badgeClass = "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 hover:bg-purple-500/20";
                  }

                  return (
                    <a
                      key={i}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className={`inline-flex items-center gap-1 font-bold text-xs border px-2.5 py-1 rounded-md my-0.5 transition-all shadow-sm ${badgeClass}`}
                    >
                      {badgeLabel}
                    </a>
                  );
                }
                return <span key={i}>{part}</span>;
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks & assessments"
        subtitle={role === "trainee" ? "Everything assigned to you, with multi-format submission tracking." : "Assign tasks, assessments or LeetCode challenges and review trainee submissions."}
        actions={canCreate ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setDraft((d) => ({ ...d, kind: "assessment" }));
                setOpenForm(true);
              }}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-purple-600 px-3 text-sm font-semibold text-white hover:bg-purple-700 shadow-xs cursor-pointer"
            >
              <Plus className="size-4" /> New Assessment
            </button>
            <button
              onClick={() => {
                setDraft((d) => ({ ...d, kind: "task" }));
                setOpenForm(true);
              }}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-700 shadow-xs cursor-pointer"
            >
              <Plus className="size-4" /> New Task
            </button>
          </div>
        ) : undefined}
      />

      {typeCategory === "assessments" ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Kpi label="Total Assessments" value={totalAssessmentsList.length} hint="14 SharePoint & Domain Assessments" />
          <Kpi
            label={role === "trainee" ? "Submitted Assessments" : "Assessments Completed"}
            value={role === "trainee" ? submittedAssessmentsCount : `${submittedAssessmentsCount} / ${totalAssessmentsList.length}`}
            tone="success"
            hint={role === "trainee" ? "Completed by you" : `${fullySubmittedAssessmentsCount} fully completed by all trainees`}
          />
          <Kpi
            label={role === "trainee" ? "Pending Assessments" : "Pending Assessments"}
            value={pendingAssessmentsCount}
            tone={pendingAssessmentsCount > 0 ? "warning" : "success"}
            hint={role === "trainee" ? "Awaiting submission" : pendingAssessmentsCount === 0 ? "All 14 assessments have submissions!" : "Assessments awaiting submission"}
          />
        </div>
      ) : typeCategory === "tasks" ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Kpi label="Total Learning Tasks" value={totalTasksList.length} hint="SQL & Domain Practice Tasks" />
          <Kpi
            label={role === "trainee" ? "Submitted Tasks" : "Tasks Completed"}
            value={role === "trainee" ? submittedTasksCount : `${submittedTasksCount} / ${totalTasksList.length}`}
            tone="success"
            hint={role === "trainee" ? "Completed learning tasks" : "Tasks with trainee submissions"}
          />
          <Kpi
            label={role === "trainee" ? "Pending Tasks" : "Pending Tasks"}
            value={pendingTasksCount}
            tone={pendingTasksCount > 0 ? "warning" : "success"}
            hint={role === "trainee" ? "Awaiting completion" : "Tasks awaiting submission"}
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <Kpi label="Total Assessments" value={totalAssessmentsList.length} hint="SharePoint & Domain Assessments" />
          <Kpi label="Total Learning Tasks" value={totalTasksList.length} hint="SQL & Domain Practice Tasks" />
          <Kpi
            label="Total Submissions Received"
            value={ws.submissions.filter((s) => s.status === "submitted" || s.status === "reviewed" || s.status === "completed").length}
            tone="success"
            hint="Across all trainees & assignments"
          />
        </div>
      )}

      {/* Primary Category Selector: Assessments vs Tasks */}
      <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl bg-muted/60 border border-border/80 shadow-xs">
        <button
          type="button"
          onClick={() => setTypeCategory("assessments")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-extrabold transition-all cursor-pointer ${
            typeCategory === "assessments"
              ? "bg-purple-600 text-white shadow-md ring-2 ring-purple-600/30 scale-[1.02]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted font-bold"
          }`}
        >
          <span>📝 Assessments ({assessmentTasksCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setTypeCategory("tasks")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-extrabold transition-all cursor-pointer ${
            typeCategory === "tasks"
              ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-600/30 scale-[1.02]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted font-bold"
          }`}
        >
          <span>📋 Learning Tasks ({learningTasksCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setTypeCategory("all")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-extrabold transition-all cursor-pointer ${
            typeCategory === "all"
              ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30 scale-[1.02]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted font-bold"
          }`}
        >
          <span>🌐 View All ({tasks.length})</span>
        </button>
      </div>

      {openForm && canCreate && (
        <Panel
          title={
            draft.kind === "assessment" || draft.kind === "quiz" || draft.kind === "leetcode"
              ? "📝 Assign New Assessment"
              : "📋 Assign New Learning Task"
          }
        >
          <form onSubmit={createTask} className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium">Title
              <input required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder={draft.kind === "assessment" ? "e.g. Day 15 SQL Assessment / Mid-Term Exam" : "e.g. Daily PySpark Practice / SQL Exercise"} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" />
            </label>
            <label className="text-sm font-medium">Domain
              <select value={draft.domain_id} onChange={(e) => setDraft({ ...draft, domain_id: e.target.value })} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                <option value="">All Domains</option>
                {ws.domains.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium sm:col-span-2">Assign to Trainee
              <select value={draft.trainee_id} onChange={(e) => setDraft({ ...draft, trainee_id: e.target.value })} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-semibold">
                {role === "mentor" || role === "buddy" ? (
                  <>
                    <option value="">All My Assigned Trainees ({scopeTrainees.length})</option>
                    {scopeTrainees.map((st) => (
                      <option key={st.traineeId} value={st.traineeId}>
                        Target Trainee: {st.name} ({st.domainName || "Trainee"})
                      </option>
                    ))}
                  </>
                ) : (
                  <>
                    <option value="">All Trainees (Batch-Wide Curriculum)</option>
                    {scopeTrainees.map((st) => (
                      <option key={st.traineeId} value={st.traineeId}>
                        Specific Trainee: {st.name} ({st.domainName || "Trainee"})
                      </option>
                    ))}
                  </>
                )}
              </select>
            </label>
            <label className="text-sm font-medium">Type
              <select value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value })} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-semibold">
                <option value="assessment">📝 Assessment (Graded / Exam)</option>
                <option value="task">📋 Task (Learning Practice)</option>
                <option value="assignment">📑 Assignment</option>
                <option value="quiz">❓ Quiz</option>
                <option value="leetcode">⚡ LeetCode / Challenge</option>
                <option value="project">🚀 Project</option>
              </select>
            </label>
            <label className="text-sm font-medium">Priority
              <select value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value })} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select>
            </label>
            <label className="text-sm font-medium">Due date
              <input type="date" value={draft.due_at} onChange={(e) => setDraft({ ...draft, due_at: e.target.value })} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" />
            </label>
            <label className="text-sm font-medium sm:col-span-2">Description / Problem Requirements / External Links
              <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} rows={3} placeholder="Add problem description or paste link e.g. https://leetcode.com/problems/..." className="mt-1 w-full rounded-lg border border-input bg-background p-3 text-sm" />
            </label>
            <button className={`h-10 rounded-lg text-sm font-semibold text-white sm:col-span-2 transition-all cursor-pointer ${
              draft.kind === "assessment" || draft.kind === "quiz" || draft.kind === "leetcode" ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"
            }`}>
              {draft.kind === "assessment" || draft.kind === "quiz" || draft.kind === "leetcode" ? "Assign Assessment to Trainees" : "Assign Task to Trainees"}
            </button>
          </form>
        </Panel>
      )}

      <Panel
        title={
          typeCategory === "assessments"
            ? "📝 Assessments & Examinations"
            : typeCategory === "tasks"
            ? "📋 Learning Tasks & Assignments"
            : "Tasks & Assessments Board"
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            <select aria-label="Filter status" value={filter} onChange={(e) => setFilter(e.target.value)} className="h-9 rounded-lg border border-input bg-background px-2 text-xs font-semibold">
              <option value="all">Status: All</option><option value="open">Status: Open</option><option value="submitted">Status: Submitted</option><option value="completed">Status: Completed</option>
            </select>
          </div>
        }
      >
        {/* Source Category Tabs */}
        {role === "mentor" || role === "buddy" ? (
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-border">
            <span className="text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-md border border-purple-500/20">
              🤝 Tasks & Assignments Created For Your Trainees ({tasks.length})
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 pb-4 mb-4 border-b border-border">
            <button
              type="button"
              onClick={() => setSourceFilter("all")}
              className={`h-8 px-3 rounded-lg text-xs font-bold transition-all ${
                sourceFilter === "all"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted"
              }`}
            >
              All Tasks ({tasks.length})
            </button>

            <button
              type="button"
              onClick={() => setSourceFilter("admin")}
              className={`h-8 px-3 rounded-lg text-xs font-bold transition-all ${
                sourceFilter === "admin"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500/20"
              }`}
            >
              General / Main Tasks ({adminTasksCount})
            </button>

            <button
              type="button"
              onClick={() => setSourceFilter("mentor_buddy")}
              className={`h-8 px-3 rounded-lg text-xs font-bold transition-all ${
                sourceFilter === "mentor_buddy"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 hover:bg-purple-500/20"
              }`}
            >
              🤝 Mentor & Buddy Tasks ({mentorBuddyTasksCount})
            </button>
          </div>
        )}

        {shown.length === 0 ? (
          <EmptyState title="No tasks found for this view" hint="Tasks assigned in this category will show up here." />
        ) : (
          <ul className="space-y-2">
            {shown.map((t) => {
              const sub = subFor(t.id, me?.id);
              const status = sub?.status ?? "not_started";
              let subParsed: { text?: string; file?: { name: string; url: string; size: number } } = {};
              if (sub?.content) {
                try { subParsed = JSON.parse(sub.content); } catch { subParsed = { text: sub.content }; }
              }

              const targetScope = scopeTrainees.filter((s) => !t.domain_id || t.domain_id === "" || t.domain_id.split(",").includes(s.domainId));
              const totalCount = targetScope.length;
              const targetScopeIds = new Set(targetScope.map((s) => s.traineeId));
              const subsForThisTask = ws.submissions.filter((s) => s.task_id === t.id && targetScopeIds.has(s.trainee_id) && (s.status === "submitted" || s.status === "reviewed" || s.status === "completed"));
              const submittedCount = new Set(subsForThisTask.map((s) => s.trainee_id)).size;

              let badgeText = "";
              let badgeClass = "";
              if (role === "trainee") {
                if (status === "reviewed") {
                  badgeText = `Reviewed · ${sub?.score ?? 100}%`;
                  badgeClass = "border-success/40 bg-success/10 text-success font-medium";
                } else if (status === "submitted") {
                  badgeText = "Submitted";
                  badgeClass = "border-primary/40 bg-primary/10 text-primary font-medium";
                } else {
                  badgeText = "Not Started";
                  badgeClass = "border-border bg-muted/40 text-muted-foreground";
                }
              } else {
                if (submittedCount === 0) {
                  badgeText = `Submitted: 0 / ${totalCount} trainees`;
                  badgeClass = "border-border bg-muted/40 text-muted-foreground font-medium";
                } else if (submittedCount >= totalCount && totalCount > 0) {
                  badgeText = `All Submitted (${submittedCount}/${totalCount})`;
                  badgeClass = "border-success/40 bg-success/10 text-success font-semibold";
                } else {
                  badgeText = `Submitted: ${submittedCount} / ${totalCount} trainees`;
                  badgeClass = "border-primary/40 bg-primary/10 text-primary font-semibold";
                }
              }

              const isMb = isMentorBuddyTask(t);
              const creatorMember = t.created_by_member_id ? ws.members.find((m) => m.id === t.created_by_member_id) : null;
              const matchedCourse = ws.courses.find((c) => c.id === t.course_id || t.title.toLowerCase().includes(c.title.toLowerCase()) || c.title.toLowerCase().includes(t.title.toLowerCase()));
              const targetedTraineeObj = t.trainee_id ? ws.trainees.find((x) => x.id === t.trainee_id) : null;
              const targetedMember = targetedTraineeObj ? ws.members.find((m) => m.id === targetedTraineeObj.member_id) : null;

              return (
                <li key={t.id} className="rounded-lg border border-border p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium">{t.title}</p>
                        {isMb && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                            🤝 {creatorMember ? `${creatorMember.full_name} (${creatorMember.role})` : "Mentor / Buddy Task"}
                          </span>
                        )}
                        {targetedMember && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            <User className="size-3 shrink-0" /> Targeted: {targetedMember.full_name}
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                        {renderDescriptionWithLinks(t.description)}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground capitalize">
                        {t.kind} · {t.priority} priority{t.due_at ? ` · due ${new Date(t.due_at).toLocaleDateString()}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full border px-2.5 py-1 text-xs ${badgeClass}`}>{badgeText}</span>
                      {canCreate && (
                        <div className="flex items-center gap-1">
                          <button onClick={() => startEditTask(t)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="Edit Task">
                            <Pencil className="size-3.5" />
                          </button>
                          <button onClick={() => handleDeleteTask(t.id)} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive" title="Delete Task">
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {matchedCourse && (
                    <div className="mt-3.5 pt-2.5 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 bg-muted/20 -mx-3 -mb-1 px-3 py-2">
                      <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                        <BookOpen className="size-3.5 text-primary shrink-0" />
                        Allocated Course: <strong className="text-foreground font-semibold">{matchedCourse.title}</strong>
                      </span>
                      <Link
                        to="/courses/$id"
                        params={{ id: matchedCourse.id }}
                        className="inline-flex h-7 items-center gap-1 rounded-lg bg-primary px-3 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all shrink-0 shadow-sm"
                      >
                        Open Course Path ➔
                      </Link>
                    </div>
                  )}

                  {role === "trainee" && status !== "reviewed" && (
                    answerFor === t.id ? (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                          {isAssessment(t) ? "📝 Assessment Submission Form" : "📋 Task Submission Form"}
                        </p>
                        <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={2} placeholder={isAssessment(t) ? "Write solution notes, paste link, or describe assessment work…" : "Write task description, notes, or paste link…"}
                          className="w-full rounded-lg border border-input bg-background p-3 text-sm" />
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="inline-flex h-9 cursor-pointer items-center justify-center rounded-lg border border-input bg-background px-3 text-xs font-medium hover:bg-muted">
                            {fileData ? `Attached: ${fileData.name}` : "Upload File (PDF, DOCX, ZIP, Code, Images, etc.)"}
                            <input type="file" onChange={handleFileChange} className="hidden" />
                          </label>
                          {fileData && (
                            <button type="button" onClick={() => setFileData(null)} className="text-xs text-danger hover:underline">Remove file</button>
                          )}
                        </div>
                        <div className="mt-2 flex gap-2">
                          <button
                            type="button"
                            onClick={() => submitWork(t.id, t.title, isAssessment(t))}
                            disabled={!answer.trim() && !fileData}
                            className={`h-9 rounded-lg px-3 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                              isAssessment(t) ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"
                            }`}
                          >
                            {status === "submitted"
                              ? isAssessment(t) ? "Update Assessment Submission" : "Update Task Submission"
                              : isAssessment(t) ? "Submit Assessment" : "Submit Task"}
                          </button>
                          <button onClick={() => { setAnswerFor(null); setFileData(null); }} className="h-9 rounded-lg border border-input px-3 text-sm">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => { setAnswerFor(t.id); setAnswer(subParsed.text ?? sub?.content ?? ""); setFileData(subParsed.file ?? null); }} className="mt-3 h-9 rounded-lg border border-input px-3 text-sm font-semibold hover:bg-muted cursor-pointer">
                        {status === "submitted"
                          ? isAssessment(t) ? "Update Assessment Submission ➔" : "Update Task Submission ➔"
                          : isAssessment(t) ? "Submit Assessment ➔" : "Submit Task ➔"}
                      </button>
                    )
                  )}

                  {role !== "trainee" && (
                    <TaskSubmissionTracker
                      task={t}
                      ws={ws}
                      scopeTrainees={scopeTrainees}
                      review={review}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function TaskSubmissionTracker({
  task,
  ws,
  scopeTrainees,
  review,
}: {
  task: Task;
  ws: any;
  scopeTrainees: any[];
  review: (submissionId: string, score: number) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"submitted" | "pending">("submitted");
  const [searchQuery, setSearchQuery] = useState("");

  const scopedTraineeIds = useMemo(() => new Set(scopeTrainees.map((s) => s.traineeId)), [scopeTrainees]);

  const targetTrainees = useMemo(
    () => scopeTrainees.filter((s) => !task.domain_id || task.domain_id === "" || task.domain_id.split(",").includes(s.domainId)),
    [scopeTrainees, task.domain_id],
  );

  const targetTraineeIds = useMemo(() => new Set(targetTrainees.map((s) => s.traineeId)), [targetTrainees]);

  const taskSubs = useMemo(
    () => ws.submissions.filter((s: any) => s.task_id === task.id && targetTraineeIds.has(s.trainee_id) && (s.status === "submitted" || s.status === "reviewed" || s.status === "completed")),
    [ws.submissions, task.id, targetTraineeIds],
  );

  const uniqueTaskSubs = useMemo(() => {
    const map = new Map<string, any>();
    for (const sub of taskSubs) {
      if (!map.has(sub.trainee_id) || new Date(sub.submitted_at || 0) > new Date(map.get(sub.trainee_id).submitted_at || 0)) {
        map.set(sub.trainee_id, sub);
      }
    }
    return Array.from(map.values());
  }, [taskSubs]);

  const submittedTraineeIds = useMemo(() => new Set(uniqueTaskSubs.map((s: any) => s.trainee_id)), [uniqueTaskSubs]);
  const notSubmittedTrainees = useMemo(
    () => targetTrainees.filter((s) => !submittedTraineeIds.has(s.traineeId)),
    [targetTrainees, submittedTraineeIds],
  );

  const isAssessmentItem =
    task.kind === "assessment" ||
    task.kind === "quiz" ||
    task.kind === "leetcode" ||
    task.title.toLowerCase().includes("assessment") ||
    task.title.toLowerCase().includes("day ");

  const totalCount = targetTrainees.length || 1;
  const submittedCount = submittedTraineeIds.size;
  const pendingCount = notSubmittedTrainees.length;
  const pct = Math.min(100, Math.round((submittedCount / totalCount) * 100));

  const filteredPending = useMemo(() => {
    if (!searchQuery.trim()) return notSubmittedTrainees;
    return notSubmittedTrainees.filter((t) => t.name?.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [notSubmittedTrainees, searchQuery]);

  return (
    <div className="mt-3.5 rounded-xl border border-border/80 bg-card overflow-hidden transition-all shadow-sm">
      {/* Header Bar / Collapsible Toggle Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full flex-wrap items-center justify-between gap-3 p-3 text-left bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <Meter value={pct} className="w-24 shrink-0" />
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <span>{submittedCount} / {targetTrainees.length} {isAssessmentItem ? "Assessment Submissions" : "Task Submissions"} ({pct}%)</span>
              {submittedCount === targetTrainees.length && targetTrainees.length > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                  ✓ 100% Complete
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {submittedCount} Submitted {isAssessmentItem ? "Assessments" : "Tasks"} · {pendingCount} Pending Trainees
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-bold text-foreground shadow-xs hover:border-primary/50 transition-all">
          <span>{open ? "Hide Submissions" : `View ${isAssessmentItem ? "Assessment" : "Task"} Submissions`}</span>
          <ChevronDown className={`size-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180 text-primary" : ""}`} />
        </div>
      </button>

      {/* Expanded Accordion Body */}
      {open && (
        <div className="p-4 border-t border-border/60 space-y-4 bg-muted/10">
          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("submitted")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "submitted"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <CheckCircle2 className="size-3.5" />
                Submitted {isAssessmentItem ? "Assessment" : "Task"} Work ({submittedCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("pending")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "pending"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <Clock className="size-3.5" />
                Not Submitted Yet ({pendingCount})
              </button>
            </div>

            {activeTab === "pending" && pendingCount > 0 && (
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter pending trainees..."
                  className="h-8 w-48 rounded-lg border border-input bg-background pl-2.5 pr-7 text-xs"
                />
              </div>
            )}
          </div>

          {/* TAB 1: SUBMITTED WORK LIST */}
          {activeTab === "submitted" && (
            <div className="space-y-3">
              {uniqueTaskSubs.length === 0 ? (
                <div className="p-6 text-center border border-dashed rounded-xl bg-card">
                  <Clock className="size-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-bold text-foreground">No submissions received yet</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Assigned trainees will appear here as soon as they submit their work.</p>
                </div>
              ) : (
                uniqueTaskSubs.map((s: any) => {
                  const traineeObj = ws.trainees.find((x: any) => x.id === s.trainee_id);
                  const name = ws.members.find((mm: any) => mm.id === traineeObj?.member_id)?.full_name || "Trainee";
                  const domainName = ws.domains.find((d: any) => d.id === traineeObj?.domain_id)?.name || "Domain";

                  let parsed: { text?: string; file?: { name: string; url: string; size: number } } = {};
                  try {
                    if (s.content) parsed = JSON.parse(s.content);
                  } catch {
                    parsed = { text: s.content ?? "" };
                  }

                  const isReviewed = s.status === "reviewed" || s.score != null;

                  return (
                    <div key={s.id} className="panel p-3.5 space-y-3 border border-border/80 hover:border-primary/30 transition-all bg-card">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <Initials name={name} className="size-8 text-xs font-bold shrink-0" />
                          <div>
                            <span className="text-xs font-bold text-foreground">{name}</span>
                            <span className="ml-2 text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                              {domainName}
                            </span>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              Submitted: {new Date(s.submitted_at || Date.now()).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isReviewed ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="size-3.5" /> Reviewed · {s.score ?? 100}%
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary border border-primary/30">
                              <Award className="size-3.5" /> Ready for Review
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Submitted Text Content */}
                      {parsed.text && (
                        <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap bg-muted/40 p-2.5 rounded-lg border border-border/50">
                          {parsed.text}
                        </p>
                      )}

                      {/* Attached File */}
                      {parsed.file && (
                        <div className="flex items-center justify-between gap-2 p-2 rounded-lg border border-primary/20 bg-primary/5">
                          <span className="text-xs font-semibold text-foreground flex items-center gap-1.5 truncate">
                            <FileText className="size-4 text-primary shrink-0" />
                            {parsed.file.name}
                            <span className="text-[10px] text-muted-foreground">({(parsed.file.size / 1024).toFixed(1)} KB)</span>
                          </span>
                          <a
                            href={parsed.file.url}
                            download={parsed.file.name}
                            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline bg-background px-2.5 py-1 rounded border border-input shrink-0"
                          >
                            <Download className="size-3" /> Download
                          </a>
                        </div>
                      )}

                      {/* Review & Score Buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
                        <span className="text-[11px] font-bold text-muted-foreground">Assign Evaluation Score:</span>
                        <div className="flex items-center gap-1.5">
                          {[60, 75, 90, 100].map((scoreVal) => (
                            <button
                              key={scoreVal}
                              type="button"
                              onClick={() => review(s.id, scoreVal)}
                              className={`h-7 px-2.5 rounded-md text-xs font-bold transition-all ${
                                s.score === scoreVal
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : "border border-input bg-background hover:bg-muted text-foreground"
                              }`}
                            >
                              {scoreVal}%
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: NOT SUBMITTED YET (PENDING TRAINEES GRID) */}
          {activeTab === "pending" && (
            <div className="space-y-3">
              {filteredPending.length === 0 ? (
                <div className="p-6 text-center border border-dashed rounded-xl bg-card">
                  <CheckCircle2 className="size-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-foreground">All trainees have submitted their work!</p>
                </div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredPending.map((st) => (
                    <div
                      key={st.traineeId}
                      className="flex items-center justify-between gap-2.5 p-2.5 rounded-xl border border-border bg-card hover:border-amber-500/40 transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Initials name={st.name} className="size-8 text-xs font-bold shrink-0 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">{st.name}</p>
                          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5">
                            <Clock className="size-3 shrink-0" /> Pending
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => notify(st.memberId, "Task Reminder 🔔", `Reminder: Please complete and submit "${task.title}".`, "task", "/tasks")}
                        title="Send task reminder notification"
                        className="inline-flex h-7 items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-all shrink-0"
                      >
                        <Bell className="size-3" /> Remind
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
