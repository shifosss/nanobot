create or replace function public.is_current_account(account_id uuid)
returns boolean
language sql
stable
as $$
  select (select auth.uid()) = account_id;
$$;

create or replace function public.owns_profile(profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = profile_id
      and p.account_id = (select auth.uid())
  );
$$;

create or replace function public.current_profile_condition_tags(profile_id uuid)
returns text[]
language sql
stable
security definer
set search_path = public
as $$
  with active_plan as (
    select lower(p.name) as plan_name
    from public.profiles pr
    join public.account_subscriptions s
      on s.account_id = pr.account_id
     and s.status = 'active'
    join public.plans p
      on p.id = s.plan_id
    where pr.id = profile_id
    limit 1
  )
  select coalesce(
    array_remove(
      array[
        case when plan_name like '%diabetes%' then 'diabetes' end,
        case when plan_name like '%elderly%' then 'elderly' end,
        case when plan_name like '%pregnancy%' then 'pregnancy' end,
        case when plan_name like '%child%' then 'child' end,
        case when plan_name like '%women%' then 'women' end
      ],
      null
    ),
    array[]::text[]
  )
  from active_plan;
$$;

create or replace function public.owns_storage_profile_path(object_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = public, storage
as $$
declare
  folder_parts text[];
  folder_profile_id uuid;
begin
  folder_parts := storage.foldername(object_name);

  if coalesce(array_length(folder_parts, 1), 0) = 0 then
    return false;
  end if;

  begin
    folder_profile_id := folder_parts[1]::uuid;
  exception
    when others then
      return false;
  end;

  return public.owns_profile(folder_profile_id);
end;
$$;

alter table public.accounts enable row level security;
alter table public.profiles enable row level security;
alter table public.plans enable row level security;
alter table public.account_subscriptions enable row level security;
alter table public.device_types enable row level security;
alter table public.plan_device_types enable row level security;
alter table public.devices enable row level security;
alter table public.insight_categories enable row level security;
alter table public.biomarkers enable row level security;
alter table public.plan_biomarkers enable row level security;
alter table public.biomarker_reference_ranges enable row level security;
alter table public.profile_reference_ranges enable row level security;
alter table public.biomarker_readings enable row level security;
alter table public.time_focus_rules enable row level security;
alter table public.biomarker_questions enable row level security;
alter table public.biomarker_dismissal_rules enable row level security;
alter table public.body_locations enable row level security;
alter table public.sensation_types enable row level security;
alter table public.suggested_reasons enable row level security;
alter table public.idfw_sessions enable row level security;
alter table public.idfw_physical_symptoms enable row level security;
alter table public.idfw_mental_symptoms enable row level security;
alter table public.idfw_reports enable row level security;
alter table public.export_requests enable row level security;
alter table public.suggested_actions enable row level security;

create policy accounts_select_own
  on public.accounts
  for select
  to authenticated
  using (public.is_current_account(id));

create policy accounts_update_own
  on public.accounts
  for update
  to authenticated
  using (public.is_current_account(id))
  with check (public.is_current_account(id));

create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using (public.is_current_account(account_id));

create policy profiles_insert_own
  on public.profiles
  for insert
  to authenticated
  with check (public.is_current_account(account_id));

create policy profiles_update_own
  on public.profiles
  for update
  to authenticated
  using (public.is_current_account(account_id))
  with check (public.is_current_account(account_id));

create policy profiles_delete_own
  on public.profiles
  for delete
  to authenticated
  using (public.is_current_account(account_id));

create policy plans_select_authenticated
  on public.plans
  for select
  to authenticated
  using (true);

create policy account_subscriptions_select_own
  on public.account_subscriptions
  for select
  to authenticated
  using (public.is_current_account(account_id));

create policy account_subscriptions_insert_own
  on public.account_subscriptions
  for insert
  to authenticated
  with check (public.is_current_account(account_id));

create policy account_subscriptions_update_own
  on public.account_subscriptions
  for update
  to authenticated
  using (public.is_current_account(account_id))
  with check (public.is_current_account(account_id));

create policy device_types_select_authenticated
  on public.device_types
  for select
  to authenticated
  using (true);

create policy plan_device_types_select_authenticated
  on public.plan_device_types
  for select
  to authenticated
  using (true);

create policy devices_select_owned
  on public.devices
  for select
  to authenticated
  using (profile_id is not null and public.owns_profile(profile_id));

create policy insight_categories_select_authenticated
  on public.insight_categories
  for select
  to authenticated
  using (true);

create policy biomarkers_select_authenticated
  on public.biomarkers
  for select
  to authenticated
  using (true);

create policy plan_biomarkers_select_authenticated
  on public.plan_biomarkers
  for select
  to authenticated
  using (true);

create policy biomarker_reference_ranges_select_authenticated
  on public.biomarker_reference_ranges
  for select
  to authenticated
  using (true);

create policy profile_reference_ranges_select_owned
  on public.profile_reference_ranges
  for select
  to authenticated
  using (public.owns_profile(profile_id));

create policy profile_reference_ranges_insert_owned
  on public.profile_reference_ranges
  for insert
  to authenticated
  with check (public.owns_profile(profile_id));

create policy profile_reference_ranges_update_owned
  on public.profile_reference_ranges
  for update
  to authenticated
  using (public.owns_profile(profile_id))
  with check (public.owns_profile(profile_id));

create policy biomarker_readings_select_owned
  on public.biomarker_readings
  for select
  to authenticated
  using (public.owns_profile(profile_id));

create policy biomarker_readings_insert_owned
  on public.biomarker_readings
  for insert
  to authenticated
  with check (
    public.owns_profile(profile_id)
    and exists (
      select 1
      from public.devices d
      where d.id = device_id
        and d.profile_id = biomarker_readings.profile_id
    )
  );

create policy time_focus_rules_select_authenticated
  on public.time_focus_rules
  for select
  to authenticated
  using (true);

create policy biomarker_questions_select_owned
  on public.biomarker_questions
  for select
  to authenticated
  using (public.owns_profile(profile_id));

create policy biomarker_questions_update_owned
  on public.biomarker_questions
  for update
  to authenticated
  using (public.owns_profile(profile_id))
  with check (public.owns_profile(profile_id));

create policy biomarker_dismissal_rules_select_owned
  on public.biomarker_dismissal_rules
  for select
  to authenticated
  using (public.owns_profile(profile_id));

create policy biomarker_dismissal_rules_update_owned
  on public.biomarker_dismissal_rules
  for update
  to authenticated
  using (public.owns_profile(profile_id))
  with check (public.owns_profile(profile_id));

create policy body_locations_select_authenticated
  on public.body_locations
  for select
  to authenticated
  using (true);

create policy sensation_types_select_authenticated
  on public.sensation_types
  for select
  to authenticated
  using (true);

create policy suggested_reasons_select_authenticated
  on public.suggested_reasons
  for select
  to authenticated
  using (true);

create policy idfw_sessions_select_owned
  on public.idfw_sessions
  for select
  to authenticated
  using (public.owns_profile(profile_id));

create policy idfw_physical_symptoms_select_owned
  on public.idfw_physical_symptoms
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.idfw_sessions s
      where s.id = session_id
        and public.owns_profile(s.profile_id)
    )
  );

create policy idfw_mental_symptoms_select_owned
  on public.idfw_mental_symptoms
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.idfw_sessions s
      where s.id = session_id
        and public.owns_profile(s.profile_id)
    )
  );

create policy idfw_reports_select_owned
  on public.idfw_reports
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.idfw_sessions s
      where s.id = session_id
        and public.owns_profile(s.profile_id)
    )
  );

create policy export_requests_select_owned
  on public.export_requests
  for select
  to authenticated
  using (public.owns_profile(profile_id));

create policy export_requests_insert_owned
  on public.export_requests
  for insert
  to authenticated
  with check (public.owns_profile(profile_id));

create policy export_requests_update_owned
  on public.export_requests
  for update
  to authenticated
  using (public.owns_profile(profile_id))
  with check (public.owns_profile(profile_id));

create policy suggested_actions_select_authenticated
  on public.suggested_actions
  for select
  to authenticated
  using (true);

create policy export_bucket_select_owned
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'exports'
    and public.owns_storage_profile_path(name)
  );

create policy export_bucket_insert_owned
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'exports'
    and public.owns_storage_profile_path(name)
  );

create policy export_bucket_update_owned
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'exports'
    and public.owns_storage_profile_path(name)
  )
  with check (
    bucket_id = 'exports'
    and public.owns_storage_profile_path(name)
  );

create policy export_bucket_delete_owned
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'exports'
    and public.owns_storage_profile_path(name)
  );

create view public.current_account_subscription
with (security_invoker = true)
as
select
  s.id,
  s.account_id,
  s.plan_id,
  p.name as plan_name,
  s.next_plan_id,
  np.name as next_plan_name,
  s.status,
  s.started_at,
  s.current_period_end,
  s.cancelled_at,
  s.created_at
from public.account_subscriptions s
join public.plans p
  on p.id = s.plan_id
left join public.plans np
  on np.id = s.next_plan_id;

create view public.profile_device_summary
with (security_invoker = true)
as
select
  d.id as device_id,
  d.profile_id,
  p.display_name as profile_display_name,
  d.device_code,
  d.device_type_id,
  dt.name as device_type_name,
  d.activated_at,
  d.firmware_version
from public.devices d
join public.device_types dt
  on dt.id = d.device_type_id
left join public.profiles p
  on p.id = d.profile_id;

create or replace function public.bind_device(p_device_code text, p_profile_id uuid)
returns public.devices
language plpgsql
security definer
set search_path = public
as $$
declare
  target_device public.devices;
  active_plan_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  if not public.owns_profile(p_profile_id) then
    raise exception 'Profile not found or not owned by current user.';
  end if;

  select d.*
  into target_device
  from public.devices d
  where d.device_code = p_device_code
  for update;

  if not found then
    raise exception 'Invalid device code.';
  end if;

  if target_device.profile_id is not null then
    raise exception 'Device has already been bound.';
  end if;

  select s.plan_id
  into active_plan_id
  from public.account_subscriptions s
  join public.profiles p
    on p.account_id = s.account_id
  where p.id = p_profile_id
    and s.status = 'active'
  order by s.started_at desc
  limit 1;

  if active_plan_id is null then
    raise exception 'An active subscription is required before binding a device.';
  end if;

  if not exists (
    select 1
    from public.plan_device_types pdt
    where pdt.plan_id = active_plan_id
      and pdt.device_type_id = target_device.device_type_id
  ) then
    raise exception 'The active plan does not support this device type.';
  end if;

  update public.devices
  set profile_id = p_profile_id,
      activated_at = now()
  where id = target_device.id
  returning * into target_device;

  return target_device;
end;
$$;

create or replace function public.create_idfw_session(
  p_profile_id uuid,
  p_physical_symptoms jsonb default '[]'::jsonb,
  p_mental_symptom jsonb default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  session_id uuid;
  symptom jsonb;
  has_physical boolean := coalesce(jsonb_array_length(coalesce(p_physical_symptoms, '[]'::jsonb)), 0) > 0;
  has_mental boolean := p_mental_symptom is not null and p_mental_symptom <> 'null'::jsonb;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  if not public.owns_profile(p_profile_id) then
    raise exception 'Profile not found or not owned by current user.';
  end if;

  if not has_physical and not has_mental then
    raise exception 'At least one physical or mental symptom is required.';
  end if;

  insert into public.idfw_sessions (profile_id, has_physical, has_mental)
  values (p_profile_id, has_physical, has_mental)
  returning id into session_id;

  for symptom in
    select value
    from jsonb_array_elements(coalesce(p_physical_symptoms, '[]'::jsonb))
  loop
    insert into public.idfw_physical_symptoms (
      session_id,
      body_location_id,
      sensation_type_id,
      intensity,
      selected_reason_id
    )
    values (
      session_id,
      (symptom ->> 'body_location_id')::smallint,
      (symptom ->> 'sensation_type_id')::smallint,
      (symptom ->> 'intensity')::smallint,
      nullif(symptom ->> 'selected_reason_id', '')::smallint
    );
  end loop;

  if has_mental then
    insert into public.idfw_mental_symptoms (
      session_id,
      stress_level,
      clarity_level,
      selected_reason_id
    )
    values (
      session_id,
      (p_mental_symptom ->> 'stress_level')::smallint,
      (p_mental_symptom ->> 'clarity_level')::smallint,
      nullif(p_mental_symptom ->> 'selected_reason_id', '')::smallint
    );
  end if;

  return session_id;
end;
$$;

create or replace function public.answer_biomarker_question(
  p_question_id uuid,
  p_is_normal_activity boolean,
  p_user_note text default null
)
returns public.biomarker_questions
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_question public.biomarker_questions;
  reading_time time;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  update public.biomarker_questions q
  set is_normal_activity = p_is_normal_activity,
      user_note = p_user_note,
      answered_at = now()
  where q.id = p_question_id
    and public.owns_profile(q.profile_id)
  returning * into updated_question;

  if not found then
    raise exception 'Question not found or not owned by current user.';
  end if;

  if p_is_normal_activity then
    select br.recorded_at::time
    into reading_time
    from public.biomarker_readings br
    where br.id = updated_question.reading_id;

    insert into public.biomarker_dismissal_rules (
      profile_id,
      biomarker_id,
      window_start,
      window_end,
      reason,
      source_question_id
    )
    values (
      updated_question.profile_id,
      updated_question.biomarker_id,
      (reading_time - interval '15 minutes')::time,
      (reading_time + interval '15 minutes')::time,
      p_user_note,
      updated_question.id
    )
    on conflict (source_question_id) do nothing;
  end if;

  return updated_question;
end;
$$;

create or replace function public.get_time_focus_biomarker(
  p_profile_id uuid,
  p_at_time timestamptz default now()
)
returns table (
  biomarker_id smallint,
  biomarker_code text,
  display_name text,
  unit text,
  biomarker_priority smallint,
  alert_level smallint,
  category_name text,
  rule_priority smallint,
  time_start time,
  time_end time,
  condition_tag text
)
language sql
stable
security definer
set search_path = public
as $$
  with profile_tags as (
    select public.current_profile_condition_tags(p_profile_id) as tags
  )
  select
    b.id as biomarker_id,
    b.code as biomarker_code,
    b.display_name,
    b.unit,
    b.priority as biomarker_priority,
    b.alert_level,
    ic.name as category_name,
    tfr.priority as rule_priority,
    tfr.time_start,
    tfr.time_end,
    tfr.condition_tag
  from public.time_focus_rules tfr
  join public.biomarkers b
    on b.id = tfr.biomarker_id
  join public.insight_categories ic
    on ic.id = b.category_id
  cross join profile_tags pt
  where public.owns_profile(p_profile_id)
    and (
      (tfr.time_start <= tfr.time_end and p_at_time::time between tfr.time_start and tfr.time_end)
      or (
        tfr.time_start > tfr.time_end
        and (p_at_time::time >= tfr.time_start or p_at_time::time <= tfr.time_end)
      )
    )
    and (
      tfr.condition_tag is null
      or tfr.condition_tag = any (pt.tags)
    )
  order by tfr.priority desc, b.priority asc, b.display_order asc
  limit 1;
$$;

insert into storage.buckets (id, name, public)
values ('exports', 'exports', false)
on conflict (id) do nothing;

do $$
begin
  alter publication supabase_realtime add table public.biomarker_readings;
exception
  when duplicate_object then
    null;
end;
$$;

revoke all on function public.set_updated_at() from public;
revoke all on function public.enforce_individual_profile_limit() from public;
revoke all on function public.handle_new_auth_user() from public;
revoke all on function public.prevent_device_reassignment() from public;
revoke all on function public.validate_biomarker_question_reading() from public;
