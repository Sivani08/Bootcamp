do $$
declare
  bc uuid; b12 uuid; b08 uuid;
  d_de uuid; d_ct uuid; d_an uuid; d_de8 uuid;
  m_admin uuid; m_men1 uuid; m_men2 uuid; m_bud1 uuid; m_bud2 uuid;
  mid uuid; tid uuid; cid uuid; qid uuid;
  names text[] := array['Ananya Rao','Rahul Menon','Sneha Iyer','Priya Nambiar','Kabir Malhotra','Aditya Verma','Fatima Sheikh','Rohan Das'];
  emails text[] := array['ananya.rao','rahul.menon','sneha.iyer','priya.nambiar','kabir.malhotra','aditya.verma','fatima.sheikh','rohan.das'];
  i int; j int; k int; frac numeric; dom uuid; bat uuid;
  course_titles text[]; ct text; mrec record; trec record; qrec record; prec record;
begin
  insert into public.bootcamps (name, description, starts_on, ends_on)
  values ('BootMind Corporate Bootcamp 2026','Enterprise upskilling program across engineering and clinical technology tracks','2026-06-01','2026-11-30')
  returning id into bc;

  insert into public.batches (bootcamp_id,name,starts_on,ends_on) values (bc,'Batch 12','2026-06-01','2026-09-30') returning id into b12;
  insert into public.batches (bootcamp_id,name,starts_on,ends_on) values (bc,'DE Batch 8','2026-07-01','2026-10-31') returning id into b08;

  insert into public.domains (batch_id,name,color) values (b12,'Data Engineering','indigo') returning id into d_de;
  insert into public.domains (batch_id,name,color) values (b12,'Clinical Technology','emerald') returning id into d_ct;
  insert into public.domains (batch_id,name,color) values (b12,'Analytics','amber') returning id into d_an;
  insert into public.domains (batch_id,name,color) values (b08,'Data Engineering','indigo') returning id into d_de8;

  insert into public.members (full_name,email,role,title) values ('Priya Sharma','admin@bootmind.io','admin','Program Manager') returning id into m_admin;
  insert into public.members (full_name,email,role,title) values ('Meera Krishnan','meera.krishnan@bootmind.io','mentor','Principal Data Engineer') returning id into m_men1;
  insert into public.members (full_name,email,role,title) values ('Arun Prasad','arun.prasad@bootmind.io','mentor','Clinical Systems Architect') returning id into m_men2;
  insert into public.members (full_name,email,role,title) values ('Nikhil Shah','nikhil.shah@bootmind.io','buddy','Senior Analyst') returning id into m_bud1;
  insert into public.members (full_name,email,role,title) values ('Divya Menon','divya.menon@bootmind.io','buddy','Data Engineer II') returning id into m_bud2;

  -- courses
  course_titles := array['Python','SQL','Advanced SQL','PySpark','Spark SQL','Delta Lake','Databricks','Azure'];
  for i in 1..array_length(course_titles,1) loop
    insert into public.courses (domain_id,title,description,order_index,estimated_hours)
    values (d_de, course_titles[i], course_titles[i]||' fundamentals and applied practice for data engineering.', i, 6+i)
    returning id into cid;
    for j in 1..5 loop
      insert into public.modules (course_id,title,kind,content,duration_min,order_index)
      values (cid, course_titles[i]||' — Module '||j||': '||(array['Foundations','Core Concepts','Hands-on Lab','Applied Patterns','Assessment Prep'])[j],
        (array['video','document','coding','video','notes'])[j],
        'Structured lesson covering '||course_titles[i]||' '||(array['foundations','core concepts','hands-on lab work','applied production patterns','assessment preparation'])[j]||'.',
        20+j*5, j);
    end loop;
  end loop;

  course_titles := array['Healthcare Data Standards','Clinical Trials Analytics','Regulatory & Compliance'];
  for i in 1..3 loop
    insert into public.courses (domain_id,title,description,order_index,estimated_hours)
    values (d_ct, course_titles[i], course_titles[i]||' for clinical technology teams.', i, 8)
    returning id into cid;
    for j in 1..5 loop
      insert into public.modules (course_id,title,kind,content,duration_min,order_index)
      values (cid, course_titles[i]||' — Module '||j, (array['video','document','notes','video','document'])[j],
        'Lesson '||j||' of '||course_titles[i]||'.', 25, j);
    end loop;
  end loop;

  course_titles := array['Excel & Statistics','Power BI','Predictive Analytics'];
  for i in 1..3 loop
    insert into public.courses (domain_id,title,description,order_index,estimated_hours)
    values (d_an, course_titles[i], course_titles[i]||' for the analytics track.', i, 7)
    returning id into cid;
    for j in 1..5 loop
      insert into public.modules (course_id,title,kind,content,duration_min,order_index)
      values (cid, course_titles[i]||' — Module '||j, (array['video','document','coding','video','notes'])[j],
        'Lesson '||j||' of '||course_titles[i]||'.', 25, j);
    end loop;
  end loop;

  course_titles := array['Python','SQL','PySpark'];
  for i in 1..3 loop
    insert into public.courses (domain_id,title,description,order_index,estimated_hours)
    values (d_de8, course_titles[i], course_titles[i]||' for DE Batch 8.', i, 7)
    returning id into cid;
    for j in 1..5 loop
      insert into public.modules (course_id,title,kind,content,duration_min,order_index)
      values (cid, course_titles[i]||' — Module '||j, (array['video','document','coding','video','notes'])[j],
        'Lesson '||j||' of '||course_titles[i]||'.', 25, j);
    end loop;
  end loop;

  -- quizzes: one per course
  for mrec in select c.id, c.title, c.domain_id from public.courses c loop
    insert into public.quizzes (title, course_id, domain_id, topic, duration_min, due_at)
    values (mrec.title||' Assessment', mrec.id, mrec.domain_id, mrec.title, 15, now() + interval '7 days')
    returning id into qid;
    insert into public.quiz_questions (quiz_id,prompt,options,correct_index,marks,topic,order_index) values
      (qid, 'Which statement best describes a core concept of '||mrec.title||'?',
        '["It is only used for reporting","It provides a structured way to process and model data","It replaces version control","It is a hardware specification"]'::jsonb, 1, 1, mrec.title, 1),
      (qid, 'In '||mrec.title||', which practice most improves performance at scale?',
        '["Avoiding all indexes and partitions","Loading everything into memory once","Partitioning and pushing filters close to the source","Disabling logging"]'::jsonb, 2, 1, mrec.title, 2),
      (qid, 'What is the most reliable way to validate work in '||mrec.title||'?',
        '["Manual spot checks only","Automated tests and reproducible runs","Trusting defaults","Skipping validation"]'::jsonb, 1, 1, mrec.title, 3);
  end loop;

  -- coding problems
  insert into public.coding_problems (domain_id,title,difficulty,topic,prompt,starter_code,expected_output) values
    (d_de,'Word Count','easy','Python','Return the number of words in a sentence.','def solve(s):\n    # return the word count\n    return 0','5'),
    (d_de,'Deduplicate Records','easy','Python','Remove duplicate ids from a list while preserving order.','def solve(ids):\n    return ids','[1, 2, 3]'),
    (d_de,'Second Highest Salary','medium','SQL','Write logic returning the second highest salary from a list.','def solve(salaries):\n    return None','82000'),
    (d_de,'Running Total (Window Function)','medium','Window Functions','Compute a running total over an ordered list.','def solve(values):\n    return []','[10, 30, 60]'),
    (d_de,'Broadcast Join Optimizer','hard','Spark Joins','Decide when a broadcast join is safe given table sizes (MB).','def solve(left_mb, right_mb):\n    return False','True'),
    (d_an,'Moving Average','easy','Statistics','Compute a 3-point moving average.','def solve(values):\n    return []','[2.0, 3.0]');

  -- tasks + assignments
  insert into public.tasks (title,description,kind,domain_id,batch_id,priority,submission_type,due_at,course_id)
  select 'PySpark RDD Transformations','Implement map, filter and reduceByKey transformations on the sample dataset and record your observations.','task',d_de,b12,'high','text',now()+interval '2 days', c.id from public.courses c where c.domain_id=d_de and c.title='PySpark';
  insert into public.tasks (title,description,kind,domain_id,batch_id,priority,submission_type,due_at,course_id)
  select 'Word Count Pipeline Assignment','Build an end-to-end word count pipeline and submit your repository link plus a short design note.','assignment',d_de,b12,'high','link',now()+interval '4 days', c.id from public.courses c where c.domain_id=d_de and c.title='PySpark';
  insert into public.tasks (title,description,kind,domain_id,batch_id,priority,submission_type,due_at,course_id)
  select 'Window Functions Practice Set','Solve 5 window-function problems covering RANK, LAG and running totals.','task',d_de,b12,'medium','text',now()+interval '3 days', c.id from public.courses c where c.domain_id=d_de and c.title='Advanced SQL';
  insert into public.tasks (title,description,kind,domain_id,batch_id,priority,submission_type,due_at,course_id)
  select 'Query Optimization Report','Profile three slow queries and document your optimisation approach.','assignment',d_de,b12,'medium','text',now()+interval '6 days', c.id from public.courses c where c.domain_id=d_de and c.title='SQL';
  insert into public.tasks (title,description,kind,domain_id,batch_id,priority,submission_type,due_at,course_id)
  select 'Delta Lake Time Travel Lab','Create a Delta table, run updates and demonstrate time travel queries.','task',d_de,b12,'low','text',now()+interval '9 days', c.id from public.courses c where c.domain_id=d_de and c.title='Delta Lake';
  insert into public.tasks (title,description,kind,domain_id,batch_id,priority,submission_type,due_at,course_id)
  select 'HL7 / FHIR Mapping Exercise','Map a sample patient record from HL7 v2 to FHIR resources.','task',d_ct,b12,'high','text',now()+interval '3 days', c.id from public.courses c where c.domain_id=d_ct and c.title='Healthcare Data Standards';
  insert into public.tasks (title,description,kind,domain_id,batch_id,priority,submission_type,due_at,course_id)
  select 'Clinical Trial Dashboard','Build a dashboard summarising enrolment and adverse events.','assignment',d_ct,b12,'medium','link',now()+interval '7 days', c.id from public.courses c where c.domain_id=d_ct and c.title='Clinical Trials Analytics';
  insert into public.tasks (title,description,kind,domain_id,batch_id,priority,submission_type,due_at,course_id)
  select 'Power BI KPI Report','Create a KPI report with drill-through on the sample sales dataset.','assignment',d_an,b12,'medium','link',now()+interval '5 days', c.id from public.courses c where c.domain_id=d_an and c.title='Power BI';
  insert into public.tasks (title,description,kind,domain_id,batch_id,priority,submission_type,due_at,course_id)
  select 'Descriptive Statistics Worksheet','Complete the worksheet on distributions, variance and outliers.','task',d_an,b12,'low','text',now()+interval '8 days', c.id from public.courses c where c.domain_id=d_an and c.title='Excel & Statistics';
  insert into public.tasks (title,description,kind,domain_id,batch_id,priority,submission_type,due_at,course_id)
  select 'Python Data Structures Drill','Complete the drill on lists, dicts and comprehensions.','task',d_de8,b08,'medium','text',now()+interval '2 days', c.id from public.courses c where c.domain_id=d_de8 and c.title='Python';

  -- trainees
  for i in 1..8 loop
    if i in (1,2,5) then dom := d_de; bat := b12;
    elsif i in (3,7) then dom := d_ct; bat := b12;
    elsif i in (4,8) then dom := d_an; bat := b12;
    else dom := d_de8; bat := b08; end if;

    insert into public.members (full_name,email,role,title)
    values (names[i], emails[i]||'@bootmind.io','trainee','Trainee') returning id into mid;

    frac := (array[0.78,0.52,0.66,0.41,0.88,0.34,0.72,0.59])[i];

    insert into public.trainees (member_id,batch_id,domain_id,mentor_member_id,buddy_member_id,status,status_reason,learning_hours,streak_days,longest_streak,last_active_at)
    values (mid, bat, dom,
      case when dom in (d_de,d_de8) then m_men1 else m_men2 end,
      case when i % 2 = 0 then m_bud1 else m_bud2 end,
      case when frac >= 0.65 then 'on_track'::public.trainee_status when frac >= 0.45 then 'at_risk'::public.trainee_status else 'behind'::public.trainee_status end,
      null, round((frac*30)::numeric,1),
      (array[12,4,8,2,15,1,9,6])[i], (array[18,9,11,5,21,4,14,10])[i],
      now() - (i || ' hours')::interval)
    returning id into tid;

    -- module progress proportional to frac
    for mrec in select m.id from public.modules m join public.courses c on c.id=m.course_id where c.domain_id=dom order by c.order_index, m.order_index loop
      k := coalesce(k,0);
    end loop;

    insert into public.module_progress (trainee_id, module_id, status, minutes, completed_at)
    select tid, x.id, 'completed', 20 + (row_number() over ())::int % 25, now() - ((row_number() over ()) || ' days')::interval
    from (
      select m.id, row_number() over (order by c.order_index, m.order_index) rn, count(*) over () total
      from public.modules m join public.courses c on c.id=m.course_id where c.domain_id=dom
    ) x where x.rn <= floor(x.total * frac);

    -- quiz attempts
    for qrec in select q.id from public.quizzes q join public.courses c on c.id=q.course_id where c.domain_id=dom order by c.order_index limit greatest(2, (frac*6)::int) loop
      insert into public.quiz_attempts (quiz_id,trainee_id,score,total,created_at)
      values (qrec.id, tid, greatest(1, round(3*frac)), 3, now() - ((random()*14)::int || ' days')::interval);
    end loop;

    -- coding attempts
    for prec in select p.id from public.coding_problems p limit 5 loop
      insert into public.coding_attempts (problem_id,trainee_id,code,passed,output,created_at)
      values (prec.id, tid, '# attempt', random() < frac, 'ok', now() - ((random()*12)::int || ' days')::interval);
    end loop;

    -- task submissions
    for prec in select t.id from public.tasks t where t.domain_id = dom loop
      if random() < frac then
        insert into public.task_submissions (task_id,trainee_id,status,content,submitted_at,score)
        values (prec.id, tid, 'completed','Submitted work and notes.', now() - ((random()*10)::int || ' days')::interval, round(60+40*frac))
        on conflict do nothing;
      elsif random() < 0.5 then
        insert into public.task_submissions (task_id,trainee_id,status,content)
        values (prec.id, tid, 'in_progress','Working on it.') on conflict do nothing;
      end if;
    end loop;

    -- activity logs (last 14 days)
    insert into public.activity_logs (trainee_id,type,description,minutes,created_at)
    select tid,
      (array['module','quiz','coding','task','login'])[1+(g%5)],
      (array['Completed a learning module','Attempted a quiz','Submitted a coding attempt','Worked on an assigned task','Signed in to BootMind'])[1+(g%5)],
      (array[35,18,25,40,2])[1+(g%5)],
      now() - (g || ' days')::interval - ((g*3) || ' hours')::interval
    from generate_series(0,13) g where random() < frac + 0.2;

    -- meetings
    insert into public.meetings (trainee_id,with_member_id,kind,requested_for,reason,message,status)
    select tid, t.mentor_member_id,'mentor', now() - interval '6 days','Doubt clearing','Need help with Spark joins.','completed' from public.trainees t where t.id=tid;
    insert into public.meetings (trainee_id,with_member_id,kind,requested_for,reason,message,status)
    select tid, t.buddy_member_id,'buddy', now() + interval '2 days','Weekly check-in','Would like to review my progress.','requested' from public.trainees t where t.id=tid;

    -- feedback
    insert into public.feedback (trainee_id,from_member_id,kind,category,rating,comments)
    select tid, t.mentor_member_id,'mentor','Technical Skills', greatest(2, round(5*frac)::int), 'Solid grasp of fundamentals; keep practising the weaker topics.' from public.trainees t where t.id=tid;
    insert into public.feedback (trainee_id,from_member_id,kind,category,rating,comments)
    select tid, t.buddy_member_id,'buddy','Learning Consistency', greatest(2, round(5*frac)::int), 'Consistent daily activity this week.' from public.trainees t where t.id=tid;
  end loop;

  -- ideas
  insert into public.ideas (trainee_id,title,category,description,status)
  select t.id,'Pair-programming Fridays','Training Suggestion','Set aside Friday afternoons for structured pair programming between trainees and buddies.','under_review'
  from public.trainees t limit 1;
  insert into public.ideas (trainee_id,title,category,description,status,admin_response)
  select t.id,'Internal data quality tool','Project Idea','Build a lightweight data-quality checker that runs on every pipeline run.','accepted','Great idea — scheduled for the capstone phase.'
  from public.trainees t offset 1 limit 1;
  insert into public.ideas (trainee_id,title,category,description,status)
  select t.id,'More real-world datasets','Bootcamp Feedback','The labs would land better with messier, real-world datasets.','new'
  from public.trainees t offset 2 limit 1;
end $$;

-- claim a demo seat for a newly registered user
create or replace function public.claim_demo_seat(_role public.app_role, _full_name text)
returns uuid language plpgsql security definer set search_path = public as $$
declare _mid uuid; _uid uuid := auth.uid();
begin
  if _uid is null then raise exception 'Not authenticated'; end if;

  select id into _mid from public.members where user_id = _uid;
  if _mid is not null then
    insert into public.user_roles (user_id, role)
    select _uid, m.role from public.members m where m.id = _mid
    on conflict do nothing;
    return _mid;
  end if;

  select id into _mid from public.members
  where role = _role and user_id is null
  order by created_at limit 1;

  if _mid is null then
    insert into public.members (user_id, full_name, email, role, title)
    values (_uid, coalesce(nullif(_full_name,''),'New '||_role::text), coalesce((select email from auth.users where id=_uid), _uid::text||'@bootmind.io'), _role, initcap(_role::text))
    returning id into _mid;
  else
    update public.members set user_id = _uid where id = _mid;
  end if;

  insert into public.user_roles (user_id, role) values (_uid, _role) on conflict do nothing;
  return _mid;
end $$;