-- Profiles, markets, and outcomes. Virtual credits only.
-- RLS is enabled before policies. Missing write policies deny anon and authenticated.

create table public.profiles (
  id uuid primary key references auth.users (id),
  email text unique,
  display_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

revoke all on table public.profiles from public, anon, authenticated;
grant select on table public.profiles to authenticated;
grant update (display_name) on table public.profiles to authenticated;
grant all on table public.profiles to service_role;

create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using (id = (select auth.uid()));

create policy profiles_update_own_display_name
  on public.profiles
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create table public.markets (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  category text not null,
  resolution_source text not null,
  close_at timestamptz not null,
  b numeric not null default 100,
  q_yes numeric not null default 0,
  q_no numeric not null default 0,
  status text not null,
  created_at timestamptz not null default now(),
  constraint markets_category_check check (category in ('campus', 'knowledge', 'academic')),
  constraint markets_status_check check (status in ('draft', 'open', 'closed', 'resolved'))
);

alter table public.markets enable row level security;

revoke all on table public.markets from public, anon, authenticated;
grant select on table public.markets to anon, authenticated;
grant all on table public.markets to service_role;

create policy markets_select_not_draft
  on public.markets
  for select
  to anon, authenticated
  using (status <> 'draft');

create table public.outcomes (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references public.markets (id),
  label text not null,
  constraint outcomes_label_check check (label in ('YES', 'NO')),
  constraint outcomes_market_label_unique unique (market_id, label)
);

alter table public.outcomes enable row level security;

revoke all on table public.outcomes from public, anon, authenticated;
grant select on table public.outcomes to anon, authenticated;
grant all on table public.outcomes to service_role;

create policy outcomes_select_not_draft
  on public.outcomes
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.markets
      where markets.id = outcomes.market_id
        and markets.status <> 'draft'
    )
  );
