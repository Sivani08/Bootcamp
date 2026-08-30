# BootMind — Targeted Update Plan

## Audit findings (answers to your 8 questions)

**1. Existing files that will be touched (modified, not rewritten)**
- `src/lib/auth.tsx` — session/role context (fix refresh + member lookup race)
- `src/routes/auth.tsx` — login screen; Trainee tab already Employee ID + Name, Staff tab email/password (verify + fix)
- `src/lib/trainee-auth.functions.ts` — server-side trainee sign-in (add active-trainee enforcement)
- `src/routes/_authenticated/meetups.tsx` — add "Record scorecard" on completed connects
- `src/routes/_authenticated/trainees/$id.tsx` — add Scorecards tab with history + per-session download
- `src/routes/_authenticated/reports.tsx` — add admin scorecard view + bulk download (inside existing layout)
- `src/lib/excel.ts` — add scorecard workbook generator alongside existing exports
- `src/lib/data.ts` — add scorecards to the workspace fetch
- `src/lib/files.ts` / `src/components/file-upload.tsx` — already extension allow/block list; verify + harden
- `src/components/data-import.tsx`, `src/lib/employees.functions.ts` — employee CSV/XLSX import already present; complete validation summary (total/valid/invalid/duplicate/missing)

No new pages, no sidebar/nav/theme/colour changes. New UI is a form component reused in the existing meetups and trainee-profile surfaces.

**2. Reusable tables:** `members` (has `employee_id`, `status`), `trainees` (mentor/buddy links), `meetings` (connects), `feedback` (existing free-form ratings — kept as-is), `batches`, `domains`, `resources`.

**3. New database objects (additive only):**
- `connect_scorecards` — one row per connect, shared by mentor and buddy via `participant_role` (`mentor` | `buddy`), with `trainee_id`, `evaluator_member_id`, `meeting_id` (nullable link to existing meeting), `session_date`, `session_number`, `team_name`, `session_type`, the 11 score columns (1–5) + matching comment columns, `other_comments`, timestamps.
- RLS: trainee sees own; mentor/buddy see assigned trainees (reuses `can_view_trainee`/`supports_trainee`); admin sees all. Insert restricted to the evaluator (`my_member_id()`), history preserved (no destructive updates/deletes for non-owners).
- GRANTs for `authenticated` + `service_role`.

**4. Current authentication:** Supabase email/password for admin/mentor/buddy via `supabase.auth`; trainee via `traineeLogin` server function that verifies Employee ID + Name against `members` using the admin client, then mints a real Supabase session (tokens returned, set client-side with `setSession`) so RLS applies normally. Role comes from the `members` row (`useAuth`), route gate lives in `_authenticated/route.tsx`.

**5. Excel export today:** `src/lib/excel.ts` uses the `xlsx` library, building multi-sheet workbooks (`exportCohort`, `exportTrainee`) and calling `XLSX.writeFile` — real .xlsx downloads.

**6. Mentor/Buddy feedback today:** `feedback` table + `/feedback` page — category, 1–5 rating, comments. Kept working; the scorecard becomes the structured session evaluation layered on top (it also writes a summary row into `feedback` so existing analytics keep seeing it).

**7. Meetups today:** `meetings` table with `kind` (mentor/buddy) and status flow requested → accepted → completed. Scorecard attaches to the completion step.

**8. Integration approach:** one shared scorecard model + one shared form component, rendered inside meetups (mentor/buddy) and the trainee profile (admin). No parallel feedback system, no new navigation entry.

## Implementation steps
1. Migration: `connect_scorecards` table, grants, RLS, updated_at trigger.
2. Auth fixes: only `status = 'active'` trainees can sign in; session-refresh and role-lookup hardening; sign-out cache teardown.
3. Scorecard form component (sections: Technical Proficiency, Engagement & Preparation, Progress & Improvement, Soft Skills, Other Comments) styled with existing panel/input classes.
4. Wire form into completed connects in meetups; store in DB; keep full history per session.
5. XLSX generator recreating the reference format: **Summary** sheet (Mentorship/Buddy Connect Scorecard, evaluator details, team name, session date/number, highlights, strengths, challenges) and **Week N / Individual Score Card** sheet (instruction line, sections, parameter / score / comment columns).
6. Filenames like `Mentor_Scorecard_Sivani_Kethineni_Session_03_2026-08-10.xlsx`.
7. Trainee profile: Scorecards tab listing mentor and buddy connects with per-session Download.
8. Admin bulk download in reports: filters (batch, domain, mentor/buddy, trainee, date range, session no.) → one workbook with a sheet pair per scorecard.
9. Scorecard analytics: per-category averages, latest vs previous trend — shown alongside existing metrics, Learning Health Score untouched.
10. Employee import validation summary + active-trainee eligibility; upload allow/block list verification.
11. Regression pass across all roles and existing pages.

## Notes
- The reference `Mentor Score Card.xlsx` was not attached to this message, so the workbook will be recreated programmatically from the structure and terminology you listed. Attach the file any time and I will align cell-for-cell.
- No demo data will be deleted; real data imports alongside it.
