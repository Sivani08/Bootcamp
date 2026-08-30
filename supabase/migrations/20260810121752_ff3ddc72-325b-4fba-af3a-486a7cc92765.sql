create table public.connect_scorecards (
  id uuid primary key default gen_random_uuid(),
  trainee_id uuid not null references public.trainees(id) on delete cascade,
  evaluator_member_id uuid not null references public.members(id) on delete cascade,
  participant_role app_role not null,
  meeting_id uuid references public.meetings(id) on delete set null,
  session_date date not null default current_date,
  session_number integer not null default 1,
  team_name text,
  session_type text not null default 'Connect',
  session_highlights text,
  key_strengths text,
  challenges text,
  understanding_score integer check (understanding_score between 1 and 5),
  understanding_comment text,
  problem_solving_score integer check (problem_solving_score between 1 and 5),
  problem_solving_comment text,
  coding_score integer check (coding_score between 1 and 5),
  coding_comment text,
  preparedness_score integer check (preparedness_score between 1 and 5),
  preparedness_comment text,
  involvement_score integer check (involvement_score between 1 and 5),
  involvement_comment text,
  initiative_score integer check (initiative_score between 1 and 5),
  initiative_comment text,
  application_score integer check (application_score between 1 and 5),
  application_comment text,
  improvement_score integer check (improvement_score between 1 and 5),
  improvement_comment text,
  communication_score integer check (communication_score between 1 and 5),
  communication_comment text,
  participation_score integer check (participation_score between 1 and 5),
  participation_comment text,
  feedback_score integer check (feedback_score between 1 and 5),
  feedback_comment text,
  other_comments text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index connect_scorecards_trainee_idx on public.connect_scorecards (trainee_id, session_date desc);
create index connect_scorecards_evaluator_idx on public.connect_scorecards (evaluator_member_id);

grant select, insert, update, delete on public.connect_scorecards to authenticated;
grant all on public.connect_scorecards to service_role;

alter table public.connect_scorecards enable row level security;

create policy "Scorecards visible to trainee, mentor, buddy and admin"
on public.connect_scorecards for select to authenticated
using (public.can_view_trainee(trainee_id));

create policy "Mentors, buddies and admins can create scorecards"
on public.connect_scorecards for insert to authenticated
with check (
  evaluator_member_id = public.my_member_id()
  and (public.is_admin() or public.supports_trainee(trainee_id))
);

create policy "Authors and admins can update scorecards"
on public.connect_scorecards for update to authenticated
using (evaluator_member_id = public.my_member_id() or public.is_admin())
with check (evaluator_member_id = public.my_member_id() or public.is_admin());

create policy "Admins can delete scorecards"
on public.connect_scorecards for delete to authenticated
using (public.is_admin());

create trigger connect_scorecards_touch
before update on public.connect_scorecards
for each row execute function public.touch_updated_at();