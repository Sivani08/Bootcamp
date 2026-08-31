import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { BookOpen, Plus, Pencil, Trash2, GraduationCap, ExternalLink, User } from "lucide-react";
import { useWorkspace, type Course } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { useActions, saveLocalCourse, editLocalItem, deleteLocalItem, markLocalCourseDeleted, notify } from "@/lib/actions";
import { visibleTrainees, getSignedTrainee } from "@/lib/scope";
import { EmptyState, Meter, PageHeader, Panel, SkeletonPage } from "@/components/ui-bits";

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

export const Route = createFileRoute("/_authenticated/courses/")({
  head: () => ({ meta: [
    { title: "Courses — BootMind" },
    { name: "description", content: "Domain-based learning paths with modules, durations and live completion tracking." },
    { property: "og:title", content: "Courses — BootMind" },
    { property: "og:description", content: "Domain-based learning paths with modules, durations and live completion tracking." },
  ] }),
  component: Page,
});

function Page() {
  const { data: ws, isLoading } = useWorkspace();
  const { role, member } = useAuth();
  const { db, run } = useActions();
  const [open, setOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseUrl, setCourseUrl] = useState("");
  const [domainId, setDomainId] = useState("");
  const [hours, setHours] = useState("8");
  const [dueDate, setDueDate] = useState("");
  const [targetTraineeId, setTargetTraineeId] = useState("");

  if (isLoading || !ws) return <SkeletonPage />;

  const canCreate = role === "admin" || role === "mentor" || role === "buddy";
  const scopeTrainees = visibleTrainees(ws, role, member?.id);
  const me = getSignedTrainee(ws, member);
  const domains = useMemo(() => {
    if (role === "trainee" && me) {
      return ws.domains.filter((d) => d.id === me.domain_id);
    }
    if (role === "mentor" || role === "buddy") {
      const activeDomainIds = new Set(scopeTrainees.map((st) => st.domainId));
      return ws.domains.filter((d) =>
        activeDomainIds.has(d.id) ||
        scopeTrainees.some((st) => st.domainName?.toLowerCase().includes(d.name.toLowerCase()) || d.name.toLowerCase().includes(st.domainName?.toLowerCase() || ""))
      );
    }
    return ws.domains;
  }, [role, me, ws.domains, scopeTrainees]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetDomain = domainId || domains[0]?.id || ws.domains[0]?.id;
    if (!targetDomain) return;
    const order = ws.courses.filter((c) => c.domain_id === targetDomain).length + 1;
    const newCourseId = `course-local-${Date.now()}`;

    let fullDesc = description.trim();
    if (courseUrl.trim() && !fullDesc.includes(courseUrl.trim())) {
      fullDesc = fullDesc ? `${fullDesc}\n\nCourse Link: ${courseUrl.trim()}` : `Course Link: ${courseUrl.trim()}`;
    }

    const payload = {
      id: newCourseId,
      domain_id: targetDomain,
      title: title.trim(),
      description: fullDesc,
      course_url: courseUrl.trim() || extractFirstUrl(fullDesc),
      order_index: order,
      estimated_hours: Number(hours) || 8,
      due_at: dueDate ? new Date(dueDate).toISOString() : null,
      trainee_id: targetTraineeId || null,
      created_by_member_id: member?.id || null,
    };

    saveLocalCourse(payload as any);
    await run("Course created & assigned successfully", () => db.from("courses").insert(payload));

    const deadlineStr = dueDate ? ` (Target Deadline: ${new Date(dueDate).toLocaleDateString()})` : "";
    if (role === "mentor" || role === "buddy") {
      for (const st of scopeTrainees) {
        if (!targetTraineeId || st.traineeId === targetTraineeId) {
          await notify(st.memberId, "New Course Assigned 🎓", `Your ${role} assigned a course to you: "${title.trim()}"${deadlineStr}`, "course", `/courses/${newCourseId}`);
        }
      }
    } else {
      if (targetTraineeId) {
        const targetedTrainee = ws.trainees.find((t) => t.id === targetTraineeId);
        if (targetedTrainee) {
          await notify(targetedTrainee.member_id, "New Course Assigned 🎓", `Admin assigned a course: "${title.trim()}"${deadlineStr}`, "course", `/courses/${newCourseId}`);
        }
      } else {
        await notify("all", "New Course Path Allocated", `Assigned Course: ${title.trim()}${deadlineStr}`, "course", `/courses/${newCourseId}`);
      }
    }

    setTitle("");
    setDescription("");
    setCourseUrl("");
    setDomainId("");
    setDueDate("");
    setTargetTraineeId("");
    setOpen(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    let fullDesc = description.trim();
    if (courseUrl.trim() && !fullDesc.includes(courseUrl.trim())) {
      fullDesc = fullDesc ? `${fullDesc}\n\nCourse Link: ${courseUrl.trim()}` : `Course Link: ${courseUrl.trim()}`;
    }

    const localPayload = {
      id: editingCourse.id,
      title: title.trim(),
      description: fullDesc,
      course_url: courseUrl.trim() || extractFirstUrl(fullDesc),
      domain_id: domainId || editingCourse.domain_id,
      estimated_hours: Number(hours) || 8,
      trainee_id: targetTraineeId || null,
    };

    const dbPayload = {
      title: title.trim(),
      description: fullDesc,
      domain_id: domainId || editingCourse.domain_id,
      estimated_hours: Number(hours) || 8,
      trainee_id: targetTraineeId || null,
    };

    editLocalItem("bootmind_local_courses", editingCourse.id, localPayload);
    await run("Course updated successfully", async () => {
      try {
        await db.from("courses").update(dbPayload).eq("id", editingCourse.id);
      } catch (err) {
        console.warn("Server course update notice:", err);
      }
      return { ok: true };
    });
    setEditingCourse(null);
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    markLocalCourseDeleted(courseId);
    await run("Course deleted successfully", async () => {
      try {
        await db.from("courses").delete().eq("id", courseId);
      } catch (err) {
        console.warn("Server course delete notice:", err);
      }
      return { ok: true };
    });
  };

  const startEdit = (c: Course, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingCourse(c);
    setTitle(c.title);
    setDescription(c.description || "");
    setCourseUrl((c as any).course_url || extractFirstUrl(c.description) || "");
    setDomainId(c.domain_id);
    setHours(String(c.estimated_hours || 8));
    setTargetTraineeId(c.trainee_id || "");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={role === "trainee" ? "My courses" : "Courses"}
        subtitle="Learning paths grouped by domain with live completion tracking."
        actions={canCreate ? (
          <button onClick={() => { setOpen((o) => !o); setEditingCourse(null); }} className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-sm">
            <Plus className="size-4" /> Allocate / Share Course
          </button>
        ) : undefined}
      />

      {open && canCreate && (
        <Panel title="Create & Assign a Course (Udemy or Custom Link)">
          <form onSubmit={create} className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium">Title
              <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Master Azure Databricks for Data Engineers" className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" />
            </label>
            <label className="block text-sm font-medium">Domain
              <select value={domainId} onChange={(e) => setDomainId(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-semibold">
                <option value="">Select Domain</option>
                <option value="all_domains">🌐 All Domains (Common Curriculum)</option>
                {ws.domains.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium sm:col-span-2">Assign to Trainee
              <select value={targetTraineeId} onChange={(e) => setTargetTraineeId(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-semibold">
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
                    <option value="">All Trainees in Domain (General Curriculum)</option>
                    {scopeTrainees.map((st) => (
                      <option key={st.traineeId} value={st.traineeId}>
                        Specific Trainee: {st.name} ({st.domainName || "Trainee"})
                      </option>
                    ))}
                  </>
                )}
              </select>
            </label>
            <label className="block text-sm font-medium sm:col-span-2">Udemy / External Course URL (e.g. https://agilisium.udemy.com/course/...)
              <input type="url" value={courseUrl} onChange={(e) => setCourseUrl(e.target.value)} placeholder="Paste Udemy or external course link here" className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-mono text-xs" />
            </label>
            <label className="block text-sm font-medium sm:col-span-2">Target Completion Deadline
              <input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" />
            </label>
            <label className="block text-sm font-medium sm:col-span-2">Description
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Course outline, goals, or paste Udemy links..." className="mt-1 w-full rounded-lg border border-input bg-background p-3 text-sm" />
            </label>
            <div className="flex gap-2 sm:col-span-2">
              <button type="submit" className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">Create & Assign Course</button>
              <button type="button" onClick={() => setOpen(false)} className="h-10 rounded-lg border border-input px-4 text-sm font-medium">Cancel</button>
            </div>
          </form>
        </Panel>
      )}

      {editingCourse && canCreate && (
        <Panel title={`Edit Course: ${editingCourse.title}`}>
          <form onSubmit={handleEditSubmit} className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium">Title
              <input required value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" />
            </label>
            <label className="block text-sm font-medium">Domain
              <select value={domainId} onChange={(e) => setDomainId(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-semibold">
                <option value="all_domains">🌐 All Domains (Common Curriculum)</option>
                {ws.domains.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium sm:col-span-2">Assign Specifically to Trainee (Optional)
              <select value={targetTraineeId} onChange={(e) => setTargetTraineeId(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                <option value="">All Trainees in Domain (General Allocation)</option>
                {scopeTrainees.map((st) => (
                  <option key={st.traineeId} value={st.traineeId}>
                    Targeted: {st.name} ({st.domainName})
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium sm:col-span-2">Udemy / External Course URL
              <input type="url" value={courseUrl} onChange={(e) => setCourseUrl(e.target.value)} placeholder="https://agilisium.udemy.com/course/..." className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-mono text-xs" />
            </label>
            <label className="block text-sm font-medium sm:col-span-2">Description
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-input bg-background p-3 text-sm" />
            </label>
            <div className="flex gap-2 sm:col-span-2">
              <button type="submit" className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">Save Changes</button>
              <button type="button" onClick={() => setEditingCourse(null)} className="h-10 rounded-lg border border-input px-4 text-sm font-medium">Cancel</button>
            </div>
          </form>
        </Panel>
      )}

      {domains.map((d) => {
        const domainCourses = ws.courses
          .filter((c) => {
            if (c.domain_id === "all_domains" || c.domain_id === "all") return true;
            if (!c.domain_id || c.domain_id === "" || c.domain_id === d.id) return true;
            const cDom = ws.domains.find((dom) => dom.id === c.domain_id);
            if (cDom && d.name && cDom.name.toLowerCase().trim() === d.name.toLowerCase().trim()) return true;
            return false;
          })
          .filter((c) => {
            if (role === "admin") return true;
            if (role === "trainee") {
              return !c.trainee_id || (me && c.trainee_id === me.id);
            }
            return (
              !c.trainee_id ||
              c.created_by_member_id === member?.id ||
              (c.trainee_id && scopeTrainees.some((st) => st.traineeId === c.trainee_id))
            );
          })
          .sort((a, b) => a.order_index - b.order_index);

        const isMentorBuddyCourse = (c: Course) => {
          if (c.trainee_id && c.trainee_id !== "") return true;
          if (c.created_by_member_id) {
            const creator = ws.members.find((m) => m.id === c.created_by_member_id);
            if (creator?.role === "mentor" || creator?.role === "buddy") return true;
          }
          return false;
        };

        const adminCourses = domainCourses.filter((c) => !isMentorBuddyCourse(c));
        const mentorBuddyCourses = domainCourses.filter((c) => isMentorBuddyCourse(c));

        const renderCourseCard = (c: Course, isMentorBuddy: boolean) => {
          const completions = (ws.courseCompletions || []).filter((cc) => cc.course_id === c.id);

          const targetScopeIds = (role === "mentor" || role === "buddy")
            ? new Set(scopeTrainees.map((st) => st.traineeId))
            : null;

          const isCommonCourse = c.domain_id === "all_domains" || c.domain_id === "all";

          const assignedTrainees = c.trainee_id
            ? ws.trainees.filter((t) => t.id === c.trainee_id)
            : isCommonCourse
            ? (targetScopeIds ? ws.trainees.filter((t) => targetScopeIds.has(t.id)) : ws.trainees)
            : targetScopeIds
            ? ws.trainees.filter((t) => targetScopeIds.has(t.id) && (t.domain_id === d.id || scopeTrainees.some((st) => st.traineeId === t.id && (st.domainId === d.id || st.domainName?.toLowerCase().includes(d.name.toLowerCase()) || d.name.toLowerCase().includes(st.domainName?.toLowerCase() || "")))))
            : ws.trainees.filter((t) => !c.domain_id || t.domain_id === d.id);

          const scopedCompletions = completions.filter((cc) =>
            assignedTrainees.some((t) => t.id === cc.trainee_id || t.member_id === cc.trainee_id)
          );

          const completedCount = scopedCompletions.length;
          const totalAssigned = assignedTrainees.length || 1;
          const pct = Math.round((completedCount / totalAssigned) * 100);

          const isCompletedByMe = me
            ? completions.some((cc) => cc.trainee_id === me.id || cc.trainee_id === me.member_id)
            : false;

          const directUrl = (c as any).course_url || extractFirstUrl(c.description);
          const isUdemy = directUrl?.toLowerCase().includes("udemy.com");

          const targetedTraineeObj = c.trainee_id ? ws.trainees.find((x) => x.id === c.trainee_id) : null;
          const targetedMember = targetedTraineeObj ? ws.members.find((m) => m.id === targetedTraineeObj.member_id) : null;

          const creatorMember = c.created_by_member_id ? ws.members.find((m) => m.id === c.created_by_member_id) : null;

          return (
            <div key={c.id} className="panel flex flex-col justify-between p-4 transition-all hover:shadow-elevated relative group border hover:border-primary/40">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <Link to="/courses/$id" params={{ id: c.id }} className="flex items-center gap-2 text-base font-bold text-foreground hover:text-primary hover:underline">
                    <BookOpen className="size-4 text-primary shrink-0" />{c.title}
                  </Link>
                  {canCreate && (
                    <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => startEdit(c, e)} title="Edit course" className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                        <Pencil className="size-3.5" />
                      </button>
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(c.id); }} title="Delete course" className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {isCommonCourse && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                      🌐 All Domains (Common)
                    </span>
                  )}

                  {isMentorBuddy && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                      🤝 {creatorMember ? `${creatorMember.full_name} (${creatorMember.role})` : "Mentor / Buddy Shared"}
                    </span>
                  )}

                  {targetedMember && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      <User className="size-3" /> Targeted: {targetedMember.full_name}
                    </span>
                  )}
                </div>

                <div className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {renderTextWithLinks(c.description)}
                </div>

                {role === "trainee" ? (
                  <div className="mt-3 space-y-1">
                    <Meter value={isCompletedByMe ? 100 : 0} />
                    <p className="text-xs font-bold text-muted-foreground">
                      {isCompletedByMe ? "Status: Completed ✅" : "Status: In Progress / Pending ⏳"}
                    </p>
                  </div>
                ) : (
                  <div className="mt-3 space-y-1">
                    <Meter value={pct} />
                    <p className="text-xs font-bold text-muted-foreground">
                      Completed by {completedCount} / {totalAssigned} Trainees ({pct}%)
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-border/60 flex flex-col gap-2">
                {directUrl && (
                  <a
                    href={directUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-all shadow-sm"
                  >
                    <GraduationCap className="size-4" />
                    {isUdemy ? "Launch Udemy Course ↗" : "Launch Course Link ↗"}
                  </a>
                )}
                <Link
                  to="/courses/$id"
                  params={{ id: c.id }}
                  className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg bg-primary/10 px-3 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  {role === "trainee"
                    ? isCompletedByMe
                      ? "View Course & Status ✅"
                      : "Open & Work on Course ➔"
                    : "View Completion Details ➔"}
                </Link>
              </div>
            </div>
          );
        };

        return (
          <Panel key={d.id} title={d.name} description={`${domainCourses.length} courses allocated in this domain`}>
            <div className="space-y-6">
              {/* Main Courses Section */}
              <div>
                <div className="flex items-center gap-2 mb-3 pb-1 border-b border-border/60">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
                    Main Courses ({adminCourses.length})
                  </span>
                </div>
                {adminCourses.length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {adminCourses.map((c) => renderCourseCard(c, false))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic py-2">No main admin curriculum courses allocated yet for this domain.</p>
                )}
              </div>

              {/* Mentor & Buddy Courses Section */}
              <div>
                <div className="flex items-center gap-2 mb-3 pb-1 border-b border-border/60">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-md border border-purple-500/20">
                    🤝 Mentor & Buddy Assigned / Targeted Courses ({mentorBuddyCourses.length})
                  </span>
                </div>
                {mentorBuddyCourses.length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {mentorBuddyCourses.map((c) => renderCourseCard(c, true))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic py-2">No mentor or buddy custom courses shared yet for this domain.</p>
                )}
              </div>
            </div>
          </Panel>
        );
      })}

      {ws.courses.length === 0 && <EmptyState title="No courses allocated yet" hint="Mentors, Buddies, and Admins can create & share learning paths." />}
    </div>
  );
}
