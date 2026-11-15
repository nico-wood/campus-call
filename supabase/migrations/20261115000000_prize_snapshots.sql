-- Prize snapshots: an admin can freeze the top 50 leaderboard rows at any
-- moment (e.g. at the Mon 16 Nov 2026, 11:59 p.m. PT prize cutoff) so the
-- prize payout is computed against a fixed record, not a leaderboard that
-- keeps moving after the cutoff.

create table public.prize_snapshots (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  rows jsonb not null
);

alter table public.prize_snapshots enable row level security;
revoke all on table public.prize_snapshots from public, anon, authenticated;
grant all on table public.prize_snapshots to service_role;

create or replace function public.freeze_prize_snapshot()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rows jsonb;
  v_id uuid;
begin
  select coalesce(jsonb_agg(jsonb_build_object(
    'rank', rank,
    'displayName', display_name,
    'balance', balance,
    'openValue', open_value,
    'total', total,
    'positions', positions
  )), '[]'::jsonb)
  into v_rows
  from public.local_leaderboard(50);

  insert into public.prize_snapshots (rows) values (v_rows) returning id into v_id;

  return jsonb_build_object('id', v_id, 'rows', v_rows, 'createdAt', now());
end;
$$;

create or replace function public.latest_prize_snapshot()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object('id', id, 'rows', rows, 'createdAt', created_at)
  from public.prize_snapshots
  order by created_at desc
  limit 1;
$$;

revoke all on function public.freeze_prize_snapshot() from public, anon, authenticated;
revoke all on function public.latest_prize_snapshot() from public, anon, authenticated;
grant execute on function public.freeze_prize_snapshot() to service_role;
grant execute on function public.latest_prize_snapshot() to service_role;
