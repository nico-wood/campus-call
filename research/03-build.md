# Campus Call build plan (Phase A)

Phase A is the plan and the eval harness. It does not implement markets, pages, Supabase, or the market generator. Feature code is supposed to be absent, so the score is supposed to be low. Phase B starts only after Nico reviews this note.

Vocabulary in code, tests, and UI: forecast, position, market probability, points. Virtual credits only. No real-money columns, no payment provider, no cash value.

Observed score from `powershell -ExecutionPolicy Bypass -File .\scripts\score.ps1` on 2026-11-13: **22.8788**.

| Piece | Result | Weight |
| --- | --- | --- |
| E2E | 0 / 2 failed (0 skipped). No app server. | 50 → 0 |
| Unit | 17 / 33 passed. Banned-topic tests pass. LMSR, Brier, points, and ledger throw `not implemented`. | 25 → 12.8788 |
| AI evals | 0 / 10 passed. `generateMarkets` throws `not implemented`. | 15 → 0 |
| Lint and typecheck | both exit 0 | 10 → 10 |

`npx playwright install chromium` completed (Playwright Chromium 159.0.8154.6). E2E still scores 0 because there is no server.

## Supabase schema

Deny by default. Enable row level security on every table before adding policies. If a policy is missing, the role gets nothing. The browser never receives the service-role key. Server routes write. Clients do not insert trades, ledger rows, scores, or resolutions.

No currency, no cash amount, no payment id. `numeric` columns are virtual credits.

Suggested dev-only migrations (do not apply them to a hosted database from this phase, and do not paste them into a production dashboard):

### profiles

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | same as `auth.users.id` |
| email | text | unique |
| display_name | text | optional |
| created_at | timestamptz | default now |

RLS: a user may select and update their own display name. No client insert. The magic-link route inserts via the service role.

### markets

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| question | text | not null |
| category | text | `campus`, `knowledge`, or `academic` |
| resolution_source | text | not null |
| close_at | timestamptz | not null |
| b | numeric | liquidity. Harness example uses 100 |
| q_yes | numeric | default 0 |
| q_no | numeric | default 0 |
| status | text | `open`, `closed`, or `resolved` |
| created_at | timestamptz | |

RLS: anon and authenticated may select markets that are not drafts. No client write.

### outcomes

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| market_id | uuid fk | |
| label | text | `YES` or `NO` only |

One row each. RLS: select if the parent market is selectable. No client write.

### trades

Immutable fills. A position is the sum of shares for one user, market, and side. Do not keep a second balance that can drift from this log.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| user_id | uuid fk | |
| market_id | uuid fk | |
| side | text | `yes` or `no` |
| shares | numeric | check `> 0` |
| cost_credits | numeric | check `> 0`. Credits moved to the house |
| probability_yes | numeric | YES probability **before** the trade, in [0, 1] |
| created_at | timestamptz | |

RLS: a user may select their own rows. Inserts are server-only.

### credit_ledger

Source of truth for virtual credits. Balance of an account is `sum(amount)`. The house account id is the text `house`. User account ids are profile uuids as text.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| account_id | text | `house` or a user id |
| market_id | uuid null | |
| amount | numeric | signed. Positive adds credits |
| reason | text | `subsidy`, `trade`, or `redemption` |
| created_at | timestamptz | |

RLS: a user may select rows where `account_id` is their id. No client write. No account sum may go negative. Enforce that in the same transaction as the insert.

### scores

One row per user per resolved market.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| user_id | uuid | unique with market_id |
| market_id | uuid | |
| probability_yes | numeric | volume-weighted YES probability across that user's trades |
| outcome_yes | int | 1 if YES, 0 if NO |
| brier | numeric | `(probability_yes - outcome_yes)^2` |
| points | int | `round(100 * (1 - brier))` |
| credits_spent | numeric | sum of that user's trade costs on this market |
| credits_redeemed | numeric | winning shares, 1 credit each |

Virtual-credit profit is `credits_redeemed - credits_spent`. Compute it. Do not store it under another name.

RLS: a user may select their own rows. Writes are server-only.

### resolutions

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | |
| market_id | uuid | unique. A second resolution is a conflict |
| outcome | text | `YES` or `NO` |
| resolved_by | uuid | the human who confirmed |
| assistant_note | text null | optional note from the resolution assistant |
| created_at | timestamptz | |

RLS: authenticated may select. Inserts are server-only, and only after a human confirms.

## Pages

Next.js App Router, mobile-first. Add the app in Phase B. Phase A has no `app/` directory and does not install Next, React, or Supabase.

| Path | Behavior |
| --- | --- |
| `/` | `data-testid="market-list"` contains at least one `data-testid="market-card"` |
| `/markets/[id]` | `data-testid="market-price-yes"` is a fraction in (0, 1] or a percent greater than 1. Inline SVG chart of YES probability. No chart library. `data-testid="share-input"`, `data-testid="buy-yes"`, `data-testid="credit-balance"` |
| `/portfolio` | `data-testid="portfolio-position"`. After resolution, `data-testid="points"` and `data-testid="brier-score"` |
| `/leaderboard` | `data-testid="leaderboard"` includes the signed-in email |
| `/admin` | `data-testid="admin-resolve"` resolves that user's open test market to YES |
| `/rules` | Virtual credits, Brier points, and banned topics, in plain language |
| `/login` | `data-testid="email"` and `data-testid="send-magic-link"` |

Touch targets and type should stay readable at 390px wide. Desktop is checked at 1280x720.

## API routes

| Route | Behavior |
| --- | --- |
| `POST /api/test/magic-link` | Body `{ email }`. Only when `process.env.CAMPUS_CALL_TEST_MODE === "1"`. Returns `{ confirmUrl }`. Does not send mail. Visiting `confirmUrl` signs that email in. Each confirm creates the user, a starting credit grant, and a fresh open binary market so the desktop and mobile e2e runs do not resolve the same market. |
| `POST /api/quote` | `{ marketId, side, shares }` → cost and post-trade YES probability. No write. |
| `POST /api/trade` | Debits the user, credits the house, appends a trade at the pre-trade YES probability, updates `q_yes` or `q_no`. Rejects an overspend with no write. |
| `GET /api/portfolio` | Balance, positions, points, Brier, virtual-credit profit. |
| `POST /api/resolve` | Admin only. Pays 1 virtual credit per winning share exactly once. There is no admin cookie. The header `x-campus-call-test-admin: 1` is honored only when `CAMPUS_CALL_TEST_MODE === "1"`. Ignore it otherwise. |
| `GET /api/leaderboard` | Users ordered by points. The row shows the email. |
| `POST /api/ai/generate` | Calls `generateMarkets`. Returns drafts or `{ rejected: true, reason }`. Does not insert a market. A human confirms before anything is listed. |

## LMSR

Binary Hanson LMSR. `b` is the liquidity parameter. `q_yes` and `q_no` are outstanding shares.

```
C(q_yes, q_no) = b * ln(exp(q_yes / b) + exp(q_no / b))
p_yes = exp(q_yes / b) / (exp(q_yes / b) + exp(q_no / b))
p_no = 1 - p_yes
cost to buy s YES shares = C(q_yes + s, q_no) - C(q_yes, q_no)
```

Buying NO adds `s` to `q_no` instead. Cost of a buy is strictly positive and rises with `s`.

Worked example: `b = 100`, `q = (0, 0)`. Prices are 0.5 and 0.5.

```
cost of 10 YES = 100 * ln(e^0.1 + 1) - 100 * ln(2)
              = 5.124947951363
              = 5.124948   to 6 decimal places
```

The same 10 NO shares cost 5.124948 by symmetry. `C(0, 0) = b * ln(2)`.

Bounded market-maker subsidy for a binary market is `b * ln(2)`. At `b = 100` that is `69.314718` to 6 decimal places (`69.314718055995`). Fund it by minting that many virtual credits into the house when the market is created. That is the most the house can lose if it later redeems every winning share.

Phase B implements this in `src/lib/lmsr.ts`:

- `lmsrCost(q: { yes: number; no: number }, b: number): number`
- `lmsrPrices(q, b): { yes: number; no: number }`
- `tradeCost(q, b, side: "yes" | "no", shares: number): number`

The file currently throws `not implemented`. Do not replace the tests with a looser tolerance. `tests/lmsr.test.ts` checks the 6-decimal example with `toBeCloseTo(5.124948, 6)`.

## Credit ledger

Cash means user balances plus the house. A successful trade does not change the sum: the user pays the cost-function delta and the house receives it.

Market creation is the exception. It mints `b * ln(2)` into `house` and does not debit a user. After that, trades and redemption conserve the sum.

On resolution, each winning share redeems for exactly 1 virtual credit, taken from the house. Losing shares redeem for 0. Hanson’s bound says the subsidy plus collected cost is enough to pay the winners. If a forged state would drive the house negative, throw and do not change balances.

No account may go negative. Functions in `src/lib/ledger.ts` are pure: they return a new state and do not mutate the input. They throw `not implemented` today.

| Function | Contract the tests lock |
| --- | --- |
| `emptyLedger(balances?)` | Starting balances. Default house is 0. |
| `createMarket(state, marketId, b)` | Mint `b * ln(2)` into `house`. User balances unchanged. |
| `trade(state, { marketId, userId, side, shares })` | Move `tradeCost` from the user to the house. Add shares to `q` and to that user's position. |
| `resolveMarket(state, { marketId, outcome })` | Pay `1` credit per winning share from the house. Set `resolved` and `outcome`. |

Required error substrings, matched case-insensitively:

- overspend, or a redemption the house cannot fund: `insufficient credits`
- second resolution: `already resolved`

`tests/ledger.test.ts` checks four things: an overspend throws and leaves the object unchanged; a 10-YES trade at `b = 100` conserves the sum of cash after the subsidy; resolution pays exactly 10 and a second call throws; a house with 0 credits cannot redeem 5 winning shares.

## Scoring

For one forecast, Brier is `(p - outcome)^2`. `outcome` is 1 for YES and 0 for NO. `p` is the YES market probability, even if the user bought NO.

`brierScore(0.7, 1)` is 0.09 and `brierScore(0.7, 0)` is 0.49 in real arithmetic. `0.7` is not a binary fraction, so `(0.7 - 1) ** 2` is not `=== 0.09` in IEEE. The tests use `toBeCloseTo(..., 12)`, which a direct implementation passes. `brierScore(1, 1) === 0` and `brierScore(0.5, 1) === 0.25` are exact.

If the user traded more than once, `p` is the share-weighted average of the pre-trade YES probabilities on their trades in that market.

```
points = Math.round(100 * (1 - brier))
```

`pointsFromBrier(0) === 100`, `pointsFromBrier(0.25) === 75`, `pointsFromBrier(1) === 0`. Lower Brier is a better forecast and yields more points.

Show virtual-credit profit beside points. It is redeemed credits minus credits spent. It is not the rank.

## AI features

Plan only, except the banned-topic checker.

| Feature | Rule |
| --- | --- |
| Market generator | `generateMarkets(announcement, deadline)` in `src/lib/ai/generate-markets.ts`. Offline. No API key. The eval must pass with no network. |
| Probability-move explainer | Words about why YES probability moved. Does not create a forecast. |
| Resolution assistant | A note a human must confirm. `/api/resolve` does not write on the model's say-so. |
| Manipulation flags | Shown to an admin. They do not resolve a market. |

`findBannedTopic(text): string | null` is implemented in `src/lib/ai/banned-topics.ts`. It is deterministic and does not use the network. Priority:

1. `exam-content` — exam, midterm, quiz, or final exam together with answers, questions, solutions, or confidential content
2. `individual-grade` — GPA, transcript, letter grade, or a grade tied to a named person
3. `individual-student` — a named student, or a proper name plus pass, fail, drop, enroll, or graduate
4. `single-person-outcome` — a professor, instructor, dean, provost, or chancellor canceling, postponing, or acting unilaterally

Campus place names in the fixture set (Cal Poly, Dexter Lawn, Kennedy Library, University Union, and the rest of the list in the checker) are not treated as people. Plural "students" with no person is allowed. The checker is conservative: a GPA mention or "professor" plus "cancel" is enough to flag.

Rejected generator results must be `{ rejected: true, reason: string }` and `reason` lowercased must contain the class id. Accepted markets must be:

```
{
  question: string,
  outcomes: ["YES", "NO"],
  resolutionSource: string,
  closeAt: ISO date,
  category: "campus" | "knowledge" | "academic"
}
```

`closeAt` must be `<= fixture.deadline`. `findBannedTopic(question)` must be null.

`evals/fixtures/announcements.json` has exactly 10 fixtures. Four reject: a named student, an individual grade, confidential exam content, and a professor canceling class. Six are campus or hackathon announcements with a `deadline`.

`generateMarkets` throws `not implemented`. That is why the AI rate is 0.

## Lane split

`TASKS.md` is the loop's list. Lanes: 3a DATA, 3b MARKET ENGINE, 3c FRONTEND, 3d AI, 3e E2E/QA. 3e owns this harness and must not weaken it.

The loop runs `npm test`, which is `vitest run tests`, after every open item. It does not run `evals/` or Playwright. Those stay on `scripts/score.ps1`. The four pure modules are one checkbox. Splitting them would leave `npm test` red and the loop would skip the item after three attempts.

Order in `TASKS.md`:

1. 3e harness is checked.
2. 3b implements `lmsr.ts`, `brier.ts`, `scoring.ts`, and `ledger.ts` without changing assertions.
3. 3a adds the three SQL migrations above.
4. 3b adds quote, trade, portfolio, resolve, leaderboard, and the test-mode magic link.
5. 3c adds the pages, the SVG chart, and the test ids.
6. 3d implements `generateMarkets` so `npx vitest run evals` passes offline, then the explainer, the human-confirmed resolution note, and admin flags.
7. 3e makes `e2e/campus-call.spec.ts` pass on 1280x720 and 390x844 without `test.skip` or `test.fixme`.

`npm test` stays red until step 2. That is intentional. Do not point `npm test` at `evals/` before `generateMarkets` exists, or the loop cannot finish the engine.

## Harness layout

| Path | Role |
| --- | --- |
| `tests/*.test.ts` | Unit suite. LMSR, Brier, points, ledger, banned topics |
| `evals/generate-markets.eval.ts` | AI suite. Imports `generateMarkets` |
| `evals/fixtures/announcements.json` | 10 fixtures |
| `e2e/campus-call.spec.ts` | Playwright. Desktop and mobile. No skip |
| `src/lib/ai/banned-topics.ts` | Real checker |
| `src/lib/lmsr.ts`, `brier.ts`, `scoring.ts`, `ledger.ts`, `ai/generate-markets.ts` | Throw `not implemented` so Vitest can collect the tests. A throw does not satisfy the assertions |
| `scripts/score.ps1` | Prints one number |
| `scripts/score-rate.mjs` | Reads Vitest or Playwright JSON. Skipped tests count as not passed |

Stubs exist so a missing export does not drop those tests out of `numTotalTests`. Dropping them would inflate the pass rate. The assertions require real numbers or the substrings `insufficient credits` and `already resolved`.

E2E base URL is `PLAYWRIGHT_BASE_URL` or `http://127.0.0.1:3000`. Timeout is 30s per test. Workers are 1. A missing server fails in a few seconds (the last run's two tests finished in about 4.7s). There is no `test.skip`.

## Score

```
score = 50 * (e2e pass rate) + 25 * (unit pass rate) + 15 * (AI pass rate) + 10 * (1 if lint and typecheck both exit 0, else 0)
```

Pass rate is passed / total. If a suite cannot run, the total is unknown, or the total is 0, that rate is 0. Skipped and todo tests are not passed. They stay in the total.

```
powershell -ExecutionPolicy Bypass -File .\scripts\score.ps1
```

Stdout is the number only. A one-line breakdown goes to stderr. The script exits 0 unless it crashes. `CI=1` is set. Vitest 5 writes the JSON reporter to `--outputFile` (it does not print the report on stdout). Playwright JSON is read from the test process stdout. Component commands time out in 90s, e2e in 120s.

Unit: `npx vitest run tests --reporter=json`. AI: `npx vitest run evals --reporter=json`. E2E: `npx playwright test e2e/campus-call.spec.ts --reporter=json --workers=1`. Lint: `npx eslint .`. Typecheck: `npx tsc --noEmit`.

If `node_modules` is missing, the script prints 0. If Chromium is missing, the e2e rate is 0 and the other rates still count.

This folder is not a git repository. Do not run `git init` from the harness. The commit was skipped. See `PROGRESS.md`.

## Top 5 takeaways

1. The score is 22.8788 on purpose: the banned-topic checker and the toolchain pass, and the product does not exist yet.
2. Binary LMSR at `b = 100` prices a 10-share buy from `(0, 0)` at 5.124948 virtual credits. The house is prefunded with `b * ln(2)` (69.314718) so redemption of 1 credit per winning share stays solvent.
3. Trades conserve user plus house cash. Creation mints the subsidy. Nothing can go negative, and a second resolution throws.
4. Points are `round(100 * (1 - Brier))` on the YES probability. Virtual-credit profit is a separate number and is not the rank.
5. Do not raise the score by skipping tests. Implement the four pure modules first so `npm test` can go green, then the routes and pages the e2e spec already names.

## Open questions for Nico

1. Is the starting grant 1000 virtual credits, or some other number? The e2e only needs enough for 1 YES share (about 0.50 at `b = 100` from a 0.5 price).
2. Is `b` fixed at 100 for every market, or chosen when a human publishes?
3. Who is an admin when test mode is off? The test header must not work in that mode. An allowlist of user ids is the smallest rule.
4. Is production login Supabase magic link, with `POST /api/test/magic-link` returning 404 unless `CAMPUS_CALL_TEST_MODE` is `1`?
5. Before the generator is trusted, can only an admin publish a market, and is the generator limited to drafts?
6. Leaderboard ties: more points first, then lower Brier, then earlier last forecast? `research/07-incentives.md` may already pick a tie-break. This plan does not.
7. Store full-precision credits and round only on screen? The ledger tests use a tight tolerance, not cents.
8. This directory is not a git repo, and the rules forbid `git init` from an agent. Do you want a repo after you review the harness?
