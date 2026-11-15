# SCORE HISTORY — portfolio-signed-in (Mode C, 2026-11-15)

Rubric: 7 dimensions, weights Spatial 1.5, Hierarchy 1.5, Type 1.0, Color 1.0, Interactive 1.0, Responsive 0.75, Consistency 0.75. Gate: weighted ≥ 9.7, every dim ≥ 9, blockers 0. Scored from real PNGs in `.ui-autoresearch/captures/PortfolioSignedIn/` (signed-in state via API stubs; see SURFACES.md) plus Nico's production screenshot as the reference for iteration 0.

## Iteration 0 — as deployed

| Dim | Score | Note |
| --- | --- | --- |
| Spatial | 9.4 | Stats strip and tables well-spaced, but the "Combos" heading sits flush against the positions table row above it |
| Hierarchy | 9.0 | "Combos" h2 renders at the same display size as the page title "Nico Wood"; market cell reads "the combined final score" — a lowercase sentence fragment with no line number, so the row can't tell the holder which Under they own |
| Typography | 9.5 | Tabular numerals, clean table headers; the lowercase market label breaks sentence-case convention |
| Color | 9.0 | **Market link renders in the browser's default blue/purple (visited) link colors** — hardcoded-palette violation on a page that is otherwise fully tokenized |
| Interactive | 9.6 | Row hover, InfoTip on the title; link affordance unclear in default purple |
| Responsive | 9.7 | Tables scroll inside their own container at 375/768; topbar wraps correctly (fix from join-signin pass) |
| Consistency | 9.5 | Everything matches site primitives except the link colors and heading scale |

**Weighted: 9.36 — FAIL.**

Patches applied (presentation only; market data, ids, priors untouched):
1. `portfolio-view.tsx` — `marketName()` capitalizes the label and appends the ladder line ("The combined final score · 148.5"); used in the positions market cell and combo leg text.
2. `globals.css` — `.positions-table a` uses `var(--text)` with a soft underline, accent on hover (kills the default blue/purple).
3. `portfolio-view.tsx` + `globals.css` — the Combos `page-intro` gains `section-intro`: `margin-top: var(--space-7)` and the h2 steps down to `var(--text-xl)`.

## Iteration 1 — final

| Dim | Score | Note |
| --- | --- | --- |
| Spatial | 9.7 | Combos opens its own section; table rhythm clean |
| Hierarchy | 9.8 | Page title > section heading > table headers; market row identifies the exact line |
| Typography | 9.7 | Sentence-case market names, tabular numerals |
| Color | 9.8 | All token colors; accent hover on market links |
| Interactive | 9.7 | Row hover, link hover accent, InfoTip |
| Responsive | 9.7 | 375/768/1440 coherent |
| Consistency | 9.8 | — |

**Weighted: 9.74 — PASS** (all dims ≥ 9, blockers 0). Verified: npm test 185/185.
