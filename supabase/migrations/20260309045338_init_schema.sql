create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.accounts (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  password_hash text not null default 'managed_by_supabase_auth',
  account_type text not null check (account_type in ('individual', 'parent')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  display_name text not null,
  date_of_birth date not null,
  biological_sex text not null check (biological_sex in ('male', 'female')),
  height_cm numeric(5,1),
  weight_kg numeric(5,1),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_account_id_idx on public.profiles (account_id);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  price_cents_monthly integer not null check (price_cents_monthly >= 0),
  is_active boolean not null default true
);

create table public.account_subscriptions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  plan_id uuid not null references public.plans (id),
  next_plan_id uuid references public.plans (id),
  status text not null check (status in ('active', 'cancelled', 'expired', 'pending')),
  started_at timestamptz not null,
  current_period_end timestamptz not null,
  cancelled_at timestamptz,
  created_at timestamptz not null default now()
);

create index account_subscriptions_account_id_idx
  on public.account_subscriptions (account_id);
create index account_subscriptions_plan_id_idx
  on public.account_subscriptions (plan_id);
create index account_subscriptions_next_plan_id_idx
  on public.account_subscriptions (next_plan_id);
create unique index account_subscriptions_one_active_per_account_idx
  on public.account_subscriptions (account_id)
  where status = 'active';

create table public.device_types (
  id smallint generated always as identity primary key,
  name text not null unique,
  description text
);

create table public.plan_device_types (
  plan_id uuid not null references public.plans (id) on delete cascade,
  device_type_id smallint not null references public.device_types (id),
  primary key (plan_id, device_type_id)
);

create index plan_device_types_device_type_id_idx
  on public.plan_device_types (device_type_id);

create table public.devices (
  id uuid primary key default gen_random_uuid(),
  device_code text not null unique,
  device_type_id smallint not null references public.device_types (id),
  profile_id uuid references public.profiles (id) on delete cascade,
  activated_at timestamptz not null default now(),
  firmware_version text
);

comment on column public.devices.profile_id is
  'Nullable until the device is bound for the first time; once bound it must never be reassigned.';

create index devices_profile_id_idx on public.devices (profile_id);
create index devices_device_type_id_idx on public.devices (device_type_id);

create table public.insight_categories (
  id smallint generated always as identity primary key,
  name text not null unique,
  display_order smallint not null,
  icon text
);

create table public.biomarkers (
  id smallint generated always as identity primary key,
  category_id smallint not null references public.insight_categories (id),
  code text not null unique,
  display_name text not null,
  unit text not null,
  priority smallint not null check (priority between 1 and 3),
  alert_level smallint not null check (alert_level between 1 and 4),
  is_derived boolean not null default false,
  description text,
  display_order smallint not null default 0
);

create index biomarkers_category_id_idx on public.biomarkers (category_id);

create table public.plan_biomarkers (
  plan_id uuid not null references public.plans (id) on delete cascade,
  biomarker_id smallint not null references public.biomarkers (id),
  primary key (plan_id, biomarker_id)
);

create index plan_biomarkers_biomarker_id_idx
  on public.plan_biomarkers (biomarker_id);

create table public.biomarker_reference_ranges (
  id smallint generated always as identity primary key,
  biomarker_id smallint not null references public.biomarkers (id) on delete cascade,
  sex text not null check (sex in ('male', 'female', 'all')),
  context text not null default 'default',
  range_low numeric,
  range_high numeric,
  optimal_low numeric,
  optimal_high numeric
);

create index biomarker_reference_ranges_biomarker_id_idx
  on public.biomarker_reference_ranges (biomarker_id);
create unique index biomarker_reference_ranges_unique_idx
  on public.biomarker_reference_ranges (biomarker_id, sex, context);

create table public.profile_reference_ranges (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  biomarker_id smallint not null references public.biomarkers (id) on delete cascade,
  context text not null default 'default',
  range_low numeric,
  range_high numeric,
  sample_size integer not null check (sample_size > 0),
  effective_from timestamptz not null,
  created_at timestamptz not null default now(),
  unique (profile_id, biomarker_id, context)
);

create index profile_reference_ranges_profile_id_idx
  on public.profile_reference_ranges (profile_id);
create index profile_reference_ranges_biomarker_id_idx
  on public.profile_reference_ranges (biomarker_id);

create table public.biomarker_readings (
  id bigint generated always as identity primary key,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  biomarker_id smallint not null references public.biomarkers (id) on delete cascade,
  device_id uuid not null references public.devices (id) on delete cascade,
  value numeric not null,
  context text not null default 'default',
  recorded_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index biomarker_readings_profile_biomarker_recorded_at_idx
  on public.biomarker_readings (profile_id, biomarker_id, context, recorded_at desc);
create index biomarker_readings_profile_recorded_at_idx
  on public.biomarker_readings (profile_id, recorded_at desc);
create index biomarker_readings_device_id_idx
  on public.biomarker_readings (device_id);

create table public.time_focus_rules (
  id smallint generated always as identity primary key,
  biomarker_id smallint not null references public.biomarkers (id) on delete cascade,
  time_start time not null,
  time_end time not null,
  priority smallint not null,
  condition_tag text
);

create index time_focus_rules_lookup_idx
  on public.time_focus_rules (time_start, time_end, priority desc);
create index time_focus_rules_biomarker_id_idx
  on public.time_focus_rules (biomarker_id);

create table public.biomarker_questions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  biomarker_id smallint not null references public.biomarkers (id) on delete cascade,
  reading_id bigint not null references public.biomarker_readings (id) on delete cascade,
  is_normal_activity boolean,
  user_note text,
  answered_at timestamptz,
  created_at timestamptz not null default now()
);

create index biomarker_questions_profile_id_idx
  on public.biomarker_questions (profile_id);
create index biomarker_questions_reading_id_idx
  on public.biomarker_questions (reading_id);

create table public.biomarker_dismissal_rules (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  biomarker_id smallint not null references public.biomarkers (id) on delete cascade,
  window_start time not null,
  window_end time not null,
  reason text,
  source_question_id uuid not null references public.biomarker_questions (id) on delete cascade,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index biomarker_dismissal_rules_lookup_idx
  on public.biomarker_dismissal_rules (profile_id, biomarker_id, is_active, window_start, window_end);
create unique index biomarker_dismissal_rules_source_question_id_idx
  on public.biomarker_dismissal_rules (source_question_id);

create table public.body_locations (
  id smallint generated always as identity primary key,
  name text not null unique,
  display_order smallint not null
);

create table public.sensation_types (
  id smallint generated always as identity primary key,
  name text not null unique
);

create table public.suggested_reasons (
  id smallint generated always as identity primary key,
  name text not null,
  applies_to text not null check (applies_to in ('physical', 'mental')),
  body_location_id smallint references public.body_locations (id)
);

create index suggested_reasons_body_location_id_idx
  on public.suggested_reasons (body_location_id);

create table public.idfw_sessions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  has_physical boolean not null default false,
  has_mental boolean not null default false,
  created_at timestamptz not null default now(),
  check (has_physical or has_mental)
);

create index idfw_sessions_profile_id_idx on public.idfw_sessions (profile_id);

create table public.idfw_physical_symptoms (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.idfw_sessions (id) on delete cascade,
  body_location_id smallint not null references public.body_locations (id),
  sensation_type_id smallint not null references public.sensation_types (id),
  intensity smallint not null check (intensity between 1 and 10),
  selected_reason_id smallint references public.suggested_reasons (id),
  unique (session_id, body_location_id, sensation_type_id)
);

create index idfw_physical_symptoms_session_id_idx
  on public.idfw_physical_symptoms (session_id);

create table public.idfw_mental_symptoms (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.idfw_sessions (id) on delete cascade,
  stress_level smallint not null check (stress_level between 1 and 10),
  clarity_level smallint not null check (clarity_level between 1 and 10),
  selected_reason_id smallint references public.suggested_reasons (id)
);

create table public.idfw_reports (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.idfw_sessions (id) on delete cascade,
  result_summary text not null,
  matched_conditions jsonb not null default '[]'::jsonb,
  flagged_biomarkers jsonb not null default '[]'::jsonb,
  interpretation text not null,
  suggestions text not null,
  biomarker_snapshot_start timestamptz not null,
  biomarker_snapshot_end timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.export_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  requester_type text not null check (requester_type in ('user', 'licensed_professional')),
  formats text[] not null,
  date_range_start timestamptz,
  date_range_end timestamptz,
  status text not null check (status in ('pending', 'processing', 'completed', 'failed')),
  file_urls jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  check (coalesce(array_length(formats, 1), 0) > 0)
);

create index export_requests_profile_id_idx on public.export_requests (profile_id);

create table public.suggested_actions (
  id smallint generated always as identity primary key,
  biomarker_id smallint references public.biomarkers (id) on delete cascade,
  condition text not null,
  action_text text not null,
  priority smallint not null
);

create index suggested_actions_biomarker_id_idx
  on public.suggested_actions (biomarker_id);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_account_type text;
  resolved_email text;
begin
  requested_account_type :=
    case
      when new.raw_user_meta_data ->> 'account_type' in ('individual', 'parent')
        then new.raw_user_meta_data ->> 'account_type'
      else 'individual'
    end;

  resolved_email := coalesce(new.email, new.phone, new.id::text || '@auth.local');

  insert into public.accounts (id, email, account_type)
  values (new.id, resolved_email, requested_account_type)
  on conflict (id) do update
    set email = excluded.email,
        account_type = excluded.account_type,
        updated_at = now();

  return new;
end;
$$;

create or replace function public.enforce_individual_profile_limit()
returns trigger
language plpgsql
as $$
declare
  existing_profile_count integer;
  current_account_type text;
begin
  select account_type
  into current_account_type
  from public.accounts
  where id = new.account_id;

  if current_account_type is null then
    raise exception 'Account mirror missing for account_id %.', new.account_id;
  end if;

  if current_account_type = 'individual' then
    select count(*)
    into existing_profile_count
    from public.profiles
    where account_id = new.account_id
      and id <> coalesce(new.id, gen_random_uuid());

    if existing_profile_count >= 1 then
      raise exception 'Individual accounts may only have one profile.';
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.prevent_device_reassignment()
returns trigger
language plpgsql
as $$
begin
  if old.profile_id is not null and new.profile_id is distinct from old.profile_id then
    raise exception 'Bound devices cannot be reassigned.';
  end if;

  return new;
end;
$$;

create or replace function public.validate_biomarker_question_reading()
returns trigger
language plpgsql
as $$
declare
  reading_record public.biomarker_readings;
begin
  select *
  into reading_record
  from public.biomarker_readings
  where id = new.reading_id;

  if not found then
    raise exception 'Reading % not found.', new.reading_id;
  end if;

  if reading_record.profile_id <> new.profile_id then
    raise exception 'Question profile_id must match the referenced reading profile_id.';
  end if;

  if reading_record.biomarker_id <> new.biomarker_id then
    raise exception 'Question biomarker_id must match the referenced reading biomarker_id.';
  end if;

  return new;
end;
$$;

create trigger accounts_set_updated_at
before update on public.accounts
for each row
execute function public.set_updated_at();

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger profiles_enforce_individual_profile_limit
before insert or update on public.profiles
for each row
execute function public.enforce_individual_profile_limit();

create trigger devices_prevent_reassignment
before update on public.devices
for each row
execute function public.prevent_device_reassignment();

create trigger biomarker_questions_validate_reading
before insert or update on public.biomarker_questions
for each row
execute function public.validate_biomarker_question_reading();

create trigger on_auth_user_saved
after insert or update of email, phone, raw_user_meta_data on auth.users
for each row
execute function public.handle_new_auth_user();

insert into public.accounts (id, email, account_type)
select
  u.id,
  coalesce(u.email, u.phone, u.id::text || '@auth.local'),
  case
    when u.raw_user_meta_data ->> 'account_type' in ('individual', 'parent')
      then u.raw_user_meta_data ->> 'account_type'
    else 'individual'
  end
from auth.users u
on conflict (id) do update
  set email = excluded.email,
      account_type = excluded.account_type,
      updated_at = now();
