# Prize economics

This note prices a forecaster pool paid only out of money Campus Call's own team wins at the Cal Poly AI Hackathon (Friday 13 November 2026 through Sunday 15 November 2026). It recommends how large that pool should be, and how to divide it, if the aim is accounts in the room and Nico still keeps most of the money.

**Nico stated, not verified on a public page:**

- Placement prizes: 1st $4,000, 2nd $2,000, 3rd $1,000.
- One extra $1,000 if the team wins the challenges. This note treats that as one $1,000 on top of a placement prize, not $1,000 per challenge.
- He wants to keep a real share of whatever the team wins. He does not want to give the prize away.
- Plan for 300 participants. The goal is to get all of them onto Campus Call.
- Candidate pool shares: 20%, 25%, 30%, 40%, 50% of total winnings.
- Current proposed breakup of whatever pool exists: 50/30/20 to the top 3 forecasters. Places 4–10 get a badge and a certificate, not cash.

Total winnings means the placement prize plus the challenge $1,000 if they also win that. If they win nothing, the pool is $0.

Rank is skill: mean Brier score, lower better, at least 3 resolved markets. No random draw. Virtual credits have no cash value and are not the prize. Nico and Sophie cannot win the forecaster prize, because they administer the markets. A team cannot take a position on a market about itself.

Earlier notes in this folder found no prize amounts and no headcount on the public calendar or the registration page (`research/05-hackathon-markets.md`, `research/07-incentives.md`). Those notes also recorded an indexed caption of "$7.5k+" that the calendar and the registration page did not confirm. This note does not use that caption. Nico's figures do not add up to $7,500 either (the three placement prizes add to $7,000; first place plus the one challenge $1,000 is $5,000). No probability that Campus Call wins any prize is stated or used below. Every conditional dollar is "if they win that prize."

An earlier incentives note recommended 20% split 50/30/20, written when no prize figure was on the table. This note revises both choices using the figures above. It does not edit that note.

## How a cell is computed

Pool = gross × share. Builders keep = gross − pool. Under the current 50/30/20 proposal, the three forecaster amounts are pool × 0.50, pool × 0.30, and pool × 0.20.

Round to the nearest dollar only at the end of the full product. Do not round a percentage, or a cent, and then round again. Half of a dollar rounds up (away from zero). If a list of rounded dollars misses the pool by a dollar, repair that dollar by largest remainder, not by a draw: give it to the rank whose fractional part was closest to the cutoff and lost the round. If those fractional parts are identical, the better rank (closer to first) gets the dollar.

Worked example, already a whole dollar, so the last step changes nothing. First place is $4,000 and the share is 30%:

- Pool = 4000 × 0.30 = 1200
- Builders keep = 4000 × 0.70 = 2800
- 1st forecaster = 1200 × 0.50 = 600
- 2nd = 1200 × 0.30 = 360
- 3rd = 1200 × 0.20 = 240
- Check: 600 + 360 + 240 = 1200, and 1200 + 2800 = 4000

Every cell in the five tables below is this kind of product, and every one is already a whole dollar. Nearest-dollar rounding changes none of them.

The same rule does bind on the geometric list in section 4. Rank 5 of that list, on a $1,000 pool, is $97.495258... before rounding. Nearest dollar, taken once, is $97, because 0.495 is below one half. Rounded to the cent first it becomes $97.50, and a second round then makes $98. That second round is the mistake this rule is there to stop. The $97 figure is the one used below.

## 1. Dollar table

Rows with the same gross are the same dollars. They are listed twice when they are different events (3rd place with no challenge, and the challenge with no placement, are both $1,000). "Builders keep" is the team's remainder, not one person's share of the team.

### 20%

| Outcome | Gross | Pool | Builders keep | 1st | 2nd | 3rd |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Nothing | 0 | 0 | 0 | 0 | 0 | 0 |
| Challenge only | 1,000 | 200 | 800 | 100 | 60 | 40 |
| 3rd | 1,000 | 200 | 800 | 100 | 60 | 40 |
| 3rd + challenge | 2,000 | 400 | 1,600 | 200 | 120 | 80 |
| 2nd | 2,000 | 400 | 1,600 | 200 | 120 | 80 |
| 2nd + challenge | 3,000 | 600 | 2,400 | 300 | 180 | 120 |
| 1st | 4,000 | 800 | 3,200 | 400 | 240 | 160 |
| 1st + challenge | 5,000 | 1,000 | 4,000 | 500 | 300 | 200 |

### 25%

| Outcome | Gross | Pool | Builders keep | 1st | 2nd | 3rd |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Nothing | 0 | 0 | 0 | 0 | 0 | 0 |
| Challenge only | 1,000 | 250 | 750 | 125 | 75 | 50 |
| 3rd | 1,000 | 250 | 750 | 125 | 75 | 50 |
| 3rd + challenge | 2,000 | 500 | 1,500 | 250 | 150 | 100 |
| 2nd | 2,000 | 500 | 1,500 | 250 | 150 | 100 |
| 2nd + challenge | 3,000 | 750 | 2,250 | 375 | 225 | 150 |
| 1st | 4,000 | 1,000 | 3,000 | 500 | 300 | 200 |
| 1st + challenge | 5,000 | 1,250 | 3,750 | 625 | 375 | 250 |

### 30%

| Outcome | Gross | Pool | Builders keep | 1st | 2nd | 3rd |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Nothing | 0 | 0 | 0 | 0 | 0 | 0 |
| Challenge only | 1,000 | 300 | 700 | 150 | 90 | 60 |
| 3rd | 1,000 | 300 | 700 | 150 | 90 | 60 |
| 3rd + challenge | 2,000 | 600 | 1,400 | 300 | 180 | 120 |
| 2nd | 2,000 | 600 | 1,400 | 300 | 180 | 120 |
| 2nd + challenge | 3,000 | 900 | 2,100 | 450 | 270 | 180 |
| 1st | 4,000 | 1,200 | 2,800 | 600 | 360 | 240 |
| 1st + challenge | 5,000 | 1,500 | 3,500 | 750 | 450 | 300 |

### 40%

| Outcome | Gross | Pool | Builders keep | 1st | 2nd | 3rd |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Nothing | 0 | 0 | 0 | 0 | 0 | 0 |
| Challenge only | 1,000 | 400 | 600 | 200 | 120 | 80 |
| 3rd | 1,000 | 400 | 600 | 200 | 120 | 80 |
| 3rd + challenge | 2,000 | 800 | 1,200 | 400 | 240 | 160 |
| 2nd | 2,000 | 800 | 1,200 | 400 | 240 | 160 |
| 2nd + challenge | 3,000 | 1,200 | 1,800 | 600 | 360 | 240 |
| 1st | 4,000 | 1,600 | 2,400 | 800 | 480 | 320 |
| 1st + challenge | 5,000 | 2,000 | 3,000 | 1,000 | 600 | 400 |

### 50%

| Outcome | Gross | Pool | Builders keep | 1st | 2nd | 3rd |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Nothing | 0 | 0 | 0 | 0 | 0 | 0 |
| Challenge only | 1,000 | 500 | 500 | 250 | 150 | 100 |
| 3rd | 1,000 | 500 | 500 | 250 | 150 | 100 |
| 3rd + challenge | 2,000 | 1,000 | 1,000 | 500 | 300 | 200 |
| 2nd | 2,000 | 1,000 | 1,000 | 500 | 300 | 200 |
| 2nd + challenge | 3,000 | 1,500 | 1,500 | 750 | 450 | 300 |
| 1st | 4,000 | 2,000 | 2,000 | 1,000 | 600 | 400 |
| 1st + challenge | 5,000 | 2,500 | 2,500 | 1,250 | 750 | 500 |

At 50%, builders keep half, not a majority, in every positive scenario, including 3rd place only and the challenge $1,000 only (they keep $500 of $1,000). At 20%, 25%, 30%, and 40%, builders keep more than half in every positive scenario. At 25% they keep 75% in every one of them: $750 of $1,000, $1,500 of $2,000, $2,250 of $3,000, $3,000 of $4,000, and $3,750 of $5,000.

Sensitivity, not a stated prize: if "the challenges" were two awards of $1,000 and both stacked on 1st place, gross would be $6,000, not $5,000. At 25% the pool would be 6000 × 0.25 = $1,500 and the builders would keep $4,500. The 50/30/20 forecaster dollars would be $750, $450, and $300. In general, if the add-on is N times $1,000, gross = placement + 1000 × N, and the pool is the share times that gross. N is not known. The tables use N = 1 when the challenge is won, and N = 0 when it is not.

## 2. Expected value in a room of 300

Both beliefs below are assumptions, not facts. Nico's 300 is a planning number, not a published headcount. This note does not assign a probability that the team wins the hackathon. The pools are conditional on the prize outcome.

**Equal-chance assumption.** Each of 300 people has a 1/300 chance of each paid rank and cannot win two ranks. Then expected cash = (sum of the cash prizes) / 300. When the whole pool is paid out, that sum is the pool, so expected cash = pool / 300. The breakup does not change this average. A steeper top and a wider list have the same mean. They change who gets the zero.

**Contender assumption.** Only about 30 people treat themselves as able to finish in the top 10. This count is an assumption. If those 30 are treated as equally likely to finish in any order, and they take every cash rank, a contender's mean cash is (sum of the cash prizes) / 30. That mean is pool / 30 whether the pool is spread over the top 10 or paid only to the top 3. Spreading the pool does not raise the mean. What stays concentrated, when only the top 3 are paid, is the outcome for a typical person in that group of 30: 27 of the 30 get $0, so the median is $0 and the chance of any cash is 3/30. Paying the top 10 raises that chance to 10/30, and 20 of the 30 still get $0, so the median is still $0. Do not read "concentrated" as pool / 3. That would be the cash only if someone already knew they had finished in the paid set, and it would count the same dollars three times if all 30 used it.

The table uses the recommended 25% share. Other shares scale in a straight line: a 20% pool is 0.20/0.25 of the 25% pool, and the expected cash scales with it.

| Outcome | Gross | Pool at 25% | Equal-chance: pool/300 | Contender mean: pool/30 |
| --- | ---: | ---: | ---: | ---: |
| Nothing | 0 | 0 | 0 | 0 |
| Challenge only | 1,000 | 250 | 250/300 = 0.833... | 250/30 = 8.333... |
| 3rd | 1,000 | 250 | 0.833... | 8.333... |
| 3rd + challenge | 2,000 | 500 | 500/300 = 1.666... | 500/30 = 16.666... |
| 2nd | 2,000 | 500 | 1.666... | 16.666... |
| 2nd + challenge | 3,000 | 750 | 2.50 | 25 |
| 1st | 4,000 | 1,000 | 1000/300 = 3.333... | 1000/30 = 33.333... |
| 1st + challenge | 5,000 | 1,250 | 1250/300 = 4.1666... | 1250/30 = 41.666... |

These expectations are left in exact form on purpose. Rounding 1000/300 to the nearest dollar would print $3 and hide the result. For the talking case, conditional on 1st place and a 25% pool, equal-chance expected cash is $3.333... per person. The same case at the other candidate shares is 800/300 = $2.666... (20%), 1200/300 = $4 (30%), 1600/300 = $5.333... (40%), and 2000/300 = $6.666... (50%). All of those are a few dollars, and only if the team has already won first place.

On the equal-chance assumption, the chance of any cash is 3/300 if three ranks are paid and 10/300 if ten are paid. Those fractions are the assumption, not a forecast of who is good.

Nico and Sophie are ineligible. The table still divides by 300, because that is the planning number he asked for. If both of them are inside the 300, the eligible count is 298, and 1000/298 = $3.3557... instead of $3.333.... That is not a different conclusion.

Option value, one line: on Saturday the pool is worth less than these conditional dollars, because the team may win nothing, and this note does not put a number on that chance.

## 3. Which share

Recommend **25%**. On the talking case, 1st place and $4,000, the pool is $1,000 and the builders keep $3,000. On the upside case, 1st place plus the challenge and $5,000, the pool is $1,250 and the builders keep $3,750. If they win nothing, the pool is $0 and there is nothing to keep.

The constraint is a majority for the builders in every prize scenario, including 3rd place only and the challenge $1,000 only. At 25%, both of those are a $1,000 gross, a $250 pool, and $750 kept. That is 75%, the same share as on the $4,000 and $5,000 cases. A 50% pool fails the constraint: the builders keep $500 of that $1,000, which is half, not a majority. A 40% pool keeps 60% ($600 of $1,000, $2,400 of $4,000). Sixty percent is a majority on a calculator and it is not "most of the money" in a sentence a teammate will accept. It also hands the top of the leaderboard an extra $600 on the talking case (a $1,600 pool instead of $1,000) for an equal-chance expectation of $5.33 instead of $3.33.

**Extensive margin versus intensive margin.** The extensive margin is whether person 300 opens the app at all. The intensive margin is whether someone who already cares tries harder to finish first. Moving the share from 20% to 40% barely touches the extensive margin: the conditional expectation stays a few dollars. The same move scales every forecaster check, which is an intensive-margin spend. The goal Nico named is the extensive one.

**Tournament theory.** Lazear and Rosen, "Rank-Order Tournaments as Optimum Labor Contracts" (Journal of Political Economy, 1981), show that effort in a rank contest responds to the gap between the prize for finishing ahead and the prize for finishing behind, for people who can still finish ahead. Rosen, "Prizes and Incentives in Elimination Tournaments" (American Economic Review, 1986), shows why an elimination contest puts extra weight on the top prize: contestants who have already climbed high would otherwise coast, because the future prizes left above them have run out. Both results are about people near the top. A larger share, spent on a steeper top, is a tool for that group. It is not a tool for someone who knows they will not finish there.

**Convex cost of effort.** Moldovanu and Sela, "The Optimal Allocation of Prizes in Contests" (American Economic Review, 2001), find that if the cost of extra effort is linear or concave, the designer who wants total effort puts the whole purse on first place. If that cost is convex (the next hour is harder than the last), several positive prizes can be better, because the extra prizes raise effort from middle-ability people by enough to offset some lost effort from the very best. The direction for this room: a large gap between first and everyone else gives middle-ability people little cash reason to try. It does not say that a published paper counted how many hackathon participants quit. Raising the share from 25% to 30% or 40%, and then paying 50/30/20, spends the extra money on the gap those papers say matters near the top, not on the median person.

**Coordination.** With 300 people the binding constraint is whether a table of friends joins together. Cash with an equal-chance expectation of a few dollars does not do that. A visible round number does, and so does a reason that is not cash. Twenty-five percent of the $4,000 first prize is the round number: a $1,000 pool. That is the figure a table can repeat. Thomas Schelling's focal point is the idea in plain clothes: people coordinate on the number that is obvious, not on the number that is slightly more "optimal."

**Opportunity cost.** These people are building a project the same weekend. That project is their own shot at the same prize list. A forecast has to be a few minutes, not a second job. Paying up for the intensive margin asks the room to take time away from the work that can actually win $1,000 to $4,000. The forecaster pool should not be priced as if it were buying that hour.

**Why 30% loses (the next step up).** On the talking case the pool goes from $1,000 to $1,200 and the builders keep $2,800 instead of $3,000. Equal-chance expected cash goes from $3.33 to $4.00, still conditional on first place. That dollar does not get person 300 in the door. It scales the top prizes. The round thousand disappears. The optics get worse too: Nico and Sophie run the markets and cannot win, but a larger share is easier to read as the operators taxing a product prize to feed a contest they administer.

**Why 20% loses (the next step down).** On the talking case the pool is $800, not $1,000. The builders keep an extra $200 (they keep $3,200 instead of $3,000). That $200 was not going to recruit anyone. What is lost is the sentence. At 20%, the only pool that equals $1,000 is the upside case, first place plus the challenge (5000 × 0.20 = 1000). The clean number would then depend on a second win. The number people will repeat is the first-place case. It should be the round one.

Twenty-five percent is the only candidate that keeps a clear majority (three quarters) in every positive scenario, including a $1,000 third place and a $1,000 challenge with no placement, and that makes the first-place pool a round $1,000.

## 4. Which breakup

The 50/30/20 shape is the wrong shape if the goal is 300 accounts rather than the single best forecaster. The hackathon scores real users this weekend more heavily than a perfect forecast. The pool should stay skill-based. No lottery. No cash for everyone who joins. Places outside the cash ranks still get recognition.

The comparisons use the recommended 25% share. The talking case is 1st place only: gross $4,000, pool $1,000. The upside line is 1st place plus the challenge: gross $5,000, pool $1,250.

"Too small to mention" is a judgment, not a law. It means the number should not go in a spoken sentence or on a slide, on a weekend when the team's own prize is measured in thousands. This note treats anything under $25 as under that line.

### Shape A: 50/30/20, top 3 only

On the $1,000 pool: 1st $500, 2nd $300, 3rd $200. Places 4 through 10 get $0 plus a badge and a certificate. Check: 500 + 300 + 200 = 1000.

On the $1,250 pool: 1st $625, 2nd $375, 3rd $250.

This is the intensive-margin shape. Tournament theory says the $500 gap from 1st to 4th is exactly the kind of spread that raises effort among people who might finish first, and that does little for everyone else. Under the contender assumption, 27 of 30 people get nothing. Fourth place is a cliff, not a step. Three cash ranks in a planned room of 300 means 297 people are outside the cash if they are honest about where they stand. That does not serve an account goal. It also asks for a sharper winning forecast, which is not what the weekend score rewards most.

### Shape B: top 10, geometric, ratio 0.85

Rank k gets a share proportional to 0.85^(k−1), for k from 1 to 10. The weights sum to 1 because they are divided by S = (1 − 0.85^10) / (1 − 0.85) = 5.354170637728515625. Each weight is exactly 85% of the weight above it. The dollar amounts are those weights times the pool, rounded once, so a printed check is not always exactly 85% of the check above it. The exact top weight is about 4.32 times the exact tenth weight. On the rounded $1,000 list, $187 is about 4.3 times $43. Percents rounded to four decimals are shown so the slope is readable; they sum to 99.9999 because of that rounding, so they are not the input to the dollar round. The dollars are the exact weight times the pool, rounded once.

| Rank | Weight × 100, four decimals | Unrounded dollars on $1,000 | Nearest dollar |
| ---: | ---: | ---: | ---: |
| 1 | 18.6770 | 186.770289 | 187 |
| 2 | 15.8755 | 158.754746 | 159 |
| 3 | 13.4942 | 134.941534 | 135 |
| 4 | 11.4700 | 114.700304 | 115 |
| 5 | 9.7495 | 97.495258 | 97 |
| 6 | 8.2871 | 82.870970 | 83 |
| 7 | 7.0440 | 70.440324 | 70 |
| 8 | 5.9874 | 59.874276 | 60 |
| 9 | 5.0893 | 50.893134 | 51 |
| 10 | 4.3259 | 43.259164 | 43 |

Check: 187 + 159 + 135 + 115 + 97 + 83 + 70 + 60 + 51 + 43 = 1000. Rank 5 is the unrounded example from the method section ($97.495258... becomes $97, not $98).

On the $1,250 pool, the same weights, rounded once, are already a list that sums to 1250: $233, $198, $169, $143, $122, $104, $88, $75, $64, $54. Tenth is $54. First is $233.

Every cash rank on the talking pool is at least $43, which is above the $25 line. The slope is still a skill slope: first is $187, not $500, and tenth is not a token. Equal-chance expected cash is still 1000/300 = $3.333..., the same as shape A. The mean did not move. What moved is the cliff. Fourth through tenth are paid, and a "top 10" is a cutoff a table already knows how to say.

### Shape C: top 30, which is also the top 10% of 300

Two versions, both on the $1,000 pool.

Equal split: 1000/30 = $33.333... each. That is already under a number worth putting in a sentence, and it is a weak skill prize, because first and thirtieth get the same check. It is also not a whole-dollar equal split: 30 × $33 = $990, so ten people would need an extra dollar and twenty would not. That repair would itself be unequal.

Geometric, ratio 0.90 across 30 ranks (each prize is 90% of the prize above it, weights 0.90^(k−1) divided by the sum of those thirty terms). Dollars below are nearest-dollar figures after a largest-remainder repair so the full list sums to $1,000. The ranks shown were the same before and after the repair. The two repair dollars land in the middle of the list, which is not printed in full.

| Rank | Nearest dollar on the $1,000 pool | On the $1,250 pool |
| ---: | ---: | ---: |
| 1 | 104 | 131 |
| 10 | 40 | 51 |
| 15 | 24 | 30 |
| 20 | 14 | 18 |
| 30 | 5 | 6 |

Fifteenth, at $24, is already on the wrong side of the $25 line. Twentieth is $14. Thirtieth is $5. Those are not prizes a person mentions. They are also not why person 200 opens an app: person 200 is not inside the top 30 on any honest reading of "200 of 300." A wider list makes the bottom of the cash ranks too small to say, and it still does not reach the median of the room.

A flatter ratio can hold a 15th prize above $25. That does not fix the problem. It buys five more small checks by making first and fifteenth the same kind of money. That is a participation schedule with extra steps. It is not the skill contest the Brier ranking is there to run, and it is still cash for 15 people, not for 300.

### Recommendation

Use **shape B: 10 cash ranks**, weights as in the geometric table, not 50/30/20.

Why 10, and not 3: three cash ranks is a cliff at fourth place. Contest theory with convex effort cost says that gap leaves middle-ability people with little reason to try. The account goal is not served by paying three people $500, $300, and $200. The equal-chance average is identical if the same $1,000 is spread, so the builders give away no more by using ten ranks.

Why 10, and not 300: cash for everyone who joins is a participation payment, which this contest should not be. On a $1,000 pool it is 1000/300 = $3.333... before the impossibility of paying 300 equal whole dollars out of $1,000 (300 × $3 = $900). A $3 check is not a prize. It also stops being a skill ranking.

Why 10, and not 30: the bottom of a skill-weighted top 30 is $5 to $14. That is too small to mention. An equal $33.33 is barely mentionable and flattens skill.

Why 10 rather than 12 or 15: ten is the longest list that keeps a clear skill step (85% of the prize above, first about 4.3 times tenth) and still pays the last cash rank $43 on the talking pool. "Top 10" is also the cutoff the room can say without a second explanation. The scarce badge and the cash should stop at the same rank. Two cutoffs in one weekend will be misquoted.

Places outside the cash ranks still get recognition. Anyone who met the minimum of 3 resolved markets gets a certificate that names the rank and the real denominator, and a line on the board. The scarce in-app badge stays on the top 10, including the people who also get cash. A badge given to everyone who opened the app is not a badge. Cash ranks are 1 through 10 only. Opening an account is not the same bar as prize eligibility. The account is the thing the weekend score is counting. The three resolved markets are the bar for a cash rank, so the prize does not tax every user with a second job.

If fewer than 10 people have at least 3 resolved markets, pay the published dollars for the ranks that exist. Do not rescale the whole pool onto a shorter list. Rescaling would quietly rebuild the steep top this section just rejected. Post that the empty ranks were not awarded. Do not fill them by a draw. The unawarded dollars stay with the builders. That edge case means the spoken pool is the amount set aside, and a thin ranking list does not have to leave the team in full. Say that before markets open if it is adopted.

### Ties

Yes. People who tie on mean Brier split the combined cash of the ranks they occupy, equally. No drawing.

Example on the $1,000 geometric list: two people tie for first. Ranks 1 and 2 are $187 and $159, combined $346. Each gets $173. The next person gets rank 3's $135, not rank 2's $159. Check: 173 + 173 + 135 = 481, and 187 + 159 + 135 = 481.

The regulation note (`research/02-regulation.md`) preferred an equal split and rejected a chance device. It also said that if a prize cannot be split, the earlier last forecast update wins. Use that fallback only for a leftover cent that equal division cannot place. Do not use the timestamp to award the whole rank. These prizes are cash, so they can be split. The incentives note preferred the timestamp for the whole tie. The two notes disagree. Publish one rule before markets open. This note's recommendation is the equal split of the combined cash.

## 5. What gets person 200 to open the app

The cash cannot recruit person 200. Conditional on the team winning first place, and conditional on a 25% pool of $1,000, the equal-chance expectation is $3.33. That figure already pretends person 200 is as likely to finish first as someone who is actually good. If the ranking is skill, which is the rule, person 200's cash expectation is closer to zero than $3.33. If the team wins nothing, it is zero. On Saturday it is worth less than the conditional number, because the team may win nothing. A few dollars, paid only if another team wins a prize this person does not control, will not get the 200th person in a planned room of 300 to open an app. Changing the share from 20% to 50% moves that conditional expectation from $2.67 to $6.67. That is the entire intensive-margin debate, and it is still not a reason to stop building.

**Cash offer, separated.** The cash is real only in the cases in the tables. The sentence worth saying is "a $1,000 pool if we win first, $0 if we win nothing," not "you should expect $3.33." The people for whom the cash is a coherent reason are the ones who already think they might finish in the top 10. Under the contender assumption that is about 30 people, not person 200, and even their mean is $33.33 conditional on first place, with a median of $0 if only 10 of them are paid. Their own project is aimed at $1,000 to $4,000. An hour of forecasting is a bad trade against that. A few minutes is not. The cash offer should be sized and worded so it never sounds like a second job. It should not be the first sentence at the table.

**Non-cash offer, separated.** What can move person 200 is the table, not the check. A friend opens the app and passes the phone. The board is on a screen in the room with a handle they recognize. The question is about the weekend they are already in, so they already have a view, and locking it takes a few minutes. The certificate and the badge do not open the app: the badge is invisible until they are inside, and a certificate on Sunday is not a Saturday decision. Recognition matters after they are in, as a reason to leave a real rank on the board. It is not the reason the 200th person looks up from their own demo.

Be skeptical of the non-cash channel too. Nothing in these dollars shows that 300 people will join. Three hundred is the planning number Nico asked for. It is not a count from the registration page. A table of friends is the unit that either walks in together or does not. If that ask is awkward, a rounder pool will not repair it. If the forecast takes more than a few minutes, the opportunity cost wins and the account is not created. The prize design should get out of the way of that ask. It should not be the ask.

## 6. Sentence Sophie can say

> If we win first place, the forecaster pool is one thousand dollars, which is 25 percent of that prize; if we win first place and the challenge, the pool is one thousand two hundred fifty dollars; if we win nothing, the pool is zero dollars; a lawyer has not reviewed this, and the organizers have not approved it.

## Top 5 takeaways

1. Use 25%. If the team wins first place ($4,000), the pool is $1,000 and the builders keep $3,000. If they win first place and the challenge ($5,000), the pool is $1,250 and the builders keep $3,750. If they win nothing, the pool is $0.
2. A 50% pool does not leave the builders a majority, including on a $1,000 third place or a $1,000 challenge alone. A 40% pool keeps only 60%. A 30% pool turns the round $1,000 into $1,200 for an equal-chance expectation of $4 instead of $3.33. A 20% pool saves $200 and makes the talking-case pool $800.
3. For a typical person among 300, expected cash conditional on first place is $3.33 at a 25% pool, and the breakup does not change that average. It is worth less than that on Saturday, because the team may win nothing. No win probability is assumed here.
4. Do not pay 50/30/20 if the goal is accounts. Pay 10 skill ranks on a geometric list (each prize 85% of the one above). On the $1,000 pool that is $187 down to $43. A top-30 skill list ends at about $5, which is too small to mention. Do not pay all 300.
5. Ties split the combined cash of the tied ranks equally. No drawing. The cash will not get person 200 to open the app. A lawyer has not reviewed this, and the organizers have not approved it.

## Open questions for Nico

1. Is the challenge add-on one $1,000, or several? The $6,000 row in section 1 is a sensitivity, not a figure he stated.
2. Do the hackathon rules let a team share prize money with people who are not on the team? The sentence in section 6 should not be said in the room until he accepts it, a lawyer has reviewed it, and the organizers have approved it.
3. Which tie rule is published: this note's equal split of the combined cash, or the incentives note's earlier-timestamp rule? They disagree. Cash should not use a draw either way.
4. If fewer than 10 people finish with at least 3 resolved markets, does he accept leaving the empty ranks unpaid, posting that fact, and keeping those dollars with the builders, rather than rescaling the pool onto a shorter list?
5. Is anyone besides Nico and Sophie ineligible for the forecaster prize? Other people on the building team are not named here.
6. Does he want this 25% and top-10 list to replace the earlier draft of 20% and 50/30/20? That draft was written before these prize figures were stated.
