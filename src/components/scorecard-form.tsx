import { useState } from "react";
import { useActions, notify } from "@/lib/actions";
import { SCORECARD_SECTIONS, SCALE_INSTRUCTION, commentField, scoreField, type ScoreKey } from "@/lib/scorecard";

const inputCls =
  "mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export interface ScorecardFormProps {
  traineeId: string;
  traineeMemberId: string;
  traineeName: string;
  evaluatorMemberId: string;
  participantRole: "mentor" | "buddy" | "admin";
  meetingId?: string | null;
  defaultSessionNumber?: number;
  defaultSessionDate?: string;
  teamName?: string;
  onSaved?: () => void;
}

/** Structured connect evaluation — same sections and terminology as the organisation's scorecard. */
export function ScorecardForm({
  traineeId,
  traineeMemberId,
  traineeName,
  evaluatorMemberId,
  participantRole,
  meetingId = null,
  defaultSessionNumber = 1,
  defaultSessionDate,
  teamName = "",
  onSaved,
}: ScorecardFormProps) {
  const { db, run } = useActions();
  const [busy, setBusy] = useState(false);
  const [sessionDate, setSessionDate] = useState(defaultSessionDate ?? new Date().toISOString().slice(0, 10));
  const [sessionNumber, setSessionNumber] = useState(defaultSessionNumber);
  const [sessionType, setSessionType] = useState("Connect");
  const [team, setTeam] = useState(teamName);
  const [highlights, setHighlights] = useState("");
  const [strengths, setStrengths] = useState("");
  const [challenges, setChallenges] = useState("");
  const [other, setOther] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});

  const setScore = (k: ScoreKey, v: number) => setScores((s) => ({ ...s, [k]: v }));
  const setComment = (k: ScoreKey, v: string) => setComments((c) => ({ ...c, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload: Record<string, unknown> = {
        trainee_id: traineeId,
        evaluator_member_id: evaluatorMemberId,
        participant_role: participantRole,
        meeting_id: meetingId,
        session_date: sessionDate,
        session_number: sessionNumber,
        team_name: team || null,
        session_type: sessionType,
        session_highlights: highlights || null,
        key_strengths: strengths || null,
        challenges: challenges || null,
        other_comments: other || null,
      };
      for (const section of SCORECARD_SECTIONS) {
        for (const p of section.params) {
          payload[scoreField(p.key)] = scores[p.key] ?? null;
          payload[commentField(p.key)] = comments[p.key] ?? null;
        }
      }

      const ok = await run("Scorecard saved", () => db.from("connect_scorecards").insert(payload));
      if (ok) {
        await notify(
          traineeMemberId,
          `${participantRole === "buddy" ? "Buddy" : "Mentor"} connect scorecard added`,
          `Session ${sessionNumber} on ${sessionDate}`,
          "feedback",
          "/feedback",
        );
        setScores({});
        setComments({});
        setHighlights("");
        setStrengths("");
        setChallenges("");
        setOther("");
        onSaved?.();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <p className="text-sm text-muted-foreground">
        {participantRole === "buddy" ? "Buddy" : "Mentor"} connect with <span className="font-medium text-foreground">{traineeName}</span>. {SCALE_INSTRUCTION}
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block text-sm font-medium">
          Session date
          <input type="date" required value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} className={inputCls} />
        </label>
        <label className="block text-sm font-medium">
          Session number
          <input
            type="number"
            min={1}
            required
            value={sessionNumber}
            onChange={(e) => setSessionNumber(Number(e.target.value))}
            className={inputCls}
          />
        </label>
        <label className="block text-sm font-medium">
          Session type
          <select value={sessionType} onChange={(e) => setSessionType(e.target.value)} className={inputCls}>
            {["Connect", "Doubt clearing", "Project review", "Progress check", "Career guidance"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">
          Team name
          <input value={team} onChange={(e) => setTeam(e.target.value)} className={inputCls} />
        </label>
      </div>

      {SCORECARD_SECTIONS.map((section) => (
        <fieldset key={section.title} className="rounded-lg border border-border p-4">
          <legend className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {section.title}
          </legend>
          <div className="space-y-3">
            {section.params.map((p) => (
              <div key={p.key} className="grid gap-2 sm:grid-cols-[1fr_96px_1fr] sm:items-end">
                <span className="text-sm font-medium">{p.label}</span>
                <label className="block text-xs text-muted-foreground">
                  Score
                  <select
                    required
                    value={scores[p.key] ?? ""}
                    onChange={(e) => setScore(p.key, Number(e.target.value))}
                    className={inputCls}
                  >
                    <option value="" disabled>
                      —
                    </option>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-xs text-muted-foreground">
                  Comment
                  <input
                    value={comments[p.key] ?? ""}
                    onChange={(e) => setComment(p.key, e.target.value)}
                    className={inputCls}
                  />
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      ))}

      <div className="grid gap-3 lg:grid-cols-3">
        <label className="block text-sm font-medium">
          Session highlights
          <textarea rows={3} value={highlights} onChange={(e) => setHighlights(e.target.value)} className="mt-1 w-full rounded-lg border border-input bg-background p-3 text-sm" />
        </label>
        <label className="block text-sm font-medium">
          Key strengths observed
          <textarea rows={3} value={strengths} onChange={(e) => setStrengths(e.target.value)} className="mt-1 w-full rounded-lg border border-input bg-background p-3 text-sm" />
        </label>
        <label className="block text-sm font-medium">
          Challenges faced
          <textarea rows={3} value={challenges} onChange={(e) => setChallenges(e.target.value)} className="mt-1 w-full rounded-lg border border-input bg-background p-3 text-sm" />
        </label>
      </div>

      <label className="block text-sm font-medium">
        Any other comments
        <textarea rows={2} value={other} onChange={(e) => setOther(e.target.value)} className="mt-1 w-full rounded-lg border border-input bg-background p-3 text-sm" />
      </label>

      <button
        disabled={busy}
        className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
      >
        {busy ? "Saving…" : "Submit scorecard"}
      </button>
    </form>
  );
}
