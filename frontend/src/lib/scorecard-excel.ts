import * as XLSX from "xlsx";
import {
  ALL_PARAMS,
  SCALE_INSTRUCTION,
  SCORECARD_SECTIONS,
  commentField,
  overallAverage,
  scoreField,
  scorecardFileName,
  type ScorecardRow,
} from "./scorecard";

export interface ScorecardContext {
  row: ScorecardRow;
  traineeName: string;
  evaluatorName: string;
  batchName: string;
  domainName: string;
}

type Cell = string | number | null;
type Rows = Cell[][];

const connectTitle = (row: ScorecardRow) =>
  row.participant_role === "buddy" ? "Buddy Connect Scorecard" : "Mentorship Connect Scorecard";

const evaluatorLabel = (row: ScorecardRow) => (row.participant_role === "buddy" ? "Buddy" : "Mentor");

function summaryRows(ctx: ScorecardContext): Rows {
  const { row } = ctx;
  const who = evaluatorLabel(row);
  return [
    [connectTitle(row)],
    [],
    [`${who} Details`],
    [`${who} Name`, ctx.evaluatorName],
    ["Team Name", row.team_name ?? ctx.batchName],
    ["Session Date", row.session_date],
    ["Session Number", row.session_number],
    ["Session Type", row.session_type],
    ["Batch", ctx.batchName],
    ["Domain", ctx.domainName],
    ["Connect Type", row.participant_role === "buddy" ? "Buddy Connect" : "Mentor Connect"],
    [],
    ["Session Highlights", row.session_highlights ?? ""],
    ["Key Strengths Observed", row.key_strengths ?? ""],
    ["Challenges Faced by the Team", row.challenges ?? ""],
  ];
}

function scoreCardRows(ctx: ScorecardContext): Rows {
  const { row } = ctx;
  const out: Rows = [
    ["Individual Score Card"],
    [],
    ["Team Member Details"],
    ["Team Member Name", ctx.traineeName],
    ["Batch", ctx.batchName],
    ["Domain", ctx.domainName],
    [`${evaluatorLabel(row)} Name`, ctx.evaluatorName],
    ["Session Date", row.session_date],
    ["Session Number", row.session_number],
    [],
    ["Performance Metrics"],
    [SCALE_INSTRUCTION],
    [],
    ["Parameter", "Score", "Comment"],
  ];

  for (const section of SCORECARD_SECTIONS) {
    out.push([section.title]);
    for (const p of section.params) {
      out.push([
        p.label,
        (row[scoreField(p.key)] as number | null) ?? "",
        (row[commentField(p.key)] as string | null) ?? "",
      ]);
    }
  }

  out.push([]);
  out.push(["OTHER COMMENTS"]);
  out.push(["Any other comments", row.other_comments ?? ""]);
  out.push([]);
  out.push(["Overall Average Score", overallAverage(row) ?? ""]);
  return out;
}

function sheet(rows: Rows, widths: number[]) {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = widths.map((wch) => ({ wch }));
  return ws;
}

const sheetName = (name: string) => name.replace(/[\\/?*[\]:]/g, "-").slice(0, 31);

/** Single connect scorecard in the organisation's reference format (Summary + Week N sheets). */
export function exportScorecard(ctx: ScorecardContext) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet(summaryRows(ctx), [34, 60]), "Summary");
  XLSX.utils.book_append_sheet(
    wb,
    sheet(scoreCardRows(ctx), [46, 10, 70]),
    sheetName(`Week ${ctx.row.session_number}`),
  );
  XLSX.writeFile(wb, scorecardFileName(ctx.row, ctx.traineeName));
}

/** Bulk export: an index plus one scorecard sheet per session, same labels and sections. */
export function exportScorecardsBulk(list: ScorecardContext[], filenameBase = "Connect_Scorecards") {
  const wb = XLSX.utils.book_new();

  const index = list.map((c) => ({
    Trainee: c.traineeName,
    "Connect Type": c.row.participant_role === "buddy" ? "Buddy Connect" : "Mentor Connect",
    [`${"Mentor / Buddy"}`]: c.evaluatorName,
    Batch: c.batchName,
    Domain: c.domainName,
    "Session Date": c.row.session_date,
    "Session Number": c.row.session_number,
    "Overall Average Score": overallAverage(c.row) ?? "",
    ...Object.fromEntries(
      ALL_PARAMS.map((p) => [p.label, (c.row[scoreField(p.key)] as number | null) ?? ""]),
    ),
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(index), "Index");

  const used = new Set<string>(["Index"]);
  for (const ctx of list) {
    const base = sheetName(
      `${ctx.traineeName.split(" ")[0]} ${ctx.row.participant_role === "buddy" ? "B" : "M"}${ctx.row.session_number}`,
    );
    let name = base;
    let i = 2;
    while (used.has(name)) name = sheetName(`${base}-${i++}`);
    used.add(name);
    XLSX.utils.book_append_sheet(
      wb,
      sheet([...summaryRows(ctx), [], ...scoreCardRows(ctx)], [46, 12, 70]),
      name,
    );
  }

  XLSX.writeFile(wb, `${filenameBase}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
