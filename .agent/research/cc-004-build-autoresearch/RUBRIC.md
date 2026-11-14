# Rubric — CC-004 build — Campus Call

Mode B on product commit `fcbb9ea`. Scope is enrollment, session, and explicit demo mode. The persistent 1,000 grant, the database, and the four tickets are later EPs. Their absence is not a defect. A grant, a ledger write, or a live session from a client flag is a defect.

Pass only when every dimension is ≥ 9.7, the weighted score is ≥ 9.75, blocking findings are 0, and major findings are 0. Weights are equal, 0.25.

| Dimension | Weight | What a 9.7 answer covers |
| --- | ---: | --- |
| Correctness | 0.25 | The form renders only for `entry=qr` and `event=hackathon`. Name and email validation matches `docs/overnight/DECISIONS.md`. Demo starts only from the explicit demo action. A missing verified session does not become demo. Live mode returns only for the server-issued session object. Opening the door still grants 0 and writes false. |
| Security | 0.25 | No secret in the commit. No client flag, query, header, test callback, or copied session reaches live mode. Device demo is not copied into the ledger. The client form does not import the live-session module. |
| Cut completeness and tests | 0.25 | Tests fail if validation is skipped, if demo starts without the explicit action, if a non-QR route grants, if the door writes, or if a callback, query, header, client boolean, or copied session reaches live mode. `npm test`, lint, and typecheck exit 0. `scripts/score.ps1` was not edited. |
| UI code | 0.25 | Demo is labeled Demo and says it stays on this device, is not a verified account, and does not grant virtual credits. Entering an email is not described as verified ownership. CSS variables carry color, type, and space. Screen copy avoids bet, wager, odds, and payout. This is code review, not a screenshot score. |

Blocking: a secret, a grant, a ledger write, or a client-controlled live session. Major: the form shows off the QR door, invalid input creates a session, demo starts implicitly, or a cited test does not actually assert the claim. Minor: wording or structure that does not change the acceptance.
