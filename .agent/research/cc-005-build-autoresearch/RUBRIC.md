# Rubric — CC-005 build — Campus Call

Mode B on commit `3bf3508`. Scope is the additive migration and its pgTAP file: one persistent grant of 1,000 virtual credits, once per normalized email, after a server-recorded hackathon QR context and a validated name and email. The app still not calling the function is the next cut. It is not a defect in this commit. CC-004 still requires the door to return granted 0 and wrote false. A screen change is not part of this commit. Mode C is not applicable.

Pass only when every dimension is ≥ 9.7, the weighted score is ≥ 9.75, blocking findings are 0, and major findings are 0. Weights are equal, 0.25.

| Dimension | Weight | What a 9.7 answer covers |
| --- | ---: | --- |
| Correctness | 0.25 | The function inserts one 1000-credit grant keyed by normalized email. A second call, including a concurrent call, inserts nothing. A missing QR context, a blank or overlong name, or a rejected email inserts nothing. Name and email normalization match the enrollment rules. Demo storage is not read. The existing per-account grant index remains. |
| Security | 0.25 | The grant and the QR-context record are security definer with a pinned search path. Execute and insert are revoked from anon and authenticated and granted only to service_role. A client flag, query, header, or demo value is not an input. No secret is in the commit. |
| Cut completeness and tests | 0.25 | `npx supabase test db` covers the concurrent one-email race, the validation refusals, and the anon and authenticated denials. `npm test` exits 0. `scripts/score.ps1` was not edited. An assertion that does not actually test its claim is a major finding. |
| UI code | 0.25 | This commit does not change a screen. Home, the example routes, and the QR door still do not claim that virtual credits were granted. Screen copy avoids bet, wager, odds, and payout. This is code review, not a screenshot score. |

Blocking: a secret, a second grant for one normalized email, a grant without the server-recorded QR context, or anon or authenticated executing the grant. Major: the race test does not use two sessions, a cited assertion is missing, or the unique key is the account instead of the normalized email. Minor: wording or structure that does not change the acceptance.
