# Campus Call build spec

Locked 13 November 2026 from Nico. This file is the product the overnight build ships. Where it conflicts with the old binary-market entry path in `research/00-summary.md` or with `TASKS.md` lanes 3b–3e, this file wins for the demo. The unit tests, the ledger, and the SQL stay. The trading app in the old worktree is not the front door. Do not merge it as the product.

Screen words: forecast, position, market probability, points, virtual credits. Do not use bet, wager, odds, or payout on the screen.

## Two doors

**Home.** The campus model. A top bar has the name, search, and portfolio. A row of categories filters the list: All, Sports, Music, Dining, and the hackathon. Each card shows a question, a close, and the leading outcomes with percentages. Tapping a percentage opens that event. Campus cards are labeled Example. We wrote them. Their confirms do nothing, and they take no credits.

Campus questions may be yes or no, higher or lower, or earlier or later. They show what the product can hold. They are not live.

**QR.** Opens the hackathon event only. It does not open Home and it does not show the example cards.

The layout follows the path on Polymarket and Kalshi: a list of events, an event page, and a ticket. On a phone the open ticket sits at the bottom.

## Credits

One balance. A person receives 1,000 virtual credits only after they scan the hackathon QR and enter an email and a name. The same email does not get a second grant. Scanning again does not add credits. Credits cannot be bought or redeemed.

Those credits are spent only on the hackathon tickets below. The same team may be named on more than one ticket, and on more than one place in the ranking. The only limit is the balance. A ticket asks for a team and how many credits to put on it. Confirming spends that amount. An overspend is refused and writes nothing.

## Hackathon tickets

Four tickets. Each confirms on its own. Picks lock Sunday 15 November 2026 at 12:00 p.m. PT, when the submission that gets judged is frozen. Source: the participant guide at https://cpvc-ai-hackathon-guide.vercel.app/#fri . If Discord disagrees, Discord wins.

1. **Main prize.** Name a team for 1st, 2nd, and 3rd, and choose how many credits to put on that ranking. The same team may fill more than one place.
2. **OpenAI.** One team. Its own credit amount. Daryush Shahid judges the shortlist on Zoom. The product must help a specific person or community and must use Codex.
3. **Startup Launch Award.** One team. Its own credit amount. Cal Poly Entrepreneurs. A real customer, a reason current options fail, and proof of demand from this weekend.
4. **Best Use of AI.** One team. Its own credit amount. Cal Poly Vibe Coding. The product stops working if the AI is removed.

A team may enter at most one challenge. A challenge ticket lists only teams who entered it. Before that fact exists, the ticket says entry is not in yet. Confirming the ranking does not spend credits on a challenge.

Main-prize chances add up to 100% across every team. Each challenge's chances add up to 100% across the teams who entered it. The percentage is Campus Call's read. It is not the judges' score.

## Team cards

A card starts when a link exists.

- Saturday 14 November 2026, 2:00 p.m. PT: project link. GitHub or the app builder. Work so far.
- Saturday 14 November 2026, 8:00 p.m. PT: Sunday commit. Live link. No commit, no judging slot.
- Sunday 15 November 2026, 12:00 p.m. PT: the submission that gets judged. Live app, project link, short description, AI tools used, and, if they enter a challenge, that pick plus a demo video under 2 minutes.

Each card shows the project, whether the live link runs, a feasibility read, a background read, and a grade on the official rubric. Background comes from public Instagram, LinkedIn, and the same kind of page. Private accounts stay unread. The rubric rows are Execution and design 25, Real problem and real user 25, Path to customers 20, Pitch and demo 15, and Creative use of AI 15, using the guide's low, middle, and top lines. The points and a one-line reason sit on the card. The card updates when a link or a public profile changes.

## Admin demo

The Chick-fil-A line is an admin-only ticket for demo day. A participant never spends credits on it. An admin can put credits on it so the room can see a campus question work. Everyone else sees that card as a preview, and the confirm does nothing. The other campus cards stay previews.

## Prize

If this team wins nothing, the cash pool is $0. If it wins, the pool is 50% of what this team actually receives, including a challenge award if they win one. The builders keep half. Sophie agreed. Nico stated the team has permission to split earnings and that no lawyer is required. This folder does not contain that permission. A tax advisor has not reviewed it.

The guide's published prizes are 1st $4,000, 2nd $2,000, 3rd $1,000, and $1,000 for each of the three challenges. Cash is split evenly across the winning team. Each winner fills out a W-9. On a $4,000 first place the pool is $2,000 and the builders keep $2,000. On first place plus one challenge the pool is $2,500 and the builders keep $2,500.

Pay 10 skill ranks. Rank k gets weight `0.85^(k-1)` over the sum of the ten weights. Round to the nearest dollar, then largest remainder so the checks sum to the pool. On the $2,000 pool: $374, $317, $270, $229, $195, $166, $141, $120, $102, $86. Ties split the combined cash of the ranks they occupy. No drawing. Empty ranks are not rescaled. Unawarded dollars stay with the builders.

This is not tax advice. The team pays tax on the prize it receives, then gives the pool. A person who receives a cash award can owe tax on it even when no form is sent. Do not call the award tax-free. Say that line in the same breath as the dollars.

The score for that rank is how the four tickets did against the official result. The old mean-Brier rank is the harness. It is not the score for this demo.

## Do not

Do not say Cal Poly, the CSU, CPVC, Orfalea, or the Entrepreneurship Club operates or endorses Campus Call. Do not send the organizer draft. Do not deploy production. Do not read a `.env` file.
