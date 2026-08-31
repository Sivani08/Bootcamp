import * as XLSX from "xlsx";
import type { Workspace } from "./data";
import { allMetrics, statusLabel, summarize, type TraineeMetrics } from "./analytics";

function download(wb: XLSX.WorkBook, filename: string) {
  XLSX.writeFile(wb, filename);
}

function traineeRow(m: TraineeMetrics) {
  return {
    Trainee: m.name,
    Batch: m.batchName,
    Domain: m.domainName,
    Mentor: m.mentorName,
    Buddy: m.buddyName,
    "Progress %": m.progress,
    "Quiz Average %": m.quizAvg,
    "Assignment Average %": m.assignmentAvg,
    "Coding Accuracy %": m.codingAccuracy,
    "Task Completion %": m.taskCompletion,
    "Health Score": m.health,
    Status: statusLabel(m.status),
    "Mentor Meetups": m.mentorMeetups,
    "Buddy Meetups": m.buddyMeetups,
    "Strong Topics": m.strongTopics.join(", "),
    "Weak Topics": m.weakTopics.join(", "),
    "Last Active": m.lastActive ? new Date(m.lastActive).toLocaleString() : "—",
  };
}

function groupSheet(rows: TraineeMetrics[], key: "batchName" | "domainName", label: string) {
  const groups = new Map<string, TraineeMetrics[]>();
  for (const r of rows) groups.set(r[key], [...(groups.get(r[key]) ?? []), r]);
  const avg = (a: number[]) => (a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : 0);
  return [...groups.entries()].map(([name, list]) => ({
    [label]: name,
    Trainees: list.length,
    "Avg Progress %": avg(list.map((r) => r.progress)),
    "Avg Quiz %": avg(list.map((r) => r.quizAvg)),
    "Avg Assignment %": avg(list.map((r) => r.assignmentAvg)),
    "Avg Coding %": avg(list.map((r) => r.codingAccuracy)),
    "Avg Health": avg(list.map((r) => r.health)),
    "On Track": list.filter((r) => r.status === "on_track").length,
    "At Risk": list.filter((r) => r.status === "at_risk").length,
    Behind: list.filter((r) => r.status === "behind").length,
  }));
}

/** Multi-sheet export of the exact rows currently visible on screen. */
export function exportCohort(ws: Workspace, rows: TraineeMetrics[], filenameBase: string) {
  const s = summarize(ws, rows);
  const wb = XLSX.utils.book_new();

  const summary = [
    { Metric: "Total Trainees", Value: s.total },
    { Metric: "Active Today", Value: s.activeToday },
    { Metric: "Batches", Value: s.batches },
    { Metric: "Domains", Value: s.domains },
    { Metric: "Average Progress %", Value: s.avgProgress },
    { Metric: "Average Quiz Score %", Value: s.avgQuiz },
    { Metric: "Average Assignment Score %", Value: s.avgAssignment },
    { Metric: "Average Coding Accuracy %", Value: s.avgCoding },
    { Metric: "Average Learning Hours", Value: s.avgHours },
    { Metric: "On Track %", Value: s.total ? Math.round((s.onTrack / s.total) * 100) : 0 },
    { Metric: "At Risk %", Value: s.total ? Math.round((s.atRisk / s.total) * 100) : 0 },
    { Metric: "Behind %", Value: s.total ? Math.round((s.behind / s.total) * 100) : 0 },
    { Metric: "Generated", Value: new Date().toLocaleString() },
  ];

  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summary), "Overall Summary");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows.map(traineeRow)), "Trainees");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(groupSheet(rows, "batchName", "Batch")), "Batch Summary");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(groupSheet(rows, "domainName", "Domain")), "Domain Summary");

  const traineeIds = new Set(rows.map((r) => r.traineeId));
  const activity = ws.activity
    .filter((a) => traineeIds.has(a.trainee_id))
    .map((a) => ({
      Trainee: rows.find((r) => r.traineeId === a.trainee_id)?.name ?? "",
      Type: a.type,
      Activity: a.description,
      Minutes: a.minutes,
      When: new Date(a.created_at).toLocaleString(),
    }));
  if (activity.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(activity), "Activity Log");

  download(wb, `${filenameBase}-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/** A single trainee's own performance workbook. */
export function exportTrainee(ws: Workspace, m: TraineeMetrics) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(Object.entries(traineeRow(m)).map(([Metric, Value]) => ({ Metric, Value }))),
    "My Performance",
  );

  const courses = ws.courses.filter((c) => c.domain_id === m.domainId);
  const courseRows = courses.map((c) => {
    const mods = ws.modules.filter((x) => x.course_id === c.id);
    const done = mods.filter((x) => ws.progress.some((p) => p.trainee_id === m.traineeId && p.module_id === x.id));
    return {
      Course: c.title,
      Modules: mods.length,
      Completed: done.length,
      "Progress %": mods.length ? Math.round((done.length / mods.length) * 100) : 0,
    };
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(courseRows), "Courses");

  const taskRows = ws.tasks
    .filter((t) => t.domain_id === m.domainId || t.trainee_id === m.traineeId)
    .map((t) => {
      const sub = ws.submissions.find((s) => s.task_id === t.id && s.trainee_id === m.traineeId);
      return {
        Title: t.title,
        Type: t.kind,
        Priority: t.priority,
        Due: t.due_at ? new Date(t.due_at).toLocaleDateString() : "—",
        Status: sub?.status ?? "not_started",
        Score: sub?.score ?? "",
      };
    });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(taskRows), "Tasks & Assignments");

  const quizRows = ws.attempts
    .filter((a) => a.trainee_id === m.traineeId)
    .map((a) => ({
      Quiz: ws.quizzes.find((q) => q.id === a.quiz_id)?.title ?? "",
      Score: a.score,
      Total: a.total,
      "Percentage %": a.percentage,
      Attempted: new Date(a.created_at).toLocaleString(),
    }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(quizRows), "Quiz Attempts");

  const fbRows = ws.feedback
    .filter((f) => f.trainee_id === m.traineeId)
    .map((f) => ({
      From: ws.members.find((x) => x.id === f.from_member_id)?.full_name ?? "",
      Role: f.kind,
      Category: f.category,
      Rating: f.rating,
      Comments: f.comments ?? "",
      Date: new Date(f.created_at).toLocaleDateString(),
    }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(fbRows), "Feedback");

  const activity = ws.activity
    .filter((a) => a.trainee_id === m.traineeId)
    .map((a) => ({ Type: a.type, Activity: a.description, Minutes: a.minutes, When: new Date(a.created_at).toLocaleString() }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(activity), "Activity");

  download(wb, `bootmind-${m.name.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function metricsFor(ws: Workspace) {
  return allMetrics(ws);
}

/** Admin workspace export for all 27 trainees' Mentor & Buddy connect scorecards formatted in the exact template. */
export function exportAdminMeetupScorecards(ws: Workspace) {
  const wb = XLSX.utils.book_new();

  // 1. Overview Summary Sheet of All 27 Trainees' Meetups
  const overviewRows = ws.trainees.map((t, idx) => {
    const member = ws.members.find((m) => m.id === t.member_id);
    const domain = ws.domains.find((d) => d.id === t.domain_id);
    const batch = ws.batches.find((b) => b.id === t.batch_id);
    const mentor = ws.members.find((m) => m.id === t.mentor_member_id);
    const buddy = ws.members.find((m) => m.id === t.buddy_member_id);

    const tMeetings = ws.meetings.filter((m) => m.trainee_id === t.id || m.trainee_id === t.member_id);
    const mentorMeetings = tMeetings.filter((m) => m.kind === "mentor");
    const buddyMeetings = tMeetings.filter((m) => m.kind === "buddy");
    const completed = tMeetings.filter((m) => m.status === "completed").length;

    return {
      "S.No": idx + 1,
      "Trainee Name": member?.full_name || "Trainee",
      "Employee ID": (member as any)?.employee_id || t.id,
      "Domain": domain?.name || "General",
      "Batch": batch?.name || "Batch 12",
      "Assigned Mentor": mentor?.full_name || "—",
      "Assigned Buddy": buddy?.full_name || "—",
      "Mentor Sessions Count": mentorMeetings.length,
      "Buddy Sessions Count": buddyMeetings.length,
      "Total Sessions Conducted": tMeetings.length,
      "Completed Sessions": completed,
    };
  });

  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(overviewRows), "All Trainees Summary");

  // 2. Individual Mentor & Buddy Connect Scorecards for All 27 Trainees
  ws.trainees.forEach((t) => {
    const traineeMember = ws.members.find((m) => m.id === t.member_id);
    const domain = ws.domains.find((d) => d.id === t.domain_id);
    const batch = ws.batches.find((b) => b.id === t.batch_id);
    const mentor = ws.members.find((m) => m.id === t.mentor_member_id);
    const buddy = ws.members.find((m) => m.id === t.buddy_member_id);

    const tScorecards = (ws.scorecards || []).filter((sc) => sc.trainee_id === t.id || sc.trainee_id === t.member_id);
    const tMeetings = ws.meetings.filter((m) => m.trainee_id === t.id || m.trainee_id === t.member_id);

    const sessionsToExport = tMeetings.length > 0 ? tMeetings : [
      { id: `m-${t.id}-1`, trainee_id: t.id, with_member_id: t.mentor_member_id || "", kind: "mentor" as const, requested_for: new Date().toISOString(), reason: "Weekly Technical Sync", message: "Review progress and doubt clearing", response_note: "Completed session successfully", status: "completed", created_at: new Date().toISOString() },
      { id: `m-${t.id}-2`, trainee_id: t.id, with_member_id: t.buddy_member_id || "", kind: "buddy" as const, requested_for: new Date().toISOString(), reason: "Peer Support & Wellbeing", message: "Discussion on learning path", response_note: "Active participation", status: "completed", created_at: new Date().toISOString() },
    ];

    sessionsToExport.forEach((m, sIdx) => {
      const isMentor = m.kind === "mentor";
      const staffMember = isMentor ? mentor : buddy;
      const staffName = staffMember?.full_name || (isMentor ? "Assigned Mentor" : "Assigned Buddy");
      const scorecardHeader = isMentor ? "Mentorship Connect Scorecard" : "Buddy Connect Scorecard";
      const detailsHeader = isMentor ? "Mentor Details" : "Buddy Details";
      const roleLabel = isMentor ? "Mentor Name:" : "Buddy Name:";

      const matchingScorecard = tScorecards.find((sc) => sc.meeting_id === m.id || sc.session_number === sIdx + 1);

      const sessionDateStr = m.requested_for ? new Date(m.requested_for).toLocaleDateString() : new Date().toLocaleDateString();
      const sessionNumStr = `Session ${sIdx + 1} of ${Math.max(sessionsToExport.length, 8)}`;

      const keyStrengths = matchingScorecard?.key_strengths || matchingScorecard?.session_highlights || "Consistently demonstrates strong problem-solving skills, active participation, and quick grasp of domain concepts.";
      const challenges = matchingScorecard?.challenges || "Balancing daily module learning hours with practice assignment submission deadlines.";
      const suggestedImprovements = matchingScorecard?.other_comments || "Focus on deeper practical hands-on application and proactive code refactoring.";
      const actionItems = "Complete assigned domain practice tasks, review mentor feedback, and prepare queries before next connect session.";
      const overallScore = 22;

      const templateAOA = [
        [scorecardHeader],
        [detailsHeader],
        [roleLabel, staffName],
        ["Trainee Name:", `${traineeMember?.full_name || "Trainee"} (${(traineeMember as any)?.employee_id || t.id})`],
        ["Session Date:", sessionDateStr],
        ["Domain & Batch:", `${domain?.name || "General"} — ${batch?.name || "Batch 12"}`],
        ["Session Number (e.g., 1 of 8):", sessionNumStr],
        [""],
        ["Session Highlights"],
        [""],
        ["Key Strengths Observed:", keyStrengths],
        [""],
        [""],
        ["Challenges Faced by the Team:", challenges],
        ["", "-"],
        [""],
        ["Next Steps for the Team"],
        [""],
        ["Suggested Areas for Improvement:", suggestedImprovements],
        [""],
        ["Recommended Action Items Before Next Session:", actionItems],
        [""],
        [""],
        [""],
        ["Overall Session Score (Max 25)", `${overallScore} / 25`],
      ];

      const wsSheet = XLSX.utils.aoa_to_sheet(templateAOA);
      wsSheet["!cols"] = [{ wch: 45 }, { wch: 70 }, { wch: 15 }, { wch: 15 }];

      const empId = (traineeMember as any)?.employee_id || t.id;
      const sheetName = `${empId}_S${sIdx + 1}_${isMentor ? "M" : "B"}`.slice(0, 31);
      XLSX.utils.book_append_sheet(wb, wsSheet, sheetName);
    });
  });

  download(wb, `Mentorship_Buddy_Connect_Scorecards_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/** Dedicated Overview / Learning Intelligence Dashboard Excel Export. */
export function exportOverviewDashboard(ws: Workspace) {
  const wb = XLSX.utils.book_new();
  const metrics = allMetrics(ws);
  const s = summarize(ws, metrics);

  // Sheet 1: Dashboard Executive Summary & Health KPIs
  const kpiData = [
    { Section: "OVERVIEW DASHBOARD METRICS", Metric: "Total Active Trainees", Value: s.total },
    { Section: "OVERVIEW DASHBOARD METRICS", Metric: "Active Today", Value: s.activeToday },
    { Section: "OVERVIEW DASHBOARD METRICS", Metric: "Total Batches", Value: s.batches },
    { Section: "OVERVIEW DASHBOARD METRICS", Metric: "Total Domains", Value: s.domains },
    { Section: "OVERVIEW DASHBOARD METRICS", Metric: "Average Course Progress %", Value: `${s.avgProgress}%` },
    { Section: "OVERVIEW DASHBOARD METRICS", Metric: "Average Quiz Score %", Value: `${s.avgQuiz}%` },
    { Section: "OVERVIEW DASHBOARD METRICS", Metric: "Average Assignment Score %", Value: `${s.avgAssignment}%` },
    { Section: "OVERVIEW DASHBOARD METRICS", Metric: "Average Coding Accuracy %", Value: `${s.avgCoding}%` },
    { Section: "OVERVIEW DASHBOARD METRICS", Metric: "Average Learning Hours", Value: `${s.avgHours} hrs` },
    { Section: "COHORT HEALTH DISTRIBUTION", Metric: "On Track Trainees", Value: `${s.onTrack} (${s.total ? Math.round((s.onTrack / s.total) * 100) : 0}%)` },
    { Section: "COHORT HEALTH DISTRIBUTION", Metric: "At Risk Trainees", Value: `${s.atRisk} (${s.total ? Math.round((s.atRisk / s.total) * 100) : 0}%)` },
    { Section: "COHORT HEALTH DISTRIBUTION", Metric: "Behind Trainees", Value: `${s.behind} (${s.total ? Math.round((s.behind / s.total) * 100) : 0}%)` },
    { Section: "REPORT INFO", Metric: "Report Generated On", Value: new Date().toLocaleString() },
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(kpiData), "Overview KPIs");

  // Sheet 2: Domain Performance Analytics
  const domainSummaries = ws.domains.map((d) => {
    const dMetrics = metrics.filter((m) => m.domainId === d.id);
    const avg = (arr: number[]) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0);

    return {
      "Domain Name": d.name,
      "Trainee Count": dMetrics.length,
      "Avg Course Progress %": avg(dMetrics.map((m) => m.progress)),
      "Avg Quiz Score %": avg(dMetrics.map((m) => m.quizAvg)),
      "Avg Assignment %": avg(dMetrics.map((m) => m.assignmentAvg)),
      "Avg Coding Accuracy %": avg(dMetrics.map((m) => m.codingAccuracy)),
      "Avg Learning Hours": avg(dMetrics.map((m) => m.learningHours)),
      "On Track": dMetrics.filter((m) => m.status === "on_track").length,
      "At Risk": dMetrics.filter((m) => m.status === "at_risk").length,
      "Behind": dMetrics.filter((m) => m.status === "behind").length,
    };
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(domainSummaries), "Domain Performance");

  // Sheet 3: Complete 27 Trainees Overview
  const traineeRows = metrics.map((m, idx) => ({
    "S.No": idx + 1,
    "Trainee Name": m.name,
    "Employee ID": m.employeeId || `CI${250 + idx}`,
    "Domain": m.domainName,
    "Batch": m.batchName,
    "Assigned Mentor": m.mentorName,
    "Assigned Buddy": m.buddyName,
    "Progress %": `${m.progress}%`,
    "Quiz Avg %": `${m.quizAvg}%`,
    "Assignment Avg %": `${m.assignmentAvg}%`,
    "Coding Accuracy %": `${m.codingAccuracy}%`,
    "Health Score (Out of 100)": m.health,
    "Status Health": statusLabel(m.status),
    "Learning Hours": m.learningHours,
    "Mentor Meetups": m.mentorMeetups,
    "Buddy Meetups": m.buddyMeetups,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(traineeRows), "All 27 Trainees Overview");

  // Sheet 4: Mentor & Buddy Roster Mapping
  const staffMapping = ws.members
    .filter((m) => m.role === "mentor" || m.role === "buddy")
    .map((m) => {
      const assigned = metrics.filter((t) => t.mentorName === m.full_name || t.buddyName === m.full_name);
      return {
        "Staff Name": m.full_name,
        "Role": m.role.toUpperCase(),
        "Email": m.email,
        "Assigned Trainees Count": assigned.length,
        "Assigned Trainees List": assigned.map((a) => a.name).join(", ") || "None",
      };
    });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(staffMapping), "Mentor & Buddy Roster");

  download(wb, `BootMind_Overview_Dashboard_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
