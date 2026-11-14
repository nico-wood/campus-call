# Campus Call — Volleyball Market Handoff

## Goal

Launch a small, real-money-free forecasting-market pilot for the Cal Poly Women’s Volleyball match versus Sacramento State. The markets should close before the match, then resolve from the official final score / box score so they can be shown as credible, completed markets in Sunday’s hackathon demo.

## Match details

- **Match:** Cal Poly Mustangs vs. Sacramento State Hornets, Women’s Volleyball
- **When:** Saturday, November 14, 2026, 4:00 p.m. Pacific
- **Where:** Mott Athletics Center, San Luis Obispo
- **Market close:** 3:55 p.m. Pacific — no new forecasts or trades after this time
- **Primary resolution source:** [Cal Poly women’s volleyball schedule and live stats](https://gopoly.com/sports/womens-volleyball/schedule)
- **Fallback resolution source:** [Cal Poly season statistics / final box score](https://gopoly.com/sports/womens-volleyball/stats/2026)

### Pre-match context for the UI or pitch

- Cal Poly enters at **18–7 overall, 14–1 in Big West play**.
- Sacramento State enters at **14–12 overall, 9–6 in Big West play**.
- Cal Poly won the first meeting at Sacramento State on October 1, **3–0**.
- Cal Poly recorded 42 kills, a .405 hitting percentage, five service aces, and nine team blocks in that first meeting.
- The match is part of Cal Poly’s push for the No. 1 seed in the Big West tournament.

Sources:

- [Cal Poly schedule](https://gopoly.com/sports/womens-volleyball/schedule)
- [Cal Poly cumulative stats](https://gopoly.com/sports/womens-volleyball/stats/2026)
- [Sacramento State cumulative stats](https://hornetsports.com/sports/womens-volleyball/stats)
- [Cal Poly weekly athletics roundup](https://gopoly.com/news/2026/11/10/general-weekly-mustang-roundup-nov-10-16-2026-27)

## Markets to launch

Keep the launch to these four markets. With a goal of roughly 10+ real forecasts, concentrating activity makes the dashboard look genuinely active.

### 1. Match winner (featured market)

- **Question:** Who will win: Cal Poly or Sacramento State?
- **Outcomes:** `Cal Poly` / `Sacramento State`
- **Resolution rule:** Resolve to the team listed as winner in the official final score.
- **Close:** 3:55 p.m. PT
- **Why it matters:** This is the clearest entry point for new users and should be the QR code’s default destination.

### 2. Cal Poly sweep

- **Question:** Will Cal Poly sweep Sacramento State 3–0?
- **Outcomes:** `Yes` / `No`
- **Resolution rule:** `Yes` only if the final match score is Cal Poly 3, Sacramento State 0. Every other official result resolves `No`.
- **Close:** 3:55 p.m. PT

### 3. Four or more sets

- **Question:** Will the match go to at least four sets?
- **Outcomes:** `Yes` / `No`
- **Resolution rule:** `Yes` if the official final match score contains four or five total sets; otherwise `No`.
- **Close:** 3:55 p.m. PT

### 4. First-set winner

- **Question:** Who will win Set 1?
- **Outcomes:** `Cal Poly` / `Sacramento State`
- **Resolution rule:** Resolve to the team with the higher score in Set 1 in the official match box score.
- **Close:** 3:55 p.m. PT
- **Demo value:** This should resolve early, so it can show the resolution state even while the match is in progress.

## Optional fifth market

Only add this if the UI supports an additional binary stats market without compromising the four above.

- **Question:** Will Cal Poly record 10 or more team blocks?
- **Outcomes:** `Yes` / `No`
- **Resolution rule:** Use the official final box score’s Cal Poly `TB` / total blocks field. `Yes` for 10.0+; otherwise `No`.
- **Close:** 3:55 p.m. PT

Avoid player-specific markets for this pilot. They are harder for casual participants to understand and are vulnerable to late lineup changes.

## Required product behavior

### QR flow

The QR code should land directly on the featured match-winner market. Target flow:

1. Scan QR code
2. Choose an outcome
3. Choose virtual points
4. Submit forecast
5. See updated probability / position immediately

No real money, deposits, cash-out, or real-world prize tied to a correct forecast. Label points clearly as **virtual** and **non-redeemable**.

### Market states

Implement three obvious states:

- `Open` — forecasts allowed until 3:55 p.m. PT
- `Closed / awaiting result` — no further participation; final forecast probability remains visible
- `Resolved` — winning outcome, official result, resolution timestamp, and source link shown

### Resolution provenance

Every resolved market must retain:

```ts
{
  result: "Cal Poly",
  resolvedAt: "2026-11-14T...",
  resolutionSourceName: "Cal Poly Athletics official final box score",
  resolutionSourceUrl: "https://gopoly.com/sports/womens-volleyball/schedule",
  resolutionNote: "Cal Poly defeated Sacramento State 3–X."
}
```

Use the actual official box-score URL if one is available after the match. Do not use a social-media post as the final authority.

## Dashboard metrics for Sunday

Show real, exact metrics — do not inflate or describe trades as users.

- Unique forecasters
- Total forecasts / trades
- Forecasts per market
- Final implied probability for each outcome at market close
- A simple probability-over-time chart for the featured winner market
- An anonymized activity feed, for example: `A student forecast Cal Poly` 
- Resolved-market card showing the final score and official source

Suggested pitch line:

> In one afternoon, **[X] real Cal Poly users** made **[Y] forecasts** on a live, public-data market. Campus Call locked the market before the match and resolved it against the official result.

## Sunday demo sequence

1. State the problem: campus signals and information are fragmented.
2. Open the resolved volleyball market and show real activity, probability movement, close time, result, and source.
3. Scan the QR code / show the frictionless forecasting flow.
4. Open a live follow-on market (e.g., the men’s basketball game) to demonstrate that the product is active, not a static prototype.
5. Explain expansion: athletics first, then transit and weather using public real-time data.

## Before launch checklist

- [ ] All four market questions are live.
- [ ] Every market has a 3:55 p.m. PT close time.
- [ ] Featured market is the QR code destination.
- [ ] A user can submit a forecast in under 15 seconds.
- [ ] Dashboard counts unique forecasters separately from total forecasts.
- [ ] Open/closed/resolved visual states are clearly distinct.
- [ ] Resolution source field and URL exist in the data model/UI.
- [ ] A teammate is assigned to check the official final box score and resolve the markets after the match.
- [ ] Screenshots or a short screen recording are captured in case the live demo network is unreliable.

