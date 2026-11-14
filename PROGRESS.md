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

## 2026-11-14 CC-004 accepted

Mode C round 1 passed. Weighted 9.73. Every dimension is at least 9.6. No blocking or major findings. Two minors stay. Mode B had already passed at 9.85. CC-004 is accepted. The One balance row in TASKS.md stays open for the persistent grant. CC-005 is next. The local brain handoff is still due. Nothing was pushed.

## 2026-11-14 CC-004 full-width market row

The QR door's market-probability row now uses one column, so it matches the demo form's width. Example outcome pairs stay two-up. Tests passed, 52 of 52. The three enrollment captures were replaced. Round 1 is next. The EP is not accepted.

## 2026-11-14 CC-004 Mode C round 0 fail

The enrollment captures scored 9.59. Spatial rhythm was 9.3. On desktop the market-probability row is half the card while the demo form is full width. One major. The EP is not accepted. The door row is being widened, then the three captures are scored again.

## 2026-11-14 CC-004 enrollment captures

The QR door with the demo form is captured at 1280×720, 390×844, and 375×812. The form, the device-local copy, and the closed-entry note are in the frame. Mode C is next. The EP is not accepted.

## 2026-11-14 CC-004 Mode B pass

Round 4 passed. Correctness 10.0, security 10.0, cut completeness 9.7, and UI code 9.7. Weighted 9.85. No blocking or major findings. Two minors stay. The EP is not accepted until Mode C passes. Product commit remains `fcbb9ea`.

## 2026-11-14 CC-004 call unwrap

The parser now unwraps parentheses, non-null assertions, casts, and comma expressions, and it counts `foo.startDeviceDemo`. The only resolved call must sit inside `onStartDemo`. `npm test` exit 0, 52 tests. Lint and typecheck exit 0. Round 4 is next. The EP is not accepted.

## 2026-11-14 CC-004 Mode B round 3 fail

Cut completeness scored 9.6. The parser misses a parenthesized call, a non-null call, a comma call, and `foo.startDeviceDemo`. Correctness 10.0, security 10.0, and UI code 9.7. Weighted 9.825. One major remains. The EP is not accepted. The unwrap is next, then a fresh round.

## 2026-11-14 CC-004 parser assertion

The enrollment test now parses `qr-enrollment.tsx` with the TypeScript parser. One `startDeviceDemo` call must sit inside `onStartDemo`, including a space or newline before the parenthesis. An alias in an effect fails the same check. `npm test` exit 0, 52 tests. Lint and typecheck exit 0. Round 3 is next. The EP is not accepted.

## 2026-11-14 CC-004 Mode B round 2 fail

Cut completeness scored 9.6. Brace matching still misses a call with space before the parenthesis, or a string that shifts the braces. Correctness 10.0, security 10.0, and UI code 9.7. Weighted 9.825. One major remains. The EP is not accepted. A TypeScript parse of the component is next, then a fresh round.

## 2026-11-14 CC-004 brace-matched demo assertion

The only `startDeviceDemo(` call must sit in the brace-matched body of `onStartDemo`. Every effect must omit that call and `onStartDemo`. The only other `onStartDemo` reference is the submit binding. The rejection test now covers an 81-character name and `ada@example.c`. `npm test` exit 0, 52 tests. Lint and typecheck exit 0. Round 2 is next. The EP is not accepted.

## 2026-11-14 CC-004 Mode B round 1 fail

Cut completeness scored 9.6. The new assertion still allows a second effect to be the only `startDeviceDemo(` call. Correctness 10.0, security 10.0, and UI code 9.7. Weighted 9.825. One major remains. The EP is not accepted. The brace-matched assertion is next, then a fresh round.

## 2026-11-14 CC-004 demo-start assertions

The round 0 major finding is covered by tests. `startDeviceDemo(` must sit inside `onStartDemo`, the form must submit through that handler, the effect must not call it, and the first paint must omit `Demo on this device`. `npm test` exit 0, 52 tests. Lint and typecheck exit 0. Round 1 is next. The EP is not accepted.

## 2026-11-14 CC-004 Mode B round 0 fail

Cut completeness scored 9.4 with one major finding. The explicit-demo tests call `startDeviceDemo` themselves and do not prove the form starts it only from submit. Correctness 10.0, security 10.0, and UI code 9.7. Weighted 9.775. The EP is not accepted. The cited test assertions are next, then a fresh round.

## 2026-11-14 CC-004 Mode B, three lenses

Correctness scored 10.0 and security scored 10.0. UI code scored 9.7 with one minor: `--radius-lg` is used and not defined. Cut completeness is still running. The enrollment code was not edited. The EP is not accepted.

## 2026-11-14 CC-004 awaiting Mode B

QR enrollment and explicit demo mode are commit `fcbb9ea`. Tests, lint, typecheck, and the Next build passed in that step: 52 tests. Mode B round 0 is the next score. The EP is not accepted. CC-005 has not started.

## 2026-11-14 CC-003 accepted

Mode C round 0 passed. Weighted 9.70. Every dimension is at least 9.6. No blocking or major findings. One minor stays: on desktop the closed-door stack sits in the left of the filled panel. Mode B had already passed at 9.925. CC-003 is accepted. The QR parent in TASKS.md is checked. CC-004 is next. The local brain handoff is still due. Nothing was pushed.

## 2026-11-14 CC-003 door panel

The first capture left the lower screen bare black. The hackathon event panel now fills the column, the same way the accepted home empty state does. Tests passed, 44 of 44. The new captures are in `.agent/research/ui-pixel/hackathon/`. Mode C is next. The EP is not accepted.

## 2026-11-14 CC-003 Mode B pass

Cut completeness scored 9.9. With correctness 10.0, security 10.0, and UI code 9.8, the weighted score is 9.925. No blocking or major findings. The EP is not accepted until Mode C passes. Product commit remains `3c88f89`.

## 2026-11-14 CC-003 Mode B, correctness and UI code

Correctness scored 10.0 and UI code scored 9.8. Neither had a finding. Security had already passed at 10.0. Cut completeness was still running, so the door was not edited. The EP is not accepted.

## 2026-11-14 CC-003 Mode B, security

Security scored 10.0 with no findings on commit `3c88f89`. The other three Mode B lenses were still running. The door was not edited. The EP is not accepted.

## 2026-11-14 CC-003 awaiting Mode B

The hackathon QR door is commit `3c88f89`. Tests, lint, typecheck, and the Next build passed in that step. Mode B round 0 is the next score. The EP is not accepted.

## 2026-11-14 CC-002 accepted

Mode C passed at weighted 9.72. Every dimension is at least 9.5. No blocking or major findings. Mode B had already passed at 9.9. CC-002 is accepted. The Home parent in TASKS.md is checked. CC-003 is next. The local brain handoff is still due. Nothing was pushed.

## 2026-11-14 CC-002 Mode B pass

Correctness scored 9.8 and cut completeness scored 10.0. With security 10.0 and UI code 9.8, the weighted score is 9.9. No blocking or major findings. Two minors stay. The EP is not accepted until Mode C passes. Product commit remains `35432c6`.

## 2026-11-14 CC-002 Mode B, UI code

UI code scored 9.8 with one minor: the confirm note is not an aria-live region. Security had already passed at 10.0. Correctness and cut completeness were still running, so the cards were not edited. The EP is not accepted.

## 2026-11-14 CC-002 Mode B, security

Security scored 10.0 with no findings on commit `35432c6`. The other three Mode B lenses were still running. The cards were not edited. The EP is not accepted.

## 2026-11-14 CC-002 awaiting Mode B

The example cards and event view are commit `35432c6`. Tests, lint, typecheck, and the Next build passed in that step. Mode B round 0 is the next score. The EP is not accepted.

## 2026-11-14 CC-001 accepted

Mode C round 2 passed. Weighted 9.74. Every dimension is at least 9.7. No blocking or major findings. Mode B had already passed at 9.9. CC-001 is accepted. The Home parent stays open for CC-002. The local brain handoff is still due. Nothing was pushed.

## 2026-11-14 CC-001 Mode C round 1 fail

The pixel score was 9.48. The All chip was at x=16 while the wordmark was at x=96, because the list's margin reset cancelled centering. The list now sits inside the frame. Measured x is 96 at 1280px and 16 at 390px and 375px for the wordmark, the chip, and the empty card. Tests passed, 35 of 35. New captures are in `.agent/research/ui-pixel/home/`. Round 2 is next. The EP is not accepted.

## 2026-11-14 CC-001 Mode C round 0 fail

The pixel score was 9.43. The category row and the empty card did not share one column, and the lower screen was bare black. The shell now uses one inset, the search fills the header, and the empty region fills the column. Tests passed, 35 of 35. New captures are in `.agent/research/ui-pixel/home/`. Round 1 is next. The EP is not accepted.

## 2026-11-14 CC-001 Mode B pass

UI code scored 9.8. With correctness 10.0, security 10.0, and cut completeness 9.8, the weighted score is 9.9. No blocking or major findings. Two minors stay. The EP is not accepted until Mode C passes. Product commit remains `41cb9d9`.

## 2026-11-14 CC-001 Mode B, correctness and cut

Correctness scored 10.0. Cut completeness scored 9.8 with one minor on the narrow-screen test. Security had already passed at 10.0. UI code was still running, so the shell was not edited. The EP is not accepted.

## 2026-11-14 CC-001 Mode B, security

Security scored 10.0 with no findings on commit `41cb9d9`. The other three Mode B lenses were still running. The shell was not edited. The EP is not accepted.

## 2026-11-14 CC-001 awaiting Mode B

The home shell is commit `41cb9d9`. Tests, lint, typecheck, and the Next build passed in that step. Mode B round 0 is the next score. The EP is not accepted.

## 2026-11-14 Mode A pass

Round 3 passed. Policy 9.8, cut order 9.8, completeness 9.9, architecture 9.8. Weighted 9.825. No blocking or major findings. Three minors stay in the plan. `GATE-RESULT.md` records the pass against scored commit `9c83c89`. CC-001 is the next stage. The local brain handoff for this gate was not written in this step. The repo commit is the save.

## 2026-11-14 Mode A round 3, policy and architecture

Policy scored 9.8 and architecture scored 9.8. Neither had a blocking or major finding. Completeness had already passed at 9.9. Cut order was still running. The plan was not edited. Product code was not started.

## 2026-11-14 Mode A round 3, completeness

Completeness scored 9.9 with no findings. Policy, architecture, and cut order were still running. The plan was not edited. Product code was not started.

## 2026-11-14 Mode A round 2 fail

All four lenses returned. Weighted score 9.775. Cut order scored 9.6 with one major finding: "writes nothing" after the lock could be satisfied by replaying the pre-lock confirm. CC-006 now requires a first confirm, with no earlier commit, to be refused at and after the lock, and it keeps the replay as its own check. Product code was not started. Round 3 grades that sentence.

## 2026-11-13 Mode A round 2, architecture and completeness

Architecture scored 9.8 with no blocking or major findings. Completeness scored 9.9 with no findings. Cut order was still running. The plan was not edited. Product code was not started.

## 2026-11-13 Mode A round 2, policy

Policy scored 9.8 with no blocking or major findings. The same two minor notes remain. The other three round-2 lenses were still running. The plan was not edited under them. Product code was not started.

## 2026-11-13 Mode A round 1 fail

All four lenses returned. Weighted score 9.725. Cut order scored 9.4 with one major finding: the lock check did not say a confirm at or after Sunday noon writes nothing. CC-006, CC-016, and CC-017 now say what a pass and a fail look like. Product code was not started. Round 2 grades those three cells.

## 2026-11-13 Mode A round 1, completeness

Completeness scored 9.9 with no findings. Cut order was still running. The plan was not edited. Product code was not started.

## 2026-11-13 Mode A round 1, architecture

Architecture scored 9.8 with no blocking or major findings. One minor remains on an odd leftover dollar in a cash tie. Cut order and completeness were still running. The plan was not edited under them. Product code was not started.

## 2026-11-13 Mode A round 1, policy only

Policy scored 9.8 with no blocking or major findings. The other three round-1 lenses were still running. The plan was not edited under them. Product code was not started.

## 2026-11-13 Mode A round 0 fail

All four lenses returned. Weighted score 9.45. Five major findings, no blocking findings. The plan now says Chick-fil-A debits a separate allowlisted demo balance, a sourced pre-noon entry can open a challenge ticket, prize dollars use Hamilton largest remainder, and the CC-005 through CC-017 checks can fail. Product code was not started. Round 1 grades the patched plan.

## 2026-11-13 Mode A round 0, partial

Policy scored 9.8 and completeness scored 9.8. Cut order scored 9.0 with 3 major findings, so this round cannot pass. Architecture was still running. Product code was not started. The three results are committed under `.agent/research/cc-program-design-autoresearch/`.

## 2026-11-13 Saves during the night

Each green stage gets a Campus Call commit. Mode A and each EP also get a local brain handoff. Neither is pushed during the night. The policy lens of program Mode A returned 9.8 with no blocking or major findings. The other three lenses were still running. Docs only.

## 2026-11-13 Overnight resume file

`docs/overnight/STATE.md` is the stage pointer. Chat history is not memory. One fresh agent per stage. The Grok session has to stay open and the computer awake. Docs only.

## 2026-11-13 Autonomous TierraDex loop

Nico asked the overnight run to use TierraDex's design, Mode A, build, Mode B, and Mode C sequence, and to keep going after each pass without waiting for his review. `docs/overnight/LEAD-PROMPT.md` is that contract. Mode A is once, on the locked spec and the EP plan, before product code. Each EP then builds, passes Mode B, and passes Mode C when it changes a screen. Thresholds stay strict. The old UI target of weighted 9 and floor 8 is withdrawn. Hosting and migration permissions are unchanged. `scripts/score.ps1` remains the preview check. Docs and the Mode A rubric only. Tests were not re-run. Nothing was posted or sent. The product build starts when Mode A passes.

## 2026-11-14 CC-001 home shell

Added the Next.js App Router foundation and the responsive home shell. The top bar shows Campus Call, a search field, and Portfolio. The category row shows All, Sports, Music, Dining, and Hackathon. Those controls are visible and inert. Example cards, filtering, and event pages are not in this step. `src/lib` was not moved.

`npm test` exited 0 (35 passed, 6 files). `npm run lint` exited 0. `npm run typecheck` exited 0. `npm run build` exited 0. `scripts/score.ps1` was not the pass check. No `.env` file was read. Nothing was pushed. Mode B has not started. A second writer must not start.

## 2026-11-14 CC-002 example forecasts

Home lists example forecasts we wrote. Each card shows a question, a close, an Example label, and the leading outcomes with market probabilities. The shapes are yes/no, higher/lower, and earlier/later. All, Sports, Music, Dining, and Hackathon filter the list, and a search or an unknown category can empty it. The category and the search text are in the URL. Tapping a percentage opens `/examples/[id]`. Confirm is visible and does not write, debit, or send a request. `src/lib` was not moved. TASKS.md was not checked off.

`npm test` exited 0 (40 passed, 7 files). `npm run lint` exited 0. `npm run typecheck` exited 0. `npm run build` exited 0. `scripts/score.ps1` was not the pass check. No `.env` file was read. Nothing was pushed. Mode B has not started. A second writer must not start.

## 2026-11-14 CC-003 hackathon QR door

`/hackathon?entry=qr&event=hackathon` opens the hackathon event only. Refresh renders that same event. The page does not render Home and does not show the example cards. Staged entry context stays on the market-probability link and on the return to the event. Entry is not open yet. The page does not grant virtual credits, write a ledger, or show the four tickets. Home still lists the example cards.

`npm test` exited 0 (44 passed, 8 files). `npm run lint` exited 0. `npm run typecheck` exited 0. `npm run build` exited 0. `scripts/score.ps1` was not the pass check. No `.env` file was read. Nothing was pushed. Mode B has not started. A second writer must not start.

## 2026-11-14 CC-004 QR enrollment

The hackathon QR door collects a name and an email only when `entry=qr` and `event=hackathon`. An empty name, a blank email, or a malformed email does not create a session. Demo starts only from Start demo, is labeled Demo, and stays on this device. The copy says it is not a verified account, does not grant virtual credits, and that entering an email is not verified ownership. Home and the example routes do not render the form. Opening the door still returns granted 0 and wrote false. Live mode returns only for a server-issued session. A test callback, a query flag, a request header, a client boolean, or a copied session cannot reach it. A missing verified session does not become demo. No database, migration, or ledger credit was added. The One balance row in TASKS.md is still open. CC-005 was not started.

`npm test` exited 0 (52 passed, 9 files). `npm run lint` exited 0. `npm run typecheck` exited 0. `npm run build` exited 0. `scripts/score.ps1` was not the pass check. No `.env` file was read. Nothing was pushed. Mode B is next. The EP is not accepted. A second writer must not start.
