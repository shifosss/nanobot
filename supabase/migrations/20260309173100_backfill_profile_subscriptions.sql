insert into public.profile_subscriptions (
  profile_id,
  plan_id,
  next_plan_id,
  status,
  started_at,
  current_period_end,
  cancelled_at,
  created_at
)
select
  p.id,
  s.plan_id,
  s.next_plan_id,
  s.status,
  s.started_at,
  s.current_period_end,
  s.cancelled_at,
  s.created_at
from public.account_subscriptions s
join public.profiles p
  on p.account_id = s.account_id;
