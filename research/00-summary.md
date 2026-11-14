# Campus Call — lead synthesis

13 November 2026. Research agents 1, 2, 4, 5, 6, and 7 finished, and Agent 3 finished Phase A. The demo to build is `research/10-build-spec.md`. That file wins over the binary-market entry path and the 15 launch markets below. Nothing in this file was posted or sent.

This is a product decision, not legal advice. The regulation memo is `research/02-regulation.md`.

## 1. Decision memo

**MVP.** A free board for this weekend. A person gets 1000 virtual credits, takes a position, and sees a market probability from binary LMSR with `b = 100`. A 10-YES buy from a 50/50 market costs 5.124948 credits. The house is prefunded with `b * ln(2)` (69.314718 credits). On resolution each winning share returns 1 credit. Points for one market are `round(100 * (1 - Brier))`, which the unit tests lock. The prize rank is the mean Brier across markets that person traded, lower better, and only with at least 3 resolved markets. Credits cannot be bought or redeemed. AI may draft a market from an announcement, explain a move from the position log, and suggest a resolution. A human confirms before anything resolves. Pages: list, market with a small chart, portfolio, leaderboard, admin, rules, login. Mobile-first. Stack stays Next.js, Supabase with deny-by-default RLS, and a Vercel preview only after the score holds. No production deploy.

**What opens tonight without CPVC.** Two airport markets. They resolve from the NWS CF6 for San Luis Obispo County Airport (KSBP), not from the quad. Details and the CF6 URL are in `research/01-use-cases.md`.

**Participant sheet.** One person per team may submit and update a sheet. People who do not submit are not listed. Fields: team name, what they are building, and what exists now (nothing yet, a demo link, or a public repo link). They can update it until Sunday 11:30 a.m. PT. The latest sheet is what the board reads. A recommendation is a question that can be settled from those sheets or from another named public source. The live number is the market probability, and it moves when the sheet changes or when someone takes a position. This is not a rating of a person, and it is not a crawl of Discord, GitHub, Reddit, or a professor site. A link counts only if the team pasted it. A team does not take a position on a market whose outcome is specifically that team.

**No permit to ask.** Nico is right that a participant does not need permission to say they are at this hackathon, and does not need permission to forecast a public result. The conduct line is narrower: do not say Cal Poly, the CSU, CPVC, Orfalea, or the Entrepreneurship Club operates or endorses Campus Call. Saying the event's own name, and saying this team is in it, is not that claim. Quote both club names when describing who runs the event. Those names are on the calendar and the registration page.

A hackathon question opens when its resolving source is named and the result is not already known. It does not open because an organizer granted a license to ask. It stays off when the source does not exist. Market 7 stays off until organizers publish the integer. Markets 3, 4, and 5 stay off if Friday 8:15 p.m. PT has passed. Category markets, attendance, and submission brackets stay off until a category list, a threshold, or bracket edges exist. Athletics markets stay off until Athletics compliance says yes. Dining open/closed stays off because the operator can set the result. Academic aggregates stay off. Agent 2 treats a class average as a FERPA problem, and no public attendance series was found.

**The 15 launch markets.** Starting probability is equal on every market (`1/n`). No base rate. This club's homepage calls it their first hackathon.

| # | Question | Close (PT) | Resolve from | Open now? |
| --- | --- | --- | --- | --- |
| 1 | Will the Nov. 14 maximum at KSBP be 70°F or higher? | Sat Nov. 14, 11:59 p.m. | NWS CF6SBP, day 14, MAX column | Yes |
| 2 | Will KSBP record at least 0.01 inch on Sat Nov. 14? | Sat Nov. 14, 11:59 p.m. | Same CF6, precipitation column. A trace is not enough | Yes |
| 3 | Which team size is most common on the Friday 8:40 p.m. roster? Outcomes: 2, 3, 4, tie | Fri Nov. 13, 8:15 p.m. | Organizer roster or the registration screen they name | Draft |
| 4 | Will at least one Friday-roster team span two or more of the six colleges? | Fri Nov. 13, 8:15 p.m. | Organizer aggregate. No personal profiles | Draft |
| 5 | Will at least one Friday-roster team have been created after Fri Nov. 13, 12:00 p.m.? | Fri Nov. 13, 8:15 p.m. | Organizer timestamp count | Draft |
| 6 | Will official submissions exceed the Friday roster count? | Sun Nov. 15, 11:30 a.m. | Organizer tally vs roster | Draft |
| 7 | Will official submissions be at least the integer organizers publish Friday night? | Sun Nov. 15, 11:30 a.m. | That published integer, then the tally | Draft. Opens only after they publish the integer |
| 8 | Will the number of submitting teams be odd? | Sun Nov. 15, 11:30 a.m. | The tally integer | Draft |
| 9 | Will at least half the Friday roster submit? Half rounds up | Sun Nov. 15, 11:30 a.m. | Roster count and tally | Draft |
| 10 | By Sun 11:30 a.m., will opt-in responses name at least half the Friday roster? | Sun Nov. 15, 11:30 a.m. | Opt-in export matched on team name. Hide the running total from people with a position | Draft until the roster is in hand |
| 11 | How many members will the first-listed winning team have? Outcomes: 2, 3, 4 | Sun Nov. 15, 11:30 a.m. | Results post joined to the roster | Draft |
| 12 | Will that winning project have a public source repository on the submission before the deadline? | Sun Nov. 15, 11:30 a.m. | Submission record, then the URL. The opt-in link does not count | Draft |
| 13 | Will that winning team be one whose record was created after Friday noon, with every member joining after that time? | Sun Nov. 15, 11:30 a.m. | Results post joined to registration times. This is the stand-in for "started solo" | Draft |
| 14 | Will that winning team include two or more colleges? | Sun Nov. 15, 11:30 a.m. | Results post joined to roster colleges. Publish yes/no only | Draft |
| 15 | Will that winning submission include any public URL recorded before the deadline? | Sun Nov. 15, 11:30 a.m. | Submission record. Broader than market 12 | Draft |

Nico set the blanket close: every market that is still open closes Sunday, Nov. 15, 2026, 11:30 a.m. PT. Friday roster markets still close Friday at 8:15 p.m. PT, before the 8:40 p.m. roster lock. The two airport markets still close Saturday at 11:59 p.m. PT, because Saturday's weather is already knowable by Sunday morning. If a result can be known before 11:30 a.m. Sunday, that market does not open. Full wording of each question is in `research/05-hackathon-markets.md`. The clock in this memo replaces the earlier 11:45 a.m. and 1:00 p.m. closes.

**Incentives.** Nico set this on 13 November 2026, replacing the earlier 25% plan. The pool is **50%** of what this team actually receives (placement plus one challenge award of $1,000 if they win it). The builders keep the other half. If the team wins nothing, the pool is $0. On the stated first-place prize of $4,000 the pool is $2,000 and the builders keep $2,000. On first place plus the challenge ($5,000) the pool is $2,500 and the builders keep $2,500. On third place, or the challenge alone ($1,000), the pool is $500 and the builders keep $500. Those prize figures are what Nico stated. They are not on a public page this project opened. The 300-person room is a planning number. The economics note recommended 25%. Nico chose 50% anyway. `research/08-prize-economics.md` keeps that analysis and records the override.

Pay **10** skill ranks, not 50/30/20. Rank k gets a weight of `0.85^(k-1)`, divided by the sum of those ten weights. Dollar amounts are that weight times the pool, rounded to the nearest dollar, then adjusted by the largest remainder so the ten checks sum to the pool. On the $2,000 first-place pool the list is $374, $317, $270, $229, $195, $166, $141, $120, $102, $86. On the $2,500 first-place-plus-challenge pool the list is $467, $397, $337, $287, $244, $207, $176, $150, $127, $108. On a $1,000 pool (second place, or third plus the challenge) the list is $187, $159, $135, $115, $97, $83, $70, $60, $51, $43. On a $1,500 pool the list is $280, $238, $203, $172, $146, $124, $106, $90, $76, $65. On a $500 pool the list is $93, $79, $68, $57, $49, $41, $35, $30, $26, $22. Ties split the combined cash of the ranks they occupy, equally. No drawing. A leftover cent that cannot be split uses the earlier forecast timestamp. If fewer than 10 people have at least 3 resolved markets, pay the published dollars for the ranks that exist. Do not rescale. Unawarded dollars stay with the builders. Places outside the cash ranks get a certificate that names the rank. The scarce badge stops at 10.

**Tax.** This is not tax advice. A tax advisor has not reviewed it. Nico's decision is that the team pays tax on the prize it receives, and what remains is the team's to give. The published gift is still the top 10 by mean Brier, not a private choice of names. A person who receives a cash award can owe tax on that award even when the team already paid tax on the hackathon prize, and even when no tax form is sent. Do not describe the award as tax-free.

Sophie agreed to the 50% pool on 13 November 2026. Nico stated the same day that the team has permission to split its hackathon earnings, and that no lawyer is required. This repo does not contain that permission. The team may say the 50% plan. When cash is mentioned, say the tax line in the same breath. Do not describe an award as tax-free. The default sentence at the table is still the question, free, one position. Badge and certificate remain the offer if the team wins nothing. Referral credits stay capped at 5 and do not change rank. 100 people may be most of the room. The fallback goal is 40 real forecasters. If Saturday 6:00 p.m. is under 15, stop chasing a bigger number and keep the board honest. Prize eligibility is 18+. The hackathon's own age rule was not on the calendar. `research/07-incentives.md` still describes 20% and 50/30/20. This memo wins. Its Sunday 3:00 p.m. lock also loses to the 11:30 a.m. close.

**Entry.** The room path is one open market, not a homepage and not a login wall. A QR opens that market. The first screen shows the question, the YES probability, and two buttons. Each button names the side and the credit cost of the default size, 10 shares. Tapping a button does not place the position yet. It opens one sheet on the same page: a display handle (editable; suggest the email name or a short random handle), one checkbox "I am 18 or older," and either Continue with Google or an email that sends a magic link. No college, team, phone, or Discord field. The side and size stay on the device. When sign-in returns, that position is placed without a second decision, and the page shows the new probability and the credit balance. The magic-link return URL is that same market. `/login` and `POST /api/test/magic-link` stay as the test path. They are not what a person in the room sees first. Google is the fast path only if that provider is working before doors. If it is not, the sheet is handle, the checkbox, and email. Under 18 can read the question. The checkbox is required before a position is stored. A session that never confirms does not get a prize rank. After the position, one control shows a QR of the same market. No tour and no referral screen. The market list is a link, not the landing.

In the room, a card prints the question and the QR, and a laptop on the table shows that market's price. The default spoken line is one sentence: the question, free, one position. The 50% plan may be said with the tax line. No mass email. Do not ask for a workshop mic unless that host already said yes. The recognition rhythm is two beats, not the three checkpoints in the incentives note: one position on Saturday, and a position still held at the Sunday 11:30 a.m. close. Both earn the non-cash badge. Missing one means no badge. The badge is not points.

**Rules to send organizers.** Draft. Not legal advice. Not approved by a lawyer or by the event.

1. Campus Call is a student demo by Nico and Sophie. It is not run by Cal Poly, the CSU, or the hackathon unless an organizer adds a written line. Contact: [Nico's email].
2. Free to enter. A purchase does not grant credits or improve a score. The hackathon's own fee is not a Campus Call fee.
3. Each person gets the same 1000 virtual credits. Credits have no cash value. They cannot be bought, sold, transferred, or redeemed for money, goods, or a prize.
4. A person takes a position at the current market probability. Points on one resolved market are `round(100 * (1 - Brier))`. Brier is the squared gap between the YES probability at their trade and the outcome (1 or 0). If they traded more than once, the probability is the share-weighted average. Prize rank, if a prize later exists, is the mean of those Brier scores, lower better, with at least 3 resolved markets. Ties split the combined cash of the ranks they occupy, equally. No drawing.
5. If this team wins nothing, the cash pool is zero. Points, a badge, and a certificate still exist. If this team wins a hackathon prize, 50% of what it receives is paid to 10 skill ranks on the published geometric list. Nico stated that the team has permission to split those earnings and that no lawyer is required. Empty ranks are not rescaled and are not filled by a draw. This is not tax advice. The team pays tax on the prize it receives. A person who receives a cash award can owe tax on that award even if the team already paid tax and even if no tax form is sent. Do not describe an award as tax-free.
6. Eligibility for a prize: 18 or older. Display handles only. No student ID, grade, or education record.
7. Nico, Sophie, judges, and organizers take no positions. A team takes no position on a market whose outcome is specifically that team. This weekend's markets do not name a team. No trades after close. A human resolves from the written source. If the source does not settle the question, the market is void and does not change the score.
8. Not offered: a student's grade or standing, a class average, a small course section, an unpublished exam, a person's health, a result one person can set, or a Cal Poly athletics result unless Athletics compliance has agreed in writing.
9. The operators may cancel the demo if the venue requires it. A cancelled contest does not award a prize by chance. It awards no prize, and that fact is posted.
10. California law governs, except where federal law controls. These rules do not authorize anyone to put up money or anything of value.

## 2. Conflicts and resolutions

**Cash prize vs "lawyer first."** Agent 7 recommended saying 20% out loud, split 50/30/20. The economics note recommended 25% and a top-10 list. Nico later set the pool at 50%, still on that top-10 list. Agent 2 says a prize of real value needs a lawyer before it ships, and that credits redeemable for a prize are the fact pattern to avoid. Resolution: credits are never redeemable. The 50% is a separate skill prize from the team's own winnings, not a redemption. It is the plan. Sophie agreed on 13 November 2026. Nico stated the same day that the team has permission to split earnings and that no lawyer is required. The research note that asked for a lawyer is not the live rule. A tax advisor has not reviewed it. The organizer draft below is not a request anymore. Do not send it. Do not describe the award as tax-free.

**What the leaderboard sorts by.** The harness scores points per market. Agent 2's draft ranked people by average Brier and defined points as "starting points minus that score." Those are different. A sum of points rewards playing more markets. Resolution: keep the tested points formula on each market. Rank the prize, and sort the board, by mean Brier, minimum 3 resolved markets. The e2e spec only checks that the user appears on the board, so this does not require an edited test. `research/03-build.md` still describes points as the number and profit as not the rank. Where it implies points are the rank, this memo wins.

**How many hackathon markets are ready.** Agent 5 found two that can open once a roster exists (modal team size, and opt-in coverage). The user asked for 15 launch markets. Resolution: 15 are specified. Only the two KSBP markets open before a reply. The other 13 are drafted and not tradable. Category markets from the unconfirmed `rules.js` track list are not in the 15.

**Athletics this weekend.** Agent 1 has objective game markets (Saturday volleyball, Sunday basketball, Friday wrestling). Agent 2 flags the posted athlete handbook on tangible stakes and on sharing team information, and says athletics results need a yes from compliance. Resolution: leave them off the launch board. Nico wants club sports and NCAA sports as a later business line. That line is written in `research/04-business-model.md`. It opens only after Athletics compliance says yes in writing. It is not a weekend market and not a weekend slide. Do not sell a forecast back to the office that controls the outcome. The same cut removes Taco Bell open/closed.

**Academic markets.** Agent 1 kept them campus-wide and later in the term. Agent 2 says a class average is out under FERPA. Resolution: none in the MVP. No waitlist markets. No attendance markets. No class averages.

**S&P market.** Agent 1's market 25 asks whether the Friday, Nov. 14, 2026 close beats Thursday, Nov. 13. November 13, 2026 is a Friday, so November 14 is a Saturday. The cash equity market is not open Saturday. That question is dropped, not repaired into a Monday question, because Monday is after the Sunday 11:30 a.m. close for this weekend's board.

**Who pays, in the pitch.** Agent 4 refuses unsourced prices and keeps the licensed-venue referral out of the demo. Agent 6 does the same. The forecaster pool is a participant incentive, not revenue. Resolution: Sophie does not quote $45, TAM, the pool, or a sports line unless Nico has cleared the sentence. Hosting math and the later sports note stay in `research/04-business-model.md` for the Q&A sheet. Students do not pay.

**Event name.** The calendar says Cal Poly Code Vibing Club. The registration site says Cal Poly Vibe Coding Club (CPVC), co-hosted with Orfalea College of Business and Cal Poly Entrepreneurship Club (the homepage says Cal Poly Entrepreneurs). Resolution: quote both until an organizer picks one. Do not say the University runs Campus Call.

**Age.** The calendar says the hackathon is open to everyone and states no age minimum. Agent 2 recommends 18+ when a prize has value. Resolution: 18+ for prize eligibility, including the certificate if it names a rank. Under 18 can watch. This is our rule, not the event's.

**Referral credits vs skill.** Agent 7 caps referrals at 5 and keeps them off the rank. Agent 2 says a score must be skill, not a drawing and not a purchased boost. Resolution: accept the cap. Referrals do not change Brier or points.

## 3. TASKS.md

The build list is `TASKS.md` in the project root. Lane tags are 3a–3e. Phase A is checked. Everything else is open. Phase B does not start until Nico says go.

Score now, from Agent 3's run of `scripts/score.ps1`: **22.8788**. Unit tests 17/33 (banned-topic checker passing; LMSR, Brier, points, and ledger throw `not implemented`). AI evals 0/10. E2E 0/2, no skips, no server. Lint and typecheck passed. Re-run after this synthesis is recorded below if the number changed. A score of 95 needs both e2e tests, all unit tests, almost all 10 AI fixtures, and clean lint and typecheck. One failing e2e test caps the score near 75 even if everything else is green.

The folder is a git repository on `main`, remote https://github.com/nico-wood/campus-call. Do not run `git init`. `scripts/loop.ps1` is the old generic loop. Phase B should follow `TASKS.md` and `scripts/score.ps1`, not that loop's `npm test`-only gate.

## 4. Organizer message draft

Do not send this. Item 3 is closed by Nico's statement on the split. Items 1 and 2 are withdrawn. A participant may say they are at this hackathon. A forecast does not need a permit. A question still needs a named source, and the copy still must not say the clubs or the university operate Campus Call.

---

Subject: Student request — Campus Call forecasts at this weekend's hackathon

Hello,

We are Nico and Sophie, a team at the Cal Poly AI Hackathon (Friday–Sunday, Building 003). We are building Campus Call, a free forecasting board: "The wisdom of the crowd, quantified."

We are asking the organizers for a written yes on three things.

1. May we run forecast questions about this hackathon? Virtual credits only. Credits have no cash value and cannot be bought or turned in for anything. No entry fee. We would not open those questions until you confirm the facts below. Two weather questions use the National Weather Service airport report and do not need this yes.

2. May we use the event name only to say we are a student team at the hackathon? We will not say Cal Poly, the CSU, CPVC, Orfalea, or the Entrepreneurship Club operates or endorses the board unless you add a sentence that says so. Your calendar says "Cal Poly Code Vibing Club." The registration page says "Cal Poly Vibe Coding Club (CPVC)." Please tell us which name to use.

3. Closed by Nico's statement on 13 November 2026: the team has permission to split earnings. The plan is 50% of what the team receives, paid to the ten most accurate forecasters on the published geometric list. Accuracy is mean Brier, not a drawing. If the team wins nothing, the pool is $0. No lawyer is involved, by Nico's decision. A tax advisor has not reviewed it. The team pays tax on the prize it receives, then gives the pool. A person who receives a cash award can owe tax on that award even if no form is sent. Do not describe the award as tax-free.

We also need these facts before any hackathon question opens. If you cannot confirm one, that question stays off.

- Friday, Nov. 13, 8:40 p.m. PT is the roster lock, and team sizes will not be posted before 8:15 p.m.
- A roster aggregate we may hold: team name, member count, colleges on the team, and whether the team record was created after Friday noon. No emails, majors, or profiles.
- The official submission deadline, and whether it is Sunday, Nov. 15, 12:00 p.m. PT. That noon time is our assumption. It is not on the calendar page we read.
- What counts as one official submission.
- Whether any winner, finalist list, or submission tally can come out before Sunday 11:30 a.m. PT. Predictions close then. If a result is public earlier, that question stays off.
- Whether a submission stores a public URL and a source-repository URL.
- One integer you will publish Friday night if you want a question of the form "will submissions be at least this number?"
- Where the results post will go. A human will resolve from that post. The market probability is not the result.
- Judges and organizers will not take positions, and will not change a roster, a category, or a winner in order to move a market.

Conflict rules we will enforce: a team does not forecast its own result; judges and organizers do not participate; the two of us do not take positions on markets we administer.

The draft rules are in the same note as this email. Please reply with yes, no, or edits. We will not post in Discord until you say the channel is fine.

Thank you,
Nico and Sophie

---

## Harness for review

| Path | What Nico is reviewing |
| --- | --- |
| `e2e/campus-call.spec.ts` | Desktop 1280×720 and mobile 390×844. Test-mode magic link, buy YES, price moves, portfolio, admin resolve, points, Brier, leaderboard. No skips |
| `tests/lmsr.test.ts`, `brier.test.ts`, `scoring.test.ts`, `ledger.test.ts` | Red on purpose. Modules throw `not implemented` |
| `tests/banned-topics.test.ts` | Green. Deterministic checker |
| `evals/fixtures/announcements.json` | 10 announcements, 4 of them must be rejected |
| `evals/generate-markets.eval.ts` | Red until `generateMarkets` exists. No network, no API key |
| `scripts/score.ps1` | Prints one number. Do not edit it to raise the score |
| `research/03-build.md` | Schema, routes, LMSR example, lane plan |

Phase B is waiting on Nico.
