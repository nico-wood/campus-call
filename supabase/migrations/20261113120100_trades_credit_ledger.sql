-- Trades are immutable fills. The credit ledger is the virtual-credit balance.
-- House account id is the text house. No client insert, update, or delete.

create table public.trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id),
  market_id uuid not null references public.markets (id),
  side text not null,
  shares numeric not null,
  cost_credits numeric not null,
  probability_yes numeric not null,
  created_at timestamptz not null default now(),
  constraint trades_side_check check (side in ('yes', 'no')),
  constraint trades_shares_check check (shares > 0),
  constraint trades_cost_credits_check check (cost_credits > 0),
  constraint trades_probability_yes_check check (
    probability_yes >= 0 and probability_yes <= 1
  )
);

alter table public.trades enable row level security;

revoke all on table public.trades from public, anon, authenticated;
grant select on table public.trades to authenticated;
grant all on table public.trades to service_role;

create policy trades_select_own
  on public.trades
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create index trades_user_id_idx on public.trades (user_id);

create table public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  account_id text not null,
  market_id uuid references public.markets (id),
  amount numeric not null,
  reason text not null,
  created_at timestamptz not null default now(),
  constraint credit_ledger_reason_check check (
    reason in ('subsidy', 'trade', 'redemption', 'grant')
  )
);

alter table public.credit_ledger enable row level security;

revoke all on table public.credit_ledger from public, anon, authenticated;
grant select on table public.credit_ledger to authenticated;
grant all on table public.credit_ledger to service_role;

create policy credit_ledger_select_own
  on public.credit_ledger
  for select
  to authenticated
  using (account_id = (select auth.uid())::text);

create index credit_ledger_account_id_idx on public.credit_ledger (account_id);

-- One starting grant of virtual credits per account.
create unique index credit_ledger_one_grant_per_account
  on public.credit_ledger (account_id)
  where reason = 'grant';

-- Balance is sum(amount). Reject an insert that would make an account negative.
create or replace function public.enforce_nonnegative_credit_balance()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  balance numeric;
begin
  select coalesce(sum(amount), 0)
    into balance
  from public.credit_ledger
  where account_id = new.account_id;

  if balance < 0 then
    raise exception 'insufficient credits';
  end if;

  return null;
end;
$$;

create trigger credit_ledger_nonnegative
  after insert on public.credit_ledger
  for each row
  execute function public.enforce_nonnegative_credit_balance();

revoke all on function public.enforce_nonnegative_credit_balance() from public, anon, authenticated;
