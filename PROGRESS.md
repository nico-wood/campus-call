# Progress

## 2026-11-13 Phase A harness

Wrote the Campus Call eval harness and `research/03-build.md`. No product features. Phase B was not started. No deploy.

`powershell -ExecutionPolicy Bypass -File .\scripts\score.ps1` printed **22.8788** and exited 0. Stdout was that number only. Unit tests were 17 passed / 33 (banned-topic checker green; LMSR, Brier, points, and ledger red with `not implemented`). AI evals were 0 / 10. E2E was 0 / 2 failed and 0 skipped, because there is no app server. Lint and typecheck both exited 0. Playwright Chromium installed. The red suites are intentional. They were not weakened.

`npm test` (`vitest run tests`) exits 1 for the same reason. That is expected until the pure modules exist.

Commit skipped. This folder has no git repository, and `git init` is not allowed. The harness is uncommitted on disk.

## 2026-11-13 Lead synthesis

Research files `01` through `07` are in, plus `research/03-build.md` and the Phase A harness. `research/00-summary.md` locks the 15 launch markets, the 20% incentive only after organizer and team conditions, and the rules draft. `TASKS.md` is the Phase B list. Phase B has not started. Nothing was posted or sent.

The harness score recorded by Agent 3 was 22.8788. Re-ran `powershell -ExecutionPolicy Bypass -File .\scripts\score.ps1` after the synthesis. Stdout was `22.8788`. Stderr was `unit=0.515151515151515 ai=0 e2e=0 quality=1`. Exit code 0.

## 2026-11-13 Setup from TierraDex and lec-agent-config

Copied four skills into `.claude/skills`: `rls-verifier`, `security-audit` (no Stripe), `lean-code`, and `vitest-patterns`. Left Stripe, prod-gate, two-project hosting, TierraDex Supabase refs, Knip, and the shared CI workflow out. The judge stays `scripts/score.ps1`. Details are in `SETUP.md`.

`npx supabase init` wrote `supabase/config.toml` with `project_id = "campus-call"`. No hosted Supabase project was created. `SUPABASE_ACCESS_TOKEN` is unset and the CLI has no saved login. No migration was applied. No `.env` was read.

Git remote is https://github.com/nico-wood/campus-call. First commit `d036bc6` is on `main`. The stored Git credential is the `compuwood` account, so the push used `gh auth git-credential` for `nico-wood` for that one command. Git config was not changed.

Vercel project `campus-call` on the `nico-wood` Hobby team is linked in `.vercel` and was already connected to that GitHub repo. Vercel wrote `.env.local` and it is gitignored. That file was not read and was not committed. No `vercel --prod`. No preview deploy. The app does not exist yet and the score has not moved.

`npm test` was not re-run. Product code did not change. The unit suite is still the known red harness. No `TASKS.md` item was marked done.

## 2026-11-13 Prize-share economics

Nico stated 1st $4,000, 2nd $2,000, 3rd $1,000, and one extra $1,000 if the team wins the challenges. He also stated a planning room of 300 and a prediction close of 11:30. Those prize figures are not on a public page we opened.

`research/08-prize-economics.md` compares pools of 20, 25, 30, 40, and 50 percent. Recommendation: give away 25% and keep 75%. On 1st place the pool is $1,000 and the builders keep $3,000. On 1st plus the challenge the pool is $1,250 and the builders keep $3,750. If the team wins nothing the pool is $0. Do not use 50/30/20. Pay 10 skill ranks on a geometric list (each prize 85% of the one above): $187 down to $43 on the $1,000 pool.

The cash does not recruit a typical person in a room of 300. Conditional on winning 1st, equal-chance expected cash at 25% is $3.33. The breakup does not change that average.

This is not adopted into the rules draft in `research/00-summary.md`, which still says 20% and 50/30/20. It is not announced. Organizer prize-rule approval and a lawyer review are still required before anyone says the dollar offer. The Sunday close for markets still open is already 11:30 a.m. PT in that summary. Friday roster markets still close Friday 8:15 p.m. PT. The two airport markets still close Saturday 11:59 p.m. PT.

No product code changed. Tests were not re-run. Phase B was not started. Nothing was posted or sent.
