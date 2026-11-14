# Score history — CC-004 build

## R0 — 2026-11-14 — FAIL — mode=build

| Dimension | Weight | Score |
| --- | ---: | ---: |
| Correctness | 0.25 | 10.0 |
| Security | 0.25 | 10.0 |
| Cut completeness and tests | 0.25 | 9.4 |
| UI code | 0.25 | 9.7 |
| **Weighted** | | **9.775** |

Blocking: 0
Major: 1
Top fixes: assert the only `startDeviceDemo(` call sits inside `onStartDemo`, the form submits through that handler, the effect does not call it, and first paint omits `Demo on this device`.

## R1 — 2026-11-14 — FAIL — mode=build

| Dimension | Weight | Score |
| --- | ---: | ---: |
| Correctness | 0.25 | 10.0 |
| Security | 0.25 | 10.0 |
| Cut completeness and tests | 0.25 | 9.6 |
| UI code | 0.25 | 9.7 |
| **Weighted** | | **9.825** |

Blocking: 0
Major: 1
Top fixes: brace-match the only `startDeviceDemo(` call to `onStartDemo`, scan every effect, and reject an 81-character name and `ada@example.c`.

## R2 — 2026-11-14 — FAIL — mode=build

| Dimension | Weight | Score |
| --- | ---: | ---: |
| Correctness | 0.25 | 10.0 |
| Security | 0.25 | 10.0 |
| Cut completeness and tests | 0.25 | 9.6 |
| UI code | 0.25 | 9.7 |
| **Weighted** | | **9.825** |

Blocking: 0
Major: 1
Top fixes: parse the enrollment component with the TypeScript parser and require the only `startDeviceDemo` call to sit inside `onStartDemo`.
