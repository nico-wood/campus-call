# Campus Call: open local markets build. Deadline 6:00 p.m. PT, Sat 14 Nov 2026

You are working in this repo (`nico-wood/campus-call`, Next.js 16 App Router, React 19, Supabase, Vercel). I am Nico, the owner. **This prompt is a product change from me. Where it conflicts with `AGENTS.md`, `TASKS.md`, `research/10-build-spec.md`, or the overnight plan, this prompt wins.** Specifically, I authorize all of the following:
- editing the home board and the presentation and behavior modules;
- updating test assertions that encode the old spec (for example "no % on home", "a confirm does not open a position", and the Hackathon category or prize link on home), as long as each changed assertion is replaced by one that checks the new behavior;
- applying hosted Supabase migrations;
- pushing `main` so Vercel deploys.

Do not run `vercel --prod`. Do not read or print `.env` files. Do not commit secrets.

Work fast and ship. Commit at each green step. Do not hold the release for perfect gates or multi-round reviews.

## The product change

- **Hackathon picks are dropped.** There is not enough data on the teams. Remove the Hackathon category and the prize-forecast link from the home board. Leave `/hackathon` and its modules in place, unlinked, so their tests keep passing.
- **The board is now open markets on live local events this weekend** (the forecasts in `src/app/live-forecasts.ts`). Anyone can join: hackathon participants, students, and locals.
- **Sign-up:** name, email, and phone number, then a verified email code. That grants **1,000 virtual credits once** (one grant per email, per phone, and per account).
- **Positions:** a user picks an outcome and an amount, and the confirm **actually debits credits**. Prices move under LMSR. An overspend is refused and writes nothing.
- **Payout:** after the official result, an admin resolves the market. Each winning share returns 1 credit (rounded down), exactly once. A void refunds the cost.
- **Incentive:** the leaderboard ranks people by total credits (balance plus the current value of open positions). Prize copy, verbatim in spirit: "If Campus Call places at the Cal Poly AI Hackathon, 50% of the team's prize goes to the top 10 on the leaderboard, split geometrically. If the team wins nothing, the pool is $0. Virtual credits have no cash value. Prizes may be taxable." Put the tax line in the same sentence or line as any dollar amount.
- **Screen words:** forecast, position, market probability, credits, returned credits. **Never** show bet, wager, odds, or payout on screen (`tests` check this).

## Already done for you (do not rewrite; build on it)

1. **`supabase/migrations/20261114230000_local_markets.sql`** was tested on Postgres 16 against all earlier migrations. All functions are `security definer`, executable only by `service_role`.
   - Tables: `local_participants` (unique email and phone), `local_markets` (LMSR `q[]`, `b`=300, `status` open/resolved/void), `local_positions`, `local_price_ticks` (price history).
   - New `credit_ledger` reasons `local_position`, `local_payout`, `local_refund`, plus `local_position_id`. The grant-shape check now allows `entry_context = 'open-signup'`.
   - `grant_open_participant(p_account_id, p_name, p_email, p_phone)` returns `'granted' | 'existing' | 'phone-taken' | 'email-taken' | 'invalid'`. A returning account returns `'existing'` with no name or phone needed. The phone is normalized (a 10-digit number gets a leading 1).
   - `place_local_position(p_account_id, p_market_id, p_outcome_count, p_close_at, p_outcome, p_amount, p_request_key)` returns `(status, position_id, shares, prices, balance)`. `status` is `ok | replayed | insufficient | closed | invalid`. It auto-creates the market row on the first position, using the outcome count and close time **from the server catalog** (`LIVE_FORECASTS`), never from the browser. It refuses after `close_at` (DB clock). The amount must be a whole number from 1 to 10,000.
   - `resolve_local_market(p_market_id, p_outcome)` takes outcome index ≥ 0, or -1 to void and refund. It returns `(positions_paid, credits_paid)`. A second call raises `already resolved`. It errors if no market row exists. In that case show "no positions yet", or insert the row first.
   - `local_board()` returns jsonb `{markets:[{id,status,resolvedOutcome,closeAt,prices[],volume,forecasters,history:[{t,p[]}],createdAt}], stats:{participants,positions,volume}}`. Markets with no row yet are not listed. Treat them as equal prices with empty history.
   - `local_account(p_account_id)` returns jsonb `{name,balance,granted,positions:[{id,marketId,outcome,shares,cost,createdAt,status,resolvedOutcome,priceNow,returned}]}`.
   - `local_leaderboard(p_limit)` returns rows of `(rank, display_name "First L.", balance, open_value, total, positions)`.
   - Verified results: grant, then a second grant returns `existing`; the same phone on another account returns `phone-taken`; 100 credits at 50/50 buys about 174.9 shares and moves the price to 64/36; overspend returns `insufficient`; replay returns `replayed`; resolve pays floor(shares) once and a second call raises; void refunds; anon cannot execute the functions or read the tables.
2. **`src/app/local/server.ts`** (server only) provides:
   - `localConfig()`, which reads `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`;
   - `rpc(config, fn, args)` and `authCall(config, path, payload, token)`;
   - a signed 14-day member cookie (`MEMBER_COOKIE`, `sealMember`, `openMember`, `memberCookieHeader`; HMAC with the service key, holding account id, name, and email). This replaces the old one-hour cookie, so people stay signed in all weekend;
   - `sameOrigin`, `readJson`, `isAdmin` (reads the comma list in `CAMPUS_CALL_ADMIN_EMAILS`), `json`, and `limited`.

## Build list (in this order, commit after each)

1. **API routes** (`export const runtime = "nodejs"`, `Cache-Control: private, no-store`, `sameOrigin` on every POST and DELETE):
   - `POST /api/signup`
     - `{action:"request-code", email}` calls `authCall(config,"otp",{email, create_user:true})`.
     - `{action:"verify-code", email, code, name?, phone?}`: call `authCall("verify",{email, token:code, type:"email"})`, then `authCall("user", undefined, access_token)` to get the verified user id, then `rpc("grant_open_participant")`, then set the member cookie.
     - Validate name and phone **before** verifying, because verifying consumes the code. If the grant returns `invalid` for an account with no participant row (a returning-mode user who never finished sign-up), still set the cookie and return `{needsProfile:true}`.
     - `{action:"complete-profile", name, phone}` with the cookie calls `grant_open_participant` again.
     - `phone-taken` returns a clear message (signed in, but no second grant).
     - Rate-limit with `limited()` per email and per IP.
   - `GET /api/local/board` is public, with `Cache-Control: public, s-maxage=5, stale-while-revalidate=30`. Merge `local_board()` with `LIVE_FORECASTS` so every catalog market appears.
   - `POST /api/local/position` `{marketId, outcome, amount, requestKey}` requires the member cookie. It looks up the forecast in `LIVE_FORECASTS` (unknown id returns 404), passes `outcomes.length` and `closesAt` from the catalog, and maps each status to a friendly message.
   - `GET /api/local/account` returns `local_account` for the cookie's account. `DELETE` signs out.
   - `GET /api/local/leaderboard`.
   - `POST /api/local/resolve` `{marketId, outcome}` is for admins only (`isAdmin`), otherwise 403.
2. **Shared client-safe module** (`src/app/local/markets.ts`): types plus an LMSR quote for previews. Recover q from prices as `q_i = b·ln(p_i)` with b=300. Shares for spend `a` are `s = b·ln(1 + S(e^{a/b}−1)/e_i)`, where `S = Σ e^{q_j/b}` and `e_i = e^{q_i/b}`. Also return the new prices, the average price, and "if this outcome wins, you get ⌊s⌋ credits back."
3. **UI overhaul.** My feedback: the current dark emerald/gold look reads as AI-made. I want it to feel like a real product (Polymarket or Kalshi energy, but campus). Keep plain CSS on the variables in `src/app/globals.css`, no Tailwind, no component library, no chart library (hand-rolled SVG). Keep `flex-wrap: wrap`, `@media (max-width: 40rem)`, and `--page-max` in the CSS (a test checks them).
   - **New color scheme:** a clean light theme (warm off-white background, near-black ink, Cal Poly green `#154734` as the brand color, one warm accent used sparingly) with an optional dark mode via `prefers-color-scheme`. Drop the gradient backdrop and glow effects. Use tabular numerals for all numbers.
   - **Header:** wordmark, search, Leaderboard, Portfolio. When signed out, show a primary button "Join — get 1,000 credits". When signed in, show a balance chip (credits) and the user's name, plus a sign-out item.
   - **Home:** a prize-pool banner (copy above), then a stats strip from `local_board().stats` (forecasters, positions, credits in play, open markets), then categories (All, Sports, Club sports, Transit, Campus, Weather; no Hackathon), then a market grid.
     - Each card shows: category and label, question, the leading outcome's market probability as a big %, outcome buttons showing their % ("Yes 64%"), a small sparkline from history, volume, forecaster count, and a live countdown to close. A closed card shows "Closed · awaiting result". A resolved card shows the winning outcome.
     - Clicking an outcome opens an inline trade ticket on the card (or a bottom sheet on mobile).
   - **Market detail `/markets/[id]`:**
     - A large interactive SVG chart with one line per outcome, a crosshair and tooltip that follow the mouse or touch, and range tabs (1H / 6H / All).
     - A trade ticket: outcome toggle, amount input, quick +10 / +50 / +100 / Max, and a live preview (average price, shares, new probability, "If {outcome} wins you get N credits back (+M)"). Confirm calls `/api/local/position` with a `crypto.randomUUID()` request key that is kept until success. After success, show a toast and refresh the board and the balance.
     - The rules and resolution source (`resolutionRule`, `sourceUrl`) and recent activity (price ticks, anonymous).
   - **Join flow `/join`** (also usable as a modal from any Confirm when signed out):
     - Step 1: name, email, phone. Validate inline (phone 10–15 digits).
     - Step 2: 6-digit code input with auto-advance and paste support.
     - Step 3: a "+1,000 credits" success moment, then return to the market they came from.
     - Add a "Already joined? Sign in with email" path that asks for email only.
   - **`/portfolio`:**
     - Stat tiles: balance, open position value, total, profit/loss vs 1,000, positions.
     - A positions table: market, outcome, cost, shares, current value, status, returned credits.
     - A small balance-over-time chart from the ledger, if cheap to add.
   - **`/leaderboard`:** the top 50 with rank, name, total, and positions. Highlight the signed-in user. Put the prize explanation at the top.
   - **`/admin`:** shown only to `isAdmin`. It lists every catalog market with status, volume, and current prices, plus "Resolve → [outcome]" and "Void" buttons with a confirm step.
   - **Mobile first:** 390px and 375px wide must have no horizontal overflow. Most people arrive from a QR code on a phone. Use 44px tap targets, and a sticky bottom trade bar on market detail.
   - **Motion:** subtle number tweens on price changes, hover lift on cards, and the chart crosshair. Respect `prefers-reduced-motion`.
4. **More weekend markets (optional, only if time allows, by 5:00 p.m.):** add 3–6 more local San Luis Obispo or Cal Poly events closing Sunday, 15 Nov or Monday, 16 Nov to `LIVE_FORECASTS`. Each needs a public source page that names the event, the close time, and how the result will be known (the same rule as the existing entries). Don't invent facts.
5. **Tests:** run `npm test` (vitest) and `npm run typecheck`. Update the old-spec assertions as authorized above. Add focused tests for:
   - the quote math;
   - `openMember` rejecting tampered and expired cookies;
   - `/api/local/position` refusing without a cookie, refusing an unknown market, and refusing a cross-origin request;
   - `/api/local/resolve` returning 403 for non-admins.

   Inject `fetchImpl` and do not hit the network in tests.
6. **Release (target 5:30 p.m.):**
   1. `npx supabase db push` (linked project `vftrwyuvrewekoofkcpp`). This also applies the earlier local-only `20261114143000_forecast_position_confirm.sql`. That is fine, because my migration depends on it.
   2. Commit, then `git push origin main` so Vercel deploys.
   3. Smoke-test the live site end to end with a real email: join, receive the code, check the balance is 1,000, take a position, see the price move and the balance drop, check the portfolio, check the leaderboard.
   4. Append a `PROGRESS.md` entry and a `docs/brain/entries/` handoff.

## Things I (Nico) must do in dashboards. Remind me at the start, because they gate launch

- **Supabase → Auth → SMTP:** the built-in email sender allows only a few emails per hour. Set up custom SMTP (for example Resend) or sign-ups will stall after the first handful.
- **Supabase → Auth → Email templates → Magic Link:** include `{{ .Token }}` so the email contains the 6-digit code, not just a link. Set the OTP length to 6.
- **Vercel → Project → Environment Variables (Production):** `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `CAMPUS_CALL_ADMIN_EMAILS=<my email>`. Then redeploy.
- Note: the Arab Music Ensemble market closes at 6:55 p.m. tonight and the KSBP weather market at 11:59 p.m. Resolve them from `/admin` once the result is known.

## Done means

On https://campus-call.vercel.app, a stranger on a phone can:
1. scan, join with name, email, and phone, and get 1,000 credits;
2. take positions on several local markets and watch the probabilities and charts move;
3. see their portfolio and their place on the leaderboard;
4. receive returned credits after I resolve a market from `/admin`.

Before you finish, report three things separately: what is live, what is tested only locally, and what is still on my checklist.
