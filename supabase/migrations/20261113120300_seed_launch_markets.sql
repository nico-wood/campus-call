-- Fifteen launch markets. Fixed ids. b = 100, q_yes = 0, q_no = 0.
-- Markets 1 and 2 are open. Markets 3 through 15 stay draft.
-- Closes are Pacific Standard (UTC-8) converted to UTC.
-- Subsidy is 100 * ln(2) virtual credits, and only for an open market.

insert into public.markets (
  id,
  question,
  category,
  resolution_source,
  close_at,
  b,
  q_yes,
  q_no,
  status,
  created_at
) values
  (
    '00000000-0000-4000-8000-000000000001',
    'Will the Nov. 14 maximum at KSBP be 70 F or higher?',
    'campus',
    'NWS CF6SBP day 14 MAX column',
    timestamptz '2026-11-15 07:59:00+00',
    100,
    0,
    0,
    'open',
    timestamptz '2026-11-13 00:00:00+00'
  ),
  (
    '00000000-0000-4000-8000-000000000002',
    'Will KSBP record at least 0.01 inch on Sat Nov. 14?',
    'campus',
    'NWS CF6SBP precipitation column. A trace is not enough.',
    timestamptz '2026-11-15 07:59:00+00',
    100,
    0,
    0,
    'open',
    timestamptz '2026-11-13 00:00:00+00'
  ),
  (
    '00000000-0000-4000-8000-000000000003',
    'Which team size is most common on the Friday 8:40 p.m. roster?',
    'campus',
    'organizer roster',
    timestamptz '2026-11-14 04:15:00+00',
    100,
    0,
    0,
    'draft',
    timestamptz '2026-11-13 00:00:00+00'
  ),
  (
    '00000000-0000-4000-8000-000000000004',
    'Will at least one Friday-roster team span two or more of the six colleges?',
    'campus',
    'organizer aggregate',
    timestamptz '2026-11-14 04:15:00+00',
    100,
    0,
    0,
    'draft',
    timestamptz '2026-11-13 00:00:00+00'
  ),
  (
    '00000000-0000-4000-8000-000000000005',
    'Will at least one Friday-roster team have been created after Fri Nov. 13, 12:00 p.m.?',
    'campus',
    'organizer timestamp count',
    timestamptz '2026-11-14 04:15:00+00',
    100,
    0,
    0,
    'draft',
    timestamptz '2026-11-13 00:00:00+00'
  ),
  (
    '00000000-0000-4000-8000-000000000006',
    'Will official submissions exceed the Friday roster count?',
    'campus',
    'organizer tally vs roster',
    timestamptz '2026-11-15 19:30:00+00',
    100,
    0,
    0,
    'draft',
    timestamptz '2026-11-13 00:00:00+00'
  ),
  (
    '00000000-0000-4000-8000-000000000007',
    'Will official submissions be at least the integer organizers publish Friday night?',
    'campus',
    'that published integer, then the tally',
    timestamptz '2026-11-15 19:30:00+00',
    100,
    0,
    0,
    'draft',
    timestamptz '2026-11-13 00:00:00+00'
  ),
  (
    '00000000-0000-4000-8000-000000000008',
    'Will the number of submitting teams be odd?',
    'campus',
    'the tally integer',
    timestamptz '2026-11-15 19:30:00+00',
    100,
    0,
    0,
    'draft',
    timestamptz '2026-11-13 00:00:00+00'
  ),
  (
    '00000000-0000-4000-8000-000000000009',
    'Will at least half the Friday roster submit? Half rounds up.',
    'campus',
    'roster count and tally',
    timestamptz '2026-11-15 19:30:00+00',
    100,
    0,
    0,
    'draft',
    timestamptz '2026-11-13 00:00:00+00'
  ),
  (
    '00000000-0000-4000-8000-000000000010',
    'By Sun 11:30 a.m., will opt-in responses name at least half the Friday roster?',
    'campus',
    'opt-in export matched on team name',
    timestamptz '2026-11-15 19:30:00+00',
    100,
    0,
    0,
    'draft',
    timestamptz '2026-11-13 00:00:00+00'
  ),
  (
    '00000000-0000-4000-8000-000000000011',
    'How many members will the first-listed winning team have?',
    'campus',
    'results post joined to the roster',
    timestamptz '2026-11-15 19:30:00+00',
    100,
    0,
    0,
    'draft',
    timestamptz '2026-11-13 00:00:00+00'
  ),
  (
    '00000000-0000-4000-8000-000000000012',
    'Will that winning project have a public source repository on the submission before the deadline?',
    'campus',
    'submission record, then the URL',
    timestamptz '2026-11-15 19:30:00+00',
    100,
    0,
    0,
    'draft',
    timestamptz '2026-11-13 00:00:00+00'
  ),
  (
    '00000000-0000-4000-8000-000000000013',
    'Will that winning team be one whose record was created after Friday noon, with every member joining after that time?',
    'campus',
    'results post joined to registration times',
    timestamptz '2026-11-15 19:30:00+00',
    100,
    0,
    0,
    'draft',
    timestamptz '2026-11-13 00:00:00+00'
  ),
  (
    '00000000-0000-4000-8000-000000000014',
    'Will that winning team include two or more colleges?',
    'campus',
    'results post joined to roster colleges',
    timestamptz '2026-11-15 19:30:00+00',
    100,
    0,
    0,
    'draft',
    timestamptz '2026-11-13 00:00:00+00'
  ),
  (
    '00000000-0000-4000-8000-000000000015',
    'Will that winning submission include any public URL recorded before the deadline?',
    'campus',
    'submission record',
    timestamptz '2026-11-15 19:30:00+00',
    100,
    0,
    0,
    'draft',
    timestamptz '2026-11-13 00:00:00+00'
  )
on conflict (id) do nothing;

insert into public.outcomes (id, market_id, label) values
  ('00000000-0000-4000-a001-000000000001', '00000000-0000-4000-8000-000000000001', 'YES'),
  ('00000000-0000-4000-a000-000000000001', '00000000-0000-4000-8000-000000000001', 'NO'),
  ('00000000-0000-4000-a001-000000000002', '00000000-0000-4000-8000-000000000002', 'YES'),
  ('00000000-0000-4000-a000-000000000002', '00000000-0000-4000-8000-000000000002', 'NO'),
  ('00000000-0000-4000-a001-000000000003', '00000000-0000-4000-8000-000000000003', 'YES'),
  ('00000000-0000-4000-a000-000000000003', '00000000-0000-4000-8000-000000000003', 'NO'),
  ('00000000-0000-4000-a001-000000000004', '00000000-0000-4000-8000-000000000004', 'YES'),
  ('00000000-0000-4000-a000-000000000004', '00000000-0000-4000-8000-000000000004', 'NO'),
  ('00000000-0000-4000-a001-000000000005', '00000000-0000-4000-8000-000000000005', 'YES'),
  ('00000000-0000-4000-a000-000000000005', '00000000-0000-4000-8000-000000000005', 'NO'),
  ('00000000-0000-4000-a001-000000000006', '00000000-0000-4000-8000-000000000006', 'YES'),
  ('00000000-0000-4000-a000-000000000006', '00000000-0000-4000-8000-000000000006', 'NO'),
  ('00000000-0000-4000-a001-000000000007', '00000000-0000-4000-8000-000000000007', 'YES'),
  ('00000000-0000-4000-a000-000000000007', '00000000-0000-4000-8000-000000000007', 'NO'),
  ('00000000-0000-4000-a001-000000000008', '00000000-0000-4000-8000-000000000008', 'YES'),
  ('00000000-0000-4000-a000-000000000008', '00000000-0000-4000-8000-000000000008', 'NO'),
  ('00000000-0000-4000-a001-000000000009', '00000000-0000-4000-8000-000000000009', 'YES'),
  ('00000000-0000-4000-a000-000000000009', '00000000-0000-4000-8000-000000000009', 'NO'),
  ('00000000-0000-4000-a001-000000000010', '00000000-0000-4000-8000-000000000010', 'YES'),
  ('00000000-0000-4000-a000-000000000010', '00000000-0000-4000-8000-000000000010', 'NO'),
  ('00000000-0000-4000-a001-000000000011', '00000000-0000-4000-8000-000000000011', 'YES'),
  ('00000000-0000-4000-a000-000000000011', '00000000-0000-4000-8000-000000000011', 'NO'),
  ('00000000-0000-4000-a001-000000000012', '00000000-0000-4000-8000-000000000012', 'YES'),
  ('00000000-0000-4000-a000-000000000012', '00000000-0000-4000-8000-000000000012', 'NO'),
  ('00000000-0000-4000-a001-000000000013', '00000000-0000-4000-8000-000000000013', 'YES'),
  ('00000000-0000-4000-a000-000000000013', '00000000-0000-4000-8000-000000000013', 'NO'),
  ('00000000-0000-4000-a001-000000000014', '00000000-0000-4000-8000-000000000014', 'YES'),
  ('00000000-0000-4000-a000-000000000014', '00000000-0000-4000-8000-000000000014', 'NO'),
  ('00000000-0000-4000-a001-000000000015', '00000000-0000-4000-8000-000000000015', 'YES'),
  ('00000000-0000-4000-a000-000000000015', '00000000-0000-4000-8000-000000000015', 'NO')
on conflict (id) do nothing;

insert into public.credit_ledger (
  id,
  account_id,
  market_id,
  amount,
  reason,
  created_at
) values
  (
    '00000000-0000-4000-b000-000000000001',
    'house',
    '00000000-0000-4000-8000-000000000001',
    69.31471805599453,
    'subsidy',
    timestamptz '2026-11-13 00:00:00+00'
  ),
  (
    '00000000-0000-4000-b000-000000000002',
    'house',
    '00000000-0000-4000-8000-000000000002',
    69.31471805599453,
    'subsidy',
    timestamptz '2026-11-13 00:00:00+00'
  )
on conflict (id) do nothing;
