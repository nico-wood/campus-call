-- Markets must open at a researched probability, not 50/50. ensure_local_market
-- creates (or, if no one has traded yet, updates) a market row with q seeded
-- from the catalog's prior instead of the all-zero q used when a position is
-- the first thing to touch a market. Idempotent and safe to call every time
-- the board loads (the caller caches the call for 60 seconds).

create or replace function public.ensure_local_market(
  p_id text,
  p_outcome_count integer,
  p_close_at timestamptz,
  p_prior double precision[],
  p_b numeric default 1000
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_clamped double precision[] := '{}';
  v_sum double precision := 0;
  v_q double precision[] := '{}';
  v_i integer;
  v_has_positions boolean;
begin
  if p_id is null or p_outcome_count is null or p_close_at is null or p_prior is null then
    return;
  end if;
  if p_outcome_count < 2 or p_outcome_count > 6 then
    return;
  end if;
  if pg_catalog.cardinality(p_prior) <> p_outcome_count then
    return;
  end if;
  if p_id !~ '^[a-z0-9][a-z0-9-]{2,79}$' then
    return;
  end if;

  -- Clamp each prior to [0.02, 0.98], then renormalize so it sums to 1.
  for v_i in 1 .. p_outcome_count loop
    v_clamped := v_clamped || greatest(0.02, least(0.98, coalesce(p_prior[v_i], 0)));
  end loop;
  select pg_catalog.sum(x) into v_sum from pg_catalog.unnest(v_clamped) as x;
  if v_sum is null or v_sum <= 0 then
    return;
  end if;
  for v_i in 1 .. p_outcome_count loop
    -- q_i = b * ln(prior_i); the shared additive constant cancels out in prices.
    v_q := v_q || (coalesce(p_b, 1000)::double precision * pg_catalog.ln(v_clamped[v_i] / v_sum));
  end loop;

  select exists(select 1 from public.local_positions where market_id = p_id) into v_has_positions;

  if v_has_positions then
    -- Someone already traded against this market's q; never move the price
    -- under them by rewriting it.
    return;
  end if;

  insert into public.local_markets (id, outcome_count, b, q, close_at)
  values (p_id, p_outcome_count, coalesce(p_b, 1000), v_q, p_close_at)
  on conflict (id) do update
    set q = excluded.q,
        b = excluded.b,
        outcome_count = excluded.outcome_count,
        close_at = excluded.close_at
    where public.local_markets.status = 'open'
      and not exists (select 1 from public.local_positions where market_id = excluded.id);
end;
$$;

revoke all on function public.ensure_local_market(text, integer, timestamptz, double precision[], numeric) from public, anon, authenticated;
grant execute on function public.ensure_local_market(text, integer, timestamptz, double precision[], numeric) to service_role;
