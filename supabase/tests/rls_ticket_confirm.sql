-- Atomic forecast confirmation.
-- Two overlapping spends, the Sunday noon lock, replay, and Chick-fil-A.
-- Loopback on 127.0.0.1 is trust, so the race connects with the server address.

begin;
select plan(41);

select ok(
  exists (
    select 1
    from pg_proc as proc
    join pg_namespace as ns on ns.oid = proc.pronamespace
    where ns.nspname = 'public'
      and proc.proname = 'confirm_forecast_position'
      and proc.prosecdef
  ),
  'confirm_forecast_position is security definer'
);

select is(
  (
    select cfg
    from pg_proc as proc
    join pg_namespace as ns on ns.oid = proc.pronamespace
    cross join lateral unnest(coalesce(proc.proconfig, array[]::text[])) as cfg
    where ns.nspname = 'public'
      and proc.proname = 'confirm_forecast_position'
      and cfg like 'search_path=%'
  ),
  'search_path=""',
  'confirm_forecast_position pins search_path'
);

select is(
  pg_get_function_identity_arguments(
    'public.confirm_forecast_position(uuid, text, numeric, uuid, text, text, text, text, timestamptz)'::regprocedure
  ),
  'p_account_id uuid, p_ticket text, p_amount numeric, p_request_key uuid, p_place_first text, p_place_second text, p_place_third text, p_team_name text, p_server_time timestamp with time zone',
  'confirm inputs are the account, ticket, amount, request, position, and server time'
);

select ok(
  not exists (
    select 1
    from pg_proc as proc
    join pg_namespace as ns on ns.oid = proc.pronamespace
    cross join lateral unnest(proc.proargnames) as arg
    where ns.nspname = 'public'
      and proc.proname = 'confirm_forecast_position'
      and arg ~* 'skip|header|query|flag|bypass'
  ),
  'no client flag, query, or header selects the amount or skips the lock'
);

select ok(
  pg_get_functiondef(
    'public.confirm_forecast_position(uuid, text, numeric, uuid, text, text, text, text, timestamptz)'::regprocedure
  ) !~* 'current_setting|skip_lock|request\.header',
  'the confirm function does not read a request header or a skip switch'
);

select ok(
  not has_function_privilege(
    'anon',
    'public.confirm_forecast_position(uuid, text, numeric, uuid, text, text, text, text, timestamptz)',
    'execute'
  ),
  'anon is not granted forecast confirmation'
);

select ok(
  not has_function_privilege(
    'authenticated',
    'public.confirm_forecast_position(uuid, text, numeric, uuid, text, text, text, text, timestamptz)',
    'execute'
  ),
  'authenticated is not granted forecast confirmation'
);

select ok(
  has_function_privilege(
    'service_role',
    'public.confirm_forecast_position(uuid, text, numeric, uuid, text, text, text, text, timestamptz)',
    'execute'
  ),
  'service_role can execute forecast confirmation'
);

insert into public.credit_ledger (account_id, amount, reason)
values
  ('c0060000-0000-4000-8000-000000000001', 1000, 'grant'),
  ('c0060000-0000-4000-8000-000000000002', 1000, 'grant'),
  ('c0060000-0000-4000-8000-000000000003', 1000, 'grant'),
  ('c0060000-0000-4000-8000-000000000004', 1000, 'grant'),
  ('c0060000-0000-4000-8000-000000000005', 1000, 'grant'),
  ('c0060000-0000-4000-8000-000000000006', 1000, 'grant'),
  ('c0060000-0000-4000-8000-000000000007', 1000, 'grant'),
  ('c0060000-0000-4000-8000-000000000008', 1000, 'grant'),
  ('c0060000-0000-4000-8000-000000000009', 1000, 'grant'),
  ('c0060000-0000-4000-8000-000000000010', 1000, 'grant'),
  ('c0060000-0000-4000-8000-000000000011', 1000, 'grant'),
  ('c0060000-0000-4000-8000-000000000012', 1000, 'grant'),
  ('c0060000-0000-4000-8000-000000000013', 1000, 'grant'),
  ('c0060000-0000-4000-8000-000000000014', 1000, 'grant'),
  ('c0060000-0000-4000-8000-000000000016', 1000, 'grant');

create temp table cc006_call (
  label text primary key,
  confirmation_id uuid,
  committed boolean,
  wrote boolean,
  debited numeric,
  replayed boolean
);

insert into cc006_call
select 'fraction', result.*
from public.confirm_forecast_position(
  'c0060000-0000-4000-8000-000000000012'::uuid,
  'main',
  10.5,
  'c0061000-0000-4000-8000-000000000012'::uuid,
  'North',
  'South',
  'East',
  null,
  '2026-11-15T19:00:00Z'::timestamptz
) as result;

insert into cc006_call
select 'zero', result.*
from public.confirm_forecast_position(
  'c0060000-0000-4000-8000-000000000012'::uuid,
  'main',
  0,
  'c0061000-0000-4000-8000-000000000013'::uuid,
  'North',
  'South',
  'East',
  null,
  '2026-11-15T19:00:00Z'::timestamptz
) as result;

insert into cc006_call
select 'negative', result.*
from public.confirm_forecast_position(
  'c0060000-0000-4000-8000-000000000012'::uuid,
  'main',
  -5,
  'c0061000-0000-4000-8000-000000000014'::uuid,
  'North',
  'South',
  'East',
  null,
  '2026-11-15T19:00:00Z'::timestamptz
) as result;

insert into cc006_call
select 'covered', result.*
from public.confirm_forecast_position(
  'c0060000-0000-4000-8000-000000000011'::uuid,
  'openai',
  20,
  'c0061000-0000-4000-8000-000000000011'::uuid,
  null,
  null,
  null,
  'North',
  '2026-11-15T19:00:00Z'::timestamptz
) as result;

insert into cc006_call
select 'over', result.*
from public.confirm_forecast_position(
  'c0060000-0000-4000-8000-000000000010'::uuid,
  'main',
  1001,
  'c0061000-0000-4000-8000-000000000010'::uuid,
  'North',
  'South',
  'East',
  null,
  '2026-11-15T19:00:00Z'::timestamptz
) as result;

insert into cc006_call
select 'before', result.*
from public.confirm_forecast_position(
  'c0060000-0000-4000-8000-000000000001'::uuid,
  'main',
  10,
  'c0061000-0000-4000-8000-000000000001'::uuid,
  'North',
  'South',
  'East',
  null,
  '2026-11-15T19:59:59Z'::timestamptz
) as result;

insert into cc006_call
select 'at', result.*
from public.confirm_forecast_position(
  'c0060000-0000-4000-8000-000000000002'::uuid,
  'main',
  10,
  'c0061000-0000-4000-8000-000000000002'::uuid,
  'North',
  'South',
  'East',
  null,
  '2026-11-15T20:00:00Z'::timestamptz
) as result;

insert into cc006_call
select 'after', result.*
from public.confirm_forecast_position(
  'c0060000-0000-4000-8000-000000000003'::uuid,
  'main',
  10,
  'c0061000-0000-4000-8000-000000000003'::uuid,
  'North',
  'South',
  'East',
  null,
  '2026-11-15T20:00:01Z'::timestamptz
) as result;

insert into cc006_call
select 'openai-at', result.*
from public.confirm_forecast_position(
  'c0060000-0000-4000-8000-000000000004'::uuid,
  'openai',
  10,
  'c0061000-0000-4000-8000-000000000004'::uuid,
  null,
  null,
  null,
  'North',
  '2026-11-15T20:00:00Z'::timestamptz
) as result;

insert into cc006_call
select 'startup-at', result.*
from public.confirm_forecast_position(
  'c0060000-0000-4000-8000-000000000005'::uuid,
  'startup-launch',
  10,
  'c0061000-0000-4000-8000-000000000005'::uuid,
  null,
  null,
  null,
  'North',
  '2026-11-15T20:00:00Z'::timestamptz
) as result;

insert into cc006_call
select 'best-at', result.*
from public.confirm_forecast_position(
  'c0060000-0000-4000-8000-000000000006'::uuid,
  'best-use-of-ai',
  10,
  'c0061000-0000-4000-8000-000000000006'::uuid,
  null,
  null,
  null,
  'North',
  '2026-11-15T20:00:00Z'::timestamptz
) as result;

insert into cc006_call
select 'replay-1', result.*
from public.confirm_forecast_position(
  'c0060000-0000-4000-8000-000000000007'::uuid,
  'best-use-of-ai',
  25,
  'c0061000-0000-4000-8000-000000000007'::uuid,
  null,
  null,
  null,
  'North',
  '2026-11-15T18:00:00Z'::timestamptz
) as result;

insert into cc006_call
select 'replay-2', result.*
from public.confirm_forecast_position(
  'c0060000-0000-4000-8000-000000000007'::uuid,
  'best-use-of-ai',
  25,
  'c0061000-0000-4000-8000-000000000007'::uuid,
  null,
  null,
  null,
  'North',
  '2026-11-15T21:00:00Z'::timestamptz
) as result;

insert into cc006_call
select 'replay-3', result.*
from public.confirm_forecast_position(
  'c0060000-0000-4000-8000-000000000007'::uuid,
  'best-use-of-ai',
  800,
  'c0061000-0000-4000-8000-000000000007'::uuid,
  null,
  null,
  null,
  'Other',
  '2026-11-15T21:00:00Z'::timestamptz
) as result;

insert into cc006_call
select 'chick-at', result.*
from public.confirm_forecast_position(
  'c0060000-0000-4000-8000-000000000008'::uuid,
  'chick-fil-a',
  30,
  'c0061000-0000-4000-8000-000000000008'::uuid,
  null,
  null,
  null,
  'Line',
  '2026-11-15T20:00:00Z'::timestamptz
) as result;

insert into cc006_call
select 'chick-after', result.*
from public.confirm_forecast_position(
  'c0060000-0000-4000-8000-000000000016'::uuid,
  'chick-fil-a',
  30,
  'c0061000-0000-4000-8000-000000000016'::uuid,
  null,
  null,
  null,
  'Line',
  '2026-11-15T20:00:01Z'::timestamptz
) as result;

insert into cc006_call
select 'same-main', result.*
from public.confirm_forecast_position(
  'c0060000-0000-4000-8000-000000000009'::uuid,
  'main',
  40,
  'c0061000-0000-4000-8000-000000000091'::uuid,
  'North',
  'North',
  'North',
  null,
  '2026-11-15T19:00:00Z'::timestamptz
) as result;

insert into cc006_call
select 'same-openai', result.*
from public.confirm_forecast_position(
  'c0060000-0000-4000-8000-000000000009'::uuid,
  'openai',
  40,
  'c0061000-0000-4000-8000-000000000092'::uuid,
  null,
  null,
  null,
  'North',
  '2026-11-15T19:00:00Z'::timestamptz
) as result;

insert into cc006_call
select 'second', result.*
from public.confirm_forecast_position(
  'c0060000-0000-4000-8000-000000000001'::uuid,
  'main',
  10,
  'c0061000-0000-4000-8000-000000000015'::uuid,
  'West',
  'West',
  'West',
  null,
  '2026-11-15T19:00:00Z'::timestamptz
) as result;

insert into cc006_call
select 'unknown', result.*
from public.confirm_forecast_position(
  'c0060000-0000-4000-8000-000000000013'::uuid,
  'dining',
  10,
  'c0061000-0000-4000-8000-000000000017'::uuid,
  null,
  null,
  null,
  'North',
  '2026-11-15T19:00:00Z'::timestamptz
) as result;

insert into cc006_call
select 'missing-place', result.*
from public.confirm_forecast_position(
  'c0060000-0000-4000-8000-000000000014'::uuid,
  'main',
  10,
  'c0061000-0000-4000-8000-000000000018'::uuid,
  'North',
  'South',
  null,
  null,
  '2026-11-15T19:00:00Z'::timestamptz
) as result;

select ok(
  (select wrote = false and committed = false and debited = 0 from cc006_call where label = 'fraction')
  and (select count(*) from public.forecast_confirmations where account_id = 'c0060000-0000-4000-8000-000000000012') = 0
  and (select count(*) from public.credit_ledger where account_id = 'c0060000-0000-4000-8000-000000000012' and reason = 'position') = 0,
  'a fractional virtual-credit amount writes nothing'
);

select ok(
  (select wrote = false and committed = false and debited = 0 from cc006_call where label = 'zero')
  and (select wrote = false and committed = false and debited = 0 from cc006_call where label = 'negative')
  and (select coalesce(sum(amount), 0) from public.credit_ledger where account_id = 'c0060000-0000-4000-8000-000000000012') = 1000,
  'a zero or negative virtual-credit amount writes nothing'
);

select ok(
  (select committed and wrote and debited = 20 and replayed = false from cc006_call where label = 'covered')
  and (select count(*) from public.credit_ledger where account_id = 'c0060000-0000-4000-8000-000000000011' and reason = 'position') = 1
  and (select coalesce(sum(amount), 0) from public.credit_ledger where account_id = 'c0060000-0000-4000-8000-000000000011' and reason = 'position') = -20
  and (select coalesce(sum(amount), 0) from public.credit_ledger where account_id = 'c0060000-0000-4000-8000-000000000011') = 980,
  'a confirm spends a positive whole number of virtual credits when the balance covers it'
);

select ok(
  (select wrote = false and committed = false and debited = 0 and replayed = false from cc006_call where label = 'over')
  and (select count(*) from public.forecast_confirmations where account_id = 'c0060000-0000-4000-8000-000000000010') = 0
  and (select count(*) from public.credit_ledger where account_id = 'c0060000-0000-4000-8000-000000000010' and reason = 'position') = 0
  and (select coalesce(sum(amount), 0) from public.credit_ledger where account_id = 'c0060000-0000-4000-8000-000000000010') = 1000,
  'an overspend writes nothing'
);

select ok(
  (select committed and wrote and debited = 10 and replayed = false from cc006_call where label = 'before')
  and (
    select count(*)
    from public.forecast_confirmations
    where account_id = 'c0060000-0000-4000-8000-000000000001'
      and ticket = 'main'
      and server_time = timestamptz '2026-11-15T19:59:59Z'
      and server_time < timestamptz '2026-11-15T20:00:00Z'
  ) = 1
  and (select coalesce(sum(amount), 0) from public.credit_ledger where account_id = 'c0060000-0000-4000-8000-000000000001' and reason = 'position') = -10
  and (select coalesce(sum(amount), 0) from public.credit_ledger where account_id = 'c0060000-0000-4000-8000-000000000001') = 990,
  'a first confirm before 2026-11-15T20:00:00Z commits'
);

select ok(
  (select committed = false and wrote = false and debited = 0 and replayed = false from cc006_call where label = 'at')
  and (select count(*) from public.credit_ledger where account_id = 'c0060000-0000-4000-8000-000000000002' and reason = 'position') = 0
  and (select coalesce(sum(amount), 0) from public.credit_ledger where account_id = 'c0060000-0000-4000-8000-000000000002') = 1000,
  'a first confirm at 2026-11-15T20:00:00Z is refused and writes nothing'
);

select is(
  (select count(*) from public.forecast_confirmations where account_id = 'c0060000-0000-4000-8000-000000000002'),
  0::bigint,
  'a first confirm at 2026-11-15T20:00:00Z leaves no confirmation'
);

select ok(
  (select committed = false and wrote = false and debited = 0 and replayed = false from cc006_call where label = 'after')
  and (select count(*) from public.credit_ledger where account_id = 'c0060000-0000-4000-8000-000000000003' and reason = 'position') = 0
  and (select coalesce(sum(amount), 0) from public.credit_ledger where account_id = 'c0060000-0000-4000-8000-000000000003') = 1000,
  'a first confirm after 2026-11-15T20:00:00Z is refused and writes nothing'
);

select is(
  (select count(*) from public.forecast_confirmations where account_id = 'c0060000-0000-4000-8000-000000000003'),
  0::bigint,
  'a first confirm after 2026-11-15T20:00:00Z leaves no confirmation'
);

select ok(
  'c0060000-0000-4000-8000-000000000001' <> 'c0060000-0000-4000-8000-000000000002'
  and 'c0060000-0000-4000-8000-000000000001' <> 'c0060000-0000-4000-8000-000000000003'
  and (select count(*) from public.forecast_confirmations where account_id = 'c0060000-0000-4000-8000-000000000001') = 1
  and (select count(*) from public.forecast_confirmations where account_id = 'c0060000-0000-4000-8000-000000000002') = 0
  and (select count(*) from public.forecast_confirmations where account_id = 'c0060000-0000-4000-8000-000000000003') = 0
  and (select replayed = false from cc006_call where label = 'at')
  and (select replayed = false from cc006_call where label = 'after'),
  'the at and after refusals are first confirms with no earlier commit, not a replay'
);

select is(
  (select count(*) from public.forecast_confirmations where account_id = 'c0060000-0000-4000-8000-000000000004'),
  0::bigint,
  'a first openai confirm at 2026-11-15T20:00:00Z leaves no confirmation'
);

select is(
  (select count(*) from public.forecast_confirmations where account_id = 'c0060000-0000-4000-8000-000000000005'),
  0::bigint,
  'a first startup-launch confirm at 2026-11-15T20:00:00Z leaves no confirmation'
);

select is(
  (select count(*) from public.forecast_confirmations where account_id = 'c0060000-0000-4000-8000-000000000006'),
  0::bigint,
  'a first best-use-of-ai confirm at 2026-11-15T20:00:00Z leaves no confirmation'
);

select ok(
  (select confirmation_id from cc006_call where label = 'replay-2')
    = (select confirmation_id from cc006_call where label = 'replay-1')
  and (select confirmation_id from cc006_call where label = 'replay-3')
    = (select confirmation_id from cc006_call where label = 'replay-1')
  and (select replayed and committed and wrote = false and debited = 0 from cc006_call where label = 'replay-2')
  and (select replayed and committed and wrote = false and debited = 0 from cc006_call where label = 'replay-3')
  and (select count(*) from public.forecast_confirmations where account_id = 'c0060000-0000-4000-8000-000000000007') = 1
  and (select count(*) from public.credit_ledger where account_id = 'c0060000-0000-4000-8000-000000000007' and reason = 'position') = 1
  and (select coalesce(sum(amount), 0) from public.credit_ledger where account_id = 'c0060000-0000-4000-8000-000000000007' and reason = 'position') = -25
  and (select coalesce(sum(amount), 0) from public.credit_ledger where account_id = 'c0060000-0000-4000-8000-000000000007') = 975,
  'a replay of an already committed request returns that confirmation and does not debit again'
);

select ok(
  (select committed and wrote and debited = 30 and replayed = false from cc006_call where label = 'chick-at')
  and (select committed and wrote and debited = 30 and replayed = false from cc006_call where label = 'chick-after')
  and (
    select count(*)
    from public.forecast_confirmations
    where account_id = 'c0060000-0000-4000-8000-000000000008'
      and ticket = 'chick-fil-a'
      and server_time = timestamptz '2026-11-15T20:00:00Z'
  ) = 1
  and (
    select count(*)
    from public.forecast_confirmations
    where account_id = 'c0060000-0000-4000-8000-000000000016'
      and ticket = 'chick-fil-a'
      and server_time = timestamptz '2026-11-15T20:00:01Z'
  ) = 1
  and not ('chick-fil-a' in ('main', 'openai', 'startup-launch', 'best-use-of-ai')),
  'a confirm that is not one of the four hackathon tickets is not refused by that clock'
);

select ok(
  (select committed and wrote and debited = 40 from cc006_call where label = 'same-main')
  and (select committed and wrote and debited = 40 from cc006_call where label = 'same-openai')
  and (
    select count(*)
    from public.forecast_confirmations
    where account_id = 'c0060000-0000-4000-8000-000000000009'
      and ticket = 'main'
      and place_first = 'North'
      and place_second = 'North'
      and place_third = 'North'
  ) = 1
  and (
    select count(*)
    from public.forecast_confirmations
    where account_id = 'c0060000-0000-4000-8000-000000000009'
      and ticket = 'openai'
      and team_name = 'North'
  ) = 1
  and (select coalesce(sum(amount), 0) from public.credit_ledger where account_id = 'c0060000-0000-4000-8000-000000000009') = 920,
  'the same team may be named on more than one ticket'
);

select ok(
  (select wrote = false and committed = false and debited = 0 from cc006_call where label = 'second')
  and (select count(*) from public.forecast_confirmations where account_id = 'c0060000-0000-4000-8000-000000000001') = 1
  and (select coalesce(sum(amount), 0) from public.credit_ledger where account_id = 'c0060000-0000-4000-8000-000000000001' and reason = 'position') = -10,
  'a second request for the same ticket writes nothing and does not debit again'
);

select ok(
  (select wrote = false and committed = false from cc006_call where label = 'unknown')
  and (select count(*) from public.forecast_confirmations where account_id = 'c0060000-0000-4000-8000-000000000013') = 0
  and (select coalesce(sum(amount), 0) from public.credit_ledger where account_id = 'c0060000-0000-4000-8000-000000000013') = 1000,
  'an unknown ticket writes nothing'
);

select ok(
  (select wrote = false and committed = false from cc006_call where label = 'missing-place')
  and (select count(*) from public.forecast_confirmations where account_id = 'c0060000-0000-4000-8000-000000000014') = 0,
  'a main confirm with a missing place writes nothing'
);

create temp table cc006_conn (
  connstr text not null
);

create temp table cc006_race_results (
  slot text primary key,
  ok boolean not null
);

do $connect$
declare
  v_candidate text;
  v_candidates text[] := array[
    format(
      'host=%s port=%s dbname=%s user=postgres password=postgres',
      inet_server_addr(),
      inet_server_port(),
      current_database()
    ),
    format('dbname=%s user=postgres', current_database()),
    format('dbname=%s user=postgres password=postgres', current_database()),
    format(
      'host=127.0.0.1 port=5432 dbname=%s user=postgres password=postgres',
      current_database()
    ),
    format('host=127.0.0.1 port=5432 dbname=%s user=postgres', current_database()),
    format('host=/var/run/postgresql dbname=%s user=postgres', current_database()),
    format(
      'host=/var/run/postgresql dbname=%s user=postgres password=postgres',
      current_database()
    )
  ];
begin
  if not exists (select 1 from pg_extension where extname = 'dblink') then
    begin
      create extension dblink with schema extensions;
    exception
      when others then
        create extension dblink;
    end;
  end if;

  foreach v_candidate in array v_candidates loop
    begin
      perform extensions.dblink_connect('cc006_probe', v_candidate);
      perform extensions.dblink_disconnect('cc006_probe');
      insert into cc006_conn (connstr) values (v_candidate);
      return;
    exception
      when undefined_function then
        begin
          perform public.dblink_connect('cc006_probe', v_candidate);
          perform public.dblink_disconnect('cc006_probe');
          insert into cc006_conn (connstr) values (v_candidate);
          return;
        exception
          when others then
            begin
              perform public.dblink_disconnect('cc006_probe');
            exception
              when others then
                null;
            end;
        end;
      when others then
        begin
          perform extensions.dblink_disconnect('cc006_probe');
        exception
          when others then
            begin
              perform public.dblink_disconnect('cc006_probe');
            exception
              when others then
                null;
            end;
        end;
    end;
  end loop;

  raise exception 'dblink could not open a second local connection';
end
$connect$;

do $race_setup$
declare
  v_connstr text;
  v_exec text;
  v_schema text;
  v_status text;
  v_sql text;
begin
  select connstr into strict v_connstr from cc006_conn;

  begin
    perform extensions.dblink_connect('cc006_c1', v_connstr);
    perform extensions.dblink_connect('cc006_c2', v_connstr);
    v_exec := 'extensions.dblink_exec';
  exception
    when undefined_function then
      perform public.dblink_connect('cc006_c1', v_connstr);
      perform public.dblink_connect('cc006_c2', v_connstr);
      v_exec := 'public.dblink_exec';
  end;

  v_schema := split_part(v_exec, '.', 1);

  v_sql := $cleanup$
    do $remote$
    begin
      drop function if exists public._cc006_race_confirm(
        uuid, text, numeric, uuid, text, text, text, text, timestamptz, integer, integer, integer, integer
      );
      delete from public.credit_ledger
      where account_id = 'c0060000-0000-4000-8000-0000000000aa';
      delete from public.forecast_confirmations
      where account_id = 'c0060000-0000-4000-8000-0000000000aa';
    end
    $remote$;
  $cleanup$;
  execute format('select %s($1, $2)', v_exec) into v_status using 'cc006_c1', v_sql;

  v_sql := $grant$
    insert into public.credit_ledger (id, account_id, amount, reason)
    values (
      'c0060000-0000-4000-8000-00000000aa01',
      'c0060000-0000-4000-8000-0000000000aa',
      1000,
      'grant'
    );
  $grant$;
  execute format('select %s($1, $2)', v_exec) into v_status using 'cc006_c1', v_sql;

  v_sql := $fn$
    create or replace function public._cc006_race_confirm(
      p_account_id uuid,
      p_ticket text,
      p_amount numeric,
      p_request_key uuid,
      p_place_first text,
      p_place_second text,
      p_place_third text,
      p_team_name text,
      p_server_time timestamptz,
      p_arrival integer,
      p_peer_arrival integer,
      p_seen integer,
      p_peer_seen integer
    ) returns boolean
    language plpgsql
    set search_path = ''
    as $race$
    declare
      v_deadline timestamptz;
      v_committed boolean;
      v_wrote boolean;
    begin
      perform pg_catalog.pg_advisory_lock(p_arrival);
      v_deadline := pg_catalog.clock_timestamp() + interval '10 seconds';
      loop
        exit when exists (
          select 1
          from pg_catalog.pg_locks
          where locktype = 'advisory'
            and classid = 0
            and objid = p_peer_arrival
            and objsubid = 1
            and granted
            and pid <> pg_catalog.pg_backend_pid()
        );
        if pg_catalog.clock_timestamp() > v_deadline then
          perform pg_catalog.pg_advisory_unlock(p_arrival);
          raise exception 'confirm race peer did not arrive';
        end if;
        perform pg_catalog.pg_sleep(0.01);
      end loop;

      perform pg_catalog.pg_advisory_lock(p_seen);
      v_deadline := pg_catalog.clock_timestamp() + interval '10 seconds';
      loop
        exit when exists (
          select 1
          from pg_catalog.pg_locks
          where locktype = 'advisory'
            and classid = 0
            and objid = p_peer_seen
            and objsubid = 1
            and granted
            and pid <> pg_catalog.pg_backend_pid()
        );
        if pg_catalog.clock_timestamp() > v_deadline then
          perform pg_catalog.pg_advisory_unlock(p_seen);
          perform pg_catalog.pg_advisory_unlock(p_arrival);
          raise exception 'confirm race peer was not seen';
        end if;
        perform pg_catalog.pg_sleep(0.01);
      end loop;

      perform pg_catalog.pg_advisory_unlock(p_arrival);
      v_deadline := pg_catalog.clock_timestamp() + interval '10 seconds';
      loop
        exit when not exists (
          select 1
          from pg_catalog.pg_locks
          where locktype = 'advisory'
            and classid = 0
            and objid = p_peer_arrival
            and objsubid = 1
            and granted
            and pid <> pg_catalog.pg_backend_pid()
        );
        if pg_catalog.clock_timestamp() > v_deadline then
          perform pg_catalog.pg_advisory_unlock(p_seen);
          raise exception 'confirm race peer did not confirm';
        end if;
        perform pg_catalog.pg_sleep(0.01);
      end loop;

      perform pg_catalog.pg_advisory_unlock(p_seen);
      select result.committed, result.wrote
        into v_committed, v_wrote
      from public.confirm_forecast_position(
        p_account_id,
        p_ticket,
        p_amount,
        p_request_key,
        p_place_first,
        p_place_second,
        p_place_third,
        p_team_name,
        p_server_time
      ) as result;
      return coalesce(v_committed, false) and coalesce(v_wrote, false);
    end;
    $race$;
  $fn$;
  execute format('select %s($1, $2)', v_exec) into v_status using 'cc006_c1', v_sql;

  v_sql := $revoke$
    revoke all on function public._cc006_race_confirm(
      uuid, text, numeric, uuid, text, text, text, text, timestamptz, integer, integer, integer, integer
    ) from public, anon, authenticated;
  $revoke$;
  execute format('select %s($1, $2)', v_exec) into v_status using 'cc006_c1', v_sql;

  execute format(
    'create or replace function public.cc006_send(conn text, sql text) returns integer language sql as $body$ select %I.dblink_send_query(conn, sql) $body$',
    v_schema
  );
  execute format(
    'create or replace function public.cc006_take(conn text) returns boolean language plpgsql as $body$ declare v boolean; begin select t.ok into v from %I.dblink_get_result(conn) as t(ok boolean); return v; end $body$',
    v_schema
  );
end
$race_setup$;

select ok(
  (select connstr from cc006_conn) = format(
    'host=%s port=%s dbname=%s user=postgres password=postgres',
    inet_server_addr(),
    inet_server_port(),
    current_database()
  ),
  'the overlapping confirms connect with the database server address'
);

select ok(
  (
    select coalesce(sum(amount), 0)
    from public.credit_ledger
    where account_id = 'c0060000-0000-4000-8000-0000000000aa'
  ) = 1000,
  'the race account starts with 1000 virtual credits'
);

select is(
  public.cc006_send(
    'cc006_c1',
    $q$
      select public._cc006_race_confirm(
        'c0060000-0000-4000-8000-0000000000aa'::uuid,
        'main',
        600,
        'c0062000-0000-4000-8000-0000000000a1'::uuid,
        'Alpha',
        'Beta',
        'Gamma',
        null,
        '2026-11-15T19:00:00Z'::timestamptz,
        93001,
        93002,
        93011,
        93012
      )
    $q$
  ),
  1,
  'first confirm session is dispatched'
);

select is(
  public.cc006_send(
    'cc006_c2',
    $q$
      select public._cc006_race_confirm(
        'c0060000-0000-4000-8000-0000000000aa'::uuid,
        'openai',
        600,
        'c0062000-0000-4000-8000-0000000000b2'::uuid,
        null,
        null,
        null,
        'Delta',
        '2026-11-15T19:00:00Z'::timestamptz,
        93002,
        93001,
        93012,
        93011
      )
    $q$
  ),
  1,
  'second confirm session is dispatched while the first is still waiting'
);

do $collect$
begin
  insert into cc006_race_results (slot, ok)
  values ('a', public.cc006_take('cc006_c1'));
  begin
    perform public.cc006_take('cc006_c1');
  exception
    when others then
      null;
  end;
  insert into cc006_race_results (slot, ok)
  values ('b', public.cc006_take('cc006_c2'));
  begin
    perform public.cc006_take('cc006_c2');
  exception
    when others then
      null;
  end;
end
$collect$;

select is(
  (select count(*) from cc006_race_results where ok),
  1::bigint,
  'two overlapping database transactions on one account whose combined spend exceeds the balance: one commits'
);

select is(
  (select count(*) from cc006_race_results),
  2::bigint,
  'both overlapping confirm sessions returned'
);

select ok(
  (select count(*) from public.forecast_confirmations where account_id = 'c0060000-0000-4000-8000-0000000000aa') = 1
  and (select count(*) from public.credit_ledger where account_id = 'c0060000-0000-4000-8000-0000000000aa' and reason = 'position') = 1
  and (select coalesce(sum(amount), 0) from public.credit_ledger where account_id = 'c0060000-0000-4000-8000-0000000000aa' and reason = 'position') = -600
  and (select coalesce(sum(amount), 0) from public.credit_ledger where account_id = 'c0060000-0000-4000-8000-0000000000aa') = 400
  and 600 + 600 > 1000,
  'the other overlapping confirm writes nothing'
);

do $cleanup$
declare
  v_exec text;
  v_status text;
begin
  if to_regprocedure('extensions.dblink_exec(text, text)') is not null then
    v_exec := 'extensions.dblink_exec';
  else
    v_exec := 'public.dblink_exec';
  end if;

  execute format('select %s($1, $2)', v_exec)
    into v_status
    using 'cc006_c1', $remote$
      do $inner$
      begin
        drop function if exists public._cc006_race_confirm(
          uuid, text, numeric, uuid, text, text, text, text, timestamptz, integer, integer, integer, integer
        );
        delete from public.credit_ledger
        where account_id = 'c0060000-0000-4000-8000-0000000000aa';
        delete from public.forecast_confirmations
        where account_id = 'c0060000-0000-4000-8000-0000000000aa';
      end
      $inner$;
    $remote$;

  begin
    perform extensions.dblink_disconnect('cc006_c1');
    perform extensions.dblink_disconnect('cc006_c2');
  exception
    when undefined_function then
      perform public.dblink_disconnect('cc006_c1');
      perform public.dblink_disconnect('cc006_c2');
  end;
end
$cleanup$;

set local role anon;

select throws_ok(
  $sql$
    select * from public.confirm_forecast_position(
      'c0060000-0000-4000-8000-000000000099'::uuid,
      'main',
      1,
      'c0069000-0000-4000-8000-000000000099'::uuid,
      'A',
      'B',
      'C',
      null,
      '2026-11-15T19:00:00Z'::timestamptz
    )
  $sql$,
  '42501',
  null,
  'anon cannot execute forecast confirmation'
);

select throws_ok(
  $sql$
    insert into public.forecast_confirmations (
      account_id,
      ticket,
      request_key,
      place_first,
      place_second,
      place_third,
      amount,
      server_time
    ) values (
      'c0060000-0000-4000-8000-000000000099',
      'main',
      'c0069000-0000-4000-8000-000000000099',
      'A',
      'B',
      'C',
      1,
      '2026-11-15T19:00:00Z'
    )
  $sql$,
  '42501',
  null,
  'anon cannot insert a confirmation'
);

select throws_ok(
  $sql$
    insert into public.credit_ledger (account_id, amount, reason)
    values ('c0060000-0000-4000-8000-000000000099', -1, 'position')
  $sql$,
  '42501',
  null,
  'anon cannot insert a debit'
);

set local role authenticated;
set local request.jwt.claims = '{"sub":"c0060000-0000-4000-8000-000000000001","role":"authenticated"}';
set local request.jwt.claim.sub = 'c0060000-0000-4000-8000-000000000001';

select is(
  (select count(*) from public.forecast_confirmations),
  1::bigint,
  'authenticated selects only their own forecast confirmation'
);

select throws_ok(
  $sql$
    select * from public.confirm_forecast_position(
      'c0060000-0000-4000-8000-000000000001'::uuid,
      'openai',
      1,
      'c0069000-0000-4000-8000-000000000098'::uuid,
      null,
      null,
      null,
      'North',
      '2026-11-15T19:00:00Z'::timestamptz
    )
  $sql$,
  '42501',
  null,
  'authenticated cannot execute forecast confirmation'
);

select throws_ok(
  $sql$
    insert into public.forecast_confirmations (
      account_id,
      ticket,
      request_key,
      team_name,
      amount,
      server_time
    ) values (
      'c0060000-0000-4000-8000-000000000001',
      'openai',
      'c0069000-0000-4000-8000-000000000098',
      'North',
      1,
      '2026-11-15T19:00:00Z'
    )
  $sql$,
  '42501',
  null,
  'authenticated cannot insert a confirmation'
);

select throws_ok(
  $sql$
    insert into public.credit_ledger (account_id, amount, reason)
    values ('c0060000-0000-4000-8000-000000000001', -1, 'position')
  $sql$,
  '42501',
  null,
  'authenticated cannot insert a debit'
);

select * from finish();
rollback;
