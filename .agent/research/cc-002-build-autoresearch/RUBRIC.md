# Rubric — CC-002 build — Campus Call

Mode B on commit `35432c6`. Scope is the example cards, the category and search filters, and the example event view. The hackathon QR flow is CC-003 and is not a missing feature.

Pass only when every dimension is ≥ 9.7, the weighted score is ≥ 9.75, blocking findings are 0, and major findings are 0.

| Dimension | Weight | What a 9.7 answer covers |
| --- | ---: | --- |
| Correctness | 0.25 | Five categories and search filter the list. The category and the search text survive reload. A percentage opens that example. Confirm does not write or debit. |
| Security | 0.25 | No secret in the commit. Confirm cannot reach the real ledger or send a request. No client flag grants credits or admin. |
| Cut completeness and tests | 0.25 | The CC-002 acceptance is tested, including a confirm that fails the suite if it writes or debits. `npm test`, lint, and typecheck exit 0. The score script was not edited. |
| UI code | 0.25 | Cards show a question, a close, an Example label, and outcomes. CSS variables carry color, type, and space. Screen copy avoids bet, wager, odds, and payout. This is code review, not a screenshot score. |

Blocking: a secret, a confirm that spends credits, or a weakened test. Major: a filter, URL, or confirm acceptance that is false. Minor: wording or structure that does not change the acceptance.
