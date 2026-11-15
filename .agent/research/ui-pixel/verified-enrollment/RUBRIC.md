# Verified enrollment — Mode C rubric

Recorded before visual scoring on 14 November 2026. A fresh read-only grader reviews actual rendered captures for the new staged verification/account surface, independently of implementation and Mode B. Existing accepted enrollment gate is unchanged. Do not infer visual quality from code or tests. Do not call the external presentation direction user-approved.

Evidence: `outputs/participant-enrollment/initial-1280.png`, `initial-390.png`, `initial-375.png`, `invalid-390.png`, `code-390.png`, `wrong-code-390.png`, `verified-1280.png`, `verified-390.png`, `verified-375.png`; actual browser integration summary adjacent. Viewports desktop1280x720, mobile390x844, narrow375x812. Review initial, validation, code/error, verified account and sign-out control states. Captures are full-page; assess the added surface in its actual surrounding page. Any recapture must use the real app.

| Dimension | Weight |
| --- | ---: |
| Spatial rhythm | 1.5 |
| Hierarchy | 1.5 |
| Typography | 1.0 |
| Color | 1.0 |
| Interaction | 1.0 |
| Responsiveness | 0.75 |
| Consistency | 0.75 |

Pass only at weighted >=9.7, every dimension >=9.5, blocking 0/major 0. Maximum eight capture iterations; every rescore follows actual recapture. Grader never fixes or scores their own implementation. A lower score or insufficient evidence remains failed/pending. Parent records the full scorecard and concrete findings, never downgrades them. Product readiness, source-backed ticket eligibility and hosted deployment are separate.
