# SCORE HISTORY — design audit — EP-1169

Append-only. One section per round.

## R0 — 2026-11-15 — FAIL — mode=design
| Dimension | Weight | Score |
|-----------|--------|------:|
| 1 Architecture fidelity | 1.0 | 7.4 |
| 2 Policy & non-negotiables | 1.0 | 8.5 |
| 3 Cut DAG & implementability | 1.0 | 8.4 |
| 4 Completeness & consistency | 1.0 | 7.4 |
| **Weighted** | | **7.93** |
Blocking: 1 · Major: 14 · Minor: 29
Top fixes: T4 parallax rewritten compositor-only (blocking); T3/T11 combo-ring ownership + `.combo-slip-body` scroll wrapper; T10 no-drop grouping rule, tab-preserving "See all", concrete keyboard a11y; T8 real portfolio selectors + objective acceptance; hotfix commit status corrected to 96ed84c; one post-96ed84c line-number coordinate system; `@property` precedent claim corrected; T7 survey corrected (area fill already exists — narrow, don't re-add); screen-word binding on all new T10/T11 copy.
Full grader reports + patch lists: R0-FINDINGS.md

## R1 — 2026-11-15 — FAIL — mode=design
| Dimension | Weight | Score |
|-----------|--------|------:|
| 1 Architecture fidelity | 1.0 | 8.7 |
| 2 Policy & non-negotiables | 1.0 | 9.3 |
| 3 Cut DAG & implementability | 1.0 | 8.8 |
| 4 Completeness & consistency | 1.0 | 8.4 |
| **Weighted** | | **8.80** |
Blocking: 0 · Major: 8 · Minor: 28
Top fixes: new T13 (market context on card + detail, drafted by lens 4 against the extended rubric); T8 rebuilt — `.portfolio`/`.portfolio:hover` are dead/shared selectors, row box-shadow can't paint under border-collapse (move to `td`), `--gold-line` is a gradient image not a border value, no bare `white` literal; T6 owns the portfolio summary (`.stats-strip` is shared with `/portfolio`) with `/portfolio` smoke; T4 dot-grid is on `.app::before` + the 40rem cheap path needs an added `::after` rule; T7 `leadingOutcomeIndex` must be derived + namespaced clipPath; T1 needs `prefers-reduced-motion: no-preference` in the media composition; T10 "byte-for-byte categoryHref" corrected (minus `q` clause) + `min-width: 0` on row items; T12 scope adds `.combo-add-chip`, commit-level rollback, vacuous-acceptance note, wrap-layout acceptance; T2 guard against the daf829b end-of-file block; preamble CSS-only classification fixed; 21st.dev availability rule globalized.
Full grader reports + patch lists: R1-FINDINGS.md

## R2 — 2026-11-15 — FAIL — mode=design
| Dimension | Weight | Score |
|-----------|--------|------:|
| 1 Architecture fidelity | 1.0 | 9.7 (PASS) |
| 2 Policy & non-negotiables | 1.0 | 9.3 |
| 3 Cut DAG & implementability | 1.0 | 9.2 |
| 4 Completeness & consistency | 1.0 | 9.0 |
| **Weighted** | | **9.30** |
Blocking: 0 · Major: 4 · Minor: 20
Top fixes: T10 purged of the stale AGENTS.md "example cards on home" clause (door test asserts the opposite — two graders converged); T11 gains an all-width `.main` clearance reserve so its desktop acceptance is verifiable; T13's event context rebuilt on real `LocalEvent` fields (`teams[].short`/`record` — no `label` exists) without restating the 5d54f51-enriched summaries; T7 imports the existing `leadingOutcomeIndex` helper instead of re-deriving; T8 hover needs `:not()` exclusions to preserve gold/mine rows; T9 switches to scoped custom properties so T2's press state survives; T4 mobile rule must not double-paint the moved glow; T10 track needs block padding for hover shadows/ring; T3 ring recipe needs `-webkit-mask-composite: xor`; survey records HEAD `5d54f51`; preview deploys ruled out for all 13 milestones.
Full grader reports + patch lists: R2-FINDINGS.md

## R3 — 2026-11-14 PT — PASS — mode=design

Architecture 9.8; Policy 9.8; Cut 9.7; Completeness 9.8; weighted 9.775. Blocking 0, major 0, minor 2. Minor clarifications applied: T5 inset x/y, T10 measured overflow for any row size. Final design round per user instruction; begin build, no further design polishing. Evidence R3-FINDINGS.md; GATE-RESULT.md accepts design only. UI stays local for user review.
