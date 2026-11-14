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

`npx supabase init` wrote `supabase/config.toml` with `project_id = "campus-call"`. After the Cal Poly account login, `supabase link --project-ref vftrwyuvrewekoofkcpp --yes` succeeded. `supabase/.temp/project-ref` is that ref. No migration was applied. No `.env` file was read. API keys were not copied.

Git remote is https://github.com/nico-wood/campus-call. First commit `d036bc6` is on `main`. The stored Git credential is the `compuwood` account, so the push used `gh auth git-credential` for `nico-wood` for that one command. Git config was not changed.

Vercel project `campus-call` on the `nico-wood` Hobby team is linked in `.vercel` and was already connected to that GitHub repo. Vercel wrote `.env.local` and it is gitignored. That file was not read and was not committed. No `vercel --prod`. No preview deploy. The app does not exist yet and the score has not moved.

`npm test` was not re-run. Product code did not change. The unit suite is still the known red harness. No `TASKS.md` item was marked done.

## 2026-11-13 Prize-share economics

Nico stated 1st $4,000, 2nd $2,000, 3rd $1,000, and one extra $1,000 if the team wins the challenges. He also stated a planning room of 300 and a prediction close of 11:30. Those prize figures are not on a public page we opened.

`research/08-prize-economics.md` compares pools of 20, 25, 30, 40, and 50 percent. Recommendation: give away 25% and keep 75%. On 1st place the pool is $1,000 and the builders keep $3,000. On 1st plus the challenge the pool is $1,250 and the builders keep $3,750. If the team wins nothing the pool is $0. Do not use 50/30/20. Pay 10 skill ranks on a geometric list (each prize 85% of the one above): $187 down to $43 on the $1,000 pool.

The cash does not recruit a typical person in a room of 300. Conditional on winning 1st, equal-chance expected cash at 25% is $3.33. The breakup does not change that average.

This is not adopted into the rules draft in `research/00-summary.md`, which still says 20% and 50/30/20. It is not announced. Organizer prize-rule approval and a lawyer review are still required before anyone says the dollar offer. The Sunday close for markets still open is already 11:30 a.m. PT in that summary. Friday roster markets still close Friday 8:15 p.m. PT. The two airport markets still close Saturday 11:59 p.m. PT.

No product code changed. Tests were not re-run. Phase B was not started. Nothing was posted or sent.

## 2026-11-13 Nico adopted 25% and the top 10

Nico adopted the economics recommendation. `research/00-summary.md` now sets the pool at 25% of what the team actually receives, paid to 10 geometric ranks. The builders keep 75%. Empty ranks are not rescaled. The dollars stay unannounced until Sophie agrees, an organizer confirms sharing is allowed, and Nico accepts that a lawyer has not reviewed it. The organizer draft asks for 25% and ten ranks. It was not sent.

The same memo sets the room entry path. A QR opens one market. The question and two priced buttons are the first screen. One sheet collects a handle, an 18+ checkbox, and Google or a magic link. The staged position is placed when sign-in returns. Recognition is two beats: a Saturday position, and a position still held at Sunday 11:30 a.m. PT. `research/07-incentives.md` keeps its room tactics. Its 20% split, 3:00 p.m. lock, and three checkpoints are marked superseded.

No product code changed. Tests were not re-run. Phase B was not started. Nothing was posted or sent.

## 2026-11-13 Sports as a later business line

Nico wants club sports and NCAA sports tackled eventually. `research/04-business-model.md` now has that as a later line: a public result, a read-only probability, no price, and no buyer yet. It stays closed until Athletics compliance says yes in writing. It is not on the weekend board and not in the weekend pitch. `research/00-summary.md` points at that note.

No product code changed. Tests were not re-run. Phase B was not started. Nothing was posted or sent.

## 2026-11-13 Phase B: offline market drafts

Nico said go on Phase B. `src/lib/ai/generate-markets.ts` drafts one campus market from an allowed announcement, or rejects with the banned class id. It does not call the network and does not insert a row. `npx vitest run evals` passed, 10 / 10. No Discord, GitHub, Reddit, professor-rating, or sports crawl was added. The market shape stays LMSR.

`src/lib/lmsr.ts`, `brier.ts`, `scoring.ts`, and `ledger.ts` now implement the harness. `npm test` passed, 33 / 33. `npm run typecheck` passed on that tree.

## 2026-11-13 Phase B: SQL migrations, not applied

Four files are in `supabase/migrations/`. RLS is on for profiles, markets, outcomes, trades, credit_ledger, scores, and resolutions. Anon and authenticated have no write policy on those server tables. Profiles can be selected by the owner, and authenticated can update only display_name. The seed has 15 markets. Markets 1 and 2 are open and each has a house subsidy of 69.31471805599453 virtual credits. Markets 3 through 15 are drafts. The files were read and not applied to a hosted database. No `.env` was read.

## 2026-11-13 Prize pool set to 50 percent

Nico changed the pool from 25% to 50% and kept the top 10. On a $4,000 first place the pool is $2,000 and the builders keep $2,000. On first place plus the challenge the pool is $2,500 and the builders keep $2,500. The checks are the geometric list in `research/00-summary.md`, adjusted so they sum to the pool. The economics note still records why it recommended 25%. The live rule is the summary. A cash award can be taxable even if no form is sent. This is not tax advice. The dollars stay unannounced. Nothing was posted or sent.

## 2026-11-13 Sophie agreed to the 50 percent pool

Sophie agreed to give 50% of what the team actually receives to the top 10 forecasters. The organizer has not confirmed that the prize rules allow sharing. Nico has not accepted that a lawyer has not reviewed a cash prize. A tax advisor has not reviewed it. The spoken line stays the question, free, one position. The tax disclaimer stays in the written rules. Nothing was posted or sent.

## 2026-11-13 Permission to split, no lawyer

Nico stated the team has permission to split its hackathon earnings, and that no lawyer is required. The folder does not contain that permission. Sophie had already agreed to 50% for the top 10. The team may say that plan. The default sentence at the table is still the question, free, one position. The team pays tax on the prize it receives, then gives the pool. A person who receives a cash award can still owe tax on it. This is not tax advice. Do not call the award tax-free. The organizer draft's split question is closed and was not sent. Hackathon-market permission and the event-name question are still open. Nothing was posted or sent.

## 2026-11-13 No permit to ask

Nico asked why a participant needs permission to use the event name or to run forecast questions. The live rule no longer treats either as a permit. A participant may say they are at this hackathon. A question opens when its source is named. It stays off when that source does not exist. The copy still must not say the clubs or the university operate Campus Call. The unsent organizer note's first two asks are withdrawn. Nothing was posted or sent.

## 2026-11-13 Permission tests written, not run

Seven pgTAP files are in `supabase/tests/`. They check that a normal user cannot write trades, credits, scores, resolutions, markets, or outcomes, and cannot read a draft market. Docker is not available, so `supabase test db` was not run. The migrations were not applied to a hosted database. The app build is still in progress and is not merged. The participant sheet in that build is only a team name, a one-line pitch, and an optional link. That sheet is not the demo.

## 2026-11-13 Demo spec locked

Nico confirmed the product. The spec is `research/10-build-spec.md`. Home shows campus examples and takes no credits. The QR opens the hackathon event. 1,000 virtual credits are granted once, after the QR plus an email and a name. Four tickets spend that balance. The same team may be on more than one ticket. The Chick-fil-A line is an admin-only demo. The trading app is not the front door. Nothing was posted or sent.

## 2026-11-13 Build config pointed at the spec

`TASKS.md` now lists the demo as the current build and parks the old quote, trade, and leaderboard items. `research/09-room-card.md` now sends the QR to the hackathon event. The second-brain plan is committed locally on `brain/campus-call-2026-11-14-064240`. It is not pushed. EP-1163, EP-1165, and EP-1166 are marked done. EP-1164 is ready and points at the spec. EP-1162 is still a duplicate with vitalisx-app and was not edited. Docs only. Tests were not re-run. Nothing was posted or sent.

## 2026-11-13 Schedule source is the participant guide

Nico removed the chat-server tie-break. The participant guide is the schedule source for the demo. Docs only. Tests were not re-run. Nothing was posted or sent.

## 2026-11-13 Build list names the guide

`TASKS.md` now says the participant guide is the only schedule source for the four tickets. Docs only. Tests were not re-run. Nothing was posted or sent.

## 2026-11-13 Resume name recorded

A later agent looked for the session notes in `~/.claude/second-brain.md` and did not find them. The team brain is `C:/lec-brain`. This folder resumes as `vibe-coding-hackathon`. `AGENTS.md` now says that. The product spec was already on `main`. Docs only. Tests were not re-run. Nothing was posted or sent.

## 2026-11-13 Saves during the night

Each green stage gets a Campus Call commit. Mode A and each EP also get a local brain handoff. Neither is pushed during the night. The policy lens of program Mode A returned 9.8 with no blocking or major findings. The other three lenses were still running. Docs only.

## 2026-11-13 Overnight resume file

`docs/overnight/STATE.md` is the stage pointer. Chat history is not memory. One fresh agent per stage. The Grok session has to stay open and the computer awake. Docs only.

## 2026-11-13 Autonomous TierraDex loop

Nico asked the overnight run to use TierraDex's design, Mode A, build, Mode B, and Mode C sequence, and to keep going after each pass without waiting for his review. `docs/overnight/LEAD-PROMPT.md` is that contract. Mode A is once, on the locked spec and the EP plan, before product code. Each EP then builds, passes Mode B, and passes Mode C when it changes a screen. Thresholds stay strict. The old UI target of weighted 9 and floor 8 is withdrawn. Hosting and migration permissions are unchanged. `scripts/score.ps1` remains the preview check. Docs and the Mode A rubric only. Tests were not re-run. Nothing was posted or sent. The product build starts when Mode A passes.
