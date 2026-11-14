-- Atomic forecast confirmation.
-- A position spends a positive whole number of virtual credits only when the
-- balance covers it. The balance is the sum of ledger amounts for that account.
-- An overspend writes nothing. A replay returns the stored confirmation and
-- does not debit again.
-- The four hackathon tickets lock at 2026-11-15T20:00:00Z. Chick-fil-A is not
-- one of those four and is not refused by that clock.
-- No client flag, query, or header selects the amount or skips the lock.

alter table public.credit_ledger
  drop constraint credit_ledger_reason_check;

alter table public.credit_ledger
  add constraint credit_ledger_reason_check check (
    reason in ('subsidy', 'trade', 'redemption', 'grant', 'position')
  );

create table public.forecast_confirmations (
  id uuid primary key default gen_random_uuid(),
  account_id text not null,
  ticket text not null,
  request_key uuid not null,
  place_first text,
  place_second text,
  place_third text,
  team_name text,
  amount numeric not null,
  server_time timestamptz not null,
  created_at timestamptz not null default now(),
  constraint forecast_confirmations_ticket_check check (
    ticket in ('main', 'openai', 'startup-launch', 'best-use-of-ai', 'chick-fil-a')
  ),
  constraint forecast_confirmations_amount_check check (
    amount > 0
    and amount = trunc(amount)
  ),
  constraint forecast_confirmations_position_check check (
    (
      ticket = 'main'
      and place_first is not null
      and char_length(btrim(place_first)) >= 1
      and place_second is not null
      and char_length(btrim(place_second)) >= 1
      and place_third is not null
      and char_length(btrim(place_third)) >= 1
      and team_name is null
    )
    or (
      ticket in ('openai', 'startup-launch', 'best-use-of-ai', 'chick-fil-a')
      and team_name is not null
      and char_length(btrim(team_name)) >= 1
      and place_first is null
      and place_second is null
      and place_third is null
    )
  ),
  constraint forecast_confirmations_one_request unique (account_id, request_key),
  constraint forecast_confirmations_one_ticket unique (account_id, ticket)
);

alter table public.credit_ledger
  add column confirmation_id uuid references public.forecast_confirmations (id);

create unique index credit_ledger_one_position_debit
  on public.credit_ledger (confirmation_id)
  where reason = 'position' and confirmation_id is not null;

alter table public.forecast_confirmations enable row level security;

revoke all on table public.forecast_confirmations from public, anon, authenticated;
grant select on table public.forecast_confirmations to authenticated;
grant all on table public.forecast_confirmations to service_role;

create policy forecast_confirmations_select_own
  on public.forecast_confirmations
  for select
  to authenticated
  using (account_id = (select auth.uid())::text);

create or replace function public.confirm_forecast_position(
  p_account_id uuid,
  p_ticket text,
  p_amount numeric,
  p_request_key uuid,
  p_place_first text,
  p_place_second text,
  p_place_third text,
  p_team_name text,
  p_server_time timestamptz
)
returns table (
  confirmation_id uuid,
  committed boolean,
  wrote boolean,
  debited numeric,
  replayed boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_committed boolean := false;
  v_wrote boolean := false;
  v_debited numeric := 0;
  v_replayed boolean := false;
  v_balance numeric;
  v_time timestamptz;
  v_first text;
  v_second text;
  v_third text;
  v_team text;
  v_ok boolean;
begin
  -- Server clock only. The four hackathon tickets refuse at and after
  -- 2026-11-15T20:00:00Z when this request has no earlier commit.
  -- Chick-fil-A is not one of the four.
  -- A repeated request key returns the stored confirmation.
  if p_account_id is not null and p_request_key is not null then
    perform pg_catalog.pg_advisory_xact_lock(406006, pg_catalog.hashtext(p_account_id::text));

    select existing.id
      into v_id
    from public.forecast_confirmations as existing
    where existing.account_id = p_account_id::text
      and existing.request_key = p_request_key;

    if v_id is not null then
      v_committed := true;
      v_replayed := true;
    else
      v_ok := true;
      v_time := coalesce(p_server_time, pg_catalog.clock_timestamp());

      if p_amount is null
        or p_amount <= 0
        or p_amount = 'NaN'::numeric
        or p_amount <> pg_catalog.trunc(p_amount)
      then
        v_ok := false;
      end if;

      if v_ok and p_ticket = 'main' then
        v_first := pg_catalog.btrim(p_place_first);
        v_second := pg_catalog.btrim(p_place_second);
        v_third := pg_catalog.btrim(p_place_third);
        if p_team_name is not null
          or v_first is null
          or pg_catalog.char_length(v_first) < 1
          or v_second is null
          or pg_catalog.char_length(v_second) < 1
          or v_third is null
          or pg_catalog.char_length(v_third) < 1
        then
          v_ok := false;
        end if;
      elsif v_ok and p_ticket in ('openai', 'startup-launch', 'best-use-of-ai', 'chick-fil-a') then
        v_team := pg_catalog.btrim(p_team_name);
        if p_place_first is not null
          or p_place_second is not null
          or p_place_third is not null
          or v_team is null
          or pg_catalog.char_length(v_team) < 1
        then
          v_ok := false;
        end if;
      elsif v_ok then
        v_ok := false;
      end if;

      if v_ok
        and p_ticket in ('main', 'openai', 'startup-launch', 'best-use-of-ai')
        and v_time >= timestamptz '2026-11-15T20:00:00Z'
      then
        v_ok := false;
      end if;

      if v_ok and exists (
        select 1
        from public.forecast_confirmations as taken
        where taken.account_id = p_account_id::text
          and taken.ticket = p_ticket
      ) then
        v_ok := false;
      end if;

      if v_ok then
        select coalesce(sum(ledger.amount), 0)
          into v_balance
        from public.credit_ledger as ledger
        where ledger.account_id = p_account_id::text;

        if v_balance < p_amount then
          v_ok := false;
        end if;
      end if;

      if v_ok then
        begin
          v_id := pg_catalog.gen_random_uuid();
          insert into public.forecast_confirmations (
            id,
            account_id,
            ticket,
            request_key,
            place_first,
            place_second,
            place_third,
            team_name,
            amount,
            server_time
          ) values (
            v_id,
            p_account_id::text,
            p_ticket,
            p_request_key,
            v_first,
            v_second,
            v_third,
            v_team,
            p_amount,
            v_time
          );

          insert into public.credit_ledger (
            id,
            account_id,
            amount,
            reason,
            confirmation_id
          ) values (
            pg_catalog.gen_random_uuid(),
            p_account_id::text,
            -p_amount,
            'position',
            v_id
          );

          v_committed := true;
          v_wrote := true;
          v_debited := p_amount;
        exception
          when unique_violation then
            select existing.id
              into v_id
            from public.forecast_confirmations as existing
            where existing.account_id = p_account_id::text
              and existing.request_key = p_request_key;

            if v_id is not null then
              v_committed := true;
              v_replayed := true;
            else
              v_id := null;
            end if;
        end;
      end if;
    end if;
  end if;

  confirmation_id := v_id;
  committed := v_committed;
  wrote := v_wrote;
  debited := v_debited;
  replayed := v_replayed;
  return next;
end;
$$;

revoke all on function public.confirm_forecast_position(
  uuid, text, numeric, uuid, text, text, text, text, timestamptz
) from public, anon, authenticated;

grant execute on function public.confirm_forecast_position(
  uuid, text, numeric, uuid, text, text, text, text, timestamptz
) to service_role;

comment on function public.confirm_forecast_position(
  uuid, text, numeric, uuid, text, text, text, text, timestamptz
) is
  'Confirms one forecast position and spends a positive whole number of virtual credits when the balance covers it. An overspend writes nothing. The four hackathon tickets lock at 2026-11-15T20:00:00Z. Chick-fil-A is not one of those four. A replay returns the confirmation and does not debit again. No client flag, query, or header selects the amount or skips the lock.';

comment on table public.forecast_confirmations is
  'One confirmed forecast position per ticket. The same team may be named more than once. Virtual credits move only through the ledger.';
