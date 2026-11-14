-- One score per user per market. One resolution per market.
-- Virtual-credit profit is credits_redeemed - credits_spent. It is not stored.

create table public.scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id),
  market_id uuid not null references public.markets (id),
  probability_yes numeric,
  outcome_yes integer,
  brier numeric,
  points integer,
  credits_spent numeric,
  credits_redeemed numeric,
  constraint scores_outcome_yes_check check (outcome_yes in (0, 1)),
  constraint scores_user_market_unique unique (user_id, market_id)
);

alter table public.scores enable row level security;

revoke all on table public.scores from public, anon, authenticated;
grant select on table public.scores to authenticated;
grant all on table public.scores to service_role;

create policy scores_select_own
  on public.scores
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create table public.resolutions (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null unique references public.markets (id),
  outcome text not null,
  resolved_by uuid not null references auth.users (id),
  assistant_note text,
  created_at timestamptz not null default now(),
  constraint resolutions_outcome_check check (outcome in ('YES', 'NO'))
);

alter table public.resolutions enable row level security;

revoke all on table public.resolutions from public, anon, authenticated;
grant select on table public.resolutions to authenticated;
grant all on table public.resolutions to service_role;

create policy resolutions_select_authenticated
  on public.resolutions
  for select
  to authenticated
  using (true);
