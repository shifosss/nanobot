create table public.profile_subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  plan_id uuid not null references public.plans (id),
  next_plan_id uuid references public.plans (id),
  status text not null check (status in ('active', 'cancelled', 'expired', 'pending')),
  started_at timestamptz not null,
  current_period_end timestamptz not null,
  cancelled_at timestamptz,
  created_at timestamptz not null default now()
);

create index profile_subscriptions_profile_id_idx
  on public.profile_subscriptions (profile_id);
create index profile_subscriptions_plan_id_idx
  on public.profile_subscriptions (plan_id);
create index profile_subscriptions_next_plan_id_idx
  on public.profile_subscriptions (next_plan_id);
create unique index profile_subscriptions_one_active_per_profile_idx
  on public.profile_subscriptions (profile_id)
  where status = 'active';
