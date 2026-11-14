---
name: security-audit
description: Pre-merge checklist for Campus Call data access, auth, and secrets. Use before a migration, an API route, or a deploy preview.
---

# Security audit

Campus Call has no payments, no Stripe, and no cash value. Skip every payment check from other repos.

## Data

- [ ] Every new table has RLS enabled and a policy per allowed verb. See `rls-verifier`.
- [ ] Anon and authenticated cannot insert trades, ledger rows, scores, or resolutions.
- [ ] No policy reads `user_metadata` or `raw_user_meta_data`.
- [ ] No real-money column, payment id, or cash amount.
- [ ] The service-role key is read only on the server. It is not in a client component and not prefixed with `NEXT_PUBLIC_`.

## Auth

- [ ] Server session checks use `getUser()`, not `getSession()`.
- [ ] `POST /api/test/magic-link` and the test admin header exist only when `CAMPUS_CALL_TEST_MODE` is `1`. Otherwise the magic-link route is 404 and the header is ignored.
- [ ] A second resolution of the same market fails.

## Secrets

- [ ] `.env` and `.env.*` are gitignored. `.env.example` has empty placeholders only.
- [ ] No key, token, or connection string in source, tests, logs, or `PROGRESS.md`.
- [ ] GitHub secret scanning stays on. Do not print `gh auth status` tokens into the repo.

## Supply chain

- [ ] Do not add a dependency for something the standard library or the existing harness already does.
- [ ] No `eval()`. No `dangerouslySetInnerHTML` without a sanitizer.
