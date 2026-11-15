# RUBRIC — design audit — EP-1169

Mode: design (Karpathy Mode A)
Target: `.agent/eps/EP-1169-ux-ui-21st.md` (the EP document only — no implementation exists yet)
Artifact root: `.agent/research/ep-1169-design-autoresearch/`

## Dimensions (4 graders, one lens each, full set every round)

| # | Dimension | Weight | What it measures |
|---|-----------|-------:|------------------|
| 1 | Architecture fidelity | 1.0 | The EP's technical approach is sound for THIS repo: vanilla CSS on `globals.css` variables, plain React, no Tailwind, no component library, SSR-safe client components (home page is rendered with `renderToStaticMarkup` in tests), rAF/transform-opacity-only animation, `prefers-reduced-motion` fallbacks specified per task. Ports of 21st.dev/Magic UI/Aceternity patterns are technically credible as described. |
| 2 | Policy & non-negotiables | 1.0 | The EP honors AGENTS.md "UX and UI work" verbatim: behavior modules, routes/queries, example data, `src/lib`, `supabase/`, tests, screen words (forecast, position, market probability, points, virtual credits — never bet/wager/odds/payout), required CSS markers (`flex-wrap: wrap`, `@media (max-width: 40rem)`, `--page-max`), `.frame`+`margin:0` ban, no push / no `.env` / no `vercel --prod`, protected files (score.ps1, logs/CC-00*.md, gate files, TASKS.md checkboxes, spec and overnight docs). |
| 3 | Cut DAG & implementability | 1.0 | Task ordering is buildable: each task independently committable (milestone-commit), dependencies explicit, verification commands per task (`npm test`, `tsc --noEmit`, `eslint .`, `next build`, smoke routes), rollback notes, no task requires editing a protected file, scope per task is a small reviewable diff. |
| 4 | Completeness & consistency | 1.0 | Objective ↔ tasks ↔ success criteria agree; no contradictions; current-state survey matches the real repo (including the 96ed84c hotfixes: combo pill collapse, `.confirm:disabled`, 3-outcome chip min-width); user's stated asks are all covered (mouse tracking, backgrounds, outlines, buttons, stat graphs, live-board density + horizontal Polymarket-style rows, combo tray, and — added 2026-11-15 from live smoke feedback — a dedicated mobile UX friendliness pass: the user reports mobile UI/UX "is not friendly at all", so the EP must contain an explicit mobile task with concrete, checkable criteria, not just per-task 40rem notes; and — added 2026-11-15 — market context visibility: the user reports "too many items don't give enough info about what you're forecasting on (basketball game, etc.)", so the EP must contain a presentation task that surfaces existing context data (each market already has `summary`, `label`, and event/team data in `live-forecasts.ts`/`live-events.ts`) on the card and/or detail screen — data-file changes themselves are out of the EP's scope, handled by a separate content workstream); risks and non-goals stated; nothing in the EP redoes existing hand-built patterns without saying so. |

Weighted average = sum(score × weight) / sum(weights).

## Gate (LEC strict — all must hold)

- Every dimension ≥ 9.7
- Weighted average ≥ 9.75
- Blocking defects: 0
- Major defects: 0

## Grader protocol

- Graders are read-only. No file edits. Score your dimension 0–10 (one decimal), list findings classified Blocking / Major / Minor, and give exact patches (quoted old text → new text for the EP) that would bring your dimension to ≥ 9.7. State PASS/FAIL for your dimension against the gate.
- Every round re-runs all 4 graders fresh. A separate fixer applies patches; the fixer never scores.
- Max 6 rounds; after that, residuals are surfaced and the gate is reported FAIL.
