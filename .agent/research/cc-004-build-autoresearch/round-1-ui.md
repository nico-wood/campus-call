# Round 1 — UI code

Scored against commit f0be717.

DIMENSION: UI code
SCORE: 9.7
BLOCKING: 0
MAJOR: 0
MINOR: 1
GATE: PASS

FINDINGS: Minor — `src/app/globals.css` `.door-main .event` sets `border-radius: var(--radius-lg)`, but `:root` never defines `--radius-lg` (only `--radius-md` and `--radius-pill`). The declaration is invalid, so the door card radius falls back to 0 beside the 12px enrollment card.
PATCHES: none
