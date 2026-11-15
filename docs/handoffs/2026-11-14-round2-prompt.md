# Campus Call, round 2: fixes, accurate starting probabilities, AI-researched markets, Live and Futures tabs, and UI polish (demo Sunday)

This is a fresh session. First read `docs/handoffs/2026-11-14-local-markets-prompt.md` (the round 1 spec: the email codes were later dropped in favor of name + email + phone join, and email + phone sign-in), the newest `docs/brain/entries/` handoff, and `git log -10`. This prompt is a product decision from Nico and has the same authority as round 1. Where it conflicts with `AGENTS.md`, `TASKS.md`, or older specs, this prompt wins.

Commit at each green step and push after P0, P1, and P3. Do the parts in the order listed in "Order of work" (under P5). Do not run `vercel --prod`. Do not read or print `.env` files.

Live site: https://campus-call.vercel.app (Vercel auto-deploys from `main`). Run hosted migrations with `npx supabase db push`.

## P0: fix what the smoke test found (target: 45 minutes, then push)

1. **Sign-in entry point.**
   - When signed out, the header shows **Sign in** (a quiet link) next to **Join — get 1,000 credits**.
   - `/join?mode=signin` opens the email + phone sign-in form.
   - Every "Join" call to action also offers "Already joined? Sign in".
   - The portfolio's empty state shows both buttons.
   - When signed in, the header shows the name, a balance chip, and a Sign out item.
2. **Button text alignment.**
   - Every button and button-styled link uses `display:inline-flex; align-items:center; justify-content:center; text-align:center; text-decoration:none; gap`.
   - Outcome buttons keep the label and the % on one line. Long labels like "Montana State" truncate with an ellipsis or shrink. Do not wrap them to two lines.
   - The portfolio "Join" button is underlined right now. Remove that.
   - Check at 1280, 390, and 375 wide.
3. **Leaderboard accuracy (bug).**
   - Right now an open position counts at shares × the current price. A user's own purchase pushes the price up, so they gain about 6–10% instantly just by trading. That is why John D. shows 1,065 credits.
   - Fix it with a new migration. Do not edit applied migrations. Value open positions at **LMSR liquidation value**: for each (account, market, outcome), sum the shares *s* and compute `b·ln Σexp(q/b) − b·ln Σexp(q'/b)`, where `q'` is `q` with `s` subtracted from outcome *i* (use the max-shift for stability). That is exactly what selling now would return, so a lone trade is worth about what it cost.
   - Use the same value in `local_account` (as `valueNow`) and on the portfolio.
4. **Liquidity.** New markets use `b = 1000` instead of 300, so one 100-credit position moves a 50/50 market by about 2.5 points, not 14. Add a migration that sets `b = 1000` on existing `local_markets` rows that have **no** positions yet.
5. **Test accounts.** List the accounts in `local_participants` and show them to Nico (name, created_at, positions). Do **not** delete anything until he confirms which are tests (for example "QA T." and "John D."). After he confirms, remove those accounts' positions, ledger rows, and participant rows in one transaction, and reset any market they traded to its prior.

## P1: accurate starting probabilities (priors) and data-driven markets (target: 2 to 3 hours)

Every market must open at a researched probability, not 50/50.

1. **Catalog fields.** Add these to each `LiveForecast` in `src/app/live-forecasts.ts`:
   - `prior: number[]` (sums to 1);
   - `priorMethod: string` (one short line, for example "NWS forecast high 68°F, σ 3°F" or "Spread −4.5 → normal σ 11");
   - `priorSources: {name, url}[]`;
   - `priorAt: ISO string`.
2. **Market creation.** Add an `ensure_local_market(p_id, p_outcome_count, p_close_at, p_prior double precision[], p_b numeric)` RPC (service role only, idempotent):
   - It inserts with `q_i = b·ln(prior_i)`, clamping each prior to [0.02, 0.98] and renormalizing.
   - If the row exists **and has no positions yet**, update `q` to the new prior.
   - Call it for every catalog market when the board loads, cached for 60 seconds. `place_local_position` keeps its current signature.
3. **UI.**
   - Cards and the market detail show the market probability.
   - The market detail has a small "Starting estimate: 62% · how we got this" disclosure with `priorMethod` and the source links.
   - The chart starts at the prior.
4. **Deterministic prior calculators** (`src/lib/priors.ts`, unit-tested):
   - Weather threshold: `P(high ≥ T) = 1 − Φ((T − forecastHigh)/3)`, using the forecast from `https://api.weather.gov/gridpoints/LOX/.../forecast` for SLO. Also rain: use NWS `probabilityOfPrecipitation` directly.
   - Sports winner from a point spread: `P(fav) = Φ(spread/11)` for college basketball, `/13.5` for football, `/4.5` for volleyball sets (or use a moneyline converted to implied probability with the vig removed).
   - Over/under from a total: normal with σ ≈ 11 (basketball).
   - Binary "listing still shows X at time T": prior 0.9 unless the source shows risk.

## P2: AI research pipeline that finds events and estimates probabilities (target: 2 hours, review before publishing)

Build `scripts/research-markets.mjs`, run locally with `ANTHROPIC_API_KEY` from the shell environment. It never ships in the browser, and it does not read `.env` files (Nico exports the key in the terminal).

1. **Input.** A topic list (below) and a window: events that **close and can be resolved between now and Monday 16 Nov 2026, 11:59 p.m. PT**, so markets resolve before or just after the demo.
2. **Model call.** Use the Anthropic Messages API with the server-side web search tool (latest Claude Sonnet). For each topic, ask for 0–4 candidate markets as strict JSON with these fields:
   - `id`, `category`, `label`, `question`, `outcomes`, `closesAt` (ISO with offset), `closeLabel`;
   - `resolutionRule` (the exact source, time, and tie or void handling);
   - `sourceName`, `sourceUrl`;
   - `prior`, `priorMethod`, `priorSources` (real URLs the model actually opened);
   - `confidence` (low/med/high).
3. **Validation.** Reject candidates that:
   - have no resolvable public source, or a close time in the past;
   - fail `src/lib/ai/banned-topics.ts` (reuse `generateMarkets` checks where possible);
   - **involve minors** (high school sports, little league), named private individuals, Greek life events, alcohol or parties, or anything about a specific student's or employee's personal outcome.
4. **Output.** Write candidates to `research/candidates-2026-11-14.json` and print a table. **Nothing goes live automatically.** Nico or Claude Code reviews them, then copies the approved ones into `LIVE_FORECASTS`, using the deterministic calculators from P1 to recompute the prior where data exists.
5. **Topics to run tonight** (in priority order):
   - Cal Poly NCAA athletics this weekend (gopoly.com schedules: men's and women's basketball, volleyball, any others) — winner, total, and margin. Use posted lines where they exist.
   - SLO weather Sunday and Monday (high-temperature thresholds, rain yes/no, wind) from NWS. Resolve from KSBP observations.
   - SLO Transit: detours or alerts from the GTFS-realtime alerts feed already used; on-time questions only if a public real-time feed with arrival times is reachable.
   - Cal Poly Campus Dining: published menus for Mon 16 Nov ("Will 1901 Marketplace list X on Monday's menu?").
   - Cal Poly Arts / Spanos Theatre / PAC performances, and Cal Poly events calendar listings (still listed, start time, sold out per the official page).
   - SLO farmers markets (Thursday Downtown, Saturday Madonna): "will the official page or Instagram announce a cancellation", only if an official source exists.
   - Cal Poly club sports with a public schedule and results page.
   - Rec Center: only if a public live-occupancy page exists ("Will the Rec Center count exceed N at 6 p.m. Monday?").
6. **AI resolution helper in `/admin` (optional, only if time remains).** A "Suggest result" button calls a server route that asks Claude (with web search) to read `sourceUrl` and `resolutionRule` and return `{outcome, evidence, confidence}`. The admin must still click Resolve. Never auto-resolve.

## P3: Live and Futures tabs, and long-term markets (target: 1 hour)

Nico wants many more markets on the board, the way Polymarket does it.

1. **Two kinds of market.** Add `horizon: "live" | "futures"` to `LiveForecast`.
   - **Live:** closes and resolves by **Mon 16 Nov 2026, 11:59 p.m. PT** (the prize window).
   - **Futures:** long-term questions that resolve later. Examples: Cal Poly's next published 4- or 6-year graduation rate, fall 2027 enrollment, the next U.S. News rank, Cal Poly men's basketball's final regular-season record, a Big West tournament result, the SLO season rainfall total by 31 March 2027, and aggregate Polyratings questions (for example, "Will the average rating of all CSC professors on Polyratings be at least X on 1 March 2027?").
   - Futures need the same things as live markets: an official resolution source, an exact rule, a researched prior with method and sources, and a close time.
   - No futures market targets one named student. Avoid single-professor rating questions. Aggregates are fine.
2. **Tabs.**
   - The top of the board is a tab row: **Live** (default; a pulsing dot and a "closes in" countdown on each card), **Futures**, **All**.
   - The category chips (Sports, Transit, Campus, Weather, Dining, Arts, Academics, ...) filter within the selected tab.
   - Keep `?tab=` and `?category=` in the URL.
3. **Prize rule.** Show this copy on the leaderboard, the join page, and every futures market detail:
   - "The prize leaderboard is a snapshot at Mon 16 Nov 2026, 11:59 p.m. PT. It counts your credit balance (including credits returned from resolved Live markets) plus the current sell-back value of any open positions. Futures positions don't return credits until they resolve, but they still count at sell-back value in the snapshot."
   - Add an admin "Freeze prize snapshot" button that stores the top 50 in a `prize_snapshots` table through a new migration.
4. **Targets.** At least **20 Live** and **15 Futures** markets, all researched through the P2 pipeline (add a `--horizon futures` mode) and reviewed before going live.

## P4: UI and UX polish with 21st.dev patterns (remaining time)

Nico wants the board to feel much more polished. Use 21st.dev (https://21st.dev) as the reference library.
- If the 21st.dev Magic MCP is available in this session, use it to fetch components.
- Otherwise open the component pages and port the code.
- The repo uses plain CSS on the variables in `src/app/globals.css`, with no Tailwind. Port components into plain CSS. Do not add Tailwind or shadcn tonight, because the whole app would need re-testing.
- Keep the attribution comment for each ported component.

Patterns to port, in this order:
0. **Charts like Polymarket's**: 21st.dev's area and line chart components, ported to plain SVG. Use a multi-line chart with labels at the line ends, a hover crosshair, and a legend with percentages. Use them in the hero carousel, on event pages, and in card sparklines.
1. **Animated tabs** with a sliding active indicator, for Live / Futures / All and the category chips.
2. **Number ticker**, which animates when a market probability, a balance, or a stat changes.
3. **Interactive area chart** on the market detail: gradient fill, hover crosshair and tooltip, range tabs, and the starting-estimate marker.
4. **Bottom sheet or drawer** for the trade ticket on mobile, with a sticky "Yes 64% / No 36%" bar.
5. **Toasts** (in the style of Sonner) for position confirmed, joined, and errors.
6. **Live activity ticker** (a marquee) under the header: "Ada L. took Yes on Weather 70°F · 2m ago". Show short names only.
7. **Confetti or a celebration moment** when someone joins (+1,000 credits) and when credits are returned on a winning market.
8. **Skeleton loaders**, **hover lift** and a **spotlight border** on market cards, and an **empty state** illustration.

### Color theme: premium dark green with a subtle gold layer

Do this before porting the components above, so they pick up the new tokens. Replace the theme variables in `globals.css`:

```css
--bg:            #0B1410;  /* near-black green */
--surface:       #111D17;  /* cards */
--surface-2:     #16251D;  /* raised and hover */
--border:        #1F3329;
--text:          #ECEFE9;
--text-muted:    #93A39A;
--green:         #1F6B4A;  /* primary actions (Join, Confirm) */
--green-bright:  #2E8F63;  /* hover, Yes, positive moves */
--gold:          #C9A75A;  /* the premium accent: use sparingly */
--gold-soft:     rgba(201,167,90,.14);
--gold-line:     linear-gradient(90deg, transparent, rgba(201,167,90,.55), transparent);
--negative:      #D0665A;  /* No, negative moves */
```

Gold is a restrained accent. It never fills a primary button and never colors body text. Use it only for:
- 1px hairline dividers using `--gold-line` (under the header and above the footer);
- the prize-pool banner (gold border and gold "50% of prize" text);
- leaderboard ranks 1–3 (a gold, silver, or bronze rank chip, plus a soft gold row glow for #1);
- the balance chip icon;
- the focus ring;
- the "Live" dot;
- the starting-estimate marker on charts;
- the confetti on a win.

Green stays the action color. If it reads as "gold everywhere", pull it back.

### Background from 21st.dev

Pick **one** subtle, slow background from 21st.dev's background components. Good candidates are a dot or grid pattern with a radial fade, Background Paths, or a very faint aurora or flickering grid.
- Tint it with `--green` at about 6–10% opacity and a single faint gold radial glow near the top center, behind the header and prize banner.
- Remove the current gradient backdrop and the dither grid.
- It must not reduce text contrast. Cards stay solid `--surface`.
- Motion stays under 1 cycle per 10 seconds and is static with `prefers-reduced-motion`.
- On mobile, render a cheaper static version.
- Before you commit, screenshot two candidate backgrounds at 1280 and 390, save them to `outputs/round2-ui/`, and tell Nico which one you picked and why. He rejected an earlier "AI-looking" gradient look, so lean understated.

Respect `prefers-reduced-motion`. Check at 1280, 390, and 375 wide. Keep the screen words forecast, position, market probability, and credits. Never use bet, wager, odds, or payout on screen.

## P5: Polymarket-style events (team markets, spread and total ladders, combos)

Nico shared Polymarket screenshots as the reference: a home hero carousel, an event page with team buttons, a multi-line chart, and Spread / Totals ladders with Full Game / 1st Half / 2nd Half tabs, a "Build a Combo" button, and a sticky trade panel on the right.

### P5a: Events, team outcomes, and line ladders (do this right after P1)

1. **Events group markets.**
   - Add `LocalEvent { id, category, horizon, title ("Cal Poly vs. Montana State"), startsAt, venue, teams?: [{name, short, logo, record}], sourceUrl, markets: MarketSpec[] }`.
   - `LIVE_FORECASTS` can stay the flat list the DB uses. Generate it from the events.
   - Each market has `group` (`moneyline | spread | total | team-total | prop`), `period` (`full | 1h | 2h`), and an optional `line`.
2. **Team outcomes.** A winner market's outcomes are the teams themselves ("Cal Poly 41%" / "Montana State 59%"), not Yes/No, and the team logos sit on the buttons. Add logos to `public/teams/` (Montana State and others) from official athletics sites.
3. **Spread and total ladders.**
   - Each line is its own binary market. Examples: "Montana State wins by over 3.5", 4.5, 5.5, 6.5, 7.5; "Total over 135.5", 138.5, 141.5, and so on.
   - Generate them from one spec: center line, step, and count. Compute priors from the posted spread or total with the normal model (P1).
   - UI: a horizontal line picker (‹ 3.5 4.5 **5.5** 6.5 7.5 ›). For the selected line, show the market probability with a ▲/▼ change since the prior, plus "Yes 50%" / "No 50%" buttons.
   - Period tabs: Full Game / 1st Half / 2nd Half, where the source reports halves (box scores do).
4. **Event page `/events/[id]`.**
   - Header: matchup with logos, records, start time, and a Live badge after start. Under it, a multi-line chart (one line per team, labels at the line ends, hover crosshair).
   - Then sections: Moneyline, Spread, Totals, Team Totals. Tabs at the top of that area: Game Lines, Game Props, Team Props.
   - Right side (on desktop): a sticky trade panel with Trade / Positions tabs, the selected market and outcome, an amount with +10 / +50 / +100, a preview, and Confirm (or "Join to take a position").
   - On mobile, the panel becomes the bottom sheet.
5. **Home.**
   - A hero carousel of 3–5 featured events, each with a multi-line chart and a legend with percentages.
   - A "Popular" horizontal row of event cards (teams with logos and percentages).
   - Then the Live / Futures / All tabs with the category chips.
   - On desktop, a right rail with "Build a Combo", the prize-pool card, and the top-5 leaderboard.

6. **Team-color mesh and a cursor-following border.** We inspected polymarket.us live.
   - Each event card carries its two team colors as CSS variables on the card, for example `style="--mesh-home:#FA4616; --mesh-away:#0033A0"` on a `.mesh-team-colors` card.
   - The colors are softened with `color-mix(in oklab, var(--mesh-home) 82%, #000)` in dark mode.
   - On hover, three absolutely positioned blobs fade in behind the content:
     - home: `radial-gradient(28% 70% at 22% 50%, home, transparent)`;
     - away: `radial-gradient(28% 70% at 78% 50%, away, transparent)`;
     - center: `radial-gradient(32% 26% at 50% 18%, a home and away mix at about 35%, transparent)`.
   - The featured hero card adds a 1px gradient border in the two team colors and a slow-moving background glow that follows the pointer.
   - Build ours like this:
     - Add `colors: {home, away}` per event: Cal Poly green `#154734` and gold `#BD8B13`, plus each opponent's official primary color. Non-sports events use our green and gold.
     - Make a `useCardPointer` hook that sets `--px`/`--py` (0–100%) on `pointermove`, throttled with rAF. The border is a `::before` with `padding:1px` and `background: radial-gradient(400px circle at var(--px) var(--py), var(--mesh-home), var(--mesh-away) 40%, transparent 70%)`, masked to the border ring with `mask-composite: exclude`. A second, very faint (about 8%) radial glow inside the card follows the same pointer.
     - Hover fades in over about 300 ms. Touch and `prefers-reduced-motion` get a static two-color border.
     - On 21st.dev, look for "Glowing Effect", "Spotlight Card", "Border Beam", or "Shine Border". Port the closest one to plain CSS and keep its attribution comment.
   - The page background also moves very slightly with the pointer: a large green and gold radial glow shifted by at most ±20px (parallax) behind the header and hero. Make it static on mobile.

### P5b: Combos (after P3, before P4)

A combo is a set of 2–5 legs (market + outcome). It returns credits only if every leg wins.

- **Pricing:** fixed at confirm time. `combo price = Π(leg probability) × 1.05` (a 5% house margin, capped at 0.95). Returned if all legs win: `floor(stake / price)`.
- **Leg rules:** at most one leg per event (avoids correlated mispricing). Open markets only. Every leg must close by the prize cutoff for a Live combo. Stake is 1 to 1,000.
- **New migration:**
  - `local_combos` (id, account_id, stake, price, potential_return, status `open|won|lost|void`, request_key unique per account, created_at) and `local_combo_legs` (combo_id, market_id, outcome_idx, prob_at_entry).
  - `place_local_combo(p_account_id, p_legs jsonb, p_stake, p_request_key)`: re-reads current prices server-side, never trusting the browser; debits through `credit_ledger` with reason `local_combo` (extend the check constraint); refuses an overspend.
  - Settle in `resolve_local_market`. After it resolves a market, settle every combo containing that market:
    - any leg lost → `lost`;
    - all legs resolved and won → `won`, credit `floor(stake / price)` with reason `local_combo_return` exactly once (unique index);
    - a voided leg drops out and the price is recomputed from the remaining legs' entry probabilities; if all legs are void, refund.
- **UI:**
  - "Build a Combo" mode: a + on any outcome adds it to a combo slip (a drawer on mobile, a right rail on desktop).
  - The slip shows the legs, the combined probability, the stake, and "If every leg wins you get N credits back".
  - Combos appear in the portfolio.
- **Leaderboard and prize snapshot:** an open combo counts at its stake. A won combo counts as its returned credits.
- **Tests:** pricing math, the one-leg-per-event rule, overspend refused, settlement (win, loss, void leg), and no double return.

### Order of work

Work in this order: **P0 → P1 → P5a → P3 → P2 (fill the board) → P5b → P4**. Push after each. If time runs short, ship what's done. Do not hold a working push for later parts.

## Done means

- P0 is pushed and smoke-tested on the live site.
- At least 20 Live markets resolve by Monday night and at least 15 Futures markets are open. Each one has a researched starting probability with its method and sources visible.
- The Live / Futures / All tabs work. The prize rule copy is shown on the leaderboard, the join page, and every futures market detail. The admin snapshot button works.
- Event pages show team outcomes with logos and spread and total ladders. Combos can be built, confirmed, and settled.
- The P4 polish is shipped at desktop and mobile widths.
- The leaderboard does not move when someone trades.
- Report what is live, what is local only, and anything Nico must do (for example, add `ANTHROPIC_API_KEY` to Vercel only if the admin "Suggest result" button ships).
