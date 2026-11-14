# Tasks

Campus Call lanes: 3a DATA, 3b MARKET ENGINE, 3c FRONTEND, 3d AI, 3e E2E/QA.

Vocabulary is forecast, position, market probability, and points. Never bet, wager, odds, or payout.

3e owns the harness. Do not weaken, skip, or delete tests. Do not edit `scripts/score.ps1`. Virtual credits only. No real-money columns. Do not read `.env` files. Do not run `vercel --prod`.

Nico locked the current build on 13 November 2026 and authorized the overnight run the same day. Start CC-001 after program Mode A passes. Do not start product code before that gate. `npm test` remains the unit suite. `scripts/score.ps1` still runs the old end-to-end spec, so it is not the judge of the new screens until that spec is replaced.

## Current build

Build `research/10-build-spec.md`. That file is the demo. Do these in order. Do not start a parked item while one of these is open.

Overnight execution: `docs/overnight/LEAD-PROMPT.md` is the loop. It chains one program Mode A, then each EP as build, Mode B, and Mode C when a screen changes, and it continues after a passing gate without waiting for review. `docs/overnight/GOAL.md` is the shared brief. `docs/overnight/EP-PLAN.md` is the job list. Routine decisions go in `docs/overnight/DECISIONS.md`. Status notes go in `docs/brain/` in this repository. Do not write them to `C:/lec-brain` or `compuwood/lec-agent-config`. Do not use `scripts/loop.ps1` for this queue.

Status on 14 November 2026: Home and the QR route are accepted. The one-time grant is in the database and in `src/app/participant-grant.ts`. The door still grants 0, so One balance stays open. The four tickets have a local confirm function and a forecast-section list. A page submit writes nothing, so that row stays open. Portfolio is next. Do not check a row until that path is complete.

- [x] Home. Campus example list. Categories All, Sports, Music, Dining, and the hackathon. Each campus card is labeled Example. Confirm does nothing and spends nothing.
- [x] QR route. Opens the hackathon event only. No home, and no example cards.
- [ ] One balance. Grant 1,000 virtual credits once, after the QR plus an email and a name. The same email does not get a second grant.
- [ ] Four hackathon tickets. Main prize is 1st, 2nd, and 3rd. Then OpenAI, Startup Launch, and Best Use of AI. Each ticket confirms on its own. The same team may be named more than once. An overspend is refused and writes nothing. Picks lock Sunday 15 November 2026 at 12:00 p.m. PT. The participant guide is the only schedule source: https://cpvc-ai-hackathon-guide.vercel.app/#fri .
- [ ] Team cards. Start when a project link exists. Show the project, whether the live link runs, feasibility, a public-profile background, and the guide's rubric with a one-line reason. A challenge ticket lists only teams who entered it.
- [ ] Admin demo. The Chick-fil-A line accepts credits only from an admin. Everyone else sees a preview, and confirm does nothing.
- [ ] Prize copy. 50% of what this team receives, top 10 geometric, $0 if the team wins nothing. The tax line is in the same breath as any dollar amount.
- [ ] Completion. Source-backed official results and demo rank, new-flow desktop/mobile acceptance, rendered UI review, final security/data checks, and an allowed preview only when the existing score-script gate applies. Report local demo and real-participant readiness separately. See CC-015 through CC-018.

Screen words are forecast, position, market probability, points, and virtual credits. The demo rank is how the four tickets did against the official result. Mean Brier stays in the unit tests. It is not this rank.

The existing end-to-end spec still expects a login and a YES purchase. Leave it in place until a later item replaces it with the flow above. Do not pass it by restoring the trading front door. Do not edit `scripts/score.ps1`.

## Harness already on main

These are done. They stay. They are not the front door. A question needs a named source. It does not need an organizer permit.

- [x] 3e: Phase A eval harness (score script, failing unit/e2e/AI specs, banned-topic checker)
- [x] 3b: Implement src/lib/lmsr.ts, src/lib/brier.ts, src/lib/scoring.ts, and src/lib/ledger.ts so npm test passes. Do not change test assertions. Messages must include "insufficient credits" and "already resolved" where the ledger tests require them.
- [x] 3a: Add a SQL migration for profiles, markets, and outcomes. Enable RLS and deny writes from anon and authenticated. No real-money columns. Profiles store a display handle, not a legal name.
- [x] 3a: Add a SQL migration for trades and credit_ledger. Ledger writes are server-only. A balance is the sum of ledger amounts. The house account id is house. New users receive 1000 virtual credits once.
- [x] 3a: Add a SQL migration for scores and resolutions. One resolution per market. Store per-market points, Brier, and the pre-trade YES probability. Virtual-credit profit is redeemed credits minus credits spent.
- [x] 3a: Seed the 15 launch markets from research/00-summary.md. b = 100. Starting market probability equal across outcomes. Markets 1 and 2 (KSBP) are open. Markets 3–15 are drafts and reject trades until a human publishes them. Close times are the ones in that memo.

## Parked harness

Do not build these as the demo. They describe the old binary market.

- [ ] 3b: Add POST /api/quote. Return the LMSR cost and the post-trade YES probability. Do not write.
- [ ] 3b: Add POST /api/trade. Debit virtual credits, append a trade at the pre-trade YES probability, and reject an overspend without writing. Reject trades on drafts, after close, and from Nico, Sophie, a flagged organizer or judge, or a user on the team that market is about.
- [ ] 3b: Add GET /api/portfolio with balance, positions, points, mean Brier, resolved count, and virtual-credit profit.
- [ ] 3b: Add POST /api/resolve. Redeem 1 virtual credit per winning share exactly once. A human confirms. Honor header x-campus-call-test-admin: 1 only when CAMPUS_CALL_TEST_MODE is 1. A second resolve throws.
- [ ] 3b: Add GET /api/leaderboard. Return points and mean Brier. Sort by mean Brier ascending. Mark prizeEligible only when resolved markets are at least 3. Include the signed-in email. The e2e spec only checks that the email appears.
- [ ] 3b: Add POST /api/test/magic-link. Only when CAMPUS_CALL_TEST_MODE is 1, return { confirmUrl } and do not send mail. Otherwise 404. Each confirm creates the user with 1000 virtual credits and a fresh open binary market.
- [ ] 3c: Add the mobile-first App Router shell and /login with data-testid email and send-magic-link. Visiting confirmUrl signs that email in.
- [ ] 3c: Add / with data-testid market-list and at least one market-card for the fresh test-mode market. Draft hackathon markets are hidden from this list.
- [ ] 3c: Add /markets/[id] with data-testid market-price-yes showing the YES probability as a fraction in (0, 1] or a percent greater than 1.
- [ ] 3c: Add an inline SVG probability chart on /markets/[id]. Do not add a chart library.
- [ ] 3c: Add data-testid share-input, buy-yes, and credit-balance. Buying YES spends virtual credits and raises the YES probability.
- [ ] 3c: Add /portfolio with data-testid portfolio-position. After resolution, show data-testid points and brier-score.
- [ ] 3c: Add /leaderboard with data-testid leaderboard showing the signed-in email.
- [ ] 3c: Add /admin with data-testid admin-resolve. It resolves the signed-in user's open test market to YES. Show manipulation flags. Flags do not resolve a market.
- [ ] 3c: Add /rules with the Official Rules from research/00-summary.md. State that virtual credits have no cash value, how mean Brier and points differ, the banned topics, and that no cash prize exists until that section is updated in writing.
- [ ] 3c: Add an opt-in form: team name, one-line pitch, optional public link. Category stays off until organizers freeze a list. People who do not submit are not listed.
- [x] 3d: Implement generateMarkets so npx vitest run evals passes with no network and no API key. A reject result is { rejected: true, reason } and reason contains the banned class id. Do not insert a market.
- [ ] 3d: Add a probability-move explainer that uses the position log only and does not create a forecast.
- [ ] 3d: Add a resolution assistant note that a human must confirm before a resolution is written.
- [ ] 3e: Make e2e/campus-call.spec.ts pass on desktop 1280x720 and mobile 390x844. Do not weaken or skip it. Record the scripts/score.ps1 number in PROGRESS.md.
