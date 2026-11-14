---
name: rls-verifier
description: Author and verify Supabase Row Level Security (RLS) policies and their pgTAP tests. Use when writing or reviewing any migration that creates or alters a table, adds or drops a policy, or touches authorization.
---

# RLS verifier

Adapted from lec-agent-config for Campus Call. Virtual credits only. No cash columns.

Every table starts hostile. Enable RLS before any policy. If a policy is missing, the role gets nothing. The browser never receives the service-role key. Server routes write trades, the credit ledger, scores, and resolutions. Anon and authenticated do not.

## Authoring checklist

- [ ] `ALTER TABLE <t> ENABLE ROW LEVEL SECURITY;` Never `DISABLE`. A migration that drops a policy replaces it in the same migration.
- [ ] A policy for each verb you allow: SELECT, INSERT, UPDATE, DELETE. An unguarded write is a hole.
- [ ] Scope the policy to `authenticated` or `anon` on purpose. Do not leave it on `public` unless the row is meant to be public.
- [ ] Authorize with `(select auth.uid())` so the planner caches it. Index the column the policy filters on.
- [ ] Read JWT claims from `auth.jwt() -> 'app_metadata'` only. Never `user_metadata` or `raw_user_meta_data`.
- [ ] `WITH CHECK` is the row after the write. `USING` is the row the command can see. An update that cannot re-select the new row looks broken.
- [ ] `SECURITY DEFINER` functions pin `SET search_path = ''` (or an explicit schema) and are granted narrowly.
- [ ] No currency, cash amount, or payment id. Numeric columns are virtual credits.
- [ ] Profiles store a display handle, not a legal name.

## pgTAP

Put tests in `supabase/tests/rls_<table>.sql`. Prove the denial, not only the happy path.

```sql
BEGIN;
SELECT plan(2);

SET LOCAL role anon;
SELECT is(
  (SELECT count(*) FROM public.<table>),
  0::bigint,
  'anon cannot read <table>'
);

SET LOCAL role authenticated;
SET LOCAL request.jwt.claims = '{"sub":"user-A"}';
SELECT throws_ok(
  $$ INSERT INTO public.<table>(user_id) VALUES ('user-B') $$,
  '42501',
  NULL,
  'authenticated cannot insert a row for someone else'
);

SELECT * FROM finish();
ROLLBACK;
```

Run `supabase test db` when a file under `supabase/migrations/` changes. Local bootstrap is `supabase init`, then a local stack with pgTAP. Do not apply a migration to a hosted database from an agent session unless Nico has said to in that session. Do not paste SQL into a production dashboard.
