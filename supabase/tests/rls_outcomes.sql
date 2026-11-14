-- Outcomes follow the parent market. Draft parents stay hidden.
-- No client insert, update, or delete grant.

BEGIN;
SELECT plan(15);

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
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
    'Fixture closed market',
    'campus',
    'fixture',
    timestamptz '2026-11-15 07:59:00+00',
    100,
    0,
    0,
    'closed'
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

INSERT INTO public.outcomes (id, market_id, label) VALUES
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'YES'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'NO'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', 'YES'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb4', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', 'NO');

SET LOCAL role anon;

SELECT is(
  (SELECT count(*) FROM public.outcomes WHERE market_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3'),
  0::bigint,
  'anon cannot select outcomes of a draft market'
);

SELECT is(
  (SELECT count(*) FROM public.outcomes WHERE market_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'),
  2::bigint,
  'anon can select outcomes of a market that is not draft'
);

SELECT is(
  (SELECT count(*) FROM public.outcomes WHERE market_id = '00000000-0000-4000-8000-000000000003'),
  0::bigint,
  'anon cannot select outcomes of seeded draft market 00000000-0000-4000-8000-000000000003'
);

SELECT is(
  (SELECT count(*) FROM public.outcomes WHERE market_id = '00000000-0000-4000-8000-000000000001'),
  2::bigint,
  'anon can select outcomes of seeded open market 00000000-0000-4000-8000-000000000001'
);

SELECT throws_ok(
  $sql$
    INSERT INTO public.outcomes (id, market_id, label)
    VALUES (
      'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb99',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
      'YES'
    )
  $sql$,
  '42501',
  NULL,
  'anon cannot insert outcomes'
);

SELECT throws_ok(
  $sql$
    UPDATE public.outcomes
    SET label = 'NO'
    WHERE id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1'
  $sql$,
  '42501',
  NULL,
  'anon cannot update outcomes'
);

SELECT throws_ok(
  $sql$
    DELETE FROM public.outcomes
    WHERE id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1'
  $sql$,
  '42501',
  NULL,
  'anon cannot delete outcomes'
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
  (SELECT count(*) FROM public.outcomes WHERE market_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3'),
  0::bigint,
  'authenticated cannot select outcomes of a draft market'
);

SELECT is(
  (SELECT count(*) FROM public.outcomes WHERE market_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'),
  2::bigint,
  'authenticated can select outcomes of a market that is not draft'
);

SELECT is(
  (SELECT count(*) FROM public.outcomes WHERE market_id = '00000000-0000-4000-8000-000000000003'),
  0::bigint,
  'authenticated cannot select outcomes of seeded draft market 00000000-0000-4000-8000-000000000003'
);

SELECT is(
  (SELECT count(*) FROM public.outcomes WHERE market_id = '00000000-0000-4000-8000-000000000001'),
  2::bigint,
  'authenticated can select outcomes of seeded open market 00000000-0000-4000-8000-000000000001'
);

SELECT throws_ok(
  $sql$
    INSERT INTO public.outcomes (id, market_id, label)
    VALUES (
      'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbb99',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
      'YES'
    )
  $sql$,
  '42501',
  NULL,
  'authenticated cannot insert outcomes'
);

SELECT throws_ok(
  $sql$
    UPDATE public.outcomes
    SET label = 'NO'
    WHERE id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1'
  $sql$,
  '42501',
  NULL,
  'authenticated cannot update outcomes'
);

SELECT throws_ok(
  $sql$
    DELETE FROM public.outcomes
    WHERE id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1'
  $sql$,
  '42501',
  NULL,
  'authenticated cannot delete outcomes'
);

SELECT * FROM finish();
ROLLBACK;
