# Mode C score history — Campus Call current state (post 3af4917)

Append-only. Rubric: `.agent/research/ui-pixel/ep-1169/RUBRIC.md` (7 dims, weighted ≥9.7, floor 9.5, zero blocking/major). Captures: `.ui-autoresearch/captures/CampusCall/iteration-N/` (16 shots: 8 surfaces × 1440/390, signed-out, live dev data).

## Iteration 0 — 2026-11-14 PT — FAIL

| Dim | Weight | Score | Evidence |
| --- | --- | --- | --- |
| Spatial rhythm | 1.5 | 8.6 | M1: topbar Join pill stretches to full nav width (298px) on its own wrapped row at 390px — banner-sized block breaks the right-aligned nav stack on every mobile page (`topbar-390.png`, all mobile shots). |
| Hierarchy | 1.5 | 8.8 | M1 gives the Join CTA banner-level emphasis above search on mobile, flattening the wordmark → nav → search order the desktop keeps. |
| Typography | 1.0 | 9.2 | M2: every market card footer ellipsizes mid-word ("0 credits · 0 fo…") at all widths — `.forecast-close` `flex: 1 1 auto` grows (204px for ~110px content) and squeezes `.card-stat` (86px for 128px content). |
| Color | 1.0 | 9.8 | Token palette consistent; selected-outcome contrast fix (3af4917) verified ~13.8:1; gold restrained. |
| Interaction | 1.0 | 9.7 | Targets ≥44px at 390 (probe), row arrows + focus ring present, sheet/tray behave. |
| Responsive | 0.75 | 8.8 | No horizontal overflow on any capture (errors.json empty), but M1 is a mobile-only regression. |
| Consistency | 0.75 | 9.3 | Join pill inconsistent desktop↔mobile (compact chip vs banner); footer ellipsis repeats on all 25 cards. |

**Weighted: 9.12 — FAIL** (floor misses: spatial 8.6, hierarchy 8.8, responsive 8.8; majors: 1).

Findings:
- [MAJOR] M1 — `.confirm { width: 100% }` in the pre-EP `@media (max-width: 40rem)` block (`globals.css:521–524`, commit `35432c6`) leaks onto the topbar Join anchor (`class="confirm join-button"`, `member-widget.tsx:37`), stretching it to the nav's full width. Verified by rule-scan probe: forcing `width: auto` returns it to 47px natural width. This is the user-reported "Join aligned incorrectly."
- [MINOR] M2 — card footer stat truncation (above).
- [MINOR, noted, not patched] M3 — single-point market histories render floating dot pairs with stacked labels (`detail-1440.png`, `event-1440.png`, both series at 50% stack labels). Data-sparsity artifact that self-resolves as history accrues; a collision-avoidance change is chart-component logic, out of surgical Mode C scope.
- False positive ruled out: mobile ticket-sheet summary reads "37% Yes 63% No"; the leading "37%" was covered by the Next.js dev-tools badge in the capture.

Patches for iteration 1: scoped `.workspace-nav .join-button { align-self: center; width: auto; }` in the EP-1169 mobile 40rem block; `.market-card .card-footer { justify-content: space-between }` + `.market-card .card-footer .forecast-close { flex: 0 1 auto }` next to `.card-stat`.

## Iteration 1 — 2026-11-14 PT — patch check (not a full round)

M1 patch applied (`.workspace-nav .join-button { align-self: center; width: auto; }` in the EP-1169 mobile block). Probe: Join pill 298px → 47px, now inline on the nav row (y matches Sign in). M2 first patch (`justify-content: space-between` + close-label `flex: 0 1 auto`) insufficient when a card carries a long close date — shrink split still truncated the stat (86px for 128px). Added `.market-card .card-footer .card-stat { flex: 0 0 auto; }` so the short stat keeps its text and the long date carries the existing ellipsis.

## Iteration 2 — 2026-11-14 PT — PASS

Captures: `.ui-autoresearch/captures/CampusCall/iteration-2/` (16 shots). Probes: 0 truncated `.card-stat` out of 25 cards at 1440 and 390; page scrollWidth equals viewport on both; Join pill compact and right-aligned on the shared shell of every route; `/join` form CTA still full-width (the `:521` rule's real purpose, untouched).

| Dim | Weight | Score | Evidence |
| --- | --- | --- | --- |
| Spatial rhythm | 1.5 | 9.8 | Mobile nav one aligned row (Leaderboard · Portfolio · Sign in · Join), matching desktop; card grid/row rhythm intact. |
| Hierarchy | 1.5 | 9.8 | Wordmark → nav → search order restored on mobile; CTA emphasis proportionate at both widths. |
| Typography | 1.0 | 9.7 | No mid-word ellipsis on any card footer; remaining ellipsis only on genuinely overlong close dates (by design). |
| Color | 1.0 | 9.8 | Unchanged from iteration 0 (token palette, 13.8:1 selected-outcome contrast). |
| Interaction | 1.0 | 9.7 | 44px targets hold (compact Join pill measures ≥44px tall, 47px wide); arrows/focus/sheet unchanged. |
| Responsive | 0.75 | 9.7 | errors.json empty both iterations; no horizontal overflow at 390. |
| Consistency | 0.75 | 9.7 | Join pill now consistent desktop↔mobile; footers uniform across all 25 cards. |

**Weighted: 9.75 — PASS** (floor 9.5 met on every dim; blocking 0, major 0; minor 1 residual: M3 sparse-history chart dots/stacked labels, self-resolving as history accrues — recorded, not patched per rubric's no-cosmetic-loops rule).
