-- Resolutions. Authenticated may select every row.
-- Anon has no select grant. No client insert, update, or delete.

BEGIN;
SELECT plan(11);

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

INSERT INTO public.resolutions (id, market_id, outcome, resolved_by) VALUES (
  'ffffffff-ffff-4fff-8fff-fffffffffff1',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
  'YES',
  '11111111-1111-4111-8111-111111111111'
);

SET LOCAL role anon;

SELECT throws_ok(
  $sql$ SELECT count(*) FROM public.resolutions $sql$,
  '42501',
  NULL,
  'anon cannot select resolutions'
);

SELECT throws_ok(
  $sql$
    INSERT INTO public.resolutions (id, market_id, outcome, resolved_by)
    VALUES (
      'ffffffff-ffff-4fff-8fff-ffffffffff99',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
      'NO',
      '22222222-2222-4222-8222-222222222222'
    )
  $sql$,
  '42501',
  NULL,
  'anon cannot insert resolutions'
);

SELECT throws_ok(
  $sql$
    UPDATE public.resolutions
    SET outcome = 'NO'
    WHERE id = 'ffffffff-ffff-4fff-8fff-fffffffffff1'
  $sql$,
  '42501',
  NULL,
  'anon cannot update resolutions'
);

SELECT throws_ok(
  $sql$
    DELETE FROM public.resolutions
    WHERE id = 'ffffffff-ffff-4fff-8fff-fffffffffff1'
  $sql$,
  '42501',
  NULL,
  'anon cannot delete resolutions'
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
  (SELECT count(*) FROM public.resolutions WHERE id = 'ffffffff-ffff-4fff-8fff-fffffffffff1'),
  1::bigint,
  'authenticated can select resolutions'
);

SELECT throws_ok(
  $sql$
    INSERT INTO public.resolutions (id, market_id, outcome, resolved_by)
    VALUES (
      'ffffffff-ffff-4fff-8fff-ffffffffff99',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
      'NO',
      '22222222-2222-4222-8222-222222222222'
    )
  $sql$,
  '42501',
  NULL,
  'authenticated cannot insert resolutions'
);

SELECT throws_ok(
  $sql$
    UPDATE public.resolutions
    SET outcome = 'NO'
    WHERE id = 'ffffffff-ffff-4fff-8fff-fffffffffff1'
  $sql$,
  '42501',
  NULL,
  'authenticated cannot update resolutions'
);

SELECT throws_ok(
  $sql$
    DELETE FROM public.resolutions
    WHERE id = 'ffffffff-ffff-4fff-8fff-fffffffffff1'
  $sql$,
  '42501',
  NULL,
  'authenticated cannot delete resolutions'
);

SET LOCAL request.jwt.claims = '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}';
SET LOCAL request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';

SELECT is(
  auth.uid()::text,
  '22222222-2222-4222-8222-222222222222',
  'second caller sub is auth.uid()'
);

SELECT is(
  (SELECT count(*) FROM public.resolutions WHERE id = 'ffffffff-ffff-4fff-8fff-fffffffffff1'),
  1::bigint,
  'another authenticated caller can select the same resolution'
);

SELECT * FROM finish();
ROLLBACK;
