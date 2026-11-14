-- Virtual-credit ledger. Authenticated may select rows whose
-- account_id equals auth.uid()::text, including no house rows.
-- No client insert, update, or delete.
-- enforce_nonnegative_credit_balance pins search_path to public.
-- This file only reads that pin.

BEGIN;
SELECT plan(15);

INSERT INTO auth.users (
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
) VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-4111-8111-111111111111',
    'authenticated',
    'authenticated',
    'ada@campus-call.test',
    '',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-4222-8222-222222222222',
    'authenticated',
    'authenticated',
    'bea@campus-call.test',
    '',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  );

INSERT INTO public.markets (
  id,
  question,
  category,
  resolution_source,
  close_at,
  b,
  q_yes,
  q_no,
  status
) VALUES (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
  'Fixture open market',
  'campus',
  'fixture',
  timestamptz '2026-11-15 07:59:00+00',
  100,
  0,
  0,
  'open'
);

INSERT INTO public.credit_ledger (
  id,
  account_id,
  market_id,
  amount,
  reason
) VALUES
  (
    'dddddddd-dddd-4ddd-8ddd-ddddddddddd1',
    '11111111-1111-4111-8111-111111111111',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    100,
    'grant'
  ),
  (
    'dddddddd-dddd-4ddd-8ddd-ddddddddddd2',
    '22222222-2222-4222-8222-222222222222',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    100,
    'grant'
  ),
  (
    'dddddddd-dddd-4ddd-8ddd-ddddddddddd3',
    'house',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    1,
    'subsidy'
  );

SELECT ok(
  EXISTS (
    SELECT 1
    FROM pg_proc AS proc
    JOIN pg_namespace AS ns ON ns.oid = proc.pronamespace
    WHERE ns.nspname = 'public'
      AND proc.proname = 'enforce_nonnegative_credit_balance'
      AND proc.prosecdef
      AND EXISTS (
        SELECT 1
        FROM unnest(proc.proconfig) AS cfg
        WHERE cfg = 'search_path=public'
          OR cfg = 'search_path="public"'
      )
  ),
  'enforce_nonnegative_credit_balance is security definer and pins search_path to public'
);

SET LOCAL role anon;

SELECT throws_ok(
  $sql$ SELECT count(*) FROM public.credit_ledger $sql$,
  '42501',
  NULL,
  'anon cannot select the virtual-credit ledger'
);

SELECT throws_ok(
  $sql$
    INSERT INTO public.credit_ledger (id, account_id, market_id, amount, reason)
    VALUES (
      'dddddddd-dddd-4ddd-8ddd-dddddddddd99',
      '22222222-2222-4222-8222-222222222222',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
      1,
      'trade'
    )
  $sql$,
  '42501',
  NULL,
  'anon cannot insert virtual-credit ledger rows'
);

SELECT throws_ok(
  $sql$
    UPDATE public.credit_ledger
    SET amount = 0
    WHERE id = 'dddddddd-dddd-4ddd-8ddd-ddddddddddd1'
  $sql$,
  '42501',
  NULL,
  'anon cannot update the virtual-credit ledger'
);

SELECT throws_ok(
  $sql$
    DELETE FROM public.credit_ledger
    WHERE id = 'dddddddd-dddd-4ddd-8ddd-ddddddddddd1'
  $sql$,
  '42501',
  NULL,
  'anon cannot delete virtual-credit ledger rows'
);

SET LOCAL role authenticated;
SET LOCAL request.jwt.claims = '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';
SET LOCAL request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

SELECT is(
  auth.uid()::text,
  '11111111-1111-4111-8111-111111111111',
  'authenticated sub is auth.uid() for the caller'
);

SELECT is(
  (SELECT count(*) FROM public.credit_ledger WHERE account_id = auth.uid()::text),
  1::bigint,
  'authenticated can select their own virtual-credit ledger rows'
);

SELECT is(
  (
    SELECT count(*)
    FROM public.credit_ledger
    WHERE account_id = '22222222-2222-4222-8222-222222222222'
  ),
  0::bigint,
  'authenticated cannot select another caller virtual-credit ledger rows'
);

SELECT is(
  (SELECT count(*) FROM public.credit_ledger WHERE account_id = 'house'),
  0::bigint,
  'authenticated cannot select house virtual-credit ledger rows'
);

SELECT throws_ok(
  $sql$
    INSERT INTO public.credit_ledger (id, account_id, market_id, amount, reason)
    VALUES (
      'dddddddd-dddd-4ddd-8ddd-dddddddddd99',
      '22222222-2222-4222-8222-222222222222',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
      1,
      'trade'
    )
  $sql$,
  '42501',
  NULL,
  'authenticated cannot insert a virtual-credit ledger row'
);

SELECT throws_ok(
  $sql$
    UPDATE public.credit_ledger
    SET amount = 0
    WHERE id = 'dddddddd-dddd-4ddd-8ddd-ddddddddddd1'
  $sql$,
  '42501',
  NULL,
  'authenticated cannot update the virtual-credit ledger'
);

SELECT throws_ok(
  $sql$
    DELETE FROM public.credit_ledger
    WHERE id = 'dddddddd-dddd-4ddd-8ddd-ddddddddddd1'
  $sql$,
  '42501',
  NULL,
  'authenticated cannot delete virtual-credit ledger rows'
);

SET LOCAL request.jwt.claims = '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}';
SET LOCAL request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';

SELECT is(
  auth.uid()::text,
  '22222222-2222-4222-8222-222222222222',
  'second caller sub is auth.uid()'
);

SELECT is(
  (SELECT count(*) FROM public.credit_ledger WHERE account_id = auth.uid()::text),
  1::bigint,
  'second caller can select their own virtual-credit ledger rows'
);

SELECT is(
  (
    SELECT count(*)
    FROM public.credit_ledger
    WHERE account_id = '11111111-1111-4111-8111-111111111111'
  ),
  0::bigint,
  'second caller cannot select the first caller virtual-credit ledger rows'
);

SELECT * FROM finish();
ROLLBACK;
