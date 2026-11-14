-- Markets. Anon and authenticated may select rows that are not draft.
-- No client insert, update, or delete grant.
-- Fixture ids are independent of the launch migration.
-- Seeded ids are asserted because that migration loads them.

BEGIN;
SELECT plan(17);

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

SET LOCAL role anon;

SELECT is(
  (SELECT count(*) FROM public.markets WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3'),
  0::bigint,
  'anon cannot select a draft market'
);

SELECT is(
  (SELECT count(*) FROM public.markets WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'),
  1::bigint,
  'anon can select a market that is not draft'
);

SELECT is(
  (SELECT count(*) FROM public.markets WHERE id = '00000000-0000-4000-8000-000000000003'),
  0::bigint,
  'anon cannot select seeded draft market 00000000-0000-4000-8000-000000000003'
);

SELECT is(
  (SELECT count(*) FROM public.markets WHERE id = '00000000-0000-4000-8000-000000000001'),
  1::bigint,
  'anon can select seeded open market 00000000-0000-4000-8000-000000000001'
);

SELECT is(
  (SELECT count(*) FROM public.markets WHERE status = 'draft'),
  0::bigint,
  'anon cannot select any draft market'
);

SELECT throws_ok(
  $sql$
    INSERT INTO public.markets (
      id,
      question,
      category,
      resolution_source,
      close_at,
      status
    ) VALUES (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa99',
      'Client insert must fail',
      'knowledge',
      'fixture',
      timestamptz '2026-11-15 07:59:00+00',
      'open'
    )
  $sql$,
  '42501',
  NULL,
  'anon cannot insert markets'
);

SELECT throws_ok(
  $sql$
    UPDATE public.markets
    SET question = 'changed'
    WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'
  $sql$,
  '42501',
  NULL,
  'anon cannot update markets'
);

SELECT throws_ok(
  $sql$
    DELETE FROM public.markets
    WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3'
  $sql$,
  '42501',
  NULL,
  'anon cannot delete markets'
);

SET LOCAL role authenticated;
SET LOCAL request.jwt.claims = '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';
SET LOCAL request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

SELECT is(
  auth.uid()::text,
  '11111111-1111-4111-8111-111111111111',
  'authenticated sub is auth.uid()'
);

SELECT is(
  (SELECT count(*) FROM public.markets WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3'),
  0::bigint,
  'authenticated cannot select a draft market'
);

SELECT is(
  (SELECT count(*) FROM public.markets WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'),
  1::bigint,
  'authenticated can select a market that is not draft'
);

SELECT is(
  (SELECT count(*) FROM public.markets WHERE id = '00000000-0000-4000-8000-000000000003'),
  0::bigint,
  'authenticated cannot select seeded draft market 00000000-0000-4000-8000-000000000003'
);

SELECT is(
  (SELECT count(*) FROM public.markets WHERE id = '00000000-0000-4000-8000-000000000001'),
  1::bigint,
  'authenticated can select seeded open market 00000000-0000-4000-8000-000000000001'
);

SELECT is(
  (SELECT count(*) FROM public.markets WHERE status = 'draft'),
  0::bigint,
  'authenticated cannot select any draft market'
);

SELECT throws_ok(
  $sql$
    INSERT INTO public.markets (
      id,
      question,
      category,
      resolution_source,
      close_at,
      status
    ) VALUES (
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa99',
      'Client insert must fail',
      'knowledge',
      'fixture',
      timestamptz '2026-11-15 07:59:00+00',
      'open'
    )
  $sql$,
  '42501',
  NULL,
  'authenticated cannot insert markets'
);

SELECT throws_ok(
  $sql$
    UPDATE public.markets
    SET question = 'changed'
    WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'
  $sql$,
  '42501',
  NULL,
  'authenticated cannot update markets'
);

SELECT throws_ok(
  $sql$
    DELETE FROM public.markets
    WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3'
  $sql$,
  '42501',
  NULL,
  'authenticated cannot delete markets'
);

SELECT * FROM finish();
ROLLBACK;
