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

Git remote is the existing empty repo https://github.com/nico-wood/campus-call. Vercel project `campus-call` already existed on the `nico-wood` Hobby team. No `vercel --prod`. No preview deploy. The app does not exist yet and the score has not moved.

`npm test` was not re-run. Product code did not change. The unit suite is still the known red harness. No `TASKS.md` item was marked done.
