# Round 3 — UI code

Scored against commit 2fcab26.

DIMENSION: UI code
SCORE: 9.7
BLOCKING: 0
MAJOR: 0
MINOR: 1
GATE: PASS

FINDINGS: Minor — `src/app/globals.css` `.door-main .event` sets `border-radius: var(--radius-lg)`, but `:root` never defines `--radius-lg`.
PATCHES: none
