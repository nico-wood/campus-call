# Mode C surfaces — Campus Call current state (post EP-1169, commit 3af4917)

Base: `http://localhost:3000` (Next.js dev). Reported defect under test: **Join button/pill misaligned** (user report via Greg, 2026-11-14 evening). Audit all primary screens for alignment and visual errors.

| Surface | Route | Source file | Viewports | States |
| --- | --- | --- | --- | --- |
| Home board | `/` | `src/app/page.tsx` → `local/local-shell.tsx`, `local/board-view.tsx` | 1440×900, 390×844 | signed-out (Join pill in topbar), top-of-page + first card row |
| Join page | `/join` | `src/app/join/page.tsx` → `local/join-form.tsx` | 1440×900, 390×844 | empty form |
| Market detail | `/markets/sunday-high-ksbp` | `src/app/markets/[id]/page.tsx` | 1440×900, 390×844 | default + chart |
| Leaderboard | `/leaderboard` | `src/app/leaderboard/page.tsx` | 1440×900, 390×844 | live rows (or empty) |
| Portfolio | `/portfolio` | `src/app/portfolio/page.tsx` | 1440×900, 390×844 | signed-out empty state |
| Event page | `/events/mens-basketball-montana-state` | `src/app/events/[id]/page.tsx` | 1440×900 | default |

Captures: `.ui-autoresearch/captures/CampusCall/iteration-N/`. Auth: none required (signed-out pass; the Join pill defect is a signed-out element).
