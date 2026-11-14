# Rubric — CC-001 build — Campus Call

Mode B on commit `41cb9d9`. Scope is the home shell only. Example cards, filtering, and event pages are CC-002 and are not missing features.

Pass only when every dimension is ≥ 9.7, the weighted score is ≥ 9.75, blocking findings are 0, and major findings are 0.

| Dimension | Weight | What a 9.7 answer covers |
| --- | ---: | --- |
| Correctness | 0.25 | The shell renders the name, search, portfolio, and the five category labels. Controls that are inert are not wired to a fake filter. Existing unit tests still pass. |
| Security | 0.25 | No secret in the commit. No `.env` read by the grader or the app source. No client flag that grants credits or admin. The shell does not write a balance. |
| Cut completeness and tests | 0.25 | CC-001's acceptance is met: local build, the four controls, `npm test`, lint, and typecheck exit 0. The score script is not the pass check and was not edited. |
| UI code | 0.25 | CSS variables carry color, type, and space. The layout is specified at 1280px and 390px. Screen copy avoids bet, wager, odds, and payout. This is code review, not a screenshot score. |

Blocking: a secret in the repo, a write to a balance, or a test that was weakened to pass. Major: the acceptance check is false, or the shell cannot be built. Minor: wording or structure that does not change the acceptance.
