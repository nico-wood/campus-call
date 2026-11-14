-- One persistent participant grant. Two connections grant one normalized email.
-- A second call in the same session is not this race.
-- Device-local demo storage is not a ledger row.

begin;
select plan(50);

select is(
  public.normalize_participant_name('  Ada   Lovelace  '),
  'Ada Lovelace',
  'name is trimmed and internal whitespace is collapsed'
);

select is(
  public.normalize_participant_name('   '),
  null::text,
  'a blank name is rejected'
);

select is(
  public.normalize_participant_name(repeat('a', 81)),
  null::text,
  'a name longer than 80 characters is rejected'
);

select is(
  public.normalize_participant_name(repeat('a', 80)),
  repeat('a', 80),
  'a name of 80 characters is kept'
);

select is(
  public.normalize_participant_name(E'Ada\x7fLovelace'),
  null::text,
  'a name with a control character is rejected'
);

select is(
  public.normalize_participant_name(E'Ada\tLovelace'),
  'Ada Lovelace',
  'an internal tab in a name collapses to a space'
);

select is(
  public.normalize_participant_email('  Ada@Example.COM '),
  'ada@example.com',
  'email is trimmed and lowercased'
);

select is(
  public.normalize_participant_email('ada@example'),
  null::text,
  'an email domain without a dot is rejected'
);

select is(
  public.normalize_participant_email('a@b.c'),
  null::text,
  'an email whose last label is one letter is rejected'
);

select is(
  public.normalize_participant_email('ada@@example.com'),
  null::text,
  'an email with two @ signs is rejected'
);

select is(
  public.normalize_participant_email('a..b@example.com'),
  null::text,
  'an email local part with a repeated dot is rejected'
);

select ok(
  exists (
    select 1
    from pg_proc as proc
    join pg_namespace as ns on ns.oid = proc.pronamespace
    where ns.nspname = 'public'
      and proc.proname = 'grant_hackathon_participant_credits'
      and proc.prosecdef
      and exists (
        select 1
        from unnest(coalesce(proc.proconfig, array[]::text[])) as cfg
        where cfg like 'search_path=%'
      )
  ),
  'grant_hackathon_participant_credits is security definer and pins search_path'
);

select is(
  pg_get_function_identity_arguments(
    'public.grant_hackathon_participant_credits(uuid, text, text)'::regprocedure
  ),
  'p_account_id uuid, p_name text, p_email text',
  'grant inputs are the account, name, and email'
);

select ok(
  pg_get_function_arguments(
    'public.grant_hackathon_participant_credits(uuid, text, text)'::regprocedure
  ) !~* 'flag|header|query|demo|amount|device|qr',
  'a client flag, query, header, or demo value is not a grant input'
);

select ok(
  pg_get_functiondef(
    'public.grant_hackathon_participant_credits(uuid, text, text)'::regprocedure
  ) !~* 'device|local_storage|localstorage|demo',
  'the grant function does not read device-local demo storage'
);

select ok(
  exists (
    select 1
    from pg_proc as proc
    join pg_namespace as ns on ns.oid = proc.pronamespace
    where ns.nspname = 'public'
      and proc.proname = 'record_hackathon_qr_context'
      and proc.prosecdef
      and exists (
        select 1
        from unnest(coalesce(proc.proconfig, array[]::text[])) as cfg
        where cfg like 'search_path=%'
      )
  ),
  'record_hackathon_qr_context is security definer and pins search_path'
);

select is(
  pg_get_function_identity_arguments(
    'public.record_hackathon_qr_context(uuid)'::regprocedure
  ),
  'p_account_id uuid',
  'QR context input is the account only'
);

select ok(
  exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'credit_ledger_one_grant_per_account'
  ),
  'the existing per-account grant index remains'
);

select ok(
  exists (
    select 1
    from pg_index as idx
    join pg_class as rel on rel.oid = idx.indexrelid
    join pg_namespace as ns on ns.oid = rel.relnamespace
    where ns.nspname = 'public'
      and rel.relname = 'credit_ledger_one_grant_per_normalized_email'
      and idx.indisunique
  ),
  'normalized email is a unique grant key'
);

select ok(
  not has_function_privilege(
    'anon',
    'public.grant_hackathon_participant_credits(uuid, text, text)',
    'execute'
  ),
  'anon is not granted the participant grant'
);

select ok(
  not has_function_privilege(
    'authenticated',
    'public.grant_hackathon_participant_credits(uuid, text, text)',
    'execute'
  ),
  'authenticated is not granted the participant grant'
);

select ok(
  has_function_privilege(
    'service_role',
    'public.grant_hackathon_participant_credits(uuid, text, text)',
    'execute'
  ),
  'service_role can execute the participant grant'
);

select ok(
  not has_function_privilege(
    'anon',
    'public.record_hackathon_qr_context(uuid)',
    'execute'
  ),
  'anon is not granted QR context recording'
);

select ok(
  not has_function_privilege(
    'authenticated',
    'public.record_hackathon_qr_context(uuid)',
    'execute'
  ),
  'authenticated is not granted QR context recording'
);

do $local$
begin
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  ) values
    (
      '00000000-0000-0000-0000-000000000000',
      'c0050000-0000-4000-8000-000000000011',
      'authenticated',
      'authenticated',
      'cc005-local@campus-call.test',
      '',
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      now(),
      now()
    ),
    (
      '00000000-0000-0000-0000-000000000000',
      'c0050000-0000-4000-8000-000000000022',
      'authenticated',
      'authenticated',
      'cc005-noqr@campus-call.test',
      '',
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      now(),
      now()
    );

  perform public.record_hackathon_qr_context('c0050000-0000-4000-8000-000000000011'::uuid);
end
$local$;

select is(
  public.grant_hackathon_participant_credits(
    'c0050000-0000-4000-8000-000000000011'::uuid,
    'Ada Lovelace',
    'a@b.c'
  ),
  false,
  'a bad email grants nothing'
);

select is(
  (
    select count(*)
    from public.credit_ledger
    where account_id = 'c0050000-0000-4000-8000-000000000011'
  ),
  0::bigint,
  'a bad email inserts no grant row'
);

select is(
  public.grant_hackathon_participant_credits(
    'c0050000-0000-4000-8000-000000000011'::uuid,
    E'Ada\x7f',
    'ada-local@example.com'
  ),
  false,
  'a bad name grants nothing'
);

select is(
  (
    select count(*)
    from public.credit_ledger
    where account_id = 'c0050000-0000-4000-8000-000000000011'
  ),
  0::bigint,
  'a bad name inserts no grant row'
);

select is(
  public.grant_hackathon_participant_credits(
    'c0050000-0000-4000-8000-000000000022'::uuid,
    'Grace Hopper',
    'grace@example.com'
  ),
  false,
  'a valid name and email without hackathon QR context grants nothing'
);

select is(
  (
    select count(*)
    from public.credit_ledger
    where account_id = 'c0050000-0000-4000-8000-000000000022'
  ),
  0::bigint,
  'missing QR context inserts no grant row'
);

create temp table cc005_conn (
  connstr text not null
);

create temp table cc005_race_results (
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
      perform extensions.dblink_connect('cc005_probe', v_candidate);
      perform extensions.dblink_disconnect('cc005_probe');
      insert into cc005_conn (connstr) values (v_candidate);
      return;
    exception
      when undefined_function then
        begin
          perform public.dblink_connect('cc005_probe', v_candidate);
          perform public.dblink_disconnect('cc005_probe');
          insert into cc005_conn (connstr) values (v_candidate);
          return;
        exception
          when others then
            begin
              perform public.dblink_disconnect('cc005_probe');
            exception
              when others then
                null;
            end;
        end;
      when others then
        begin
          perform extensions.dblink_disconnect('cc005_probe');
        exception
          when others then
            begin
              perform public.dblink_disconnect('cc005_probe');
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
  select connstr into strict v_connstr from cc005_conn;

  begin
    perform extensions.dblink_connect('c1', v_connstr);
    perform extensions.dblink_connect('c2', v_connstr);
    v_exec := 'extensions.dblink_exec';
  exception
    when undefined_function then
      perform public.dblink_connect('c1', v_connstr);
      perform public.dblink_connect('c2', v_connstr);
      v_exec := 'public.dblink_exec';
  end;

  v_schema := split_part(v_exec, '.', 1);

  v_sql := $cleanup$
    do $remote$
    begin
      drop function if exists public._cc005_race_grant(uuid, text, text, integer, integer, integer, integer);
      delete from public.credit_ledger
      where normalized_email = 'ada@example.com'
         or account_id in (
           'a0050000-0000-4000-8000-0000000000a1',
           'a0050000-0000-4000-8000-0000000000b2'
         );
      delete from public.hackathon_qr_contexts
      where account_id in (
        'a0050000-0000-4000-8000-0000000000a1',
        'a0050000-0000-4000-8000-0000000000b2'
      );
      delete from public.profiles
      where id in (
        'a0050000-0000-4000-8000-0000000000a1',
        'a0050000-0000-4000-8000-0000000000b2'
      );
      begin
        delete from auth.identities
        where user_id in (
          'a0050000-0000-4000-8000-0000000000a1',
          'a0050000-0000-4000-8000-0000000000b2'
        );
      exception
        when undefined_table then
          null;
      end;
      delete from auth.users
      where id in (
        'a0050000-0000-4000-8000-0000000000a1',
        'a0050000-0000-4000-8000-0000000000b2'
      );
    end
    $remote$;
  $cleanup$;
  execute format('select %s($1, $2)', v_exec) into v_status using 'c1', v_sql;

  v_sql := $users$
    do $remote$
    begin
      insert into auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at
      ) values
        (
          '00000000-0000-0000-0000-000000000000',
          'a0050000-0000-4000-8000-0000000000a1',
          'authenticated',
          'authenticated',
          'cc005-a@campus-call.test',
          '',
          now(),
          '{"provider":"email","providers":["email"]}'::jsonb,
          '{}'::jsonb,
          now(),
          now()
        ),
        (
          '00000000-0000-0000-0000-000000000000',
          'a0050000-0000-4000-8000-0000000000b2',
          'authenticated',
          'authenticated',
          'cc005-b@campus-call.test',
          '',
          now(),
          '{"provider":"email","providers":["email"]}'::jsonb,
          '{}'::jsonb,
          now(),
          now()
        );
      perform public.record_hackathon_qr_context('a0050000-0000-4000-8000-0000000000a1'::uuid);
      perform public.record_hackathon_qr_context('a0050000-0000-4000-8000-0000000000b2'::uuid);
    end
    $remote$;
  $users$;
  execute format('select %s($1, $2)', v_exec) into v_status using 'c1', v_sql;

  v_sql := $fn$
    create or replace function public._cc005_race_grant(
      p_account_id uuid,
      p_name text,
      p_email text,
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
          raise exception 'grant race peer did not arrive';
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
          raise exception 'grant race peer was not seen';
        end if;
        perform pg_catalog.pg_sleep(0.01);
      end loop;

      -- Both seen locks are held. Release arrival only after that, and wait until
      -- the peer releases arrival too. A released lock stays released, so neither
      -- session can miss a lock the other already dropped.
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
          raise exception 'grant race peer did not confirm';
        end if;
        perform pg_catalog.pg_sleep(0.01);
      end loop;

      perform pg_catalog.pg_advisory_unlock(p_seen);
      return public.grant_hackathon_participant_credits(p_account_id, p_name, p_email);
    end;
    $race$;
  $fn$;
  execute format('select %s($1, $2)', v_exec) into v_status using 'c1', v_sql;

  v_sql := $revoke$
    revoke all on function public._cc005_race_grant(uuid, text, text, integer, integer, integer, integer)
      from public, anon, authenticated;
  $revoke$;
  execute format('select %s($1, $2)', v_exec) into v_status using 'c1', v_sql;

  execute format(
    'create or replace function public.cc005_send(conn text, sql text) returns integer language sql as $body$ select %I.dblink_send_query(conn, sql) $body$',
    v_schema
  );
  execute format(
    'create or replace function public.cc005_take(conn text) returns boolean language plpgsql as $body$ declare v boolean; begin select t.ok into v from %I.dblink_get_result(conn) as t(ok boolean); return v; end $body$',
    v_schema
  );
  execute format(
    'create or replace function public.cc005_bool(conn text, sql text) returns boolean language plpgsql as $body$ declare v boolean; begin select t.ok into v from %I.dblink(conn, sql) as t(ok boolean); return v; end $body$',
    v_schema
  );
end
$race_setup$;

select is(
  public.cc005_send(
    'c1',
    $q$
      select public._cc005_race_grant(
        'a0050000-0000-4000-8000-0000000000a1'::uuid,
        '  Ada   Lovelace  ',
        '  Ada@Example.COM ',
        91001,
        91002,
        91011,
        91012
      )
    $q$
  ),
  1,
  'first grant session is dispatched'
);

select is(
  public.cc005_send(
    'c2',
    $q$
      select public._cc005_race_grant(
        'a0050000-0000-4000-8000-0000000000b2'::uuid,
        'Ada Lovelace',
        'ada@example.com',
        91002,
        91001,
        91012,
        91011
      )
    $q$
  ),
  1,
  'second grant session is dispatched while the first is still waiting'
);

do $collect$
begin
  insert into cc005_race_results (slot, ok)
  values ('a', public.cc005_take('c1'));
  begin
    perform public.cc005_take('c1');
  exception
    when others then
      null;
  end;
  insert into cc005_race_results (slot, ok)
  values ('b', public.cc005_take('c2'));
  begin
    perform public.cc005_take('c2');
  exception
    when others then
      null;
  end;
end
$collect$;

select is(
  (
    select count(*)
    from public.credit_ledger
    where reason = 'grant'
      and normalized_email = 'ada@example.com'
  ),
  1::bigint,
  'two concurrent grants of one normalized email insert one row'
);

select is(
  (select count(*) from cc005_race_results where ok),
  1::bigint,
  'exactly one of the two concurrent grant calls inserts'
);

select is(
  (select count(*) from cc005_race_results),
  2::bigint,
  'both grant sessions returned'
);

select ok(
  (
    select coalesce(sum(amount), 0)
    from public.credit_ledger
    where reason = 'grant'
      and normalized_email = 'ada@example.com'
  ) = 1000,
  'concurrent grants add 1000 virtual credits once'
);

select is(
  (
    select normalized_email
    from public.credit_ledger
    where reason = 'grant'
      and normalized_email = 'ada@example.com'
  ),
  'ada@example.com',
  'the stored grant email is normalized'
);

select is(
  (
    select participant_name
    from public.credit_ledger
    where reason = 'grant'
      and normalized_email = 'ada@example.com'
  ),
  'Ada Lovelace',
  'the stored grant name is normalized'
);

select is(
  (
    select entry_context
    from public.credit_ledger
    where reason = 'grant'
      and normalized_email = 'ada@example.com'
  ),
  'hackathon-qr',
  'the grant records hackathon QR context'
);

select is(
  public.cc005_bool(
    'c1',
    $q$
      select public.grant_hackathon_participant_credits(
        'a0050000-0000-4000-8000-0000000000a1'::uuid,
        'Ada Lovelace',
        'ADA@example.com'
      )
    $q$
  ),
  false,
  'a revisit does not regrant'
);

select is(
  (
    select count(*)
    from public.credit_ledger
    where reason = 'grant'
      and normalized_email = 'ada@example.com'
  ),
  1::bigint,
  'a revisit inserts no second grant row'
);

select ok(
  (
    select coalesce(sum(amount), 0)
    from public.credit_ledger
    where reason = 'grant'
      and normalized_email = 'ada@example.com'
  ) = 1000,
  'a revisit does not add credits'
);

select is(
  public.cc005_bool(
    'c2',
    $q$
      select public.grant_hackathon_participant_credits(
        'a0050000-0000-4000-8000-0000000000b2'::uuid,
        'Ada Lovelace',
        ' ada@example.com '
      )
    $q$
  ),
  false,
  'a second account with the same normalized email does not get a grant'
);

select is(
  (
    select count(*)
    from public.credit_ledger
    where reason = 'grant'
      and account_id in (
        'a0050000-0000-4000-8000-0000000000a1',
        'a0050000-0000-4000-8000-0000000000b2'
      )
  ),
  1::bigint,
  'the normalized email, not only account_id, keeps a single grant'
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
    using 'c1', $remote$
      do $inner$
      begin
        drop function if exists public._cc005_race_grant(uuid, text, text, integer, integer, integer, integer);
        delete from public.credit_ledger
        where normalized_email = 'ada@example.com'
           or account_id in (
             'a0050000-0000-4000-8000-0000000000a1',
             'a0050000-0000-4000-8000-0000000000b2'
           );
        delete from public.hackathon_qr_contexts
        where account_id in (
          'a0050000-0000-4000-8000-0000000000a1',
          'a0050000-0000-4000-8000-0000000000b2'
        );
        delete from public.profiles
        where id in (
          'a0050000-0000-4000-8000-0000000000a1',
          'a0050000-0000-4000-8000-0000000000b2'
        );
        begin
          delete from auth.identities
          where user_id in (
            'a0050000-0000-4000-8000-0000000000a1',
            'a0050000-0000-4000-8000-0000000000b2'
          );
        exception
          when undefined_table then
            null;
        end;
        delete from auth.users
        where id in (
          'a0050000-0000-4000-8000-0000000000a1',
          'a0050000-0000-4000-8000-0000000000b2'
        );
      end
      $inner$;
    $remote$;

  begin
    perform extensions.dblink_disconnect('c1');
    perform extensions.dblink_disconnect('c2');
  exception
    when undefined_function then
      perform public.dblink_disconnect('c1');
      perform public.dblink_disconnect('c2');
  end;
end
$cleanup$;

set local role anon;

select throws_ok(
  $sql$
    select public.grant_hackathon_participant_credits(
      'c0050000-0000-4000-8000-000000000011'::uuid,
      'Ada Lovelace',
      'ada@example.com'
    )
  $sql$,
  '42501',
  null,
  'anon cannot execute the participant grant'
);

select throws_ok(
  $sql$
    insert into public.credit_ledger (account_id, amount, reason, normalized_email, participant_name, entry_context)
    values ('c0050000-0000-4000-8000-000000000011', 1000, 'grant', 'ada@example.com', 'Ada Lovelace', 'hackathon-qr')
  $sql$,
  '42501',
  null,
  'anon cannot insert a grant'
);

select throws_ok(
  $sql$
    insert into public.hackathon_qr_contexts (account_id)
    values ('c0050000-0000-4000-8000-000000000011')
  $sql$,
  '42501',
  null,
  'anon cannot insert hackathon QR context'
);

set local role authenticated;
set local request.jwt.claims = '{"sub":"c0050000-0000-4000-8000-000000000011","role":"authenticated"}';
set local request.jwt.claim.sub = 'c0050000-0000-4000-8000-000000000011';

select throws_ok(
  $sql$
    select public.grant_hackathon_participant_credits(
      'c0050000-0000-4000-8000-000000000011'::uuid,
      'Ada Lovelace',
      'ada@example.com'
    )
  $sql$,
  '42501',
  null,
  'authenticated cannot execute the participant grant'
);

select throws_ok(
  $sql$
    insert into public.credit_ledger (account_id, amount, reason, normalized_email, participant_name, entry_context)
    values ('c0050000-0000-4000-8000-000000000011', 1000, 'grant', 'ada@example.com', 'Ada Lovelace', 'hackathon-qr')
  $sql$,
  '42501',
  null,
  'authenticated cannot insert a grant'
);

select throws_ok(
  $sql$
    insert into public.hackathon_qr_contexts (account_id)
    values ('c0050000-0000-4000-8000-000000000011')
  $sql$,
  '42501',
  null,
  'authenticated cannot insert hackathon QR context'
);

select * from finish();
rollback;
