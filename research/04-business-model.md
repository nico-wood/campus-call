# Campus Call — business note for Sophie

Written 13 November 2026 for the Cal Poly SLO hackathon (13–15 November 2026). Nico is the builder. The campus product is free to play: students use virtual credits, accuracy builds a reputation, and the line we can say is "The wisdom of the crowd, quantified." Pages below were read that day. Vendor prices move. Nothing here is a signed customer, a measured bill, or a revenue forecast.

Words in this note: forecast, position, market probability, points. Students do not put up cash.

## Who pays

Students do not pay. Points are created by the app. They are not dollars, and they are not redeemable for dollars in the campus product. That is a product rule for this build, not a price taken from a rate card.

There is no published price list for a campus forecasting dashboard. The dollar figures in the cost table are a bottom-up hosting floor. Any price a buyer would pay above that floor is unset. Do not quote a range.

### Dashboards for clubs, ASI, athletics, and dining

The thing being sold, later, is a read-only view of market probabilities that changes a decision the buyer already makes. It is not a cash market.

- A club decides whether to hold an event and how much to prepare (a room, food, printed shirts). The forecast is a crowd question with a public result, such as whether turnout clears a number the club writes down in advance. Clubs are users. Assumption: they pay $0 during a pilot. A club budget is too small, and no one has asked a club to pay.
- Associated Students (the student government, ASI at Cal Poly) decides whether to staff or fund a campus-wide event. A dashboard is useful only if a probability changes that staffing call. No ASI price for this kind of tool was found. Do not invent one.
- Athletics decides how many people to put on gates and concessions for a game. The useful forecast is a crowd question that resolves from a figure the department already publishes, or from a threshold written before the game. The department might pay for the dashboard, or it might let a sponsor pay. Neither price is published.
- Campus dining decides how much of an item to prep before a game, a concert, or a bad-weather day. The buyer is the dining operator or the campus auxiliary, not the student. They pay only if a forecast changes a prep quantity often enough to matter. No dining contract or software price was found for this.

Assumption, stated plainly: in the first term the buyer is "whoever has the decision," and the only dollar number attached to that buyer is the cost to host the campus, not a willingness-to-pay study.

### Sponsored markets

A brand pays cash so that one market's points are subsidized and the brand's name sits on that market. The subsidy itself is points, not dollars. Under the product assumption in the cost table (liquidity parameter b = 100 credits), a binary market's worst-case subsidy is 100 × ln(2), about 69.3 credits. Those credits are not a cash cost and must not be quoted as $69.

The cash price is whatever the brand pays Campus Call to be named. No campus-forecasting sponsor card exists. Fizz, a campus app, sells labeled brand placements and does not publish a rate on its own FAQ, so there is no peer price to copy. Assumption: the minimum cash that covers hosting is one sponsor paying the monthly host bill for that campus, with no margin. That bill is the $45 line in the cost table, and only under the assumptions in that table. A second sponsor in the same month is margin or a second campus, not a second copy of the same $45, unless hosting actually rises.

The sponsor does not write the question and does not decide how it resolves. If they do, the probability is an ad, and a serious reader will ignore it.

### Campus brand partnerships

This is the same cash idea, stretched over a term rather than one market: a dining brand, a local shop, or an athletics sponsor named across a set of markets. Still no rate card. The decision they are buying is attention next to a question students already care about (a game, a menu, a campus event), not a feed of unrelated ads. Price: unset. Cost floor: the same hosting line, unless the partnership adds usage that pushes Vercel or Supabase past included quotas. We have no traffic forecast, so we do not estimate that overage.

### Later: a referral, not this build

A licensed real-money event-contract venue is a possible later referral only. It is not in the hackathon build, and it is not a revenue line for the weekend. In the United States, listing those contracts is a regulated exchange activity. The CFTC's designated-contract-market record shows Kalshi as designated on 3 November 2020 ([CFTC filing 42993](https://www.cftc.gov/IndustryOversight/IndustryFilings/TradingOrganizations/42993)). Kalshi's own help center describes the firm as a CFTC-regulated designated contract market ([How is Kalshi regulated?](https://help.kalshi.com/en/articles/13823765-how-is-kalshi-regulated)). A referral would send a person to a venue that already holds that kind of license. Campus Call would not hold customer funds or list contracts. Whether a campus, a state, or the venue's license even allows the referral is a legal question, not a product feature. Leave it out of the demo.

## How the others make money

Each row is from that product's own site, read 13 November 2026. "Copy" means the campus product. "Do not copy" is the part that would turn Campus Call into a cash venue or an ad feed.

| | What it is | Money model | Who the user is | What Campus Call should copy | What it must not copy |
| --- | --- | --- | --- | --- | --- |
| [Manifold](https://docs.manifold.markets/faq) | A forecasting site. Anyone can open a question. The market probability moves when people take positions with play-money called mana. | Mana cannot be converted to cash. A new account starts with M1000. Manifold also sells more mana, and mana can be spent for entries in prize drawings ([prize FAQ](https://docs.manifold.markets/prize-faq)). | People who want a reputation and more mana, and anyone who opens a question for friends or a community. | A public market probability, a record of who was accurate, and questions that people on one campus can open themselves. | Selling points for dollars, prize drawings tied to points, and questions about a private life. |
| [Metaculus](https://www.metaculus.com/about/) | A forecasting platform. A person types a probability. Metaculus aggregates it. It is a public-benefit corporation. Its "why" page says forecasters do not buy shares or put up money ([Why Metaculus](https://www.metaculus.com/why/)). | Forecasting is free. Organizations can pay to host a tournament, hire pro forecasters, or run a private space. No public price list. Some tournaments award cash prizes. | Forecasters building a track record, and organizations that want a forecast tied to a decision. | A probability a person states directly, a score that rewards being right, and a question written because someone has a decision to make. | Cash prizes inside the campus app, and a global research brand that is not about one campus. |
| [Kalshi](https://help.kalshi.com/en/articles/13823805-fees) | A CFTC-designated exchange for event contracts. The price is a market probability. Cash changes hands. | Kalshi charges a trading fee. Its fee schedule, effective 7 July 2026, states the standard fee as round up of M × 0.07 × C × P × (1 − P), where P is the contract price in dollars and C is the number of contracts ([fee schedule PDF](https://kalshi.com/docs/kalshi-fee-schedule.pdf)). The same schedule says there is no membership fee. | Adults taking cash positions on events. | A question with the resolution rule written before anyone takes a position. | Cash contracts, trading fees, and anything that needs the CFTC license described above. |
| [Polymarket](https://docs.polymarket.com/polymarket-101) | An event-contract venue. A share priced between $0 and $1 is the market's probability. Polymarket's fees page says Polymarket US is QCX LLC, a CFTC-regulated designated contract market, and that the international platform is not regulated by the CFTC ([fees](https://polymarket.com/fees)). | Taker fees on many categories, using the shape C × fee rate × p × (1 − p). Docs list geopolitics as fee-free. Collateral is a dollar stablecoin, not campus points ([trading fees](https://docs.polymarket.com/trading/fees)). | People trading event contracts with dollars. | Reading the current price as a probability the crowd can check. | Crypto collateral, cash if the outcome happens, and a global order book. |
| [Fizz](https://fizz.social/faq) | A discussion app for a college or a city. Fizz says it is live on 800+ U.S. college campuses, that a college community requires a school email or proof of enrollment, and that it is not affiliated with the school. | Free for students. Brands pay for labeled in-feed posts, sponsored polls, front-door takeovers, push notifications, and on-campus activations. The FAQ does not list a price. | Students in a closed campus feed, and brands that pay to appear there. | Campus-only access, and a sponsor whose name is obvious on the surface they paid for. | An anonymous social feed, ads as the product, and letting the sponsor own the question. |

## How big the crowd is

These are headcounts. They are not revenue. There is no sourced price per student, so this note does not multiply students by a dollar figure.

**TAM, in words.** Every student enrolled at a U.S. degree-granting institution who could open a forecast. Degree-granting means the institution grants an associate degree or higher and is in the federal IPEDS count. The TAM is that headcount. It is not a dollar market.

**SAM, in words.** The students Campus Call could actually reach with a product one small team can support. Two cuts, both still headcounts:

- The practical SAM is the California State University system, then one campus inside it. The hackathon is at Cal Poly San Luis Obispo. A second campus is a CSU campus, not a national rollout.
- The wider SAM is students at U.S. four-year institutions. That is the closest official stand-in for "four-year campuses." It is not a count of students who live in residence halls. The NCES table below does not publish that split. Treat the four-year headcount as a ceiling, not a residential market.

**The counts.**

U.S. fall enrollment, degree-granting institutions, fall 2024. Source: NCES Digest of Education Statistics 2025, Table 311.15, IPEDS Fall Enrollment, Spring 2025 provisional data, table prepared March 2026. Fifty states and the District of Columbia. [Table 311.15](https://nces.ed.gov/programs/digest/d25/tables/dt25_311.15.asp).

- All students: 19,659,633. This is the TAM headcount.
- Four-year: 14,962,894. This is the wider SAM headcount.
- Two-year: 4,696,739. Check: 14,962,894 + 4,696,739 = 19,659,633.
- Public four-year: 9,849,220. A tighter slice if the first off-campus buyers are public universities. It still includes commuter campuses, and it leaves out private nonprofit colleges. It is not "residential."

Arithmetic, not an estimate: four-year students are 14,962,894 / 19,659,633 = 76.1% of the TAM headcount. Public four-year students are 9,849,220 / 14,962,894 = 65.8% of the four-year headcount.

How many front doors, not how many students. IPEDS Institutional Characteristics, academic year 2024–25, provisional, counts 2,614 U.S. four-year Title IV institutions (the U.S. row under "4-year"; the 2,691 figure includes other U.S. jurisdictions). [IPEDS Table 1, tableId 36525](https://nces.ed.gov/ipeds/search/viewtable?tableId=36525). This is every Title IV institution classified as four-year, including small and special-focus schools. It is not a list of residential campuses, and it is not a buyer list. This note does not divide enrollment by that institution count, because the enrollment table is degree-granting fall 2024 and the institution table is Title IV level in 2024–25. Those are related counts, not the same denominator.

**CSU, the practical SAM.** Fall 2025 system headcount is 471,451 students, and the system describes itself as 22 universities, with Cal Poly San Luis Obispo and Cal Maritime still integrating through fall 2026. Source: CSU news release, 8 December 2025, [enrollment growth](https://www.calstate.edu/csu-system/news/Pages/CSU-Sees-Highest-Year-Over-Year-Enrollment-Growth-in-a-Decade-.aspx). The campus table that adds up to 471,451 also includes International Programs and CalStateTEACH, so do not divide 471,451 by 22 and call it an average campus. [Enrollment by campus, fall 2025](https://www.calstate.edu/csu-system/about-the-csu/facts-about-the-csu/enrollment).

**Beachhead.** Cal Poly's own facts page lists a student body of 23,245 in fall 2025, undergraduate and graduate. [Facts and figures](https://www.calpoly.edu/about/facts-and-figures). Arithmetic, same term: 23,245 / 471,451 = 4.9% of the CSU headcount. That is a share of students, not a share of future revenue, and not a forecast of how many of those students will open the app. Participation is unknown. Do not invent a rate.

Fall 2025 CSU and fall 2024 national figures are different years. This note does not divide one by the other.

**Dollars, kept separate.** No one has agreed to pay per student or per campus. Multiplying 19.7 million students, or 2,614 institutions, by the $45 hosting assumption would describe neither revenue nor a market. It is not shown.

## What one campus costs

Credits and dollars are different columns of reality. The subsidy is points the app creates. The host bill is money Nico or a sponsor pays to Vercel and Supabase. Prices are USD and, on both vendors' pages, exclude tax.

| Item | Figure | Assumption vs Source |
| --- | --- | --- |
| Vercel Hobby | $0 / month | Source. [Vercel pricing](https://vercel.com/pricing): Hobby is $0. Included usage includes 100 GB fast data transfer, 1 million CDN requests, and 1 million function invocations a month ([Hobby plan](https://vercel.com/docs/plans/hobby)). Terms, section 4: Hobby is for personal or non-commercial use only ([Vercel terms](https://vercel.com/legal/terms)). |
| Vercel Pro | $20 / month platform fee | Source. [Pro plan](https://vercel.com/docs/plans/pro-plan): $20 a month includes one deploying seat and $20 of usage credit. Another deploying seat is $20 a month. Credit that is unused expires. Prices exclude tax. |
| Supabase Free | $0 / month | Source. [Supabase pricing](https://supabase.com/pricing): two active projects, 500 MB database, 50,000 monthly active users, 5 GB egress. A free project pauses after one week of inactivity. |
| Supabase Pro, one Micro project | $25 / month | Source. Pro is from $25 per organization per month and includes $10 of compute credit, which covers one Micro instance ($10). Spend caps are on by default. A single project inside the included quotas is the $25, not $25 plus $10. |
| One commercial campus, usage inside the included quotas | $45 / month | Estimate. Assumption: one Vercel Pro team with one deploying seat, one Supabase Pro organization, one Micro project, and usage that never passes the included credit and quotas, so on-demand charges are $0. $20 + $25 = $45. This is not a quote either vendor has given for "a campus." |
| Same stack plus a second Micro project | $55 / month | Estimate. Assumption: a separate dev project. Supabase's own example is two Micro projects at $25 + $10 + $10 − $10 credit = $35. Plus $20 Vercel = $55. |
| Hackathon weekend | $0 hosting | Estimate. Assumption: the weekend stays inside Hobby and Supabase Free quotas, and nobody is paying Campus Call yet, so the deploy is still non-commercial. This is not a semester plan. A free Supabase project pauses after a week idle, and a paid sponsor makes the Vercel use commercial. |
| Liquidity parameter b | 100 credits | Product assumption. Not a vendor price and not dollars. It is how hard it is to move the market probability. A larger b costs the app more points. |
| Worst-case points subsidy, one binary market | 100 × ln(2), about 69.3 credits | Formula, given b = 100. Hanson: starting from uniform prices, the market maker's maximum loss is b times the log of the number of outcomes ([Hanson 2003 note](https://mason.gmu.edu/~rhanson/msrbook.pdf)). For two outcomes that maximum is b × ln(2) ([Pennock, 2006](http://blog.oddhead.com/2006/10/30/implementing-hansons-market-maker/)). ln(2) is about 0.693, so 100 × 0.693 is about 69.3 credits. Not dollars. |
| Sponsor cash that covers hosting | $45 per campus per month | Estimate. Assumption: one named sponsor, zero margin, no overage, and the sponsor pays the host bill in dollars. The 69.3 credits are not part of that cash. If the sponsor funds ten binary markets, the app still creates about 693 credits of worst-case subsidy, and the cash floor is still $45 unless usage breaks the quotas. |
| One campus pilot, dollars per month | $0 this weekend; $45 after that if the paid stack above is the one in use | The $0 and the $45 are the two estimates in this table. Anything above $45 is an unsourced price, not a cost. |

We do not have a forecast of page views, so this note does not estimate overage. If a real pilot crosses the included quotas, the bill is higher than $45 and has to be read off the invoice.

## What you can say out loud

Campus Call lets students on one campus forecast together with points, and it shows the crowd's market probability as a plain number. This weekend the only thing that is true is a free pilot at the Cal Poly hackathon, with no paying customer and no cash in the app. Points stay points, and a student does not pay to take a position. The plan, which is not built yet, is that a club, the student government, athletics, or dining might later pay for a simple dashboard, or a local brand might pay to put its name on a market and cover hosting. A referral to a licensed cash event-contract company is a later idea that depends on regulation, and it is not part of this weekend.

## If nobody pays

No office and no brand has agreed to pay. The dashboard story is a hypothesis. If it is wrong, the product can still exist. The honest order is:

1. A free tool for one club or one class, hosted at $0 while it stays inside the free tiers and stays non-commercial. That is a class project, not a company. Say so.
2. One named sponsor who covers the host bill, on the order of $45 a month under the paid-stack assumption, in exchange for their name on a market they do not control. That is the first cash that does not require a campus office to buy software.
3. A dashboard fee only after a few markets have resolved and someone with a real decision says the probability changed what they did. Selling the dashboard before that is selling a blank chart.

Other risks, stated without a rescue plan we do not have:

- Points may not be enough. If students take casual positions, the probability is noise, and nobody should pay for it. Reputation is the incentive on paper. It is unproven here.
- A sponsor who can move the probability with a large position, or who writes the question, ruins the number. The name is the product they buy. Control is not.
- Free hosting is not a business model. It pauses, and it is not allowed once the use is commercial.
- One campus is the whole story until a second campus asks. National headcount is context for the size of the crowd, not a sales pipeline.
- Sliding from points to cash, including a "small referral" in the demo, pulls a campus app into a regulated activity. The CFTC status cited above belongs to Kalshi, not to Campus Call.

## Top 5 takeaways

1. Students do not pay. Points are not dollars, and the campus build does not cash them out.
2. This weekend can cost $0 to host. A commercial one-campus pilot is about $45 a month before tax and before overages, if one Vercel Pro seat and one Supabase Micro stay inside the included quotas.
3. The crowd on paper is 19,659,633 students at U.S. degree-granting institutions in fall 2024, of whom 14,962,894 are at four-year institutions. That is a headcount, not revenue. The first market is the CSU, 471,451 students in fall 2025, starting with Cal Poly's 23,245.
4. Copy a public market probability, an accuracy record, and a sponsor whose name is labeled. Do not copy cash contracts, selling points, or an anonymous ad feed.
5. If nobody buys the data, the fallback is a free club or class tool, plus a named sponsor who covers hosting. It is not a cash exchange, and it is not a national revenue story.

## Open questions for Nico

1. Does the hackathon deploy stay on Vercel Hobby and Supabase Free all weekend, and who checks that it is still non-commercial if a sponsor is even mentioned on stage?
2. Is b = 100 credits the liquidity parameter in the build? The "about 69.3 credits" line is that assumption plus the formula. A different b changes the points, not the host bill.
3. One Supabase project, or a second project for dev? On the paid stack that is the difference between the $45 estimate and the $55 estimate.
4. Which person will you actually ask first — a club officer, ASI, athletics, or dining — and what decision, in one sentence, would make them pay?
5. Who resolves a market, and what public source do they use? A dashboard is only as good as that rule.
6. Can a sponsor fund the points and be named, with no say over the question text or the resolution?
7. Is the licensed-venue referral staying out of the demo and the spoken pitch, except as the one line that it is later and not this weekend?
