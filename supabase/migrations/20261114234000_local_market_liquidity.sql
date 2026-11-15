-- Raise LMSR liquidity for new markets from b=300 to b=1000, so a 100-credit
-- position moves a 50/50 market by about 2.5 points instead of 14. Existing
-- markets that have no positions yet (nobody has traded, so no one is
-- affected) are backfilled to the new default; markets with positions keep
-- their original b so already-placed positions keep the price history they
-- were priced against.

alter table public.local_markets
  alter column b set default 1000;

update public.local_markets m
   set b = 1000
 where b <> 1000
   and not exists (select 1 from public.local_positions p where p.market_id = m.id);

-- Expose b on the public board so the client can price its trade preview
-- against the market's actual liquidity instead of a hardcoded constant.
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
        'b', m.b,
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

revoke all on function public.local_board() from public, anon, authenticated;
grant execute on function public.local_board() to service_role;
