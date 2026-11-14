-- Trades. Authenticated may select only their own rows.
-- cost_credits is virtual credits. No client insert, update, or delete.

BEGIN;
SELECT plan(13);

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

INSERT INTO public.trades (
  id,
  user_id,
  market_id,
  side,
  shares,
  cost_credits,
  probability_yes
) VALUES
  (
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc1',
    '11111111-1111-4111-8111-111111111111',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    'yes',
    1,
    1,
    0.5
  ),
  (
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc2',
    '22222222-2222-4222-8222-222222222222',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    'no',
    1,
    1,
    0.5
  );

SET LOCAL role anon;

SELECT throws_ok(
  $sql$ SELECT count(*) FROM public.trades $sql$,
  '42501',
  NULL,
  'anon cannot select trades'
);

SELECT throws_ok(
  $sql$
    INSERT INTO public.trades (
      id,
      user_id,
      market_id,
      side,
      shares,
      cost_credits,
      probability_yes
    ) VALUES (
      'cccccccc-cccc-4ccc-8ccc-cccccccccc99',
      '22222222-2222-4222-8222-222222222222',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
      'yes',
      1,
      1,
      0.5
    )
  $sql$,
  '42501',
  NULL,
  'anon cannot insert trades'
);

SELECT throws_ok(
  $sql$
    UPDATE public.trades
    SET shares = 2
    WHERE id = 'cccccccc-cccc-4ccc-8ccc-ccccccccccc1'
  $sql$,
  '42501',
  NULL,
  'anon cannot update trades'
);

SELECT throws_ok(
  $sql$
    DELETE FROM public.trades
    WHERE id = 'cccccccc-cccc-4ccc-8ccc-ccccccccccc1'
  $sql$,
  '42501',
  NULL,
  'anon cannot delete trades'
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
  (SELECT count(*) FROM public.trades WHERE user_id = auth.uid()),
  1::bigint,
  'authenticated can select their own trades'
);

SELECT is(
  (SELECT count(*) FROM public.trades WHERE user_id <> auth.uid()),
  0::bigint,
  'authenticated cannot select another caller trades'
);

SELECT throws_ok(
  $sql$
    INSERT INTO public.trades (
      id,
      user_id,
      market_id,
      side,
      shares,
      cost_credits,
      probability_yes
    ) VALUES (
      'cccccccc-cccc-4ccc-8ccc-cccccccccc99',
      '22222222-2222-4222-8222-222222222222',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
      'yes',
      1,
      1,
      0.5
    )
  $sql$,
  '42501',
  NULL,
  'authenticated cannot insert a trade for another caller'
);

SELECT throws_ok(
  $sql$
    UPDATE public.trades
    SET shares = 2
    WHERE id = 'cccccccc-cccc-4ccc-8ccc-ccccccccccc1'
  $sql$,
  '42501',
  NULL,
  'authenticated cannot update trades'
);

SELECT throws_ok(
  $sql$
    DELETE FROM public.trades
    WHERE id = 'cccccccc-cccc-4ccc-8ccc-ccccccccccc1'
  $sql$,
  '42501',
  NULL,
  'authenticated cannot delete trades'
);

SET LOCAL request.jwt.claims = '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}';
SET LOCAL request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';

SELECT is(
  auth.uid()::text,
  '22222222-2222-4222-8222-222222222222',
  'second caller sub is auth.uid()'
);

SELECT is(
  (SELECT count(*) FROM public.trades WHERE user_id = auth.uid()),
  1::bigint,
  'second caller can select their own trades'
);

SELECT is(
  (SELECT count(*) FROM public.trades WHERE user_id <> auth.uid()),
  0::bigint,
  'second caller cannot select the first caller trades'
);

SELECT * FROM finish();
ROLLBACK;
