-- Fix the leaderboard/portfolio valuation bug: an open position was valued at
-- shares x current price, but a user's own purchase pushes the price up, so
-- that double-counts the user's own market impact. Value it instead at LMSR
-- liquidation value: what selling the held shares back right now would
-- return. For shares s in outcome i, that is
--   b * ln(sum exp(q_j / b)) - b * ln(sum exp(q'_j / b))
-- where q' is q with s subtracted from outcome i (max-shifted for stability).

create or replace function public.local_liquidation_value(
  p_q double precision[],
  p_b numeric,
  p_outcome integer,
  p_shares double precision
)
returns double precision
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_max double precision;
  v_sum_before double precision := 0;
  v_sum_after double precision := 0;
  v_qi_after double precision;
  v_i integer;
begin
  if p_shares is null or p_shares <= 0 then
    return 0;
  end if;
  select pg_catalog.max(x) into v_max from pg_catalog.unnest(p_q) as x;
  for v_i in 1 .. pg_catalog.cardinality(p_q) loop
    v_sum_before := v_sum_before + pg_catalog.exp((p_q[v_i] - v_max) / p_b::double precision);
    if v_i = p_outcome + 1 then
      v_qi_after := p_q[v_i] - p_shares;
    else
      v_qi_after := p_q[v_i];
    end if;
    v_sum_after := v_sum_after + pg_catalog.exp((v_qi_after - v_max) / p_b::double precision);
  end loop;
  return p_b::double precision * (pg_catalog.ln(v_sum_before) - pg_catalog.ln(v_sum_after));
end;
$$;

revoke all on function public.local_liquidation_value(double precision[], numeric, integer, double precision) from public, anon, authenticated;
grant execute on function public.local_liquidation_value(double precision[], numeric, integer, double precision) to service_role;

-- One account: balance and every position, now with valueNow (liquidation
-- value) alongside the existing priceNow (per-share price). Shares held by
-- the same account in the same (market, outcome) are grouped, because
-- liquidation value is not additive across separately-valued slices of the
-- same position: it must be evaluated once against the account's total held
-- shares, then allocated pro-rata back to each position row.
create or replace function public.local_account(p_account_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with groups as (
    select market_id, outcome_idx, sum(shares) as group_shares
    from public.local_positions
    where account_id = p_account_id
    group by market_id, outcome_idx
  )
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
        'valueNow', round((
          public.local_liquidation_value(m.q, m.b, p.outcome_idx, g.group_shares)
          * (p.shares / g.group_shares)
        )::numeric, 2),
        'returned', (select coalesce(sum(l.amount), 0) from public.credit_ledger l
                     where l.local_position_id = p.id and l.reason in ('local_payout', 'local_refund'))
      ) order by p.created_at desc)
      from public.local_positions p
      join public.local_markets m on m.id = p.market_id
      join groups g on g.market_id = p.market_id and g.outcome_idx = p.outcome_idx
      where p.account_id = p_account_id
    ), '[]'::jsonb)
  );
$$;

-- Leaderboard: balance plus the LMSR liquidation value of open positions
-- (grouped the same way), not shares x current price.
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
        where m.status = 'open') as open_val,
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

revoke all on function public.local_account(uuid) from public, anon, authenticated;
revoke all on function public.local_leaderboard(integer) from public, anon, authenticated;
grant execute on function public.local_account(uuid) to service_role;
grant execute on function public.local_leaderboard(integer) to service_role;
