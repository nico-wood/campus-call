-- Combos: a set of 2-5 legs (market + outcome). Returns credits only if every
-- non-void leg wins. Price is fixed at confirm time: the product of each
-- leg's current probability, times a 5% house margin, capped at 0.95.
--
-- The one-leg-per-event and same-horizon rules live in TypeScript
-- (src/app/local/combo-handler.ts), not here: "event" and "horizon" are
-- catalog-only concepts (src/app/live-events.ts, src/app/live-forecasts.ts)
-- that this database has no table for. This function verifies everything it
-- *can* see: the legs exist, are open, aren't closed, have no duplicate
-- market, the stake and price math, overspend, and replay.

-- 1. Ledger reasons and link column --------------------------------------------------

alter table public.credit_ledger
  drop constraint credit_ledger_reason_check;

alter table public.credit_ledger
  add constraint credit_ledger_reason_check check (
    reason in (
      'subsidy', 'trade', 'redemption', 'grant', 'position',
      'local_position', 'local_payout', 'local_refund',
      'local_combo', 'local_combo_return'
    )
  );

-- 2. Tables -----------------------------------------------------------------------------

create table public.local_combos (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references auth.users (id) on delete cascade,
  stake numeric not null check (stake between 1 and 1000 and stake = trunc(stake)),
  price numeric not null check (price > 0 and price <= 0.95),
  potential_return numeric not null,
  status text not null default 'open' check (status in ('open', 'won', 'lost', 'void')),
  request_key uuid not null,
  created_at timestamptz not null default now(),
  constraint local_combos_one_request unique (account_id, request_key)
);

create table public.local_combo_legs (
  combo_id uuid not null references public.local_combos (id),
  market_id text not null references public.local_markets (id),
  outcome_idx integer not null check (outcome_idx >= 0),
  prob_at_entry double precision not null check (prob_at_entry > 0 and prob_at_entry <= 1),
  status text not null default 'open' check (status in ('open', 'won', 'lost', 'void'))
);

create index local_combo_legs_market_idx on public.local_combo_legs (market_id);
create index local_combo_legs_combo_idx on public.local_combo_legs (combo_id);
create index local_combos_account_idx on public.local_combos (account_id);

alter table public.credit_ledger
  add column local_combo_id uuid references public.local_combos (id);

create unique index credit_ledger_one_combo_entry_per_reason
  on public.credit_ledger (local_combo_id, reason)
  where local_combo_id is not null;

alter table public.local_combos enable row level security;
alter table public.local_combo_legs enable row level security;

revoke all on table public.local_combos from public, anon, authenticated;
revoke all on table public.local_combo_legs from public, anon, authenticated;
grant all on table public.local_combos to service_role;
grant all on table public.local_combo_legs to service_role;

-- 3. Place a combo ---------------------------------------------------------------------

create or replace function public.place_local_combo(
  p_account_id uuid,
  p_legs jsonb,
  p_stake numeric,
  p_request_key uuid
)
returns table (
  status text,
  combo_id uuid,
  price numeric,
  potential_return numeric,
  balance numeric
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_leg jsonb;
  v_market_id text;
  v_outcome_idx integer;
  v_market public.local_markets%rowtype;
  v_prices double precision[];
  v_prob double precision;
  v_price numeric := 1;
  v_balance numeric;
  v_id uuid;
  v_n integer;
  v_seen text[] := '{}';
  v_market_ids text[] := '{}';
  v_outcome_idxs integer[] := '{}';
  v_probs double precision[] := '{}';
  v_i integer;
begin
  status := 'invalid';
  combo_id := null;
  price := null;
  potential_return := null;
  balance := null;

  if p_account_id is null or p_request_key is null or p_legs is null then
    return next; return;
  end if;
  if not exists (select 1 from auth.users where id = p_account_id) then
    return next; return;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(406020, pg_catalog.hashtext(p_account_id::text));

  select id into v_id from public.local_combos
   where account_id = p_account_id and request_key = p_request_key;
  if v_id is not null then
    select coalesce(sum(amount), 0) into balance from public.credit_ledger where account_id = p_account_id::text;
    select c.price, c.potential_return into price, potential_return from public.local_combos c where c.id = v_id;
    status := 'replayed';
    combo_id := v_id;
    return next; return;
  end if;

  if p_stake is null or p_stake = 'NaN'::numeric or p_stake < 1 or p_stake > 1000
    or p_stake <> pg_catalog.trunc(p_stake) then
    return next; return;
  end if;

  if jsonb_typeof(p_legs) <> 'array' then
    return next; return;
  end if;
  v_n := jsonb_array_length(p_legs);
  if v_n < 2 or v_n > 5 then
    return next; return;
  end if;

  for v_leg in select * from jsonb_array_elements(p_legs)
  loop
    v_market_id := v_leg ->> 'marketId';
    begin
      v_outcome_idx := (v_leg ->> 'outcomeIdx')::integer;
    exception
      when others then
        v_outcome_idx := null;
    end;
    if v_market_id is null or v_outcome_idx is null then
      return next; return;
    end if;
    if v_market_id = any(v_seen) then
      return next; return;
    end if;
    v_seen := v_seen || v_market_id;

    select * into v_market from public.local_markets where id = v_market_id for update;
    if not found then
      return next; return;
    end if;
    if v_outcome_idx < 0 or v_outcome_idx >= v_market.outcome_count then
      return next; return;
    end if;
    if v_market.status <> 'open' or pg_catalog.now() >= v_market.close_at then
      status := 'closed';
      return next; return;
    end if;

    v_prices := public.local_prices(v_market.q, v_market.b);
    v_prob := v_prices[v_outcome_idx + 1];
    v_price := v_price * v_prob;

    v_market_ids := v_market_ids || v_market_id;
    v_outcome_idxs := v_outcome_idxs || v_outcome_idx;
    v_probs := v_probs || v_prob;
  end loop;

  v_price := least(v_price * 1.05, 0.95);

  select coalesce(sum(amount), 0) into v_balance
  from public.credit_ledger where account_id = p_account_id::text;
  if v_balance < p_stake then
    status := 'insufficient';
    balance := v_balance;
    return next; return;
  end if;

  v_id := pg_catalog.gen_random_uuid();
  insert into public.local_combos (id, account_id, stake, price, potential_return, request_key)
  values (v_id, p_account_id, p_stake, v_price, pg_catalog.floor(p_stake / v_price), p_request_key);

  for v_i in 1 .. pg_catalog.array_length(v_market_ids, 1) loop
    insert into public.local_combo_legs (combo_id, market_id, outcome_idx, prob_at_entry)
    values (v_id, v_market_ids[v_i], v_outcome_idxs[v_i], v_probs[v_i]);
  end loop;

  insert into public.credit_ledger (account_id, amount, reason, local_combo_id)
  values (p_account_id::text, -p_stake, 'local_combo', v_id);

  status := 'ok';
  combo_id := v_id;
  price := v_price;
  potential_return := pg_catalog.floor(p_stake / v_price);
  balance := v_balance - p_stake;
  return next;
end;
$$;

-- 4. Settlement -------------------------------------------------------------------------
-- Re-creates resolve_local_market with every existing behavior unchanged
-- (the position-settlement loop, the resolved/void status update, the
-- "already resolved" exception, the returned shape), and adds combo
-- settlement for any combo with a leg on this market.

create or replace function public.resolve_local_market(p_market_id text, p_outcome integer)
returns table (positions_paid integer, credits_paid numeric)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_market public.local_markets%rowtype;
  v_row record;
  v_amount numeric;
  v_new_price double precision;
begin
  positions_paid := 0;
  credits_paid := 0;

  select * into v_market from public.local_markets where id = p_market_id for update;
  if not found then
    raise exception 'market not found' using errcode = 'P0002';
  end if;
  if v_market.status <> 'open' then
    raise exception 'already resolved' using errcode = '22023';
  end if;
  if p_outcome is null or p_outcome < -1 or p_outcome >= v_market.outcome_count then
    raise exception 'invalid outcome' using errcode = '22023';
  end if;

  for v_row in
    select id, account_id, outcome_idx, shares, cost
    from public.local_positions where market_id = p_market_id
  loop
    if p_outcome = -1 then
      v_amount := v_row.cost;
      insert into public.credit_ledger (account_id, amount, reason, local_position_id)
      values (v_row.account_id::text, v_amount, 'local_refund', v_row.id);
    elsif v_row.outcome_idx = p_outcome then
      v_amount := pg_catalog.floor(v_row.shares)::numeric;
      if v_amount <= 0 then
        continue;
      end if;
      insert into public.credit_ledger (account_id, amount, reason, local_position_id)
      values (v_row.account_id::text, v_amount, 'local_payout', v_row.id);
    else
      continue;
    end if;
    positions_paid := positions_paid + 1;
    credits_paid := credits_paid + v_amount;
  end loop;

  if p_outcome = -1 then
    update public.local_markets set status = 'void', resolved_at = pg_catalog.now() where id = p_market_id;
  else
    update public.local_markets
       set status = 'resolved', resolved_outcome = p_outcome, resolved_at = pg_catalog.now()
     where id = p_market_id;
  end if;

  -- Settle this market's legs.
  if p_outcome = -1 then
    update public.local_combo_legs set status = 'void'
     where market_id = p_market_id and status = 'open';
  else
    update public.local_combo_legs set status = 'won'
     where market_id = p_market_id and status = 'open' and outcome_idx = p_outcome;
    update public.local_combo_legs set status = 'lost'
     where market_id = p_market_id and status = 'open' and outcome_idx <> p_outcome;
  end if;

  -- Any combo with a lost leg is lost outright; no payout, no refund.
  update public.local_combos set status = 'lost'
   where status = 'open'
     and id in (select combo_id from public.local_combo_legs where market_id = p_market_id)
     and exists (select 1 from public.local_combo_legs l where l.combo_id = local_combos.id and l.status = 'lost');

  -- Combos touched by this market that are now fully settled (no 'open' legs left):
  -- either every leg voided (full refund) or the remaining non-void legs all won
  -- (pay out at the price recomputed from those non-void legs).
  for v_row in
    select c.id as combo_id, c.account_id, c.stake,
           count(*) filter (where l.status = 'open') as open_legs,
           count(*) filter (where l.status = 'void') as void_legs,
           count(*) as total_legs
    from public.local_combos c
    join public.local_combo_legs l on l.combo_id = c.id
    where c.status = 'open'
      and c.id in (select combo_id from public.local_combo_legs where market_id = p_market_id)
    group by c.id, c.account_id, c.stake
  loop
    if v_row.open_legs > 0 then
      continue;
    end if;

    if v_row.void_legs = v_row.total_legs then
      update public.local_combos set status = 'void' where id = v_row.combo_id;
      insert into public.credit_ledger (account_id, amount, reason, local_combo_id)
      values (v_row.account_id::text, v_row.stake, 'local_combo_return', v_row.combo_id);
    else
      select least(pg_catalog.exp(sum(pg_catalog.ln(prob_at_entry))) * 1.05, 0.95)
        into v_new_price
        from public.local_combo_legs
       where combo_id = v_row.combo_id and status <> 'void';
      update public.local_combos
         set status = 'won', price = v_new_price, potential_return = pg_catalog.floor(v_row.stake / v_new_price)
       where id = v_row.combo_id;
      insert into public.credit_ledger (account_id, amount, reason, local_combo_id)
      values (v_row.account_id::text, pg_catalog.floor(v_row.stake / v_new_price), 'local_combo_return', v_row.combo_id);
    end if;
  end loop;

  -- Combos still waiting on other legs, but with a leg on this market that
  -- just voided: reprice now from the remaining non-void legs so the
  -- displayed potential return stays accurate while it waits.
  update public.local_combos c
     set price = sub.new_price,
         potential_return = pg_catalog.floor(c.stake / sub.new_price)
    from (
      select l.combo_id, least(pg_catalog.exp(sum(pg_catalog.ln(l.prob_at_entry))) * 1.05, 0.95) as new_price
      from public.local_combo_legs l
      where l.status <> 'void'
        and l.combo_id in (select combo_id from public.local_combo_legs where market_id = p_market_id)
      group by l.combo_id
    ) sub
   where c.id = sub.combo_id
     and c.status = 'open'
     and exists (select 1 from public.local_combo_legs l2 where l2.combo_id = c.id and l2.status = 'void');

  return next;
end;
$$;

-- 5. Reads --------------------------------------------------------------------------------

create or replace function public.local_account_combos(p_account_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', c.id,
    'stake', c.stake,
    'price', c.price,
    'potentialReturn', c.potential_return,
    'status', c.status,
    'createdAt', c.created_at,
    'legs', coalesce((
      select jsonb_agg(jsonb_build_object(
        'marketId', l.market_id,
        'outcomeIdx', l.outcome_idx,
        'probAtEntry', l.prob_at_entry,
        'status', l.status
      ) order by l.market_id)
      from public.local_combo_legs l where l.combo_id = c.id
    ), '[]'::jsonb),
    'returned', (select coalesce(sum(cl.amount), 0) from public.credit_ledger cl
                 where cl.local_combo_id = c.id and cl.reason = 'local_combo_return')
  ) order by c.created_at desc), '[]'::jsonb)
  from public.local_combos c
  where c.account_id = p_account_id;
$$;

revoke all on function public.place_local_combo(uuid, jsonb, numeric, uuid) from public, anon, authenticated;
revoke all on function public.resolve_local_market(text, integer) from public, anon, authenticated;
revoke all on function public.local_account_combos(uuid) from public, anon, authenticated;

grant execute on function public.place_local_combo(uuid, jsonb, numeric, uuid) to service_role;
grant execute on function public.resolve_local_market(text, integer) to service_role;
grant execute on function public.local_account_combos(uuid) to service_role;

-- 6. Leaderboard: open combos count at their stake --------------------------------------
-- Re-creates local_leaderboard (defined in 20261114233000) with the same
-- position-value logic unchanged, adding every open combo's stake to
-- open_value. A won/void combo's return is already in `bal` via
-- credit_ledger (local_combo_return), so it needs no extra term here.

create or replace function public.local_leaderboard(p_limit integer default 50)
returns table (
  rank bigint,
  display_name text,
  balance numeric,
  open_value double precision,
  total double precision,
  positions bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  with people as (
    select
      lp.account_id,
      case
        when pg_catalog.strpos(lp.display_name, ' ') > 0 then
          pg_catalog.split_part(lp.display_name, ' ', 1) || ' ' ||
          pg_catalog.left(pg_catalog.regexp_replace(lp.display_name, '^.* ', ''), 1) || '.'
        else lp.display_name
      end as short_name,
      (select coalesce(sum(l.amount), 0) from public.credit_ledger l where l.account_id = lp.account_id::text) as bal,
      (select coalesce(sum(public.local_liquidation_value(m.q, m.b, g.outcome_idx, g.group_shares)), 0)
         from (
           select market_id, outcome_idx, sum(shares) as group_shares
           from public.local_positions
           where account_id = lp.account_id
           group by market_id, outcome_idx
         ) g
         join public.local_markets m on m.id = g.market_id
        where m.status = 'open') as open_positions_val,
      (select coalesce(sum(c.stake), 0) from public.local_combos c
        where c.account_id = lp.account_id and c.status = 'open') as open_combos_val,
      (select count(*) from public.local_positions p where p.account_id = lp.account_id) as n
    from public.local_participants lp
  ),
  totals as (
    select account_id, short_name, bal, (open_positions_val + open_combos_val) as open_val, n
    from people
  )
  select
    pg_catalog.row_number() over (order by (bal + open_val) desc, n desc, short_name) as rank,
    short_name, bal, open_val, (bal + open_val)::double precision, n
  from totals
  order by 1
  limit greatest(1, least(coalesce(p_limit, 50), 200));
$$;

revoke all on function public.local_leaderboard(integer) from public, anon, authenticated;
grant execute on function public.local_leaderboard(integer) to service_role;
