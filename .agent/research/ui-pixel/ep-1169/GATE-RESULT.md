# GATE RESULT — ui — ep-1169 (Campus Call current state)

## Status: PASS

2026-11-14 PT. Source: working tree on top of 3af4917. Reported defect (Join pill misaligned on mobile) reproduced, root-caused (`globals.css:521` mobile `.confirm { width: 100% }` leaking onto the `confirm join-button` nav anchor), fixed, and re-verified.

## Surfaces
| Surface | Weighted | Floor ok | Iters | Status |
|---------|----------|----------|------:|--------|
| / (home, 1440+390) | 9.75 | yes | 2 | PASS |
| /join | 9.75 | yes | 2 | PASS |
| /markets/sunday-high-ksbp | 9.75 | yes | 2 | PASS |
| /leaderboard | 9.75 | yes | 2 | PASS |
| /portfolio | 9.75 | yes | 2 | PASS |
| /events/mens-basketball-montana-state | 9.75 | yes | 2 | PASS |

(Shared shell scored once across surfaces; per-surface captures all re-taken in iteration 2.)

## Blocking: 0 · Major: 0 · Minor residual: 1 (M3 sparse-history chart rendering, data-driven, noted in SCORE-HISTORY)
## Captures: .ui-autoresearch/captures/CampusCall/ (gitignored)
## SCORE-HISTORY: .agent/research/ui-pixel/ep-1169/SCORE-HISTORY.md
