# CC-005 browser enrollment score history

## Round 0 — 14 November 2026 — FAIL

| Dimension | Weight | Score |
| --- | ---: | ---: |
| Correctness code | 0.25 | 9.8 |
| Security | 0.25 | 9.85 |
| Cut/tests | 0.25 | 8.8 |
| UI code | 0.25 | 9.75 |
| Weighted | | 9.55 |

Blocking 0, major 1: actual delivered mail lacks the numeric OTP accepted by the UI/API. Two distinct code minors: duplicate-cookie regression and accessible inline validation association/focus. The actual browser grant path is unproved, so no gate pass. Writer is fixing local templates without changing existing confirmation settings or applying a hosted migration. A fresh full four-lens round is required after fixes and actual integration proof. Mode C remains pending.

## Round 1 — 14 November 2026 — PASS for local enrollment

| Dimension | Weight | Score |
| --- | ---: | ---: |
| Correctness | 0.25 | 9.85 |
| Security | 0.25 | 9.9 |
| Cut/tests | 0.25 | 9.85 |
| UI code | 0.25 | 9.9 |
| Weighted | | 9.875 |

Four fresh read-only graders after the fixes. Blocking0, major0, minor0. Actual code email, first grant, repeat normalized-email refusal, refreshed balance and sign-out passed locally. Existing demo/door behavior and assertions remain. An unrelated concurrent bundle anchor temporarily broke the shared suite; acceptance held until non-navigation repair and full110/110 passed. The local-only template and unchanged auth confirmation setting are documented. Mode C and hosted readiness remain separate.
