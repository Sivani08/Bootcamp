-- ============ ENUMS ============
create type public.app_role as enum ('admin','mentor','buddy','trainee');
create type public.trainee_status as enum ('on_track','at_risk','behind');
create type public.work_status as enum ('not_started','in_progress','submitted','reviewed','completed','overdue');
create type public.meeting_status as enum ('requested','accepted','rejected','rescheduled','completed','cancelled');
create type public.idea_status as enum ('new','under_review','accepted','rejected','implemented');

create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

-- ============ IDENTITY ============
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text not null default '',
  email text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select public.has_role(auth.uid(),'admin')
$$;

-- ============ ORG ============
create table public.members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users on delete set null,
  full_name text not null,
  email text not null unique,
  role public.app_role not null,
  title text,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.members to authenticated;
grant all on public.members to service_role;
alter table public.members enable row level security;

create or replace function public.my_member_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from public.members where user_id = auth.uid() limit 1
$$;

create table public.bootcamps (
  id uuid primary key default gen_random_uuid(),
  name text not null, description text,
  starts_on date, ends_on date,
  created_at timestamptz not null default now()
);
create table public.batches (
  id uuid primary key default gen_random_uuid(),
  bootcamp_id uuid not null references public.bootcamps on delete cascade,
  name text not null, starts_on date, ends_on date,
  created_at timestamptz not null default now()
);
create table public.domains (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.batches on delete cascade,
  name text not null, color text default 'indigo',
  created_at timestamptz not null default now()
);
create table public.trainees (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null unique references public.members on delete cascade,
  batch_id uuid not null references public.batches on delete cascade,
  domain_id uuid not null references public.domains on delete cascade,
  mentor_member_id uuid references public.members on delete set null,
  buddy_member_id uuid references public.members on delete set null,
  status public.trainee_status not null default 'on_track',
  status_reason text,
  learning_hours numeric not null default 0,
  streak_days int not null default 0,
  longest_streak int not null default 0,
  last_active_at timestamptz default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trainees_touch before update on public.trainees for each row execute function public.touch_updated_at();

create or replace function public.my_trainee_id() returns uuid
language sql stable security definer set search_path = public as $$
  select t.id from public.trainees t join public.members m on m.id = t.member_id
  where m.user_id = auth.uid() limit 1
$$;

create or replace function public.supports_trainee(_trainee_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.trainees t
    where t.id = _trainee_id
      and (t.mentor_member_id = public.my_member_id() or t.buddy_member_id = public.my_member_id())
  )
$$;

create or replace function public.can_view_trainee(_trainee_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_admin() or _trainee_id = public.my_trainee_id() or public.supports_trainee(_trainee_id)
$$;

-- ============ LEARNING CONTENT ============
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  domain_id uuid not null references public.domains on delete cascade,
  title text not null, description text,
  order_index int not null default 0,
  estimated_hours numeric default 8,
  created_at timestamptz not null default now()
);
create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses on delete cascade,
  title text not null, kind text not null default 'video',
  content text, resource_url text,
  duration_min int not null default 25,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null, description text,
  kind text not null default 'task',
  course_id uuid references public.courses on delete cascade,
  module_id uuid references public.modules on delete set null,
  domain_id uuid references public.domains on delete cascade,
  batch_id uuid references public.batches on delete cascade,
  trainee_id uuid references public.trainees on delete cascade,
  priority text not null default 'medium',
  submission_type text not null default 'text',
  due_at timestamptz,
  created_at timestamptz not null default now()
);
create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  title text not null, course_id uuid references public.courses on delete cascade,
  domain_id uuid references public.domains on delete cascade,
  topic text, duration_min int not null default 15, due_at timestamptz,
  created_at timestamptz not null default now()
);
create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes on delete cascade,
  prompt text not null, options jsonb not null,
  correct_index int not null, marks int not null default 1,
  topic text, order_index int not null default 0
);
create table public.coding_problems (
  id uuid primary key default gen_random_uuid(),
  domain_id uuid references public.domains on delete cascade,
  title text not null, difficulty text not null default 'easy',
  topic text, prompt text not null, starter_code text, expected_output text,
  created_at timestamptz not null default now()
);

do $$
declare t text;
begin
  foreach t in array array['bootcamps','batches','domains','courses','modules','tasks','quizzes','quiz_questions','coding_problems']
  loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "read_all_auth" on public.%I for select to authenticated using (true)', t);
    execute format('create policy "admin_write" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- ============ TRAINEE ACTIVITY ============
create table public.module_progress (
  id uuid primary key default gen_random_uuid(),
  trainee_id uuid not null references public.trainees on delete cascade,
  module_id uuid not null references public.modules on delete cascade,
  status public.work_status not null default 'completed',
  minutes int not null default 20,
  completed_at timestamptz default now(),
  unique (trainee_id, module_id)
);
create table public.task_submissions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks on delete cascade,
  trainee_id uuid not null references public.trainees on delete cascade,
  status public.work_status not null default 'in_progress',
  content text, score numeric,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (task_id, trainee_id)
);
create trigger task_sub_touch before update on public.task_submissions for each row execute function public.touch_updated_at();

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes on delete cascade,
  trainee_id uuid not null references public.trainees on delete cascade,
  score numeric not null default 0, total numeric not null default 0,
  percentage numeric generated always as (case when total > 0 then round(score*100/total) else 0 end) stored,
  answers jsonb, created_at timestamptz not null default now()
);
create table public.coding_attempts (
  id uuid primary key default gen_random_uuid(),
  problem_id uuid not null references public.coding_problems on delete cascade,
  trainee_id uuid not null references public.trainees on delete cascade,
  code text, passed boolean not null default false, output text,
  created_at timestamptz not null default now()
);
create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  trainee_id uuid not null references public.trainees on delete cascade,
  type text not null, description text not null,
  minutes int not null default 0, meta jsonb,
  created_at timestamptz not null default now()
);
create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  trainee_id uuid not null references public.trainees on delete cascade,
  with_member_id uuid not null references public.members on delete cascade,
  kind public.app_role not null,
  requested_for timestamptz not null,
  reason text, message text, response_note text,
  status public.meeting_status not null default 'requested',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger meetings_touch before update on public.meetings for each row execute function public.touch_updated_at();

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  trainee_id uuid not null references public.trainees on delete cascade,
  from_member_id uuid not null references public.members on delete cascade,
  kind public.app_role not null,
  category text not null, rating int not null check (rating between 1 and 5),
  comments text, created_at timestamptz not null default now()
);
create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  trainee_id uuid not null references public.trainees on delete cascade,
  title text not null, category text not null default 'Project Idea',
  description text not null, status public.idea_status not null default 'new',
  admin_response text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger ideas_touch before update on public.ideas for each row execute function public.touch_updated_at();

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members on delete cascade,
  title text not null, body text, category text not null default 'system',
  link text, read boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  scope text not null, period_label text not null,
  title text not null, payload jsonb not null,
  generated_at timestamptz not null default now()
);

do $$
declare t text;
begin
  foreach t in array array['module_progress','task_submissions','quiz_attempts','coding_attempts','activity_logs','meetings','feedback','ideas']
  loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "scoped_read" on public.%I for select to authenticated using (public.can_view_trainee(trainee_id))', t);
    execute format('create policy "scoped_insert" on public.%I for insert to authenticated with check (public.can_view_trainee(trainee_id))', t);
    execute format('create policy "scoped_update" on public.%I for update to authenticated using (public.can_view_trainee(trainee_id)) with check (public.can_view_trainee(trainee_id))', t);
    execute format('create policy "scoped_delete" on public.%I for delete to authenticated using (public.is_admin())', t);
  end loop;
end $$;

grant select, insert, update, delete on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "own_notifications" on public.notifications for select to authenticated
  using (member_id = public.my_member_id() or public.is_admin());
create policy "insert_notifications" on public.notifications for insert to authenticated with check (true);
create policy "update_own_notifications" on public.notifications for update to authenticated
  using (member_id = public.my_member_id() or public.is_admin()) with check (true);

grant select, insert, update, delete on public.reports to authenticated;
grant all on public.reports to service_role;
alter table public.reports enable row level security;
create policy "reports_read" on public.reports for select to authenticated using (true);
create policy "reports_admin" on public.reports for all to authenticated using (public.is_admin()) with check (public.is_admin());

grant select, insert, update, delete on public.trainees to authenticated;
grant all on public.trainees to service_role;
alter table public.trainees enable row level security;
create policy "trainees_read" on public.trainees for select to authenticated using (public.can_view_trainee(id));
create policy "trainees_admin" on public.trainees for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "trainees_self_update" on public.trainees for update to authenticated
  using (id = public.my_trainee_id()) with check (id = public.my_trainee_id());

create policy "members_read" on public.members for select to authenticated using (true);
create policy "members_admin" on public.members for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "profiles_read" on public.profiles for select to authenticated using (true);
create policy "profiles_self" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles_insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "roles_read_own" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.is_admin());