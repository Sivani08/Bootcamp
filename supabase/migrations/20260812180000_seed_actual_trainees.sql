-- Delete synthetic demo trainees
delete from public.members where role = 'trainee' and (employee_id like 'DEMO%' or email like '%@bootmind.io');

do $$
declare
  bc uuid; b12 uuid;
  d_de uuid; d_ct uuid; d_dcg uuid;
  m_admin uuid; m_men1 uuid; m_men2 uuid; m_bud1 uuid; m_bud2 uuid;
  mid uuid; tid uuid;
begin
  select id into bc from public.bootcamps limit 1;
  select id into b12 from public.batches limit 1;
  select id into d_de from public.domains where name ilike '%data engineering%' limit 1;
  select id into d_ct from public.domains where name ilike '%clinical%' limit 1;
  select id into d_dcg from public.domains where name ilike '%analytics%' limit 1;
  select id into m_admin from public.members where role = 'admin' limit 1;
  select id into m_men1 from public.members where role = 'mentor' order by created_at limit 1;
  select id into m_men2 from public.members where role = 'mentor' order by created_at desc limit 1;
  select id into m_bud1 from public.members where role = 'buddy' order by created_at limit 1;
  select id into m_bud2 from public.members where role = 'buddy' order by created_at desc limit 1;

  -- CI254: AnanyaSree Sridharan
  insert into public.members (full_name, email, role, title, employee_id, status)
  values ('AnanyaSree Sridharan', 'AnanyaSree.Sridharan@agilisium.com', 'trainee', 'DCG Trainee', 'CI254', 'active')
  on conflict (lower(employee_id)) do update set full_name = excluded.full_name, email = excluded.email
  returning id into mid;

  insert into public.trainees (member_id, batch_id, domain_id, mentor_member_id, buddy_member_id, status, learning_hours, streak_days, longest_streak, last_active_at)
  values (mid, b12, coalesce(d_dcg, d_de), m_men1, m_bud1, 'on_track', 35, 29, 34, now() - interval '0 hours')
  on conflict do nothing;

  -- CI250: ArakatavemulaLakshmi Kullayamma
  insert into public.members (full_name, email, role, title, employee_id, status)
  values ('ArakatavemulaLakshmi Kullayamma', 'ArakatavemulaLakshmi.Kullayamma@agilisium.com', 'trainee', 'DE Trainee', 'CI250', 'active')
  on conflict (lower(employee_id)) do update set full_name = excluded.full_name, email = excluded.email
  returning id into mid;

  insert into public.trainees (member_id, batch_id, domain_id, mentor_member_id, buddy_member_id, status, learning_hours, streak_days, longest_streak, last_active_at)
  values (mid, b12, coalesce(d_de, d_de), m_men2, m_bud2, 'on_track', 36, 30, 35, now() - interval '1 hours')
  on conflict do nothing;

  -- CI267: Aruna Kiruthija
  insert into public.members (full_name, email, role, title, employee_id, status)
  values ('Aruna Kiruthija', 'Aruna.Kiruthija@aglisium.com', 'trainee', 'CT Trainee', 'CI267', 'active')
  on conflict (lower(employee_id)) do update set full_name = excluded.full_name, email = excluded.email
  returning id into mid;

  insert into public.trainees (member_id, batch_id, domain_id, mentor_member_id, buddy_member_id, status, learning_hours, streak_days, longest_streak, last_active_at)
  values (mid, b12, coalesce(d_ct, d_de), m_men1, m_bud1, 'on_track', 36, 30, 35, now() - interval '2 hours')
  on conflict do nothing;

  -- CI255: Jagan Saravanan
  insert into public.members (full_name, email, role, title, employee_id, status)
  values ('Jagan Saravanan', 'Jagan.Saravanan@agilisium.com', 'trainee', 'DE Trainee', 'CI255', 'active')
  on conflict (lower(employee_id)) do update set full_name = excluded.full_name, email = excluded.email
  returning id into mid;

  insert into public.trainees (member_id, batch_id, domain_id, mentor_member_id, buddy_member_id, status, learning_hours, streak_days, longest_streak, last_active_at)
  values (mid, b12, coalesce(d_de, d_de), m_men2, m_bud2, 'on_track', 36, 30, 35, now() - interval '3 hours')
  on conflict do nothing;

  -- CI263: Janarthanan Karuppusamy
  insert into public.members (full_name, email, role, title, employee_id, status)
  values ('Janarthanan Karuppusamy', 'Janarthanan.Karuppasamy@agilisium.com', 'trainee', 'DCG Trainee', 'CI263', 'active')
  on conflict (lower(employee_id)) do update set full_name = excluded.full_name, email = excluded.email
  returning id into mid;

  insert into public.trainees (member_id, batch_id, domain_id, mentor_member_id, buddy_member_id, status, learning_hours, streak_days, longest_streak, last_active_at)
  values (mid, b12, coalesce(d_dcg, d_de), m_men1, m_bud1, 'on_track', 36, 30, 35, now() - interval '4 hours')
  on conflict do nothing;

  -- CI261: Jayashree Sankar
  insert into public.members (full_name, email, role, title, employee_id, status)
  values ('Jayashree Sankar', 'Jayashree.Sankar@agilisium.com', 'trainee', 'DE Trainee', 'CI261', 'active')
  on conflict (lower(employee_id)) do update set full_name = excluded.full_name, email = excluded.email
  returning id into mid;

  insert into public.trainees (member_id, batch_id, domain_id, mentor_member_id, buddy_member_id, status, learning_hours, streak_days, longest_streak, last_active_at)
  values (mid, b12, coalesce(d_de, d_de), m_men2, m_bud2, 'on_track', 36, 30, 35, now() - interval '5 hours')
  on conflict do nothing;

  -- CI269: Jeevanantham Balamurugan
  insert into public.members (full_name, email, role, title, employee_id, status)
  values ('Jeevanantham Balamurugan', 'jeevananthambalamurugan@agilisium.com', 'trainee', 'CT Trainee', 'CI269', 'active')
  on conflict (lower(employee_id)) do update set full_name = excluded.full_name, email = excluded.email
  returning id into mid;

  insert into public.trainees (member_id, batch_id, domain_id, mentor_member_id, buddy_member_id, status, learning_hours, streak_days, longest_streak, last_active_at)
  values (mid, b12, coalesce(d_ct, d_de), m_men1, m_bud1, 'on_track', 30, 25, 30, now() - interval '6 hours')
  on conflict do nothing;

  -- CI264: Jeyakrishnan Rajendran
  insert into public.members (full_name, email, role, title, employee_id, status)
  values ('Jeyakrishnan Rajendran', 'Jeyakrishnan.Rajendran@agilisium.com', 'trainee', 'CT Trainee', 'CI264', 'active')
  on conflict (lower(employee_id)) do update set full_name = excluded.full_name, email = excluded.email
  returning id into mid;

  insert into public.trainees (member_id, batch_id, domain_id, mentor_member_id, buddy_member_id, status, learning_hours, streak_days, longest_streak, last_active_at)
  values (mid, b12, coalesce(d_ct, d_de), m_men2, m_bud2, 'on_track', 36, 30, 35, now() - interval '7 hours')
  on conflict do nothing;

  -- CI257: Karthick Saravanan
  insert into public.members (full_name, email, role, title, employee_id, status)
  values ('Karthick Saravanan', 'Karthick.Saravanan@agilisium.com', 'trainee', 'DE Trainee', 'CI257', 'active')
  on conflict (lower(employee_id)) do update set full_name = excluded.full_name, email = excluded.email
  returning id into mid;

  insert into public.trainees (member_id, batch_id, domain_id, mentor_member_id, buddy_member_id, status, learning_hours, streak_days, longest_streak, last_active_at)
  values (mid, b12, coalesce(d_de, d_de), m_men1, m_bud1, 'on_track', 36, 30, 35, now() - interval '8 hours')
  on conflict do nothing;

  -- CI268: Karthik Thiyagarajan
  insert into public.members (full_name, email, role, title, employee_id, status)
  values ('Karthik Thiyagarajan', 'karthik.thiyagarajan@agilisium.com', 'trainee', 'DCG Trainee', 'CI268', 'active')
  on conflict (lower(employee_id)) do update set full_name = excluded.full_name, email = excluded.email
  returning id into mid;

  insert into public.trainees (member_id, batch_id, domain_id, mentor_member_id, buddy_member_id, status, learning_hours, streak_days, longest_streak, last_active_at)
  values (mid, b12, coalesce(d_dcg, d_de), m_men2, m_bud2, 'on_track', 36, 30, 35, now() - interval '9 hours')
  on conflict do nothing;

  -- CI258: Kethireddy Sivani
  insert into public.members (full_name, email, role, title, employee_id, status)
  values ('Kethireddy Sivani', 'Kethireddy.Sivani@agilisium.com', 'trainee', 'DE Trainee', 'CI258', 'active')
  on conflict (lower(employee_id)) do update set full_name = excluded.full_name, email = excluded.email
  returning id into mid;

  insert into public.trainees (member_id, batch_id, domain_id, mentor_member_id, buddy_member_id, status, learning_hours, streak_days, longest_streak, last_active_at)
  values (mid, b12, coalesce(d_de, d_de), m_men1, m_bud1, 'on_track', 36, 30, 35, now() - interval '10 hours')
  on conflict do nothing;

  -- CI271: Lakshan VijayaSekar
  insert into public.members (full_name, email, role, title, employee_id, status)
  values ('Lakshan VijayaSekar', 'Lakshan.VijayaSekar@agilisium.com', 'trainee', 'CT Trainee', 'CI271', 'active')
  on conflict (lower(employee_id)) do update set full_name = excluded.full_name, email = excluded.email
  returning id into mid;

  insert into public.trainees (member_id, batch_id, domain_id, mentor_member_id, buddy_member_id, status, learning_hours, streak_days, longest_streak, last_active_at)
  values (mid, b12, coalesce(d_ct, d_de), m_men2, m_bud2, 'on_track', 36, 30, 35, now() - interval '11 hours')
  on conflict do nothing;

  -- 11701: Lingesh Thirumalai
  insert into public.members (full_name, email, role, title, employee_id, status)
  values ('Lingesh Thirumalai', 'Lingesh.Thirumalai@agilisium.com', 'trainee', 'CT Trainee', '11701', 'active')
  on conflict (lower(employee_id)) do update set full_name = excluded.full_name, email = excluded.email
  returning id into mid;

  insert into public.trainees (member_id, batch_id, domain_id, mentor_member_id, buddy_member_id, status, learning_hours, streak_days, longest_streak, last_active_at)
  values (mid, b12, coalesce(d_ct, d_de), m_men1, m_bud1, 'on_track', 36, 30, 35, now() - interval '0 hours')
  on conflict do nothing;

  -- CI252: MittapalliBhanu Vardhanreddy
  insert into public.members (full_name, email, role, title, employee_id, status)
  values ('MittapalliBhanu Vardhanreddy', 'MittapalliBhanu.Vardhanreddy@agilisium.com', 'trainee', 'DE Trainee', 'CI252', 'active')
  on conflict (lower(employee_id)) do update set full_name = excluded.full_name, email = excluded.email
  returning id into mid;

  insert into public.trainees (member_id, batch_id, domain_id, mentor_member_id, buddy_member_id, status, learning_hours, streak_days, longest_streak, last_active_at)
  values (mid, b12, coalesce(d_de, d_de), m_men2, m_bud2, 'on_track', 34, 28, 33, now() - interval '1 hours')
  on conflict do nothing;

  -- CI259: Monaleesaa Karthikeyan
  insert into public.members (full_name, email, role, title, employee_id, status)
  values ('Monaleesaa Karthikeyan', 'Monaleesaa.Karthikeyan@agilisium.com', 'trainee', 'CT Trainee', 'CI259', 'active')
  on conflict (lower(employee_id)) do update set full_name = excluded.full_name, email = excluded.email
  returning id into mid;

  insert into public.trainees (member_id, batch_id, domain_id, mentor_member_id, buddy_member_id, status, learning_hours, streak_days, longest_streak, last_active_at)
  values (mid, b12, coalesce(d_ct, d_de), m_men1, m_bud1, 'on_track', 35, 29, 34, now() - interval '2 hours')
  on conflict do nothing;

  -- CI253: Nandimandalam Akanksha Sree
  insert into public.members (full_name, email, role, title, employee_id, status)
  values ('Nandimandalam Akanksha Sree', 'NandimandalamAkanksha.Sree@agilisium.com', 'trainee', 'CT Trainee', 'CI253', 'active')
  on conflict (lower(employee_id)) do update set full_name = excluded.full_name, email = excluded.email
  returning id into mid;

  insert into public.trainees (member_id, batch_id, domain_id, mentor_member_id, buddy_member_id, status, learning_hours, streak_days, longest_streak, last_active_at)
  values (mid, b12, coalesce(d_ct, d_de), m_men2, m_bud2, 'on_track', 36, 30, 35, now() - interval '3 hours')
  on conflict do nothing;

  -- CI265: Nithish Balaji
  insert into public.members (full_name, email, role, title, employee_id, status)
  values ('Nithish Balaji', 'Nithish.Balaji@agilisium.com', 'trainee', 'CT Trainee', 'CI265', 'active')
  on conflict (lower(employee_id)) do update set full_name = excluded.full_name, email = excluded.email
  returning id into mid;

  insert into public.trainees (member_id, batch_id, domain_id, mentor_member_id, buddy_member_id, status, learning_hours, streak_days, longest_streak, last_active_at)
  values (mid, b12, coalesce(d_ct, d_de), m_men1, m_bud1, 'on_track', 35, 29, 34, now() - interval '4 hours')
  on conflict do nothing;

  -- CI251: PentelaAjay Kumar
  insert into public.members (full_name, email, role, title, employee_id, status)
  values ('PentelaAjay Kumar', 'PentelaAjay.Kumar@agilisium.com', 'trainee', 'CT Trainee', 'CI251', 'active')
  on conflict (lower(employee_id)) do update set full_name = excluded.full_name, email = excluded.email
  returning id into mid;

  insert into public.trainees (member_id, batch_id, domain_id, mentor_member_id, buddy_member_id, status, learning_hours, streak_days, longest_streak, last_active_at)
  values (mid, b12, coalesce(d_ct, d_de), m_men2, m_bud2, 'on_track', 35, 29, 34, now() - interval '5 hours')
  on conflict do nothing;

  -- CI270: Priyatharshini kannan
  insert into public.members (full_name, email, role, title, employee_id, status)
  values ('Priyatharshini kannan', 'Priyatharshini.kannan@aglisium.com', 'trainee', 'CT Trainee', 'CI270', 'active')
  on conflict (lower(employee_id)) do update set full_name = excluded.full_name, email = excluded.email
  returning id into mid;

  insert into public.trainees (member_id, batch_id, domain_id, mentor_member_id, buddy_member_id, status, learning_hours, streak_days, longest_streak, last_active_at)
  values (mid, b12, coalesce(d_ct, d_de), m_men1, m_bud1, 'on_track', 36, 30, 35, now() - interval '6 hours')
  on conflict do nothing;

  -- CI278: SANJAY
  insert into public.members (full_name, email, role, title, employee_id, status)
  values ('SANJAY', 'sanjay@agilisium.com', 'trainee', 'CT Trainee', 'CI278', 'active')
  on conflict (lower(employee_id)) do update set full_name = excluded.full_name, email = excluded.email
  returning id into mid;

  insert into public.trainees (member_id, batch_id, domain_id, mentor_member_id, buddy_member_id, status, learning_hours, streak_days, longest_streak, last_active_at)
  values (mid, b12, coalesce(d_ct, d_de), m_men2, m_bud2, 'on_track', 36, 30, 35, now() - interval '7 hours')
  on conflict do nothing;

  -- CI256: SandhiyaSri Dhandapani
  insert into public.members (full_name, email, role, title, employee_id, status)
  values ('SandhiyaSri Dhandapani', 'SandhiyaSri.Dhandapani@agilisium.com', 'trainee', 'CT Trainee', 'CI256', 'active')
  on conflict (lower(employee_id)) do update set full_name = excluded.full_name, email = excluded.email
  returning id into mid;

  insert into public.trainees (member_id, batch_id, domain_id, mentor_member_id, buddy_member_id, status, learning_hours, streak_days, longest_streak, last_active_at)
  values (mid, b12, coalesce(d_ct, d_de), m_men1, m_bud1, 'on_track', 36, 30, 35, now() - interval '8 hours')
  on conflict do nothing;

  -- CI266: Shandrakala Nagendran
  insert into public.members (full_name, email, role, title, employee_id, status)
  values ('Shandrakala Nagendran', 'Shandrakala.Nagendran@agilisium.com', 'trainee', 'DE Trainee', 'CI266', 'active')
  on conflict (lower(employee_id)) do update set full_name = excluded.full_name, email = excluded.email
  returning id into mid;

  insert into public.trainees (member_id, batch_id, domain_id, mentor_member_id, buddy_member_id, status, learning_hours, streak_days, longest_streak, last_active_at)
  values (mid, b12, coalesce(d_de, d_de), m_men2, m_bud2, 'on_track', 36, 30, 35, now() - interval '9 hours')
  on conflict do nothing;

  -- CI260: Sivakumar NandaKumar
  insert into public.members (full_name, email, role, title, employee_id, status)
  values ('Sivakumar NandaKumar', 'Sivakumar.NandaKumar@agilisium.com', 'trainee', 'DCG Trainee', 'CI260', 'active')
  on conflict (lower(employee_id)) do update set full_name = excluded.full_name, email = excluded.email
  returning id into mid;

  insert into public.trainees (member_id, batch_id, domain_id, mentor_member_id, buddy_member_id, status, learning_hours, streak_days, longest_streak, last_active_at)
  values (mid, b12, coalesce(d_dcg, d_de), m_men1, m_bud1, 'on_track', 35, 29, 34, now() - interval '10 hours')
  on conflict do nothing;

  -- CI262: Srinithi Santhoshkumar
  insert into public.members (full_name, email, role, title, employee_id, status)
  values ('Srinithi Santhoshkumar', 'Srinithi.Santhoshkumar@agilisium.com', 'trainee', 'DE Trainee', 'CI262', 'active')
  on conflict (lower(employee_id)) do update set full_name = excluded.full_name, email = excluded.email
  returning id into mid;

  insert into public.trainees (member_id, batch_id, domain_id, mentor_member_id, buddy_member_id, status, learning_hours, streak_days, longest_streak, last_active_at)
  values (mid, b12, coalesce(d_de, d_de), m_men2, m_bud2, 'on_track', 36, 30, 35, now() - interval '11 hours')
  on conflict do nothing;

  -- CI272: Bhuvana
  insert into public.members (full_name, email, role, title, employee_id, status)
  values ('Bhuvana', 'bhuvana@agilisium.com', 'trainee', 'DE Trainee', 'CI272', 'active')
  on conflict (lower(employee_id)) do update set full_name = excluded.full_name, email = excluded.email
  returning id into mid;

  insert into public.trainees (member_id, batch_id, domain_id, mentor_member_id, buddy_member_id, status, learning_hours, streak_days, longest_streak, last_active_at)
  values (mid, b12, coalesce(d_de, d_de), m_men1, m_bud1, 'on_track', 31, 26, 31, now() - interval '0 hours')
  on conflict do nothing;

  -- CI273: Shiva Prashanth
  insert into public.members (full_name, email, role, title, employee_id, status)
  values ('Shiva Prashanth', 'shivaprashanth@agilisium.com', 'trainee', 'DE Trainee', 'CI273', 'active')
  on conflict (lower(employee_id)) do update set full_name = excluded.full_name, email = excluded.email
  returning id into mid;

  insert into public.trainees (member_id, batch_id, domain_id, mentor_member_id, buddy_member_id, status, learning_hours, streak_days, longest_streak, last_active_at)
  values (mid, b12, coalesce(d_de, d_de), m_men2, m_bud2, 'on_track', 31, 26, 31, now() - interval '1 hours')
  on conflict do nothing;

  -- CI274: Yavvna Lakshmi
  insert into public.members (full_name, email, role, title, employee_id, status)
  values ('Yavvna Lakshmi', 'yavvnalakshmi@agilisium.com', 'trainee', 'DE Trainee', 'CI274', 'active')
  on conflict (lower(employee_id)) do update set full_name = excluded.full_name, email = excluded.email
  returning id into mid;

  insert into public.trainees (member_id, batch_id, domain_id, mentor_member_id, buddy_member_id, status, learning_hours, streak_days, longest_streak, last_active_at)
  values (mid, b12, coalesce(d_de, d_de), m_men1, m_bud1, 'on_track', 31, 26, 31, now() - interval '2 hours')
  on conflict do nothing;

end $$;
