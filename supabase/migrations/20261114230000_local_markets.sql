-- Open local markets. Virtual credits only. No real money.
-- Anyone who verifies an email and gives a name and phone number gets 1000
-- virtual credits once (one grant per email, one per phone, one per account).
-- Positions are priced by LMSR (cost function C(q) = b ln sum exp(q_i / b)).
-- A resolution pays 1 virtual credit per winning share (rounded down) exactly
-- once. A void refunds the cost exactly once.
-- Every function here is security definer and only service_role may call it.
-- The browser never supplies an account id, a price, a close time, or a clock.

-- 1. Ledger reasons and links -------------------------------------------------

alter table public.credit_ledger
  drop constraint credit_ledger_reason_check;

alter table public.credit_ledger
  add constraint credit_ledger_reason_check check (
    reason in (
      'subsidy', 'trade', 'redemption', 'grant', 'position',
      'local_position', 'local_payout', 'local_refund'
    )
  );

alter table public.credit_ledger
  drop constraint credit_ledger_participant_grant_shape_check;

alter table public.credit_ledger
  add constraint credit_ledger_participant_grant_shape_check check (
    (
      normalized_email is null
      and participant_name is null
      and entry_context is null
    )
    or (
      reason = 'grant'
      and amount = 1000
      and entry_context in ('hackathon-qr', 'open-signup')
      and participant_name is not null
      and char_length(participant_name) between 1 and 80
      and participant_name !~ '[[:cntrl:]]'
      and normalized_email is not null
      and char_length(normalized_email) between 6 and 254
      and normalized_email = lower(normalized_email)
      and normalized_email !~ '[[:space:]]'
      and normalized_email !~ '[[:cntrl:]]'
      and length(normalized_email) - length(replace(normalized_email, '@', '')) = 1
    )
  );

-- 2. Participants ----------------------------------------------------------------

create table public.local_participants (
  account_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  normalized_email text not null unique,
  phone_digits text not null unique check (phone_digits ~ '^[0-9]{10,15}$'),
  created_at timestamptz not null default now()
);

alter table public.local_participants enable row level security;
revoke all on table public.local_participants from public, anon, authenticated;
grant all on table public.local_participants to service_role;

-- 3. Markets, positions, price history ---------------------------------------

create table public.local_markets (
  id text primary key check (id ~ '^[a-z0-9][a-z0-9-]{2,79}$'),
  outcome_count integer not null check (outcome_count between 2 and 6),
  b numeric not null default 300 check (b > 0),
  q double precision[] not null,
  close_at timestamptz not null,
  status text not null default 'open' check (status in ('open', 'resolved', 'void')),
  resolved_outcome integer,
  resolved_at timestamptz,
  volume numeric not null default 0 check (volume >= 0),
  created_at timestamptz not null default now(),
  constraint local_markets_q_shape check (pg_catalog.cardinality(q) = outcome_count),
  constraint local_markets_resolution_shape check (
    (status = 'open' and resolved_outcome is null and resolved_at is null)
    or (status = 'resolved' and resolved_outcome >= 0 and resolved_outcome < outcome_count and resolved_at is not null)
    or (status = 'void' and resolved_outcome is null and resolved_at is not null)
  )
);

create table public.local_positions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references auth.users (id) on delete cascade,
  market_id text not null references public.local_markets (id),
  outcome_idx integer not null check (outcome_idx >= 0),
  shares double precision not null check (shares > 0),
  cost numeric not null check (cost > 0 and cost = trunc(cost)),
  request_key uuid not null,
  prices_after double precision[] not null,
  created_at timestamptz not null default now(),
  constraint local_positions_one_request unique (account_id, request_key)
);

create index local_positions_market_idx on public.local_positions (market_id);
create index local_positions_account_idx on public.local_positions (account_id);

create table public.local_price_ticks (
  id bigserial primary key,
  market_id text not null references public.local_markets (id),
  prices double precision[] not null,
  volume numeric not null,
  created_at timestamptz not null default now()
);

create index local_price_ticks_market_idx on public.local_price_ticks (market_id, id);

alter table public.credit_ledger
  add column local_position_id uuid references public.local_positions (id);

create unique index credit_ledger_one_local_entry_per_reason
  on public.credit_ledger (local_position_id, reason)
  where local_position_id is not null;

alter table public.local_markets enable row level security;
alter table public.local_positions enable row level security;
alter table public.local_price_ticks enable row level security;

revoke all on table public.local_markets from public, anon, authenticated;
revoke all on table public.local_positions from public, anon, authenticated;
revoke all on table public.local_price_ticks from public, anon, authenticated;
grant all on table public.local_markets to service_role;
grant all on table public.local_positions to service_role;
grant all on table public.local_price_ticks to service_role;
grant usage, select on sequence public.local_price_ticks_id_seq to service_role;

-- 4. Helpers -----------------------------------------------------------------------

create or replace function public.local_prices(p_q double precision[], p_b numeric)
returns double precision[]
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_max double precision;
  v_sum double precision := 0;
  v_out double precision[] := '{}';
  v_i integer;
begin
  select pg_catalog.max(x) into v_max from pg_catalog.unnest(p_q) as x;
  for v_i in 1 .. pg_catalog.cardinality(p_q) loop
    v_sum := v_sum + pg_catalog.exp((p_q[v_i] - v_max) / p_b::double precision);
  end loop;
  for v_i in 1 .. pg_catalog.cardinality(p_q) loop
    v_out := v_out || (pg_catalog.exp((p_q[v_i] - v_max) / p_b::double precision) / v_sum);
  end loop;
  return v_out;
end;
$$;

create or replace function public.normalize_participant_phone(p_phone text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_digits text;
begin
  if p_phone is null or pg_catalog.char_length(p_phone) > 40 then
    return null;
  end if;
  if p_phone !~ '^[0-9 ()+.-]+$' then
    return null;
  end if;
  v_digits := pg_catalog.regexp_replace(p_phone, '[^0-9]', '', 'g');
  if pg_catalog.char_length(v_digits) = 10 then
    v_digits := '1' || v_digits;
  end if;
  if v_digits !~ '^[0-9]{11,15}$' then
    return null;
  end if;
  return v_digits;
end;
$$;

-- 5. Sign-up grant -------------------------------------------------------------
-- Returns 'granted', 'existing', 'phone-taken', 'email-taken', or 'invalid'.

create or replace function public.grant_open_participant(
  p_account_id uuid,
  p_name text,
  p_email text,
  p_phone text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text;
  v_email text;
  v_phone text;
  v_owner uuid;
begin
  if p_account_id is null then
    return 'invalid';
  end if;
  if not exists (select 1 from auth.users where id = p_account_id) then
    return 'invalid';
  end if;

  -- A returning participant signs in without a name or phone.
  if exists (select 1 from public.local_participants where account_id = p_account_id) then
    return 'existing';
  end if;

  v_name := public.normalize_participant_name(p_name);
  v_email := public.normalize_participant_email(p_email);
  v_phone := public.normalize_participant_phone(p_phone);
  if v_name is null or v_email is null or v_phone is null then
    return 'invalid';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(405005, pg_catalog.hashtext(v_email));
  perform pg_catalog.pg_advisory_xact_lock(405007, pg_catalog.hashtext(v_phone));
  perform pg_catalog.pg_advisory_xact_lock(405006, pg_catalog.hashtext(p_account_id::text));

  select account_id into v_owner from public.local_participants where phone_digits = v_phone;
  if v_owner is not null and v_owner <> p_account_id then
    return 'phone-taken';
  end if;

  select account_id into v_owner from public.local_participants where normalized_email = v_email;
  if v_owner is not null and v_owner <> p_account_id then
    return 'email-taken';
  end if;

  insert into public.local_participants (account_id, display_name, normalized_email, phone_digits)
  values (p_account_id, v_name, v_email, v_phone)
  on conflict (account_id) do nothing;

  -- One grant per normalized email and per account, across both entry paths.
  if exists (
    select 1 from public.credit_ledger
    where reason = 'grant'
      and (normalized_email = v_email or account_id = p_account_id::text)
  ) then
    return 'existing';
  end if;

  begin
    insert into public.credit_ledger (
      account_id, amount, reason, normalized_email, participant_name, entry_context
    ) values (
      p_account_id::text, 1000, 'grant', v_email, v_name, 'open-signup'
    );
  exception
    when unique_violation then
      return 'existing';
  end;
  return 'granted';
end;
$$;

-- 6. Open a position ---------------------------------------------------------------
-- p_outcome_count and p_close_at come from the server catalog. They are used
-- only to create the market row the first time. After that the stored row wins.

create or replace function public.place_local_position(
  p_account_id uuid,
  p_market_id text,
  p_outcome_count integer,
  p_close_at timestamptz,
  p_outcome integer,
  p_amount numeric,
  p_request_key uuid
)
returns table (
  status text,
  position_id uuid,
  shares double precision,
  prices double precision[],
  balance numeric
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_market public.local_markets%rowtype;
  v_balance numeric;
  v_prices double precision[];
  v_max double precision;
  v_sum double precision := 0;
  v_ei double precision;
  v_shares double precision;
  v_q double precision[];
  v_id uuid;
  v_i integer;
begin
  status := 'invalid';
  position_id := null;
  shares := 0;
  prices := null;
  balance := null;

  if p_account_id is null or p_request_key is null or p_market_id is null then
    return next; return;
  end if;
  if not exists (select 1 from auth.users where id = p_account_id) then
    return next; return;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(406007, pg_catalog.hashtext(p_account_id::text));

  select lp.id, lp.shares into v_id, v_shares
  from public.local_positions as lp
  where lp.account_id = p_account_id and lp.request_key = p_request_key;
  if v_id is not null then
    select coalesce(sum(amount), 0) into balance from public.credit_ledger where account_id = p_account_id::text;
    status := 'replayed';
    position_id := v_id;
    shares := v_shares;
    return next; return;
  end if;

  if p_amount is null or p_amount = 'NaN'::numeric or p_amount < 1 or p_amount > 10000
    or p_amount <> pg_catalog.trunc(p_amount) then
    return next; return;
  end if;

  if p_outcome_count is not null and p_close_at is not null
    and p_outcome_count between 2 and 6
    and p_market_id ~ '^[a-z0-9][a-z0-9-]{2,79}$' then
    insert into public.local_markets (id, outcome_count, q, close_at)
    values (p_market_id, p_outcome_count, pg_catalog.array_fill(0::double precision, array[p_outcome_count]), p_close_at)
    on conflict (id) do nothing;
  end if;

  select * into v_market from public.local_markets where id = p_market_id for update;
  if not found then
    return next; return;
  end if;
  if p_outcome is null or p_outcome < 0 or p_outcome >= v_market.outcome_count then
    return next; return;
  end if;
  if v_market.status <> 'open' or pg_catalog.now() >= v_market.close_at then
    status := 'closed';
    return next; return;
  end if;

  select coalesce(sum(amount), 0) into v_balance
  from public.credit_ledger where account_id = p_account_id::text;
  if v_balance < p_amount then
    status := 'insufficient';
    balance := v_balance;
    return next; return;
  end if;

  -- Shares s for spend a: s = b ln(1 + S (e^(a/b) - 1) / e_i), with S and e_i
  -- taken relative to the largest q for numeric stability.
  select pg_catalog.max(x) into v_max from pg_catalog.unnest(v_market.q) as x;
  for v_i in 1 .. v_market.outcome_count loop
    v_sum := v_sum + pg_catalog.exp((v_market.q[v_i] - v_max) / v_market.b::double precision);
  end loop;
  v_ei := pg_catalog.exp((v_market.q[p_outcome + 1] - v_max) / v_market.b::double precision);
  v_shares := v_market.b::double precision * pg_catalog.ln(
    1 + v_sum * (pg_catalog.exp(p_amount::double precision / v_market.b::double precision) - 1) / v_ei
  );
  if v_shares is null or v_shares <= 0 or v_shares = 'Infinity'::double precision then
    return next; return;
  end if;

  v_q := v_market.q;
  v_q[p_outcome + 1] := v_q[p_outcome + 1] + v_shares;
  v_prices := public.local_prices(v_q, v_market.b);

  update public.local_markets
     set q = v_q, volume = volume + p_amount
   where id = p_market_id;

  v_id := pg_catalog.gen_random_uuid();
  insert into public.local_positions (id, account_id, market_id, outcome_idx, shares, cost, request_key, prices_after)
  values (v_id, p_account_id, p_market_id, p_outcome, v_shares, p_amount, p_request_key, v_prices);

  insert into public.credit_ledger (account_id, amount, reason, local_position_id)
  values (p_account_id::text, -p_amount, 'local_position', v_id);

  insert into public.local_price_ticks (market_id, prices, volume)
  values (p_market_id, v_prices, v_market.volume + p_amount);

  status := 'ok';
  position_id := v_id;
  shares := v_shares;
  prices := v_prices;
  balance := v_balance - p_amount;
  return next;
end;
$$;

-- 7. Resolve or void ----------------------------------------------------------------
-- p_outcome >= 0 resolves to that outcome. p_outcome = -1 voids and refunds.
-- A second call raises 'already resolved'.

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
  return next;
end;
$$;

-- 8. Reads ---------------------------------------------------------------------------

-- Public board state: prices, volume, forecasters, and recent history per market.
create or replace function public.local_board()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'markets', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', m.id,
        'status', m.status,
        'resolvedOutcome', m.resolved_outcome,
        'closeAt', m.close_at,
        'prices', to_jsonb(public.local_prices(m.q, m.b)),
        'volume', m.volume,
        'forecasters', (select count(distinct p.account_id) from public.local_positions p where p.market_id = m.id),
        'history', coalesce((
          select jsonb_agg(jsonb_build_object('t', t.created_at, 'p', to_jsonb(t.prices)) order by t.id)
          from (
            select * from public.local_price_ticks t2
            where t2.market_id = m.id
            order by t2.id desc limit 300
          ) t
        ), '[]'::jsonb),
        'createdAt', m.created_at
      ))
      from public.local_markets m
    ), '[]'::jsonb),
    'stats', jsonb_build_object(
      'participants', (select count(*) from public.local_participants),
      'positions', (select count(*) from public.local_positions),
      'volume', (select coalesce(sum(volume), 0) from public.local_markets)
    )
  );
$$;

-- One account: balance and every position with the market's current state.
create or replace function public.local_account(p_account_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'name', (select display_name from public.local_participants where account_id = p_account_id),
    'balance', (select coalesce(sum(amount), 0) from public.credit_ledger where account_id = p_account_id::text),
    'granted', exists (select 1 from public.credit_ledger where account_id = p_account_id::text and reason = 'grant'),
    'positions', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', p.id,
        'marketId', p.market_id,
        'outcome', p.outcome_idx,
        'shares', p.shares,
        'cost', p.cost,
        'createdAt', p.created_at,
        'status', m.status,
        'resolvedOutcome', m.resolved_outcome,
        'priceNow', (public.local_prices(m.q, m.b))[p.outcome_idx + 1],
        'returned', (select coalesce(sum(l.amount), 0) from public.credit_ledger l
                     where l.local_position_id = p.id and l.reason in ('local_payout', 'local_refund'))
      ) order by p.created_at desc)
      from public.local_positions p
      join public.local_markets m on m.id = p.market_id
      where p.account_id = p_account_id
    ), '[]'::jsonb)
  );
$$;

-- Leaderboard: balance plus the current value of open positions.
-- Names are shortened to a first name and a last initial.
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
      (select coalesce(sum(p.shares * (public.local_prices(m.q, m.b))[p.outcome_idx + 1]), 0)
         from public.local_positions p join public.local_markets m on m.id = p.market_id
        where p.account_id = lp.account_id and m.status = 'open') as open_val,
      (select count(*) from public.local_positions p where p.account_id = lp.account_id) as n
    from public.local_participants lp
  )
  select
    pg_catalog.row_number() over (order by (bal + open_val) desc, n desc, short_name) as rank,
    short_name, bal, open_val, (bal + open_val)::double precision, n
  from people
  order by 1
  limit greatest(1, least(coalesce(p_limit, 50), 200));
$$;

revoke all on function public.local_prices(double precision[], numeric) from public, anon, authenticated;
revoke all on function public.normalize_participant_phone(text) from public, anon, authenticated;
revoke all on function public.grant_open_participant(uuid, text, text, text) from public, anon, authenticated;
revoke all on function public.place_local_position(uuid, text, integer, timestamptz, integer, numeric, uuid) from public, anon, authenticated;
revoke all on function public.resolve_local_market(text, integer) from public, anon, authenticated;
revoke all on function public.local_board() from public, anon, authenticated;
revoke all on function public.local_account(uuid) from public, anon, authenticated;
revoke all on function public.local_leaderboard(integer) from public, anon, authenticated;

grant execute on function public.local_prices(double precision[], numeric) to service_role;
grant execute on function public.normalize_participant_phone(text) to service_role;
grant execute on function public.grant_open_participant(uuid, text, text, text) to service_role;
grant execute on function public.place_local_position(uuid, text, integer, timestamptz, integer, numeric, uuid) to service_role;
grant execute on function public.resolve_local_market(text, integer) to service_role;
grant execute on function public.local_board() to service_role;
grant execute on function public.local_account(uuid) to service_role;
grant execute on function public.local_leaderboard(integer) to service_role;
