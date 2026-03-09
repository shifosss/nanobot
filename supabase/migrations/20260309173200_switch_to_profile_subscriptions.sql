create or replace function public.current_profile_condition_tags(profile_id uuid)
returns text[]
language sql
stable
security definer
set search_path = public
as $$
  with active_plan as (
    select lower(p.name) as plan_name
    from public.profile_subscriptions s
    join public.plans p
      on p.id = s.plan_id
    where s.profile_id = $1
      and s.status = 'active'
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

alter table public.profile_subscriptions enable row level security;

create policy profile_subscriptions_select_own
  on public.profile_subscriptions
  for select
  to authenticated
  using (public.owns_profile(profile_id));

create policy profile_subscriptions_insert_own
  on public.profile_subscriptions
  for insert
  to authenticated
  with check (public.owns_profile(profile_id));

create policy profile_subscriptions_update_own
  on public.profile_subscriptions
  for update
  to authenticated
  using (public.owns_profile(profile_id))
  with check (public.owns_profile(profile_id));

drop view if exists public.current_account_subscription;

create view public.current_profile_subscription
with (security_invoker = true)
as
select
  s.id,
  s.profile_id,
  pr.account_id,
  pr.display_name as profile_display_name,
  s.plan_id,
  p.name as plan_name,
  s.next_plan_id,
  np.name as next_plan_name,
  s.status,
  s.started_at,
  s.current_period_end,
  s.cancelled_at,
  s.created_at
from public.profile_subscriptions s
join public.profiles pr
  on pr.id = s.profile_id
join public.plans p
  on p.id = s.plan_id
left join public.plans np
  on np.id = s.next_plan_id;

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
  from public.profile_subscriptions s
  where s.profile_id = p_profile_id
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
