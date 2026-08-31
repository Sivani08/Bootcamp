import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Trash2, AlertTriangle, Clock, Calendar, CheckCircle2, ArrowRight } from "lucide-react";
import { useWorkspace } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { useActions, editLocalItem, deleteLocalItem, markLocalNotificationDeleted, clearAllLocalNotifications } from "@/lib/actions";
import { EmptyState, Kpi, PageHeader, Panel, SkeletonPage } from "@/components/ui-bits";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [
    { title: "Notifications & Reminders — BootMind" },
    { name: "description", content: "Task, assessment, course deadlines and mentor/buddy connect reminder notifications." },
    { property: "og:title", content: "Notifications & Reminders — BootMind" },
    { property: "og:description", content: "Task, assessment, course deadlines and mentor/buddy connect reminder notifications." },
  ] }),
  component: Page,
});

const ALLOWED_CATEGORIES = new Set(["task", "assessment", "course", "connect", "meetup"]);

function Page() {
  const { data: ws, isLoading } = useWorkspace();
  const { member, role } = useAuth();
  const { db, run } = useActions();

  const rows = useMemo(() => {
    if (!ws) return [];
    return ws.notifications
      .filter((n) => {
        if (!n) return false;
        const cat = (n.category || "task").toLowerCase();
        if (!ALLOWED_CATEGORIES.has(cat) && !cat.includes("task") && !cat.includes("assess") && !cat.includes("course") && !cat.includes("connect") && !cat.includes("meetup")) {
          return false;
        }
        if (!member) return true;
        if (!n.member_id || n.member_id === "all" || n.member_id === "broadcast" || n.member_id === role) return true;
        if (n.member_id === member.id) return true;
        const myTrainee = ws.trainees.find((t) => t.member_id === member.id);
        if (myTrainee && (n.member_id === myTrainee.id || n.member_id === myTrainee.member_id)) return true;
        if (role === "admin") return true;
        return false;
      })
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  }, [ws, member, role]);

  const unread = useMemo(() => rows.filter((n) => !n.read), [rows]);

  // Compute Near Deadline Reminders for Tasks, Assessments, and Courses
  const deadlineReminders = useMemo(() => {
    if (!ws) return [];
    const now = Date.now();
    const fortyEightHours = 48 * 3600 * 1000;
    const reminders: { id: string; title: string; type: "Task" | "Assessment" | "Course"; dueAt: string; isOverdue: boolean; linkTo: string }[] = [];

    for (const t of ws.tasks) {
      if (t.due_at) {
        const dueTime = new Date(t.due_at).getTime();
        const diff = dueTime - now;
        if (diff <= fortyEightHours) {
          reminders.push({
            id: `task-due-${t.id}`,
            title: t.title,
            type: "Task",
            dueAt: t.due_at,
            isOverdue: diff < 0,
            linkTo: "/tasks",
          });
        }
      }
    }

    for (const q of ws.quizzes) {
      if (q.due_at) {
        const dueTime = new Date(q.due_at).getTime();
        const diff = dueTime - now;
        if (diff <= fortyEightHours) {
          reminders.push({
            id: `quiz-due-${q.id}`,
            title: q.title,
            type: "Assessment",
            dueAt: q.due_at,
            isOverdue: diff < 0,
            linkTo: `/quizzes/${q.id}`,
          });
        }
      }
    }

    for (const c of ws.courses) {
      if ((c as any).due_at) {
        const dueTime = new Date((c as any).due_at).getTime();
        const diff = dueTime - now;
        if (diff <= fortyEightHours) {
          reminders.push({
            id: `course-due-${c.id}`,
            title: c.title,
            type: "Course",
            dueAt: (c as any).due_at,
            isOverdue: diff < 0,
            linkTo: `/courses/${c.id}`,
          });
        }
      }
    }

    return reminders.sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
  }, [ws]);

  if (isLoading || !ws) return <SkeletonPage />;

  const markAll = async () => {
    rows.forEach((n) => editLocalItem("bootmind_local_notifications", n.id, { read: true }));
    await run("All caught up", () => db.from("notifications").update({ read: true }).eq("member_id", member?.id).eq("read", false));
  };

  const markOne = async (id: string) => {
    editLocalItem("bootmind_local_notifications", id, { read: true });
    await run("Marked as read", () => db.from("notifications").update({ read: true }).eq("id", id));
  };

  const deleteNotif = async (id: string) => {
    markLocalNotificationDeleted(id);
    await run("Notification deleted", () => db.from("notifications").delete().eq("id", id));
  };

  const deleteAll = async () => {
    if (!confirm("Are you sure you want to delete all notifications?")) return;
    const ids = rows.map((n) => n.id);
    clearAllLocalNotifications(ids);
    await run("All notifications deleted", () => db.from("notifications").delete().in("id", ids));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications & Deadline Reminders"
        subtitle="Track task deadlines, assessment quizzes, course milestones, and mentor/buddy connect reminders."
        actions={
          <div className="flex items-center gap-2">
            {unread.length > 0 && (
              <button onClick={markAll} className="h-9 rounded-lg border border-input px-3 text-sm font-medium hover:bg-muted">
                Mark all read
              </button>
            )}
            {rows.length > 0 && (
              <button onClick={deleteAll} className="h-9 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive px-3 text-sm font-medium hover:bg-destructive/20 transition-colors">
                Delete all
              </button>
            )}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi label="Total Notifications" value={rows.length} />
        <Kpi label="Unread Alerts" value={unread.length} tone="warning" />
        <Kpi label="Urgent Deadlines" value={deadlineReminders.length} tone={deadlineReminders.length > 0 ? "warning" : "success"} />
      </div>

      {deadlineReminders.length > 0 && (
        <Panel title="⏰ Near & Overdue Deadlines (Tasks, Assessments & Courses)">
          <div className="space-y-2.5">
            {deadlineReminders.map((d) => (
              <div
                key={d.id}
                className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 ${
                  d.isOverdue ? "border-destructive/40 bg-destructive/10 text-destructive-foreground" : "border-warning/40 bg-warning/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`size-5 shrink-0 ${d.isOverdue ? "text-destructive" : "text-amber-500"}`} />
                  <div>
                    <p className="text-sm font-bold flex items-center gap-2">
                      <span className="rounded bg-background px-2 py-0.5 text-xs font-semibold uppercase">{d.type}</span>
                      {d.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Clock className="size-3.5" /> {d.isOverdue ? "Overdue deadline:" : "Due near:"} {new Date(d.dueAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={d.linkTo as any}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Open {d.type} ➔
                  </Link>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${d.isOverdue ? "bg-destructive text-destructive-foreground" : "bg-amber-500/20 text-amber-700 dark:text-amber-300"}`}>
                    {d.isOverdue ? "Overdue ⚠️" : "Deadline Near ⏳"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      <Panel title="Inbox">
        {rows.length === 0 ? (
          <EmptyState title="No notifications" hint="Alerts about task deadlines, assessments, courses and connect sessions land here." />
        ) : (
          <ul className="space-y-2">
            {rows.map((n) => {
              let targetUrl = (n as any).url || "/courses";
              if (n.category === "task") targetUrl = "/tasks";
              else if (n.category === "connect" || n.category === "meetup") targetUrl = "/meetups";

              return (
                <li key={n.id} className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3.5 transition-colors ${n.read ? "border-border bg-card" : "border-primary/40 bg-accent/40"}`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{n.category || "reminder"}</span>
                      <p className="text-sm font-bold text-foreground">{n.title}</p>
                    </div>
                    {n.body && <p className="text-xs text-muted-foreground leading-relaxed">{n.body}</p>}
                    <p className="text-[11px] text-muted-foreground/80 flex items-center gap-1">
                      <Calendar className="size-3" /> {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={targetUrl}
                      className="inline-flex h-8 items-center gap-1 rounded-lg bg-primary/10 px-3 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                    >
                      Open {n.category === "course" ? "Course" : n.category === "task" ? "Task" : "Page"} ➔
                    </Link>
                    {!n.read && (
                      <button onClick={() => markOne(n.id)} className="p-1 text-muted-foreground hover:text-primary" title="Mark as read">
                        <CheckCircle2 className="size-4" />
                      </button>
                    )}
                    <button onClick={() => deleteNotif(n.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors" title="Delete notification">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
