# Rubric — CC-003 build — Campus Call

Mode B on commit `3c88f89`. Scope is the QR door only. Credit grants and the four tickets are later EPs and are not missing features.

Pass only when every dimension is ≥ 9.7, the weighted score is ≥ 9.75, blocking findings are 0, and major findings are 0.

| Dimension | Weight | What a 9.7 answer covers |
| --- | ---: | --- |
| Correctness | 0.25 | `/hackathon` opens only the hackathon event. Refresh stays there. Example cards are absent. URL entry context survives an in-door link and a refresh. |
| Security | 0.25 | No secret in the commit. The door grants nothing and writes no ledger. No client flag grants credits or admin. |
| Cut completeness and tests | 0.25 | A test fails if the staged context disappears or if the door grants credits. `npm test`, lint, and typecheck exit 0. The score script was not edited. |
| UI code | 0.25 | The door is not Home. It says entry is not open yet. CSS variables carry color, type, and space. Screen copy avoids bet, wager, odds, and payout. This is code review, not a screenshot score. |

Blocking: a secret, a grant, or a weakened test. Major: the direct URL, the refresh, or the staged context is false. Minor: wording or structure that does not change the acceptance.
