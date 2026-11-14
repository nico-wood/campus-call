-- Profiles. Callers may read and update only their own row.
-- Update privilege is the display_name column grant, not the whole table.

BEGIN;
SELECT plan(22);

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
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '33333333-3333-4333-8333-333333333333',
    'authenticated',
    'authenticated',
    'cy@campus-call.test',
    '',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  );

INSERT INTO public.profiles (id, email, display_name) VALUES
  ('11111111-1111-4111-8111-111111111111', 'ada@campus-call.test', 'Ada'),
  ('22222222-2222-4222-8222-222222222222', 'bea@campus-call.test', 'Bea');

SELECT ok(
  has_column_privilege('authenticated', 'public.profiles', 'display_name', 'UPDATE'),
  'authenticated has a column grant to update display_name'
);

SELECT ok(
  NOT has_column_privilege('authenticated', 'public.profiles', 'email', 'UPDATE'),
  'authenticated has no column grant to update email'
);

SELECT ok(
  NOT has_column_privilege('anon', 'public.profiles', 'display_name', 'UPDATE'),
  'anon has no column grant to update display_name'
);

SET LOCAL role anon;

SELECT throws_ok(
  $sql$ SELECT count(*) FROM public.profiles $sql$,
  '42501',
  NULL,
  'anon cannot select profiles'
);

SELECT throws_ok(
  $sql$
    INSERT INTO public.profiles (id, email, display_name)
    VALUES (
      '33333333-3333-4333-8333-333333333333',
      'cy@campus-call.test',
      'Cy'
    )
  $sql$,
  '42501',
  NULL,
  'anon cannot insert profiles'
);

SELECT throws_ok(
  $sql$
    UPDATE public.profiles
    SET display_name = 'Stolen'
    WHERE id = '11111111-1111-4111-8111-111111111111'
  $sql$,
  '42501',
  NULL,
  'anon cannot update display_name'
);

SELECT throws_ok(
  $sql$
    DELETE FROM public.profiles
    WHERE id = '11111111-1111-4111-8111-111111111111'
  $sql$,
  '42501',
  NULL,
  'anon cannot delete profiles'
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
  (SELECT count(*) FROM public.profiles WHERE id = auth.uid()),
  1::bigint,
  'authenticated can select their own profile'
);

SELECT is(
  (SELECT count(*) FROM public.profiles WHERE id <> auth.uid()),
  0::bigint,
  'authenticated cannot select another profile'
);

SELECT is(
  (SELECT display_name FROM public.profiles WHERE id = auth.uid()),
  'Ada',
  'authenticated reads their own display_name'
);

SELECT lives_ok(
  $sql$
    UPDATE public.profiles
    SET display_name = 'Ada Lane'
    WHERE id = '11111111-1111-4111-8111-111111111111'
  $sql$,
  'authenticated can update their own display_name'
);

SELECT is(
  (SELECT display_name FROM public.profiles WHERE id = auth.uid()),
  'Ada Lane',
  'authenticated sees the updated display_name'
);

SELECT throws_ok(
  $sql$
    UPDATE public.profiles
    SET email = 'nope@campus-call.test'
    WHERE id = '11111111-1111-4111-8111-111111111111'
  $sql$,
  '42501',
  NULL,
  'authenticated cannot update profile columns other than display_name'
);

SELECT is(
  (SELECT display_name FROM public.profiles WHERE id = auth.uid()),
  'Ada Lane',
  'rejected column update leaves display_name in place'
);

SELECT lives_ok(
  $sql$
    UPDATE public.profiles
    SET display_name = 'Stolen'
    WHERE id = '22222222-2222-4222-8222-222222222222'
  $sql$,
  'authenticated update of another profile matches no visible row'
);

SELECT throws_ok(
  $sql$
    INSERT INTO public.profiles (id, email, display_name)
    VALUES (
      '33333333-3333-4333-8333-333333333333',
      'cy@campus-call.test',
      'Cy'
    )
  $sql$,
  '42501',
  NULL,
  'authenticated cannot insert a profile'
);

SELECT throws_ok(
  $sql$
    DELETE FROM public.profiles
    WHERE id = '11111111-1111-4111-8111-111111111111'
  $sql$,
  '42501',
  NULL,
  'authenticated cannot delete their own profile'
);

RESET ROLE;

SELECT is(
  (SELECT display_name FROM public.profiles WHERE id = '22222222-2222-4222-8222-222222222222'),
  'Bea',
  'authenticated cannot change another profile display_name'
);

SET LOCAL role authenticated;
SET LOCAL request.jwt.claims = '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}';
SET LOCAL request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';

SELECT is(
  auth.uid()::text,
  '22222222-2222-4222-8222-222222222222',
  'second caller sub is auth.uid()'
);

SELECT is(
  (SELECT display_name FROM public.profiles WHERE id = auth.uid()),
  'Bea',
  'second caller can select their own profile'
);

SELECT is(
  (SELECT count(*) FROM public.profiles WHERE id = '11111111-1111-4111-8111-111111111111'),
  0::bigint,
  'second caller cannot select the first profile'
);

SELECT * FROM finish();
ROLLBACK;
