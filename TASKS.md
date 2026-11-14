# Tasks

Campus Call lanes: 3a DATA, 3b MARKET ENGINE, 3c FRONTEND, 3d AI, 3e E2E/QA.

Vocabulary is forecast, position, market probability, and points. Never bet, wager, odds, or payout.

3e owns the harness. Do not weaken, skip, or delete tests. Do not edit `scripts/score.ps1`. Virtual credits only. No real-money columns. Do not read `.env` files. Do not run `vercel --prod`.

Phase B starts only after Nico says go. The loop's judge is `scripts/score.ps1`, not an opinion. `npm test` is the unit suite only.

Product decisions locked in `research/00-summary.md`:

- New accounts get 1000 virtual credits. Liquidity `b` is 100 on every launch market.
- Each resolved market adds `round(100 * (1 - brier))` points. That formula is locked by tests.
- Prize rank is mean Brier across markets the person traded, lower better, and only if they have at least 3 resolved markets. The public board shows both numbers and sorts by mean Brier. People under 3 markets still appear.
- Hackathon markets stay drafts until organizers approve them. The two airport markets can open without that approval.

- [x] 3e: Phase A eval harness (score script, failing unit/e2e/AI specs, banned-topic checker)
- [ ] 3b: Implement src/lib/lmsr.ts, src/lib/brier.ts, src/lib/scoring.ts, and src/lib/ledger.ts so npm test passes. Do not change test assertions. Messages must include "insufficient credits" and "already resolved" where the ledger tests require them.
- [ ] 3a: Add a SQL migration for profiles, markets, and outcomes. Enable RLS and deny writes from anon and authenticated. No real-money columns. Profiles store a display handle, not a legal name.
- [ ] 3a: Add a SQL migration for trades and credit_ledger. Ledger writes are server-only. A balance is the sum of ledger amounts. The house account id is house. New users receive 1000 virtual credits once.
- [ ] 3a: Add a SQL migration for scores and resolutions. One resolution per market. Store per-market points, Brier, and the pre-trade YES probability. Virtual-credit profit is redeemed credits minus credits spent.
- [ ] 3a: Seed the 15 launch markets from research/00-summary.md. b = 100. Starting market probability equal across outcomes. Markets 1 and 2 (KSBP) are open. Markets 3–15 are drafts and reject trades until a human publishes them. Close times are the ones in that memo.
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
- [ ] 3d: Implement generateMarkets so npx vitest run evals passes with no network and no API key. A reject result is { rejected: true, reason } and reason contains the banned class id. Do not insert a market.
- [ ] 3d: Add a probability-move explainer that uses the position log only and does not create a forecast.
- [ ] 3d: Add a resolution assistant note that a human must confirm before a resolution is written.
- [ ] 3e: Make e2e/campus-call.spec.ts pass on desktop 1280x720 and mobile 390x844. Do not weaken or skip it. Record the scripts/score.ps1 number in PROGRESS.md.
