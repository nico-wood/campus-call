-- Scores. Authenticated may select only their own rows.
-- Amounts are virtual credits. No client insert, update, or delete.

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
) VALUES
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    'Fixture open market',
    'campus',
    'fixture',
    timestamptz '2026-11-15 07:59:00+00',
    100,
    0,
    0,
    'open'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
    'Fixture draft market',
    'campus',
    'fixture',
    timestamptz '2026-11-15 07:59:00+00',
    100,
    0,
    0,
    'draft'
  );

INSERT INTO public.scores (
  id,
  user_id,
  market_id,
  probability_yes,
  outcome_yes,
  brier,
  points,
  credits_spent,
  credits_redeemed
) VALUES
  (
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee1',
    '11111111-1111-4111-8111-111111111111',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    0.5,
    1,
    0.25,
    10,
    1,
    0
  ),
  (
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee2',
    '22222222-2222-4222-8222-222222222222',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    0.5,
    0,
    0.25,
    10,
    1,
    0
  );

SET LOCAL role anon;

SELECT throws_ok(
  $sql$ SELECT count(*) FROM public.scores $sql$,
  '42501',
  NULL,
  'anon cannot select scores'
);

SELECT throws_ok(
  $sql$
    INSERT INTO public.scores (
      id,
      user_id,
      market_id,
      outcome_yes,
      credits_spent,
      credits_redeemed
    ) VALUES (
      'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee99',
      '22222222-2222-4222-8222-222222222222',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
      0,
      1,
      0
    )
  $sql$,
  '42501',
  NULL,
  'anon cannot insert scores'
);

SELECT throws_ok(
  $sql$
    UPDATE public.scores
    SET points = 0
    WHERE id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee1'
  $sql$,
  '42501',
  NULL,
  'anon cannot update scores'
);

SELECT throws_ok(
  $sql$
    DELETE FROM public.scores
    WHERE id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee1'
  $sql$,
  '42501',
  NULL,
  'anon cannot delete scores'
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
  (SELECT count(*) FROM public.scores WHERE user_id = auth.uid()),
  1::bigint,
  'authenticated can select their own scores'
);

SELECT is(
  (SELECT count(*) FROM public.scores WHERE user_id <> auth.uid()),
  0::bigint,
  'authenticated cannot select another caller scores'
);

SELECT throws_ok(
  $sql$
    INSERT INTO public.scores (
      id,
      user_id,
      market_id,
      outcome_yes,
      credits_spent,
      credits_redeemed
    ) VALUES (
      'eeeeeeee-eeee-4eee-8eee-eeeeeeeeee99',
      '22222222-2222-4222-8222-222222222222',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
      0,
      1,
      0
    )
  $sql$,
  '42501',
  NULL,
  'authenticated cannot insert a score for another caller'
);

SELECT throws_ok(
  $sql$
    UPDATE public.scores
    SET points = 0
    WHERE id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee1'
  $sql$,
  '42501',
  NULL,
  'authenticated cannot update scores'
);

SELECT throws_ok(
  $sql$
    DELETE FROM public.scores
    WHERE id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee1'
  $sql$,
  '42501',
  NULL,
  'authenticated cannot delete scores'
);

SET LOCAL request.jwt.claims = '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}';
SET LOCAL request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';

SELECT is(
  auth.uid()::text,
  '22222222-2222-4222-8222-222222222222',
  'second caller sub is auth.uid()'
);

SELECT is(
  (SELECT count(*) FROM public.scores WHERE user_id = auth.uid()),
  1::bigint,
  'second caller can select their own scores'
);

SELECT is(
  (SELECT count(*) FROM public.scores WHERE user_id <> auth.uid()),
  0::bigint,
  'second caller cannot select the first caller scores'
);

SELECT * FROM finish();
ROLLBACK;
