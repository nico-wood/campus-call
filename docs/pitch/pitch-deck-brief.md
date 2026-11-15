# Campus Call — pitch deck brief

A working brief for an AI assistant (or teammate) editing the Campus Call pitch deck. Everything in "Locked framing" is a settled founder decision — apply it, don't relitigate it. Facts in "Proof points" were verified against live sources on Nov. 15, 2026; each carries its date and source so a slide can cite it.

## 1. Product snapshot

Campus Call is a live forecast board for a campus community. Students get free virtual credits and place tickets on local questions with researched starting probabilities, written resolution rules, and public data sources. Live at **https://campus-call.vercel.app**.

What's on the board right now (all real, all auto-resolvable from public feeds):

- **Transit:** Will the 7:48 a.m. Route 4A bus reach Kennedy Library in time for an 8 a.m. class? (resolves from SLO Transit's GTFS-realtime feed; the 7:48 arrival is from their published schedule). Will CHP log a US-101 incident during Monday's commute?
- **Weather:** observed highs/lows and rain totals at the SLO airport station (NWS observations, Φ-model priors from the gridpoint forecast); storm-swell at the Diablo Canyon buoy (NOAA NDBC live data).
- **Campus:** Will Thursday's Downtown SLO Farmers' Market survive a 94%-rain storm? Will Cal Poly post a campus-wide storm alert Wednesday?
- **Academics:** Will Canvas log a service incident before Friday? (priced from Instructure's own status history) plus enrollment/graduation-rate futures.
- **Sports:** Cal Poly at Montana State — winner, halftime leader, overtime, totals ladders, and props (any 20-point scorer, tip-off within 15 minutes of schedule, margin of 10+, Cal Poly 8+ threes).

Mechanics that matter for the pitch:

- Every market opens at a **researched prior, never 50/50** — priors are computed from public data (NWS forecasts, team scoring averages, posted schedules, status-page incident history) with the method stated on the market.
- Every market has a **written resolution rule naming its public source** — auditable, no judgment calls.
- Markets are **generated and resolved at near-zero marginal cost** from public feeds (NWS, GTFS, NDBC, CHP, official box scores).
- Distribution is a **QR code at an event** — this hackathon is running the live demo (QR door, credit grant, prize window closing Sunday noon).

## 2. Locked framing (founder decisions — binding)

1. **The product is play-money markets with real prizes.** Real money never touches the mechanism.
2. **The real-money prediction market industry is TAM evidence and a Phase 3 licensed-partner roadmap item — never the shipped mechanism.** Phase 3 means partnering with a licensed operator for 21+/alumni segments, not becoming one.
3. **"The community is the beneficiary, never the counterparty."** This is the thesis sentence. In a real-money market, winners are paid by losers — the house needs you to lose. In Campus Call, players never fund each other; prizes come from whoever wants the crowd's attention.
4. **Community dividend:** a fixed, named percentage of every sponsored prize pool is directed to a campus cause, with the destination chosen by the top forecasters.
5. **Language discipline:** the words *bet, wager, odds, payout* never appear — not in the app, not in the deck. This is enforced in the codebase: the test suite fails if those words render in the UI. Use *forecast, ticket, credits, prize, probability*. (The enforcement itself is a defensibility talking point.)

## 3. Business model

### Real-money market vs. Campus Call

| | Real money (Kalshi, Polymarket) | Campus Call (play credits) |
|---|---|---|
| Winners are paid by | Losers — zero-sum pool, operator skims fees | Sponsors/organizers — credits are free; prizes are someone's marketing budget |
| Operator revenue | Trading fees, spread, interest on deposit float | Event licensing, sponsored markets, prize-pool placement, forecast data |
| Legal lane | CFTC designation or offshore; KYC/AML; ongoing state-level fights over sports contracts | Free entry + skill + no cash-out = the promotions/sweepstakes lane (ESPN Streak for the Cash, DFS free rolls) |
| Who can play | 18+/21+, geo-blocked; never permitted on a campus | Anyone with the QR code — including the under-21 majority of a campus |
| Player motive | Profit | Status on a leaderboard of people you actually know, plus prizes |

### Who pays (three buyers)

1. **Event organizers (the wedge).** Hackathons, orientation weeks, club fairs pay to run a prize window because a live forecast board is an engagement machine. **This hackathon is customer #1 running the live demo.**
2. **Local sponsors (markets are native ad inventory).** "Will Thursday's farmers' market survive the storm? — prize by [local business]" is an ad people voluntarily check five times a day. In-kind prizes (gift cards, specials) also keep the sweepstakes lane clean.
3. **The institution.** Universities already budget for student-engagement platforms and experience surveys; aggregate campus forecasts (event attendance, dining demand, transit reliability) answer "what will students do" faster than any survey.

### Why people play without cashable winnings

- **The leaderboard is socially real.** Play-money works when the audience knows each other — most fantasy football leagues are free and people obsess for months. Campus density makes bragging rights beat small winnings.
- **The board is useful even without placing a ticket.** Will the bus make my 8 a.m., will the market get rained out, will Canvas go down during dead week — the probabilities are campus news. Real-money markets have no retention hook at local scale; we do.
- **Prizes top it off, they don't carry it.** HQ Trivia and ESPN Streak proved sponsor-funded prizes plus a recurring ritual drive huge free participation.
- **This audience legally can't play the alternative.** Kalshi's growth is the demand evidence; campus is the segment it can never touch.

### The two-layer board (the data story, stated precisely)

A market that resolves from a public feed (NWS, transit GTFS, a status page) cannot contain information worth buying — the feed is the better, free source. So the board has two layers doing different jobs. **Utility markets** (weather, bus on time, Canvas up) are the daily habit, the trust layer (clean public-source resolution), and the calibration engine: hundreds of cheap forecasts give every player a scored track record. **Demand markets** (event attendance, turnout, sellouts, how full) are the sellable data, because the crowd is the only source — a footfall/demand forecast of the student population made by the student population, at a resolution Placer.ai and Morning Consult can't see. Track records from the utility layer tell you whose demand forecasts to weight (Good Judgment's model). Local businesses are the **sponsor**, not the data customer; data buyers are the institution, venues, and aggregators. Stage line: "The weather markets are the habit. The demand markets are the data. The sponsors pay for the attention in between."

## 4. Proof points that companies pay for this information

Verified Nov. 15, 2026. Strongest three are bolded — use those on the slide.

**They pay for the forecast signal:**

- **ICE → Polymarket (the headline stat).** Intercontinental Exchange — owner of the NYSE — committed **$2B to Polymarket at a $9B post-money valuation** (announced Oct. 7, 2025), and completed a $600M cash tranche in March 2026. ICE becomes the **global distributor of Polymarket's event-driven data**; coverage explicitly framed it as "a data acquisition, structured as an equity investment." ([CNBC](https://www.cnbc.com/2025/10/07/nyse-owner-intercontinental-exchange-2-billion-polymarket-stake.html), [FinTech Weekly](https://www.fintechweekly.com/magazine/articles/intercontinental-exchange-polymarket-financial-data-infrastructure-2026), [Forbes](https://www.forbes.com/sites/boazsobrado/2025/10/07/polymarket-secured-a-2-billion-investment-from-wall-streets-ice/))
- **Kalshi at $40B (the TAM stat).** Kalshi closed a $1B round on Oct. 29, 2026 at a **$40B valuation** (Sequoia + Wellington co-led), up from $22B earlier in 2026, with non-sports revenue run rate reported above $1B. ([CNBC](https://www.cnbc.com/2026/10/29/kalshi-40-billion-valuation-funding-round.html), [Cointelegraph](https://cointelegraph.com/news/kalshi-closes-1b-funding-round-at-40b-valuation-as-non-sports-revenue-run-rate-tops-1b), [Bloomberg](https://www.bloomberg.com/news/articles/2026-03-19/kalshi-gets-1-billion-in-new-funding-at-22-billion-valuation))
- **Hollywood Stock Exchange (the structural match).** A **play-money** market whose box-office forecasts were accurate enough that movie studios bought the signal and Cantor Fitzgerald bought the company. Direct proof that stakes don't need to be real for the output to be worth real money.
- **Corporate internal prediction markets.** HP's markets (built with Caltech) beat its official sales forecasts in 6 of 8 trials; Google ran a large internal market and published research showing it worked; Eli Lilly forecast drug-candidate success; Ford, Intel, GE, Siemens ran programs. A vendor industry (Consensus Point, Inkling/Cultivate Labs) existed because firms paid SaaS fees for "aggregate my crowd's forecasts."
- **Good Judgment Inc.** sells Superforecaster probability feeds and custom forecasts to corporations and governments on subscription.
- **Probability feeds are an established paid category.** Sportradar and Genius Sports pay leagues billions for data rights and resell probability feeds; X named Polymarket its official prediction-market partner (2025); Bloomberg carried its election odds.

**They pay for the audience and local signal:**

- **Student attention is already a paid market.** UNiDAYS and Student Beans exist because brands pay to reach verified students.
- **Alternative data / local sentiment.** Morning Consult, CivicScience, YouGov sell aggregated "what will people do" panels; Placer.ai sells foot-traffic prediction. Campus-resolution demand forecasts are a niche none of them can see.
- **Institutions already budget for it.** Student-engagement platforms and experience surveys (Qualtrics et al.) are existing line items answering the same question slower.

Slide beat for this section: **"Play-money signals have real buyers"** (HSX) → **"the biggest exchanges agree"** (ICE paid $2B for event-data distribution) → **"firms pay even for small crowds"** (HP/Google/Eli Lilly, Good Judgment). Kicker: *nobody produces this signal at campus resolution — and we produce it at near-zero marginal cost, because our markets are generated and resolved automatically from public feeds.*

## 5. Suggested deck structure

1. **Hook:** a real market from the live board (farmers' market vs. the storm, or the 7:48 bus to Kennedy Library). Show the probability moving.
2. **Problem/insight:** campuses run on predictable-but-unpredicted local events; the people best positioned to forecast them have no venue — and legally can't use the real-money ones.
3. **Product:** the board, QR door, credits, tickets, leaderboard, prize window. Emphasize researched priors + written resolution rules + public sources (trustworthy, auditable, no bookmaker).
4. **Why it's not gambling (one slide, confident, not defensive):** free entry, no cash-out, skill-weighted, community dividend, language discipline enforced by CI.
5. **Business model:** the three buyers; "the community is the beneficiary, never the counterparty."
6. **Proof the data is worth money:** the three bolded proof points above.
7. **Economics/defensibility:** near-zero marginal content cost (AI-generated markets, priors from public data, auto-resolution), QR distribution, event-driven acquisition.
8. **Traction:** this weekend. Live at a real hackathon, real markets resolving on real feeds, N enrolled forecasters, credits in play (pull live numbers before presenting).
9. **Roadmap:** Phase 1 events → Phase 2 sponsored always-on campus boards + institutional insights → Phase 3 licensed-partner real-money for 21+/alumni segments (partner, not operator).

## 6. Objection handling

- **"Isn't this gambling?"** No consideration (free), no cash-out, skill-weighted forecasts, and the no-gambling-language rule is enforced by the test suite — the build fails if *bet/wager/odds/payout* render in the UI.
- **"Cold start?"** Events solve it; this weekend is exhibit A. Each event seeds the always-on board.
- **"Retention between events?"** The utility markets (transit, weather, Canvas) are the daily habit between prize windows — the board is useful even if you never place a ticket.
- **"Why won't Kalshi do this?"** They legally can't serve this audience, and campus-resolution markets are too small for their cost structure. Our cost per market rounds to zero.
- **"Why would anyone pay for a forecast you resolved from a free public feed?"** They wouldn't, and we don't claim it. Utility markets are the habit and the track-record engine; demand markets (attendance, turnout, sellouts) are the data, because the crowd is the only source. See "The two-layer board" above.
- **"How do you resolve fairly?"** Every market ships a written resolution rule naming a public source (NWS observations, GTFS-realtime, official box scores) — show one on screen.

## 7. Do / don't

- **Do** demo from the live board, not screenshots, if logistics allow.
- **Do** say dollar figures with their dates ("committed October 2025", "valued October 2026").
- **Don't** use *bet, wager, odds, payout, gambling* for our product anywhere in the deck.
- **Don't** present real-money operation as our plan — it's TAM evidence and a Phase 3 partnership only.
- **Don't** claim selling individual student data; the data story is aggregate forecasts only.
- **Re-verify before stage** if quoting: the X–Polymarket partnership date (2025), HSX/Cantor specifics, HP "6 of 8" figure. The ICE and Kalshi numbers above were source-checked Nov. 15, 2026.
