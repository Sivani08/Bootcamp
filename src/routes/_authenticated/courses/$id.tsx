import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowLeft, CheckCircle2, Circle, GraduationCap, ExternalLink, ShieldCheck, Users, Clock, Award } from "lucide-react";
import { useWorkspace } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { useActions, logActivity, markLocalCourseCompleted, markLocalCourseIncomplete, notify } from "@/lib/actions";
import { visibleTrainees } from "@/lib/scope";
import { EmptyState, PageHeader, Panel, SkeletonPage, Initials, Kpi } from "@/components/ui-bits";

function extractFirstUrl(text: string | null | undefined): string | null {
  if (!text) return null;
  const match = text.match(/(https?:\/\/[^\s]+|www\.[^\s]+)/i);
  if (!match) return null;
  const url = match[0];
  return url.startsWith("www.") ? `https://${url}` : url;
}

function renderTextWithLinks(text: string | null | undefined) {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  const parts = text.split(urlRegex);
  return (
    <span>
      {parts.map((part, i) => {
        if (!part) return null;
        if (part.match(/^(https?:\/\/|www\.)/i)) {
          const href = part.startsWith("www.") ? `https://${part}` : part;
          const isUdemy = part.toLowerCase().includes("udemy.com");
          return (
            <a
              key={i}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 font-bold text-purple-600 dark:text-purple-400 underline hover:opacity-80 bg-purple-500/10 px-2 py-0.5 rounded my-0.5 transition-all"
            >
              {isUdemy ? <GraduationCap className="size-3.5 shrink-0" /> : <ExternalLink className="size-3.5 shrink-0" />}
              {isUdemy ? "Udemy Course Link ↗" : "Course Link ↗"}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

export const Route = createFileRoute("/_authenticated/courses/$id")({
  head: () => ({ meta: [
    { title: "Course — BootMind" },
    { name: "description", content: "View assigned course details, launch external learning links, and track completion." },
    { property: "og:title", content: "Course — BootMind" },
    { property: "og:description", content: "View assigned course details, launch external learning links, and track completion." },
  ] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const { data: ws, isLoading } = useWorkspace();
  const { member, role } = useAuth();
  const { db, run } = useActions();

  if (isLoading || !ws) return <SkeletonPage />;
  const course = ws.courses.find((c) => c.id === id);
  if (!course) return <EmptyState title="Course not found" />;

  const me = ws.trainees.find((t) => t.member_id === member?.id || (member as any)?.employee_id?.toLowerCase() === t.member_id?.toLowerCase());
  const domain = ws.domains.find((d) => d.id === course.domain_id);

  const scopeTrainees = useMemo(() => visibleTrainees(ws, role, member?.id), [ws, role, member]);

  const isCommonCourse = course.domain_id === "all_domains" || course.domain_id === "all";

  // Filter assigned trainees: For Mentors & Buddies, show ONLY their assigned mentees
  const assignedTrainees = useMemo(() => {
    if (role === "mentor" || role === "buddy") {
      const scopeIds = new Set(scopeTrainees.map((st) => st.traineeId));
      return ws.trainees.filter(
        (t) =>
          scopeIds.has(t.id) &&
          (!course.domain_id ||
            isCommonCourse ||
            t.domain_id === course.domain_id ||
            scopeTrainees.some(
              (st) =>
                st.traineeId === t.id &&
                (st.domainId === course.domain_id ||
                  st.domainName?.toLowerCase().includes(domain?.name?.toLowerCase() || ""))
            ))
      );
    }
    return ws.trainees.filter((t) => !course.domain_id || isCommonCourse || t.domain_id === course.domain_id);
  }, [ws.trainees, role, scopeTrainees, course.domain_id, domain, isCommonCourse]);

  // Course completions records
  const completions = (ws.courseCompletions || []).filter((cc) => cc.course_id === course.id);
  const completedTraineeIds = new Set(completions.map((cc) => cc.trainee_id));

  // Check if current logged-in trainee completed this course
  const isCompletedByMe = me ? completedTraineeIds.has(me.id) || completedTraineeIds.has(me.member_id) : false;

  const directUrl = (course as any).course_url || extractFirstUrl(course.description);
  const isUdemy = directUrl?.toLowerCase().includes("udemy.com");

  const toggleCourseCompletion = async () => {
    const targetTraineeId = me ? me.id : member?.id || "guest";
    if (isCompletedByMe) {
      markLocalCourseIncomplete(course.id, targetTraineeId);
      await run("Course status updated to In Progress", async () => {
        try {
          await db.from("course_completions").delete().eq("course_id", course.id).eq("trainee_id", targetTraineeId);
        } catch {}
        return { ok: true };
      });
    } else {
      markLocalCourseCompleted(course.id, targetTraineeId);
      await run("Course Marked as Completed! 🎉", async () => {
        try {
          await db.from("course_completions").insert({
            course_id: course.id,
            trainee_id: targetTraineeId,
            status: "completed",
            completed_at: new Date().toISOString(),
          });
        } catch {}
        return { ok: true };
      });

      if (me) {
        await logActivity(me.id, "course", `Completed assigned course: ${course.title}`, (course.estimated_hours || 4) * 60);
        await notify("all", "Course Completed 🎉", `${me.name} completed assigned course "${course.title}".`, "course", `/courses/${course.id}`);
      }
    }
  };

  const completedCount = completedTraineeIds.size;
  const totalAssigned = assignedTrainees.length || 1;
  const pctCompleted = Math.round((completedCount / totalAssigned) * 100);

  return (
    <div className="space-y-6">
      <Link to="/courses" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to courses
      </Link>

      <div className="panel p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
                {isCommonCourse ? "🌐 All Domains (Common Curriculum)" : domain?.name || "Assigned Course"}
              </span>
              {(course as any).due_at && (
                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  <Clock className="size-3.5" /> Target Deadline: {new Date((course as any).due_at).toLocaleDateString()}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{course.title}</h1>
            <div className="text-sm text-muted-foreground leading-relaxed pt-1">
              {renderTextWithLinks(course.description)}
            </div>
          </div>

          {directUrl && (
            <a
              href={directUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2.5 rounded-xl bg-purple-600 px-5 text-sm font-bold text-white hover:bg-purple-700 transition-all shadow-md shrink-0"
            >
              <GraduationCap className="size-5" />
              {isUdemy ? "Launch Udemy Course ↗" : "Launch Course Link ↗"}
            </a>
          )}
        </div>
      </div>

      {/* Trainee Course Action Panel */}
      {role === "trainee" && (
        <Panel title="Course Action & Status">
          <div className={`flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border ${isCompletedByMe ? "border-emerald-500/40 bg-emerald-500/10" : "border-border bg-card"}`}>
            <div className="flex items-center gap-3">
              {isCompletedByMe ? (
                <CheckCircle2 className="size-7 text-emerald-500 shrink-0" />
              ) : (
                <Circle className="size-7 text-muted-foreground shrink-0" />
              )}
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {isCompletedByMe ? "Course Completed 🎉" : "Course Pending / In Progress"}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isCompletedByMe
                    ? "Great job! You have marked this assigned course as completed."
                    : "Work on this course via the link above, then click the button once you finish."}
                </p>
              </div>
            </div>

            <button
              onClick={toggleCourseCompletion}
              className={`inline-flex h-10 items-center gap-2 rounded-xl px-5 text-sm font-bold shadow transition-all ${
                isCompletedByMe
                  ? "border border-input bg-background hover:bg-muted text-foreground"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              <ShieldCheck className="size-4" />
              {isCompletedByMe ? "Mark as In Progress ↺" : "Mark Course as Completed ✅"}
            </button>
          </div>
        </Panel>
      )}

      {/* Admin / Mentor / Buddy Course Completion Tracking Panel */}
      {(role === "admin" || role === "mentor" || role === "buddy") && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Kpi label="Assigned Trainees" value={totalAssigned} />
            <Kpi label="Trainees Completed" value={completedCount} tone={completedCount > 0 ? "success" : "neutral"} />
            <Kpi label="Completion Rate" value={`${pctCompleted}%`} tone={pctCompleted >= 50 ? "success" : "warning"} />
          </div>

          <Panel title={`Trainee Course Completions (${completedCount} / ${totalAssigned})`} description="Track which trainees have completed this assigned course.">
            <div className="space-y-2">
              {assignedTrainees.map((t) => {
                const memberObj = ws.members.find((m) => m.id === t.member_id);
                const isDone = completedTraineeIds.has(t.id) || completedTraineeIds.has(t.member_id);
                const record = completions.find((cc) => cc.trainee_id === t.id || cc.trainee_id === t.member_id);

                return (
                  <div key={t.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card">
                    <div className="flex items-center gap-3">
                      <Initials name={memberObj?.full_name || "Trainee"} className="size-9 text-xs" />
                      <div>
                        <p className="text-sm font-bold text-foreground">{memberObj?.full_name || "Trainee"}</p>
                        <p className="text-xs text-muted-foreground">{memberObj?.email} · {t.id}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isDone ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="size-3.5" /> Completed
                          {record?.completed_at ? ` on ${new Date(record.completed_at).toLocaleDateString()}` : ""}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          <Clock className="size-3.5" /> In Progress / Pending
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
