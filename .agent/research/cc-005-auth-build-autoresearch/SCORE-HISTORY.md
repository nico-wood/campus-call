# CC-005 auth substage score history

## Round 0 — 14 November 2026 — PASS

| Dimension | Weight | Score |
| --- | ---: | ---: |
| Correctness | 0.25 | 9.8 |
| Security | 0.25 | 9.8 |
| Cut/tests | 0.25 | 9.8 |
| UI code | 0.25 | 9.9 |
| Weighted | | 9.825 |

Four fresh read-only graders. Blocking 0, major 0. Two distinct minor findings: grant RPC timeout bounds; direct expiry/provider-invalidated-cookie/limiter-boundary test coverage. Security and cut graders both identified the latter. No implementation fix/self-grading occurred. Backend substage only, not full balance acceptance.
