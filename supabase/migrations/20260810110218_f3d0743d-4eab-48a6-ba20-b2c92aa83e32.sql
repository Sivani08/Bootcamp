-- 1. Real employee fields on members
alter table public.members
  add column if not exists employee_id text,
  add column if not exists status text not null default 'active',
  add column if not exists joining_date date,
  add column if not exists phone text,
  add column if not exists is_demo boolean not null default false;

-- mark all existing seeded people as demo and give placeholder employee ids
update public.members set is_demo = true where is_demo = false;
update public.members m
set employee_id = 'DEMO' || lpad(s.rn::text, 5, '0')
from (select id, row_number() over (order by created_at, id) rn from public.members) s
where s.id = m.id and m.employee_id is null;

create unique index if not exists members_employee_id_key
  on public.members (lower(employee_id)) where employee_id is not null;

alter table public.members
  drop constraint if exists members_status_check;
alter table public.members
  add constraint members_status_check check (status in ('active','inactive'));

-- 2. Tighten member visibility: trainees should not see other trainees' rows
drop policy if exists members_read on public.members;
create policy members_read on public.members for select to authenticated
using (
  public.is_admin()
  or role <> 'trainee'
  or user_id = auth.uid()
  or exists (
    select 1 from public.trainees t
    where t.member_id = members.id and public.can_view_trainee(t.id)
  )
);

-- 3. Resource / file metadata table
create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  file_type text not null,
  mime_type text not null,
  file_size bigint not null,
  storage_path text not null unique,
  description text,
  uploaded_by uuid not null references public.members(id) on delete cascade,
  uploaded_by_role app_role not null,
  visibility text not null default 'shared',
  course_id uuid references public.courses(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete cascade,
  module_id uuid references public.modules(id) on delete cascade,
  trainee_id uuid references public.trainees(id) on delete cascade,
  batch_id uuid references public.batches(id) on delete cascade,
  domain_id uuid references public.domains(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.resources TO authenticated;
GRANT ALL ON public.resources TO service_role;

alter table public.resources enable row level security;

create policy resources_read on public.resources for select to authenticated
using (
  public.is_admin()
  or uploaded_by = public.my_member_id()
  or (trainee_id is not null and public.can_view_trainee(trainee_id))
  or (
    trainee_id is null and (
      -- everyone in scope sees generally shared learning material
      visibility = 'shared'
      and (
        batch_id is null
        or exists (select 1 from public.trainees t
                   where t.member_id = public.my_member_id() and t.batch_id = resources.batch_id)
        or exists (select 1 from public.trainees t
                   where (t.mentor_member_id = public.my_member_id() or t.buddy_member_id = public.my_member_id())
                     and t.batch_id = resources.batch_id)
      )
    )
  )
);

create policy resources_insert on public.resources for insert to authenticated
with check (uploaded_by = public.my_member_id());

create policy resources_update on public.resources for update to authenticated
using (public.is_admin() or uploaded_by = public.my_member_id())
with check (public.is_admin() or uploaded_by = public.my_member_id());

create policy resources_delete on public.resources for delete to authenticated
using (public.is_admin() or uploaded_by = public.my_member_id());

create trigger resources_touch before update on public.resources
for each row execute function public.touch_updated_at();

create index if not exists resources_course_idx on public.resources(course_id);
create index if not exists resources_task_idx on public.resources(task_id);
create index if not exists resources_trainee_idx on public.resources(trainee_id);

-- 4. Storage policies for the private resources bucket
create policy "resources_bucket_read" on storage.objects for select to authenticated
using (
  bucket_id = 'resources'
  and exists (select 1 from public.resources r where r.storage_path = storage.objects.name)
);

create policy "resources_bucket_insert" on storage.objects for insert to authenticated
with check (bucket_id = 'resources');

create policy "resources_bucket_delete" on storage.objects for delete to authenticated
using (
  bucket_id = 'resources'
  and (
    public.is_admin()
    or exists (
      select 1 from public.resources r
      where r.storage_path = storage.objects.name and r.uploaded_by = public.my_member_id()
    )
  )
);