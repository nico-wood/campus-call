# Mode C surfaces — Portfolio, signed in (2026-11-15)

Base: `http://localhost:3000` (Next.js dev). Requested by Nico from a production screenshot of `campus-call.vercel.app/portfolio` (signed in as Nico Wood, one open position, one open combo).

Auth/data: the signed-in state is produced by Playwright route interception (`.ui-autoresearch/capture-portfolio.ts`) stubbing `/api/local/account` and `/api/local/combos` with the exact data from the screenshot. No account is created and no position is placed in the real database.

| Surface | Route | Source file | Viewports | States |
| --- | --- | --- | --- | --- |
| Portfolio (signed in) | `/portfolio` | `src/app/portfolio/page.tsx` → `src/app/local/portfolio-view.tsx` | 375×812, 768×1024, 1440×900 (dark) | 1 open position (Under on a combined-total ladder line), 1 open 3-leg combo |

Captures: `.ui-autoresearch/captures/PortfolioSignedIn/iteration-N/`.
