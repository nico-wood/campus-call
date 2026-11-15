# SCORE HISTORY — join-signin (Mode C, 2026-11-15)

Rubric: 7 dimensions, weights Spatial 1.5, Hierarchy 1.5, Type 1.0, Color 1.0, Interactive 1.0, Responsive 0.75, Consistency 0.75. Gate: weighted ≥ 9.7, every dim ≥ 9, blockers 0. Scored from real PNGs in `.ui-autoresearch/captures/JoinSignin/` and `JoinForm/`.

## Iteration 0 — after form-gap fix only

| Dim | Score | Note |
| --- | --- | --- |
| Spatial | 9.2 | Field/button rhythm fixed (form gap + CTA margin), but the card and inputs stretch ~1650px edge-to-edge at 1440 — over-wide for a 2–3 field form |
| Hierarchy | 9.6 | Pill → h1 → fields → CTA clear; two stacked notices compete slightly |
| Typography | 9.7 | Consistent scale and weights |
| Color | 9.8 | Layered dark surfaces, accent CTA, subdued notices |
| Interactive | 9.6 | CTA clear; hover states; mode-toggle link low affordance but acceptable |
| Responsive | 9.0 | Mobile good; **tablet 768px topbar defect: nav pills painted over the collapsed search box** (pre-existing, every page) |
| Consistency | 9.8 | Matches site primitives |

**Weighted: 9.53 — FAIL** (spatial over-stretch; tablet topbar collision).

Patches applied:
1. `globals.css` — `.main > .enrollment { max-width: 36rem; margin-inline: auto; }` (join page only; QR/hackathon enrollment embeds untouched).
2. `globals.css` — new `@media (min-width: 40.0625rem) and (max-width: 56rem)` block: topbar wraps, search takes its own full-width row, nav right-aligns and can wrap (same pattern the ≤40rem mobile layout already used).

## Iteration 2 — final (iteration 1 captured the width fix; iteration 2 adds the topbar fix)

| Dim | Score | Note |
| --- | --- | --- |
| Spatial | 9.8 | Centered 36rem card, even field rhythm, CTA breathing room |
| Hierarchy | 9.7 | Clear reading order in both join and signin modes |
| Typography | 9.8 | — |
| Color | 9.8 | — |
| Interactive | 9.7 | — |
| Responsive | 9.7 | 375/768/1440 all coherent; topbar collision gone |
| Consistency | 9.8 | — |

**Weighted: 9.76 — PASS** (all dims ≥ 9, blockers 0).
