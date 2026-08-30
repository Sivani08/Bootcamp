create or replace function public.claim_demo_seat(_role app_role, _full_name text)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $function$
declare _mid uuid; _uid uuid := auth.uid(); _email text;
begin
  if _uid is null then raise exception 'Not authenticated'; end if;

  select email into _email from auth.users where id = _uid;

  select id into _mid from public.members where user_id = _uid;
  if _mid is not null then
    insert into public.user_roles (user_id, role)
    select _uid, m.role from public.members m where m.id = _mid
    on conflict do nothing;
    return _mid;
  end if;

  -- 1) an invite created by an admin for this exact email
  select id into _mid from public.members
  where user_id is null and lower(email) = lower(coalesce(_email,''))
  order by created_at limit 1;

  -- 2) otherwise an open seat for the requested role
  if _mid is null then
    select id into _mid from public.members
    where role = _role and user_id is null
    order by created_at limit 1;
  end if;

  if _mid is null then
    insert into public.members (user_id, full_name, email, role, title)
    values (_uid, coalesce(nullif(_full_name,''),'New '||_role::text), coalesce(_email, _uid::text||'@bootmind.io'), _role, initcap(_role::text))
    returning id into _mid;
  else
    update public.members set user_id = _uid,
      full_name = coalesce(nullif(_full_name,''), full_name)
    where id = _mid;
  end if;

  insert into public.user_roles (user_id, role)
  select _uid, m.role from public.members m where m.id = _mid
  on conflict do nothing;

  return _mid;
end $function$;