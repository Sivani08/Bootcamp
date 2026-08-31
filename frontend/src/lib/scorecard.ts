/** Shared model for the Mentor / Buddy Connect Scorecard. */

export interface ScorecardRow {
  id: string;
  trainee_id: string;
  evaluator_member_id: string;
  participant_role: "mentor" | "buddy" | "admin";
  meeting_id: string | null;
  session_date: string;
  session_number: number;
  team_name: string | null;
  session_type: string;
  session_highlights: string | null;
  key_strengths: string | null;
  challenges: string | null;
  other_comments: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: string | number | null;
}

export type ScoreKey =
  | "understanding"
  | "problem_solving"
  | "coding"
  | "preparedness"
  | "involvement"
  | "initiative"
  | "application"
  | "improvement"
  | "communication"
  | "participation"
  | "feedback";

export interface ScoreParam {
  key: ScoreKey;
  label: string;
}

export interface ScoreSection {
  title: string;
  params: ScoreParam[];
}

/** Sections and terminology taken from the organisation's Mentor Score Card. */
export const SCORECARD_SECTIONS: ScoreSection[] = [
  {
    title: "TECHNICAL PROFICIENCY",
    params: [
      { key: "understanding", label: "Understanding of Concepts" },
      { key: "problem_solving", label: "Problem-Solving Approach" },
      { key: "coding", label: "Coding/Practical Skills" },
    ],
  },
  {
    title: "ENGAGEMENT AND PREPARATION",
    params: [
      { key: "preparedness", label: "Preparedness for the Session" },
      { key: "involvement", label: "Active Involvement During the Connect" },
      { key: "initiative", label: "Initiative and Enthusiasm" },
    ],
  },
  {
    title: "PROGRESS AND IMPROVEMENT",
    params: [
      { key: "application", label: "Application of Learning from Previous Sessions" },
      { key: "improvement", label: "Overall Skill Improvement compared to the last session" },
    ],
  },
  {
    title: "SOFT SKILLS",
    params: [
      { key: "communication", label: "Language Skills / Communication Skills" },
      { key: "participation", label: "Participation in Discussions" },
      { key: "feedback", label: "Responsiveness to Feedback" },
    ],
  },
];

export const ALL_PARAMS: ScoreParam[] = SCORECARD_SECTIONS.flatMap((s) => s.params);

export const SCALE_INSTRUCTION =
  "Rate each parameter on a scale of 1 to 5 (1 = Needs Improvement, 5 = Excellent). Provide comments for clarity.";

export const scoreField = (k: ScoreKey) => `${k}_score`;
export const commentField = (k: ScoreKey) => `${k}_comment`;

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);

export function sectionAverage(row: ScorecardRow, section: ScoreSection): number | null {
  const vals = section.params.map((p) => num(row[scoreField(p.key)])).filter((v): v is number => v !== null);
  if (!vals.length) return null;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
}

export function overallAverage(row: ScorecardRow): number | null {
  const vals = ALL_PARAMS.map((p) => num(row[scoreField(p.key)])).filter((v): v is number => v !== null);
  if (!vals.length) return null;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
}

/** Chronological scorecards for one trainee, oldest first. */
export function sortedByDate(rows: ScorecardRow[]) {
  return [...rows].sort(
    (a, b) => a.session_date.localeCompare(b.session_date) || a.session_number - b.session_number,
  );
}

export interface ScorecardTrend {
  label: string;
  previous: number | null;
  current: number | null;
}

/** Latest vs previous session, per section plus overall. */
export function scorecardTrend(rows: ScorecardRow[]): ScorecardTrend[] {
  const ordered = sortedByDate(rows);
  const current = ordered.at(-1);
  const previous = ordered.at(-2);
  if (!current) return [];
  return [
    ...SCORECARD_SECTIONS.map((s) => ({
      label: s.title.replace(/\b\w+/g, (w) => w[0] + w.slice(1).toLowerCase()),
      previous: previous ? sectionAverage(previous, s) : null,
      current: sectionAverage(current, s),
    })),
    { label: "Overall", previous: previous ? overallAverage(previous) : null, current: overallAverage(current) },
  ];
}

const safe = (v: string) => v.trim().replace(/[^A-Za-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "Unknown";

export function scorecardFileName(row: ScorecardRow, traineeName: string) {
  const role = row.participant_role === "buddy" ? "Buddy" : "Mentor";
  const session = String(row.session_number).padStart(2, "0");
  return `${role}_Scorecard_${safe(traineeName)}_Session_${session}_${row.session_date}.xlsx`;
}
