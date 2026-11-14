# TierraDex patterns for Campus Call

Reviewed 13 November 2026. Read-only review of TierraDex source and saved screenshots. This is preparation, not a Campus Call UI implementation or a live TierraDex QA pass.

Source root: `C:/Application Development/BianchiWood/TierraDex/tierradex-app`.

## Patterns to adapt

| Observed pattern and source (relative to source root) | Campus Call use | Acceptance evidence |
| --- | --- | --- |
| Strong card headline, quiet metadata, prominent numbers, one action: `src/components/offerings/retail-offering-card.tsx`, `src/components/assets/asset-card.tsx` | Question first, Example/Open/Locked status, close time, leading outcomes. Images optional. Percentages open the event. | Readable at 375px; example status never hidden; no nested interactive controls. |
| URL-based filters and search: `src/components/admin/offerings-pathway-filters.tsx`, `src/app/(dashboard)/investor/offerings/page.tsx` | All, Sports, Music, Dining, hackathon; preserve category/search when returning from an event. | Reload, shared URL, back/forward preserve the selected filter. |
| List-to-detail context: `src/components/investor/investor-offerings-browser.tsx` | Real event URLs; browsing context survives return. QR bypasses Home and opens the hackathon. | Direct event URL and browser navigation both work. |
| Header/body/footer action sheet: `src/components/ds/sidesheet.tsx` | Desktop ticket beside event; mobile ticket at bottom. Balance, amount, inline error, confirmation stay together. | Keyboard focus, Escape, close, backdrop, scroll containment, focus return; phone keyboard does not hide confirm. |
| Text badges: `src/components/ds/badge.tsx` | Example, Open, Locked, Entry pending, Admin demo. | Text explains availability without relying on color. |
| Shared mobile/desktop route definitions: `src/components/layout/bottom-nav.tsx`, `src/lib/nav/investor-nav.ts` | Minimal Home/Hackathon/Portfolio navigation if useful. | Safe-area padding; active route correct; navigation never covers ticket actions. |
| One-action empty states: `src/components/ds/empty-state.tsx` | No positions, no entered teams, no matching examples; clear recovery where possible. | Missing facts stay missing; no fabricated teams, grades, or percentages. |
| Card-shaped loading: `src/components/ds/skeleton.tsx`, `src/app/(dashboard)/investor/offerings/loading.tsx` | Stable layouts for actual fetches. Inline errors and retry for failures. | Loading, empty, error and success rendered separately. Static examples need no fake loading. |
| Tokens and typography: `src/app/globals.css`, `src/components/ds/page-header.tsx` | Consistent spacing, radii, semantic surfaces, restrained accent, readable sans, tabular percentages and balances. | Shared tokens and reusable components; desktop/mobile review. |

Adapt patterns rather than copying the financial application. Keep Campus Call's top bar and category row. Do not import TierraDex's order book, candlesticks, wallet setup, role matrix, assistant, notifications, or large sidebar. The source sheet moves from the right even on mobile; Campus Call needs the bottom ticket specified in the build spec. TierraDex components also depend on theme tokens and portal theme propagation; isolated copy/paste is unsafe.

## Visual evidence and limits

Saved offerings screenshot reviewed by the UI specialist: `tests/theme-snapshot.spec.ts-snapshots/investor-offerings-light-desktop-light-win32.png`. It supports the restrained card hierarchy and single-action pattern, but appears older than current source.

The lead inspected `tests/public-pages.spec.ts-snapshots/login-page-desktop-light-linux.png`: clear form hierarchy and restrained accent, but a full split-screen login would add unnecessary friction to Campus Call's QR flow. `tests/dashboard-pages.spec.ts-snapshots/marketplace-desktop-light-linux.png` actually shows a dark dashboard/setup screen. Its filename is not evidence of a marketplace or light theme.

No numerical UI quality score is assigned to unrendered Campus Call screens. When a screen exists, Mode C captures Home, event, ticket, portfolio, and admin preview at desktop 1280x720, mobile 390x844, and narrow 375px. The pass bar is the one in `docs/overnight/LEAD-PROMPT.md`. The earlier target of weighted 9 with a floor of 8 is withdrawn.
