-- One hackathon participant grant of 1000 virtual credits.
-- The unique key is the normalized email. The per-account grant index stays.
-- Device-local demo storage is not read and is not copied into the ledger.
-- Anon and authenticated cannot insert a grant. This step does not buy or redeem credits.

create or replace function public.participant_js_whitespace(p_code integer)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select p_code in (9, 10, 11, 12, 13, 32, 160, 5760, 8232, 8233, 8239, 8287, 12288, 65279)
    or p_code between 8192 and 8202;
$$;

create or replace function public.normalize_participant_name(p_name text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_name text := '';
  v_index integer;
  v_length integer;
  v_char text;
  v_code integer;
  v_previous_ws boolean := false;
begin
  if p_name is null then
    return null;
  end if;

  v_length := pg_catalog.char_length(p_name);
  v_index := 1;
  while v_index <= v_length loop
    v_char := pg_catalog.substring(p_name, v_index, 1);
    v_code := pg_catalog.ascii(v_char);
    if public.participant_js_whitespace(v_code) then
      if v_name <> '' and not v_previous_ws then
        v_name := v_name || ' ';
        v_previous_ws := true;
      end if;
    else
      v_name := v_name || v_char;
      v_previous_ws := false;
    end if;
    v_index := v_index + 1;
  end loop;

  if v_previous_ws then
    v_name := pg_catalog.left(v_name, pg_catalog.char_length(v_name) - 1);
  end if;

  if pg_catalog.char_length(v_name) < 1 or pg_catalog.char_length(v_name) > 80 then
    return null;
  end if;

  v_index := 1;
  v_length := pg_catalog.char_length(v_name);
  while v_index <= v_length loop
    v_code := pg_catalog.ascii(pg_catalog.substring(v_name, v_index, 1));
    if v_code <= 31 or v_code = 127 then
      return null;
    end if;
    v_index := v_index + 1;
  end loop;

  return v_name;
end;
$$;

create or replace function public.normalize_participant_email(p_email text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_email text;
  v_at integer;
  v_local text;
  v_domain text;
  v_labels text[];
  v_label text;
begin
  if p_email is null then
    return null;
  end if;

  v_email := p_email;
  while pg_catalog.char_length(v_email) > 0
    and public.participant_js_whitespace(pg_catalog.ascii(pg_catalog.left(v_email, 1)))
  loop
    v_email := pg_catalog.right(v_email, pg_catalog.char_length(v_email) - 1);
  end loop;
  while pg_catalog.char_length(v_email) > 0
    and public.participant_js_whitespace(pg_catalog.ascii(pg_catalog.right(v_email, 1)))
  loop
    v_email := pg_catalog.left(v_email, pg_catalog.char_length(v_email) - 1);
  end loop;

  v_email := pg_catalog.lower(v_email);
  if pg_catalog.char_length(v_email) < 6 or pg_catalog.char_length(v_email) > 254 then
    return null;
  end if;

  v_at := pg_catalog.strpos(v_email, '@');
  if v_at <= 1 then
    return null;
  end if;
  if pg_catalog.strpos(pg_catalog.substr(v_email, v_at + 1), '@') <> 0 then
    return null;
  end if;

  v_local := pg_catalog.substr(v_email, 1, v_at - 1);
  v_domain := pg_catalog.substr(v_email, v_at + 1);
  if v_local !~ '^[a-z0-9.!#$%&''*+/=?^_`{|}~-]+$' then
    return null;
  end if;
  if pg_catalog.left(v_local, 1) = '.'
    or pg_catalog.right(v_local, 1) = '.'
    or pg_catalog.strpos(v_local, '..') > 0
  then
    return null;
  end if;
  if v_domain !~ '^[a-z0-9.-]+$' then
    return null;
  end if;

  v_labels := pg_catalog.string_to_array(v_domain, '.');
  if pg_catalog.cardinality(v_labels) < 2 then
    return null;
  end if;
  foreach v_label in array v_labels loop
    if pg_catalog.char_length(v_label) = 0
      or pg_catalog.char_length(v_label) > 63
      or pg_catalog.left(v_label, 1) = '-'
      or pg_catalog.right(v_label, 1) = '-'
    then
      return null;
    end if;
  end loop;
  if v_labels[pg_catalog.cardinality(v_labels)] !~ '^[a-z]{2,}$' then
    return null;
  end if;

  return v_email;
end;
$$;

alter table public.credit_ledger
  add column normalized_email text,
  add column participant_name text,
  add column entry_context text,
  add constraint credit_ledger_participant_grant_shape_check check (
    (
      normalized_email is null
      and participant_name is null
      and entry_context is null
    )
    or (
      reason = 'grant'
      and amount = 1000
      and entry_context = 'hackathon-qr'
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

-- Legacy grants leave normalized_email null, so they stay one-per-account only.
create unique index credit_ledger_one_grant_per_normalized_email
  on public.credit_ledger (normalized_email)
  where reason = 'grant' and normalized_email is not null;

create table public.hackathon_qr_contexts (
  account_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.hackathon_qr_contexts enable row level security;

revoke all on table public.hackathon_qr_contexts from public, anon, authenticated;
grant all on table public.hackathon_qr_contexts to service_role;

create or replace function public.record_hackathon_qr_context(p_account_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_account_id is null then
    raise exception 'account is required' using errcode = '22023';
  end if;

  insert into public.hackathon_qr_contexts (account_id)
  values (p_account_id)
  on conflict (account_id) do nothing;
end;
$$;

create or replace function public.grant_hackathon_participant_credits(
  p_account_id uuid,
  p_name text,
  p_email text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text;
  v_email text;
begin
  if p_account_id is null then
    return false;
  end if;

  v_name := public.normalize_participant_name(p_name);
  v_email := public.normalize_participant_email(p_email);
  if v_name is null or v_email is null then
    return false;
  end if;

  if not exists (
    select 1
    from public.hackathon_qr_contexts
    where account_id = p_account_id
  ) then
    return false;
  end if;

  -- Serialize same-email grants. The unique index is the backstop.
  perform pg_catalog.pg_advisory_xact_lock(405005, pg_catalog.hashtext(v_email));
  perform pg_catalog.pg_advisory_xact_lock(405006, pg_catalog.hashtext(p_account_id::text));

  if exists (
    select 1
    from public.credit_ledger
    where reason = 'grant'
      and normalized_email = v_email
  ) then
    return false;
  end if;

  if exists (
    select 1
    from public.credit_ledger
    where account_id = p_account_id::text
      and reason = 'grant'
  ) then
    return false;
  end if;

  begin
    insert into public.credit_ledger (
      id,
      account_id,
      amount,
      reason,
      normalized_email,
      participant_name,
      entry_context,
      created_at
    ) values (
      pg_catalog.gen_random_uuid(),
      p_account_id::text,
      1000,
      'grant',
      v_email,
      v_name,
      'hackathon-qr',
      pg_catalog.now()
    );
    return true;
  exception
    when unique_violation then
      return false;
  end;
end;
$$;

revoke all on function public.participant_js_whitespace(integer) from public, anon, authenticated;
revoke all on function public.normalize_participant_name(text) from public, anon, authenticated;
revoke all on function public.normalize_participant_email(text) from public, anon, authenticated;
revoke all on function public.record_hackathon_qr_context(uuid) from public, anon, authenticated;
revoke all on function public.grant_hackathon_participant_credits(uuid, text, text) from public, anon, authenticated;

grant execute on function public.participant_js_whitespace(integer) to service_role;
grant execute on function public.normalize_participant_name(text) to service_role;
grant execute on function public.normalize_participant_email(text) to service_role;
grant execute on function public.record_hackathon_qr_context(uuid) to service_role;
grant execute on function public.grant_hackathon_participant_credits(uuid, text, text) to service_role;

comment on function public.grant_hackathon_participant_credits(uuid, text, text) is
  'Inserts one 1000 virtual-credit grant after a server-recorded hackathon QR context and a validated name and email. The same normalized email inserts nothing later.';

comment on function public.record_hackathon_qr_context(uuid) is
  'Records that the server already accepted the hackathon QR door for this account. It takes no client flag, query, or header.';
