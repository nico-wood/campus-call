# R0 grader reports — design audit — EP-1169

Four blind graders, round 0. Verbatim findings and patch lists. The fixer applies PATCHES to `.agent/eps/EP-1169-ux-ui-21st.md` ONLY; where patches from different lenses touch the same EP text, merge both intents (noted inline). Graders never edit; the fixer never scores.

---

## Lens 1 — Architecture fidelity — SCORE 7.4 — FAIL (BLOCKING 1, MAJOR 3, MINOR 9)

FINDINGS:
- [BLOCKING] T4 sub-layer 2 cannot satisfy its own acceptance row and violates binding C3: writing `--pointer-dx/dy` on `document.documentElement` invalidates style for the whole document every frame, and moving a gradient position inside `.app::after` (a `position: fixed; inset: 0` layer) repaints the full viewport per rAF — not "transform and opacity only," and guaranteed to show paint storms in the very DevTools check T4 prescribes (T4, Approach 2 + Acceptance).
- [MAJOR] T7's area fill already exists: `local-chart.tsx:123–128` renders one `<linearGradient id={chart-fill-${market.id}-${i}}>` per outcome and `:147` renders `<path className="chart-area" fill={url(#chart-fill-…)}>` with stops `0.22 → 0`. The survey claim "`LocalChart` has no area fill" is false, "class exists; wire a real `<path>` to it" is already done, and `useId()` is redundant (ids are unique via `market.id`). The real work is *narrowing* the existing areas to the leading outcome (T7 §1; Current-state survey).
- [MAJOR] T3 depends on `@property`, which is used **nowhere** in `globals.css` today, and the risk row's support evidence is wrong: `:24` and `:56` are `color-mix` declarations and `:1545` is `.stats-strip strong` (the masked-ring recipe is at `:1554`). The stated "fallback for browsers without `@property`" has no detection mechanism — there is no feature query for `@property`, and an unregistered `--shine-angle` makes `conic-gradient(from var(--shine-angle), …)` invalid at computed-value time, so the ring vanishes rather than degrading (T3 Approach; Risks table).
- [MAJOR] T3's combo-slip ring is unimplementable as described: `.combo-slip` carries `overflow-y: auto` (globals.css:1673) and is the containing block for its own `::before`, so an `inset: -1px` masked ring is clipped to nothing. The risk row blames `z-index`/`isolation` and never mentions the actual clipper (T3 Approach; Risks "Shine ring vs. overflow clipping").
- [MINOR] Pervasive line-number drift — EP says `globals.css` is "1,545 lines total"; it is 1,696. Verified deltas: `.prize-banner` 1530→1539, `.stats-strip` 1534–1537→1543–1546, `.market-card::before` 1541–1548→1553–1557, `.sparkline` 1564→1573, `.combo-slip` 1658→1667, leaderboard 1638–1648→1647–1657, chart block 1145–1168→1156–1180, marquee 1518–1528→1528–1537, 40rem stats collapse 1633–1635→1641–1643, ticket sheet 1592–1631→1601–1640, focus-visible 131→133 (Current-state survey; T2/T3/T5/T6/T7/T8 Scope rows).
- [MINOR] T7's draw-in specifies `transform: scaleX(0→1)` with `transform-box: fill-box` but no `transform-origin` — the default `50% 50%` reveals from the centre outward, not left-to-right; `clipPathUnits` and the rect geometry are also unspecified (T7 §2).
- [MINOR] T2 misses CSS specificity: `.workspace-nav a.join-button` (globals.css:1469–1470) sets `background: var(--accent)` at higher specificity than `.confirm`, so the new depth-gradient fill will not reach the Join CTA; also the Join CTA is literally `class="confirm join-button"` (`member-widget.tsx:35`), and the sheen is not excluded from the hotfixed `.confirm:disabled` state (T2 Scope/Approach).
- [MINOR] T4 ignores two existing kill-switches that `display: none` the very pseudo it extends: `.app:has(.ambient-backdrop)::after` (globals.css:217) and `.app:has(.gradient-backdrop[data-ready="true"])::after` (globals.css:237–240); `GradientBackdrop` exists at `src/app/gradient-backdrop.tsx`. Also "a third pseudo is not available" overlooks `.workspace` (`local-shell.tsx:30`) as a mount point (T4 Approach 1).
- [MINOR] T3/P3 names `offset-path` + `offset-distance` as the *fallback* technique, but coord-box `offset-path` has narrower engine support than `@property` — it is an alternative, not a fallback (P3 row; T3 Approach).
- [MINOR] T10 hand-waves keyboard access ("track is focusable via its scrollable region") — scroll containers are keyboard-focusable by default only in Firefox and Chrome 127+, and the house focus rule at `globals.css:133` is `:where(a, button, input):focus-visible`, so a focusable track gets no house ring; the new `ul.board-row-track` also has no accessible name specified, unlike `.forecast-list`'s `aria-labelledby="forecast-list-heading"` (T10 §3/Acceptance).
- [MINOR] T10's marker justification is wrong: "the grid fallback still uses them" is false for `flex-wrap: wrap` — `.forecast-list` (globals.css:556) is a CSS grid; the marker lives at `:472, :495, :1088, :1140, :1150` (T10 §5).
- [MINOR] T11's ".main gains `padding-bottom`" has no stated mechanism — `.combo-slip` is a later *sibling* of `.workspace` inside `.app` (`local-shell.tsx:56, 61`), so only `:has()` can express it; and the EP does not state that this padding must not be transitioned (C3 bans animating padding) (T11 §3).
- [MINOR] T5 calls `Sparkline` "server-renderable" while adding `useId()`; that is only safe because `sparkline.tsx` is imported exclusively by the `"use client"` `market-card.tsx` — hooks throw in Server Components, so the constraint should be written down (T5 Approach).

PATCHES (L1-P1 … L1-P14):

**L1-P1 — T7 area fill (MAJOR).** Replace:
> `  1. **Area fill:** `<defs>` linearGradient (via `useId()`) under the **leading outcome's** line only (multi-area reads muddy), `var(--emerald)` 16% → transparent; rendered behind lines with the existing `.chart-area` class (class exists; wire a real `<path>` to it).`

with:
> `  1. **Area fill (narrow it — do NOT re-add it):** `local-chart.tsx` **already** renders one `<linearGradient id={`chart-fill-${market.id}-${i}`}>` per outcome (`local-chart.tsx:123–128`, stops `0.22 → 0`) and one `<path className="chart-area" fill={`url(#chart-fill-…)`}>` per outcome (`local-chart.tsx:147`); `.chart-area` exists at `globals.css:1172`. No new `<defs>`, no `useId()` — ids are already unique via `market.id`. The only change: render the area `<path>` for the **leading outcome only** (`leadingOutcomeIndex`), since stacked multi-area reads muddy, and drop that gradient's top stop to `0.16`.`

**L1-P2 — current-state survey, chart line (MAJOR).** Replace:
> ``LocalChart` has no area fill or entrance animation;`

with:
> ``LocalChart` already fills a gradient area under *every* outcome (`local-chart.tsx:123–128, 147`), which reads muddy and should be narrowed to the leading line, and it has no entrance animation;`

**L1-P3 — `@property` support claim (MAJOR).** Replace the risks row:
> `| `@property` / `color-mix` / `mask-composite` support | All already used in this stylesheet (`:24, :56, :1545`) — the deployed baseline already assumes modern evergreen browsers; T3 specifies the no-`@property` static fallback anyway. |`

with:
> `| `@property` / `color-mix` / `mask-composite` support | `color-mix` is already used (`globals.css:24, :56`) and the masked-ring `mask-composite: exclude` recipe is already used (`globals.css:1554`). **`@property` is used nowhere in this stylesheet today — T3 introduces the first one.** There is no feature query for `@property`, so T3 does not claim a detection branch: it reads the angle as `var(--shine-angle, 0deg)` and paints `var(--gold-line)` as the first, always-valid background layer, so a non-supporting engine (pre-Chrome 85 / pre-Safari 16.4 / pre-Firefox 128 — outside the deployed baseline) shows the static gold edge instead of an invalid gradient. |`
(Merge with L4-P3 — same row, same intent; produce one merged row.)

**L1-P4 — T3 combo-slip ring + fallback (MAJOR).** Replace:
> `Combo slip gets the same ring at lower alpha, only while it has legs (it already only renders then). Fallback for browsers without `@property` and under `prefers-reduced-motion: reduce`: `::before { animation: none; background: var(--gold-line); }` (the existing static gold line token), base border back at full gold.`

with:
> `Combo slip gets the same ring at lower alpha, only while it has legs (it already only renders then) — **but `.combo-slip` carries `overflow-y: auto` (globals.css:1673) and is its own containing block, so an `inset: -1px` ring is clipped to nothing.** T11 ships before T3 and moves `max-height` + `overflow-y: auto` onto an inner `.combo-slip-body`; T3 attaches the ring to the non-scrolling root. If that wrapper is not in place, ship the prize-banner ring only. Layer order keeps the ring valid everywhere: `background: var(--gold-line), conic-gradient(from var(--shine-angle, 0deg), transparent 0 340deg, color-mix(in srgb, var(--gold) 65%, transparent) 355deg, transparent 360deg);` — an engine without `@property` keeps the static gold line and never animates the angle. Under `prefers-reduced-motion: reduce`: `::before { animation: none; }`, base border back at full gold.`
(Merge with L3-P1 and L4-P4: the final T3 text must ALSO scope the slip ring to `.combo-slip-open::before` only — expanded state, collapsed pill stays plain — and state that T3 owns 100% of the ring CSS.)

**L1-P5 — offset-path wording (MINOR).** Replace:
> ``offset-path`/`offset-distance` noted as the fallback technique if the conic comet reads poorly on the large banner radius`

with:
> ``offset-path: border-box` + `offset-distance` noted as an *alternative* (not a fallback — coord-box `offset-path` has narrower support than `@property`) if the conic comet reads poorly on the large banner radius`

**L1-P6 — T4 parallax (BLOCKING).** Replace:
> `  2. **Header-glow pointer parallax (optional, JS):** `PointerParallax` client component mounted once in `LocalShell`, listening to `pointermove` on `window` behind `(hover:hover) and (pointer:fine)` + not-reduced-motion checks, rAF-throttled, writing `--pointer-dx`/`--pointer-dy` in the range ±1 onto `document.documentElement`; `.app::after`'s gold glow position gains `calc(50% + var(--pointer-dx, 0) * 1.5rem)` — a ≤1.5rem drift, imperceptible as "an effect," felt as depth. Removes its listener on unmount; SSR-safe.`

with:
> `  2. **Header-glow pointer parallax (optional, JS):** `PointerParallax` renders its **own** layer — `div.header-glow` (`position: fixed; inset: 0; z-index: -1; pointer-events: none`) carrying only the gold radial glow, which moves off `.app::after` (that pseudo keeps the dot-grid/beams). Mounted once in `LocalShell`; listens to `pointermove` on `window` behind `(hover: hover) and (pointer: fine)` + not-reduced-motion checks read once in the effect; rAF-throttled to one pending frame; writes **`ref.current.style.transform = `translate3d(${dx}px, ${dy}px, 0)``** clamped to ±1.5rem. Compositor-only: no repaint, no `setState`, and **no custom property is written to `document.documentElement`** — an inherited custom property there invalidates style for the entire document every frame, and repositioning a gradient on a viewport-sized fixed layer repaints the whole viewport; both are banned by C3. CSS: `.header-glow { transition: transform 240ms ease-out; will-change: transform; }`. Under reduced motion or coarse pointers the layer renders with no listener and no transform. Removes its listener on unmount; SSR-safe (ref + effect only, no browser API in render).`

**L1-P7 — T4 acceptance, backdrop kill-switches (MINOR).** Replace:
> `- **Acceptance:** board background shows added depth at ≤0.07 effective opacity; under 40rem the flat tint path still applies; reduced motion / touch = zero drift;`

with:
> `- **Acceptance:** board background shows added depth at ≤0.07 effective opacity; under 40rem the flat tint path still applies; reduced motion / touch = zero drift; the beams survive the existing kill-switches that `display: none` this pseudo — `.app:has(.ambient-backdrop)::after` (globals.css:217) and `.app:has(.gradient-backdrop[data-ready="true"])::after` (globals.css:237–240); neither backdrop is mounted on `/` today (`src/app/gradient-backdrop.tsx` has no importer), and if one is ever mounted the beams move to `.workspace::before` (`local-shell.tsx:30`);`

**L1-P8 — line numbers (MINOR).** Replace:
> `**Theme.** One dark theme: premium dark-green + gold, defined as CSS custom properties at `src/app/globals.css:4–99` (1,545 lines total).`

with:
> `**Theme.** One dark theme: premium dark-green + gold, defined as CSS custom properties at `src/app/globals.css:4–99` (**1,696 lines total**). Line numbers below were captured before the main hotfixes and now run ~9–13 low; verified current anchors: ambient comment `:163`, dot-grid `:172–178`, `.confirm` `:864–893`, `.chart-area` `:1172`, marquee `:1528–1537`, `.prize-banner` `:1539`, `.stats-strip` `:1543–1546`, masked-ring recipe `.market-card::before` `:1554`, `.sparkline` `:1573`, `.market-outcome-buttons` `:1574`, trade-ticket sheet `:1601–1640`, 40rem stats collapse `:1641–1643`, `.positions-table` `:1647–1650`, `.leaderboard-row-first` `:1653`, `.rank-chip*` `:1654–1657`, `.combo-slip` `:1667–1680`, `.combo-slip-collapsed` `:1681`, 40rem slip re-dock `:1694–1696`, `:focus-visible` `:133`. Selector names, not numbers, are authoritative — re-grep before editing.`
(Merge with L4-P2 and L3-P9/P10 — one coordinate system post-96ed84c; also apply the itemized per-task substitutions below.)

Additionally, in every place the EP cites the masked-ring recipe as `globals.css:1545` or `:1545` (P1 table row, T3 Approach, T1 Scope "~1541–1548", Risks "Shine ring vs. `overflow`"), replace `1545` with `1554` and `~1541–1548` with `:1553–1557`; replace T2's `~864–885` with `:864–893`, T2's `~1461–1463` with `:1469–1472`, T5's `~1564` with `:1573`, T6's `~1534–1537`/`1633–1635` with `:1543–1546`/`:1641–1643`, T7's `~1145–1168` with `:1156–1180`, T8's `~1644`/`~1645–1648`/`~1638` with `:1653`/`:1654–1657`/`:1647–1650`, T11's `~1667–1696` (already correct) and `globals.css:1695` with `:1694–1696`, and C3's `globals.css:131` with `globals.css:133`.

**L1-P9 — T7 draw-in origin (MINOR).** Replace:
> `a `<clipPath>` holding a `<rect>` whose `transform: scaleX(0→1)` animates over 500ms ease-out (`transform-box: fill-box`).`

with:
> `a `<clipPath clipPathUnits="userSpaceOnUse">` holding a `<rect x="0" y="0" width={width} height={plotHeight}>` whose `transform` animates `scaleX(0) → scaleX(1)` over 500ms ease-out with `transform-box: fill-box; transform-origin: 0 50%;` — without an explicit left origin the default `50% 50%` reveals from the centre outward instead of left-to-right.`

**L1-P10 — T2 scope/specificity + disabled (MINOR).** Replace:
> `- **Scope:** `src/app/globals.css` only (`.confirm` block at ~864–885; `.join-button` at ~1461–1463). No markup changes.`

with:
> `- **Scope:** `src/app/globals.css` only (`.confirm` block `:864–893`; `.join-button` `:1471–1472` **and `.workspace-nav a.join-button` `:1469–1470`**, whose higher-specificity `background: var(--accent)` would otherwise cancel the new `.confirm` depth-gradient fill). Note the Join CTA is literally `class="confirm join-button"` (`member-widget.tsx:35`), so it inherits the `.confirm` sheen automatically. No markup changes.`

and replace:
> `Under `prefers-reduced-motion: reduce`, `::after { animation: none; }` and the existing `filter: brightness(1.06)` hover stands alone.`

with:
> `Exclude the hotfixed disabled state: `.confirm:disabled::after { content: none; }` (`globals.css:887–893`). Under `prefers-reduced-motion: reduce`, `::after { animation: none; }` and the existing `filter: brightness(1.06)` hover stands alone.`

**L1-P11 — T10 markers + keyboard (MINOR).** Replace:
> `  5. Mobile: rows stay horizontally scrollable under 40rem (native touch pattern) with `flex-basis: 85vw` cards; the `@media (max-width: 40rem)` block and the `flex-wrap: wrap` marker in globals.css are preserved (neither is removed — the grid fallback still uses them).`

with:
> `  5. Mobile: rows stay horizontally scrollable under 40rem (native touch pattern) with `flex-basis: 85vw` cards. Marker safety: this task never edits `--page-max`, `@media (max-width: 40rem)`, or `flex-wrap: wrap` — the latter lives on unrelated rules (`globals.css:472, 495, 1088, 1140, 1150`); `.forecast-list` (`globals.css:556`) is a CSS **grid**, not a flex row, and is not edited at all.
>   6. Keyboard/a11y, concretely: the track gets `tabIndex={0}` and `aria-labelledby` pointing at its row-header `h2` id (mirroring `.forecast-list`'s `aria-labelledby="forecast-list-heading"`), because scroll containers are keyboard-focusable by default only in Firefox and Chrome 127+; and `.board-row-track:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }` is added explicitly, since the house rule at `globals.css:133` matches only `:where(a, button, input)`.`
(Merge with L3-P6/P7 — the final T10 keyboard text must include the required prev/next buttons with aria-labels and disabled-at-ends, plus the focusable track.)

**L1-P12 — T11 inner scroll wrapper (MAJOR, unblocks L1-P4).** Replace:
> `  2. **Expanded state slides, never covers actions:** animate expand/collapse with `transform: translateY` + `opacity` only (160–220ms, `var(--motion-fast)` family; `prefers-reduced-motion: reduce` → no transition, instant swap — the toggle already re-renders states). Expanded panel keeps `max-height: calc(100vh - var(--space-8))` + internal scroll (exists) and must not intercept clicks outside its box (no backdrop).`

with:
> `  2. **Expanded state slides, never covers actions:** animate expand/collapse with `transform: translateY` + `opacity` only (160–220ms, `var(--motion-fast)` family; `prefers-reduced-motion: reduce` → no transition, instant swap — the toggle already re-renders states). **Move `max-height: calc(100vh - var(--space-8))` + `overflow-y: auto` off the `.combo-slip` root (`globals.css:1667–1680`) onto a new inner `<div className="combo-slip-body">` wrapping the expanded content (`combo-slip.tsx:82–132`)** — the root's `overflow-y: auto` currently clips any `inset: -1px` decoration (which T3's ring needs) and truncates the collapsed pill's shadow. The panel must not intercept clicks outside its box (no backdrop).`

**L1-P13 — T11 `.main` padding mechanism (MINOR).** Replace:
> `when the slip is expanded, `.main` gains `padding-bottom` equal to the pill height only on viewports where the slip spans the content (`@media (max-width: 40rem)` block, which already re-docks the slip full-width at `globals.css:1695`).`

with:
> `when the slip is expanded, `.main` gains `padding-bottom` equal to the pill height only on viewports where the slip spans the content. Mechanically this must be `.app:has(.combo-slip-open) .main { padding-bottom: … }` — `.combo-slip` is a *later sibling* of `.workspace` inside `.app` (`local-shell.tsx:56, 61`) and is unreachable by a descendant selector; `:has()` is already used here (`globals.css:206, 217, 236`). The padding is a static state change with **no transition** (C3 bans animating padding); only the slip's own `transform`/`opacity` animate. Scope it to the `@media (max-width: 40rem)` block, which already re-docks the slip full-width at `globals.css:1694–1696`.`
(Merge with L2-MINOR-5 patch and L4-P6: final text also states `.main` gains padding-bottom AND NOTHING ELSE — margin/margin-inline/.frame untouched per C5 — and T11's Scope row explicitly includes the one `.app:has(...) .main` rule with no `local-shell.tsx` edits.)

**L1-P14 — T5 hook safety note (MINOR).** Replace:
> `- **Approach:** Keep the component server-renderable and dependency-free.`

with:
> `- **Approach:** Keep the component dependency-free. `useId()` is safe here only because `Sparkline` is imported solely by `market-card.tsx`, which is `"use client"` (hooks are unavailable in Server Components) — if any server component ever imports `Sparkline`, pass an explicit `idPrefix` prop instead. SSR via `renderToStaticMarkup` (the door test) is unaffected: `useId` is supported by the server renderer.`

---

## Lens 2 — Policy & non-negotiables — SCORE 8.5 — FAIL (BLOCKING 0, MAJOR 2, MINOR 5)

FINDINGS:
- [MAJOR] T10 introduces new on-screen copy (per-row `h2` category heading + count, a "See all" link) while the Out-of-scope section declares "No copy changes", and neither T10's Acceptance nor Verify binds that copy to the AGENTS.md screen-word rule — which is test-enforced on home SSR by `tests/home-shell.test.ts:21` (`/\b(bet|wager|odds|payout)s?\b/`). (Tasks → T10, Approach step 1 / Acceptance; Out of scope bullet 3)
- [MAJOR] T10's grouping rule drops markets and fabricates a bogus row: `LOCAL_CATEGORIES` (`src/app/local/categories.ts:1`) is `["All","Sports","Club sports","Transit","Campus","Weather","Academics"]` — iterating it yields an "All" row, and any market whose `category` is not in that list silently disappears from the home browse view, violating AGENTS.md "Home keeps the example cards, each labeled Example" and the Routes-and-queries contract. No acceptance row asserts the rows' union equals today's filtered set. (Tasks → T10, Approach step 1 / Acceptance)
- [MINOR] The Out-of-scope protected-file list omits "the numeric gates in `docs/overnight/LEAD-PROMPT.md`" and the "status notes go in `docs/brain/`, not `C:/lec-brain` or `compuwood/lec-agent-config`" clause, both named in the AGENTS.md bullet the EP quotes in C1. (Out of scope / non-goals, bullet 3)
- [MINOR] Success criterion 8 restates the home-shell invariant weaker than the actual test: it omits the banned-word SSR assertion that lives in the same `tests/home-shell.test.ts` block and the explicit category names. (Success criteria, item 8)
- [MINOR] The EP never records that the AGENTS.md category list quoted in C1 ("All, Sports, Music, Dining, and Hackathon") is stale against the live test (`All, Sports, Club sports, Transit, Campus, Weather`) and `LOCAL_CATEGORIES`; an implementer following C1 literally while doing T10 could "correct" the category row and break `npm test`. (C1 Tests bullet / Current-state survey)
- [MINOR] T11 scopes `combo-slip.tsx` as "markup/classes only", which still permits editing rendered strings; the tray-handle spec ("leg count, combined price") composes visible content with no freeze on existing string literals and no screen-word guard. (Tasks → T11, Scope / Approach step 1)
- [MINOR] T11 step 3 edits `.main` — the element AGENTS.md names as sharing `.frame` — without the C5 guard that only `padding-bottom` may be added and `margin` / `margin-inline: auto` must not be touched. (Tasks → T11, Approach step 3; C5)

PATCHES (L2):

**L2-MAJOR-1a — T10 Approach step 1.** Replace:
> `a header (`h2` with category name + count, plus a "See all" link to `categoryHref`-style `/?category=X` preserving tab/query semantics — plain `<a>`, same query-string contract as today) and a `ul.board-row-track` of the **same `MarketCard` components**.`

with:
> `a header (`h2` whose text is the existing category name from `LOCAL_CATEGORIES` plus a numeric count, and a "See all" link) and a `ul.board-row-track` of the **same `MarketCard` components**. **Screen-word binding:** the only new on-screen strings this task may introduce are the existing category names, a bare count, and the literal "See all" — all four of `bet`, `wager`, `odds`, `payout` stay absent from home SSR (`tests/home-shell.test.ts:21` asserts this on the rendered markup, as does `tests/hackathon-door.test.ts`), and no existing string literal in `board-view.tsx` is edited. **Query contract:** the "See all" href is built by the existing category-href helper and carries only `category` (plus `tab` when a non-default tab is active); it never copies the search query or any unknown/partial parameter into the next link (AGENTS.md, "Routes and queries").`
(Merge with L3-P4: the href is built by a LOCAL 6-line copy of the `page.tsx:36` rule inside `board-view.tsx` — `categoryHref` stays module-private; emit `category=<name>` only when not "All", append `tab=<tab>` only when tab ≠ "live".)

**L2-MAJOR-1b — Out of scope bullet.** Replace:
> `- No copy changes (screen words frozen: forecast, position, market probability, points, virtual credits).`

with:
> `- No changes to existing copy, and the screen words stay frozen (forecast, position, market probability, points, virtual credits — never bet/wager/odds/payout). The only new strings this EP adds are navigational/presentational and must use frozen vocabulary: T10's per-row category heading + market count + "See all" link, and T11's combined-price line in the collapsed pill — enforced by the banned-word regexes in `tests/home-shell.test.ts`, `tests/hackathon-door.test.ts`, `tests/enrollment.test.ts`, `tests/example-forecasts.test.ts`, `tests/participant-grant.test.ts`, and `tests/ticket-confirm.test.ts`.`
(This is the merged form of L2's two alternatives and L4-P9 — use exactly this once.)

**L2-MAJOR-2 — T10 grouping no-drop rule.** Replace:
> `group the filtered markets by category (in the categories' existing `LOCAL_CATEGORIES` order, skipping empty groups) and render one `section.board-row` per group:`

with:
> `group the filtered markets by category in `LOCAL_CATEGORIES` order **excluding the `"All"` entry (it is a filter token, not a category)**, skipping empty groups, and render one `section.board-row` per group. **No-drop rule:** any market whose `category` is not a `LOCAL_CATEGORIES` member (including example cards and anything the merge returns off-list) is collected into a final row rendered with the existing `.forecast-list` grid, so the union of all rows is byte-for-byte the same market set the flat grid renders today — grouping never removes a card from the DOM or the tab order.`

and add to T10's Acceptance, after `filtered/search/category views identical to today;`:
> `the set of market cards rendered in the All view equals today's flat-grid set exactly (count asserted in smoke against the pre-change grid, and every example card still renders with its Example label);`

**L2-MINOR-1 — Out of scope protected list.** Replace:
> `- No changes to: behavior modules, routes/queries, example data, `src/lib`, `supabase/`, `tests/`, `scripts/score.ps1`, `logs/CC-001.md`–`CC-004.md`, `.agent/research/` gate files, `TASKS.md` checkboxes, `research/10-build-spec.md`, `docs/overnight/EP-PLAN.md`, `docs/overnight/DECISIONS.md`.`

with:
> `- No changes to: behavior modules, routes/queries, example data, `src/lib`, `supabase/migrations`, `supabase/tests`, `tests/`, `scripts/score.ps1`, `logs/CC-001.md`–`CC-004.md`, `.agent/research/` gate files and the scored commits they name, `TASKS.md` checkboxes, `research/10-build-spec.md`, `docs/overnight/EP-PLAN.md`, `docs/overnight/DECISIONS.md`, and the numeric gates in `docs/overnight/LEAD-PROMPT.md`. Status notes go only to `PROGRESS.md` and `docs/brain/` — never to `C:/lec-brain` or `compuwood/lec-agent-config`.`

**L2-MINOR-2+3 — success criterion 8.** Replace:
> `8. `src/app/globals.css` still contains the literal strings `flex-wrap: wrap`, `@media (max-width: 40rem)`, and `--page-max` (asserted by `tests/home-shell.test.ts`), and the home shell still shows Campus Call, the search field, Portfolio, and the category row with exactly one `aria-current`.`

with:
> `8. `tests/home-shell.test.ts` passes unmodified in all three of its assertions: (a) `src/app/globals.css` still contains the literal strings `flex-wrap: wrap`, `@media (max-width: 40rem)`, and `--page-max`; (b) home SSR still contains `>Campus Call<`, `placeholder="Search forecasts"`, `>Portfolio<`, every category label the test names, and exactly one `aria-current="true"`; (c) home SSR still matches none of `/\b(bet|wager|odds|payout)s?\b/i`. Note for the implementer: the category names quoted in C1 from AGENTS.md ("All, Sports, Music, Dining, and Hackathon") are stale — the live source of truth is `LOCAL_CATEGORIES` in `src/app/local/categories.ts` (`All, Sports, Club sports, Transit, Campus, Weather, Academics`) and the test's own list. Do not edit the category row to match the AGENTS.md wording; no task in this EP touches it.`
(Merge with L4-P11's C1 survey note — add that note after the C1 quote as well.)

**L2-MINOR-4 — T11 Scope string freeze.** Replace:
> `- **Scope:** `src/app/local/combo-slip.tsx` (markup/classes only — the confirm flow, pricing, and `useCombo` state are behavior and stay untouched), `src/app/globals.css` (`.combo-slip*` block ~1667–1696).`

with:
> `- **Scope:** `src/app/local/combo-slip.tsx` (element structure and `className` values only — the confirm flow, pricing, `useCombo` state, and **every string literal and `aria-label` in the file** stay byte-identical; no new user-visible wording is introduced beyond the combined-price line in the collapsed pill, which uses frozen vocabulary, and `bet`, `wager`, `odds`, `payout` never appear in rendered copy), `src/app/globals.css` (`.combo-slip*` block ~1667–1696 **plus one `.app:has(.combo-slip-open) .main` rule adjacent to that block**). No edits to `local-shell.tsx`.`
(Merged form of L2-MINOR-4 + L4-P6 scope line; keep the combo-slip-body wrapper permission from L1-P12 in Approach step 2.)

**L2-MINOR-5 — T11 `.main` C5 guard.** In T11 Approach step 3 (after applying L1-P13), ensure the text includes:
> ``.main` gains **`padding-bottom` and nothing else** — its `margin`, `margin-inline: auto`, and `.frame` participation are untouched (C5: a `.frame` element must never pick up `margin: 0`)`

---

## Lens 3 — Cut DAG & implementability — SCORE 8.4 — FAIL (BLOCKING 0, MAJOR 4, MINOR 7)

FINDINGS:
- [MAJOR] T3/T11 combo-slip shine ring has no owner: execution order ships T11 *before* T3, but T11 item 4 says "if T3 ships first, no extra work" while T3's own text specs the slip ring "only while it has legs" (not expanded-state-only) — the expanded-only scoping is assigned to neither task, and both claim the same `.combo-slip::before`. (Tasks preamble order line; T3 Approach; T11 Approach item 4)
- [MAJOR] T10's "See all" link needs `categoryHref`, which is module-private at `src/app/page.tsx:36` and is not in T10's Scope row; T10 also never mentions the `tab` prop that `BoardView` actually receives (`page.tsx:114`, `type Tab = "live"|"futures"|"all"`), so the specified `/?category=X` href silently drops `tab` and switches a futures/all browser back to the live horizon. (T10 Scope; T10 Approach item 1)
- [MAJOR] T10's acceptance requires keyboard horizontal scroll, but the mechanism is "optional prev/next buttons" in Approach item 3 and the track gets no `tabIndex`/`role`/`aria-label` — an implementer can satisfy the approach and fail the acceptance, and a build auditor has no objective test. (T10 Approach item 3 vs T10 Acceptance)
- [MAJOR] T8 is promised to deliver "portfolio summary gets the gold-polish treatment" (Success criterion 6) but names no portfolio selector (real ones are `.portfolio` globals.css:362 and `.portfolio:hover`:425), its Scope row is conditional ("if class names match — otherwise CSS only"), and its Acceptance row is unverifiable prose ("reads 'gold' at a glance", "chips look dimensional"). (T8 Scope / Approach / Acceptance)
- [MINOR] globals.css line anchors are from a pre-hotfix snapshot and are systematically ~9–10 low (see L1-P8 for the verified list); the "re-read the live working tree" mitigation is scoped to T10/T11 only. (Current-state survey; T1–T8 Scope rows)
- [MINOR] T6 cites `board-view.tsx` "lines ~62–67" but T10 ships first and restructures that exact file, so the reference is stale by construction with no note. (T6 Scope)
- [MINOR] T9 is permitted to "share the rAF-throttle helper if natural" with T1's hook, but `use-pointer-glow.ts` is not in T9's Scope row — the diff could silently exceed the stated file list. (T9 Scope)
- [MINOR] T4's deliverable is conditional (`pointer-parallax.tsx` "only if the parallax half is kept"), so the final gate's `git diff --stat`-against-Scope review has no authoritative answer for whether that file and the `local-shell.tsx` mount belong. (T4 Scope / Restraint gate; Verification gate)
- [MINOR] T10 and T11 cite unverified 21st.dev category URLs (`/s/carousel`, `/s/dock`, `/s/drawer`) with "confirm the listing once at implementation time" and no stated fallback if the listing is absent, gated, or offline. (T10 / T11 "21st.dev source pattern")
- [MINOR] T1's acceptance depends on React DevTools "Highlight updates", a tool in no Verify row, making the central performance claim unreproducible for a later build auditor. (T1 Acceptance)
- [MINOR] No task Scope row lists `PROGRESS.md`, although AGENTS.md "Progress and retries" requires a per-milestone append and the final gate expects one — the per-commit file contract is implicit. (Tasks preamble; all Scope rows)

PATCHES (L3-P1 … L3-P14):

**L3-P1 — T3 Approach (MAJOR, merge with L1-P4 and L4-P4).** The final T3 slip-ring text must state: the ring is scoped to the **expanded** state only (`.combo-slip-open::before`), the collapsed pill stays plain, T11 ships earlier and leaves the `combo-slip-open`/`combo-slip-collapsed` class split in place, and **T3 owns 100% of the slip ring CSS** — T11 adds none.

**L3-P2 — T11 Approach item 4 (MAJOR).** Replace:
> `4. Low-alpha shine ring from T3 applies only to the expanded state (T3 already specs this; if T3 ships first, no extra work).`

with:
> `4. **No shine ring in this task.** T11 ships *before* T3 in the execution order, so the ring is not T11's to write. T11's only obligation to T3 is to keep the expanded state marked with the `combo-slip-open` class (and move the root's `max-height`/`overflow-y: auto` onto the inner `.combo-slip-body` — see step 2) so T3 can attach `.combo-slip-open::before` later. Adding any ring/`@property` CSS here is out of scope and would collide with T3's hunk.`
(Merged with L4-P4's version.)

**L3-P3 — T10 Scope (MAJOR).** Replace:
> `- **Scope:** `src/app/local/board-view.tsx`, `src/app/globals.css` (new `.board-row*` block; `.forecast-list` untouched), optionally a small `src/app/local/board-row.tsx` client component for the row chrome.`

with:
> `- **Scope:** `src/app/local/board-view.tsx`, `src/app/globals.css` (new `.board-row*` block; `.forecast-list` untouched), optionally a small `src/app/local/board-row.tsx` client component for the row chrome. **`src/app/page.tsx` is deliberately NOT in scope:** `categoryHref` there (`page.tsx:36`) is module-private and stays private — T10 builds the "See all" href from a local 6-line copy of the same rule inside `board-view.tsx`, using the `tab` prop `BoardView` already receives (`page.tsx:114`). Do not export, move, or re-import `categoryHref`.`

**L3-P4 — T10 Approach item 1 href rule (MAJOR, merge into L2-MAJOR-1a's replacement).** The "See all" link text must read:
> `plus a "See all" link built by a local helper that reproduces `page.tsx:36` `categoryHref` byte-for-byte: emit `category=<name>` only when the name is not `"All"`, and append `tab=<tab>` only when the current `tab` prop is not `"live"` — so a row opened from the futures tab stays on futures. Plain `<a href>`, identical query-string contract to today's category links)`

**L3-P5 — T10 Approach item 2 (MAJOR, merge with L4-P5 — L4's "whole-view fallback" version is the semantically complete one; use L4-P5's replacement text verbatim, which also adds `tab`-values application).** Also apply L4-P5's Acceptance opening replacement.

**L3-P6 — T10 Approach item 3 (MAJOR).** Replace:
> `optional prev/next buttons reusing the `.category-scroll` button style (scroll by `track.clientWidth * 0.9` via `scrollBy({ behavior: "smooth" })`, `behavior: "auto"` under reduced motion).`

with:
> `**required** prev/next buttons per row, reusing the existing `.category-scroll` button style (`globals.css:1119`): `type="button"`, `aria-label="Scroll <category> left"` / `"… right"`, scrolling `track.clientWidth * 0.9` via `scrollBy({ behavior: "smooth" })` (`behavior: "auto"` under reduced motion), each `disabled` at its end of the track. In addition the track itself carries `tabIndex={0}` and `aria-labelledby` pointing at its row-header `h2` id (mirroring `.forecast-list`'s `aria-labelledby="forecast-list-heading"`) so the scroll container is keyboard-focusable and arrow-scrollable (WCAG 2.1.1) in all engines (scroll containers are keyboard-focusable by default only in Firefox and Chrome 127+); `.board-row-track:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }` is added explicitly, since the house rule at `globals.css:133` matches only `:where(a, button, input)`; no `outline: none` anywhere.`
(This is the merged form of L3-P6 + L1-P11 item 6; use once.)

**L3-P7 — T10 Acceptance keyboard row (MAJOR).** Replace:
> `horizontal scroll works by trackpad, touch, shift-wheel, keyboard (track is focusable via its scrollable region or prev/next buttons), and Tab still reaches every card control;`

with:
> `horizontal scroll works by trackpad, touch, shift-wheel, and keyboard — objectively: Tab reaches each row's prev/next buttons **and** the track itself (`tabIndex={0}`, visible `:focus-visible` gold ring), Left/Right arrows scroll the focused track, prev/next are `disabled` at the track ends, and Tab still reaches every card control in DOM order;`

**L3-P8 — T8 Scope + Approach tail + Acceptance (MAJOR).** Replace:
> `- **Scope:** `src/app/globals.css` only (`.leaderboard-row-first` ~1644, `.rank-chip*` ~1645–1648, `.positions-table` ~1638, stats-tile classes from T6 reused by portfolio markup if class names match — otherwise CSS only).`

with:
> `- **Scope:** `src/app/globals.css` only — `.leaderboard-row-first` (1653), `.rank-chip` / `.rank-chip-1|2|3` (1654–1657), `.positions-table` (1647–1650), `.portfolio` (362), `.portfolio:hover` (425). **No `.tsx` file is edited in this task.** If a portfolio tile would need a class that does not exist today, that is out of scope: record it in `PROGRESS.md` rather than adding markup.`

Replace:
> `(d) `.leaderboard-row-mine` keeps precedence over hover (specificity check). No markup edits, so `shortName`/row logic untouched.`

with:
> `(d) `.leaderboard-row-mine` keeps precedence over hover (specificity check); (e) **portfolio summary:** `.portfolio` (globals.css:362) gains the same static inset gold edge (`box-shadow: inset 2px 0 0 var(--gold)`) and `--gold-line` top border as (a), and `.portfolio:hover` (425) gains `border-color: color-mix(in srgb, var(--gold) 35%, var(--border))` — same token budget as T6's tiles, no animation anywhere in this task. No markup edits, so `shortName`/row logic untouched.`

Replace:
> `- **Acceptance:** top row reads "gold" at a glance without animation; chips look dimensional; row hover feedback on both tables; `npm test` leaderboard/portfolio-related suites green.`

with:
> `- **Acceptance (each row objectively checkable in the diff or DevTools):** (1) `.leaderboard-row-first` declares `box-shadow: inset 2px 0 0 var(--gold)` plus a `--gold-line` top border and contains **no** `animation` or `transition` property; (2) `.rank-chip-1`, `-2`, `-3` each use a `radial-gradient` background; (3) `.positions-table tbody tr:hover` computes to `var(--surface-raised)` and the transition is nulled inside the existing `prefers-reduced-motion: reduce` block; (4) `.portfolio` carries the inset gold edge and `.portfolio:hover` the gold-mixed border; (5) `.leaderboard-row-mine` still wins over `:hover` (verified in the DevTools Styles pane); (6) `npm test` leaderboard/portfolio suites green.`

**L3-P9 — survey theme line (MINOR, merge with L1-P8/L4-P2):** use the merged theme-paragraph replacement from L1-P8 with L4's post-96ed84c wording.

**L3-P10 — Tasks preamble (MINOR).** Replace:
> `CSS-only tasks (T2, T3, T4, T8) carry zero markup risk; component tasks (T1, T5, T6, T7, T9, T10, T11) touch client components only.`

with:
> `CSS-only tasks (T2, T3, T4, T8) carry zero markup risk; component tasks (T1, T5, T6, T7, T9, T10, T11) touch client components only.
>
> **Line numbers in Scope rows are anchors, not addresses — locate every hunk by its quoted selector or identifier.** Verified selector homes on the current working tree (2026-11-14, post-`96ed84c`): ambient backdrop `150–198` · `.confirm:active` `354` · `.portfolio` `362` / `:hover` `425` · `.confirm` `864–893` · `.category-scroll` `1119` · `.chart-area` `1172` · `.join-button` `1471–1472` · `.prize-banner` `1539` · `.stats-strip` `1543–1546` (40rem collapse `1641–1643`) · `.market-card::before` `1554` · `.sparkline` `1573` · `.market-outcome-buttons` `1574` · `.positions-table` `1647–1650` · `.leaderboard-row-first` `1653` · `.rank-chip*` `1654–1657` · `.combo-slip*` `1667–1696`. Because **T10 ships before T6 and restructures `board-view.tsx`**, T6's `~62–67` reference is pre-T10 — re-locate that JSX by its `aria-label="Board activity"` attribute instead.
>
> **Per-task commit contract (every task).** The task's diff is limited to the files named in its Scope row **plus a one-paragraph `PROGRESS.md` append** (what changed, how it was verified, what is next — AGENTS.md "Progress and retries"). Run `git diff --name-only` and compare it to that list before invoking `milestone-commit`; a file outside the list means the task is not ready to commit.`

**L3-P11 — T9 Scope (MINOR).** Replace:
> `- **Scope:** `src/app/local/use-magnetic.ts` (new ~45-line hook, sibling of T1's hook — share the rAF-throttle helper if natural), `src/app/local/member-widget.tsx` (attach to the signed-out `.join-button` anchor), `src/app/globals.css` (one transition rule).`

with:
> `- **Scope:** `src/app/local/use-magnetic.ts` (new ~45-line hook), `src/app/local/member-widget.tsx` (attach to the signed-out `.join-button` anchor), `src/app/globals.css` (one transition rule). **Depends on T1** (which ships first and establishes the rAF pattern). The throttle helper is deliberately **not** extracted: `use-magnetic.ts` carries its own 5-line rAF guard, so this task never edits `use-pointer-glow.ts` and the diff stays inside the Scope row.`

**L3-P12 — T4 Restraint gate (MINOR).** Replace:
> `- **Restraint gate:** if sub-layer 2 reads as gimmicky in the smoke pass, ship sub-layer 1 alone and record the decision in `PROGRESS.md` — the earlier aurora rejection (globals.css:163 comment) is precedent that quieter wins.`

with:
> `- **Restraint gate (decided before the T4 commit, never after):** if sub-layer 2 reads as gimmicky in the smoke pass, ship sub-layer 1 alone — **delete `pointer-parallax.tsx` and its `LocalShell` mount line entirely** rather than leaving dead code — and record the literal line `T4 sub-layer 2: dropped` (or `: shipped`) in `PROGRESS.md`, so the final `git diff --stat` review has an authoritative answer for whether `pointer-parallax.tsx` and the `local-shell.tsx` diff are in scope. The earlier aurora rejection (globals.css:163 comment) is precedent that quieter wins.`

**L3-P13 — T10/T11 21st.dev source fallback (MINOR).** In T10, replace:
> `(URL follows the verified `/s/<term>` structure; the research pass verified sibling categories but not this one — confirm the listing once at implementation time).`

with:
> `(URL follows the verified `/s/<term>` structure; the research pass verified sibling categories but not this one). **Fallback if the listing 404s, is gated behind an API key, or the site is unreachable: proceed with the port spec below unchanged and note the dead URL in `PROGRESS.md`.** The port is self-contained native CSS scroll-snap and depends on no 21st.dev asset, download, or `npx shadcn add` — no task in this EP is ever blocked on 21st.dev availability.`

In T11, apply the identical replacement to:
> `(URLs follow the verified `/s/<term>` structure; confirm the listings once at implementation time).`

**L3-P14 — T1 Acceptance (MINOR).** Replace:
> `- **Acceptance:** desktop hover shows the ring glow tracking the cursor smoothly at 60fps (no React re-render per move — verify with React DevTools highlight); touch + reduced motion show today's static glow; card markup/semantics unchanged; skeleton unaffected.`

with:
> `- **Acceptance:** desktop hover shows the ring glow tracking the cursor smoothly. **No-re-render proof any auditor can reproduce without DevTools:** `grep -n "useState\|useReducer\|setState" src/app/local/use-pointer-glow.ts` returns nothing, and the move path schedules at most one frame (a single `frame.current` guard, visible on read). Optional confirmation during the `/` smoke pass: DevTools → "Highlight updates when components render" shows zero card flashes on pointermove. Touch + reduced motion show today's static glow; card markup/semantics unchanged; skeleton unaffected.`

---

## Lens 4 — Completeness & consistency — SCORE 7.4 — FAIL (BLOCKING 0, MAJOR 5, MINOR 8)

FINDINGS:
- [MAJOR] Current-state survey calls the hotfixes "uncommitted working tree at EP time" — they are committed as `96ed84c` (HEAD) and `git status` shows `src/app/globals.css`, `combo-context.tsx`, `join-form.tsx` all clean (Current-state survey → "Hotfixes already on main"; Risks row "T10/T11 colliding with the uncommitted main hotfixes")
- [MAJOR] The EP mixes two `globals.css` coordinate systems: hotfix refs (887–893, 1574, 1681, 1695, 1667–1696) are post-`96ed84c` and correct, but every other ref ≥887 is the pre-hotfix number and is 9–12 lines stale — `.market-card::before` is at **1554**, not 1545/1541–1548 (1545 is now `.stats-strip strong`); also "1,545 lines total" is false (file is **1,696** lines) (Current-state survey; T1/T2/T3/T5/T6/T7/T8/T9 Scope rows; Risks)
- [MAJOR] Risks row asserts `@property` is "All already used in this stylesheet (`:24, :56, :1545`)" — `grep -c "@property" src/app/globals.css` returns **0**; `:24`/`:56` are `color-mix`, and `mask-composite` lives at `:1554`. T3's core technique has no in-repo precedent (Risks → "`@property` / `color-mix` / `mask-composite` support")
- [MAJOR] T3 ↔ T11 contradiction: T3 applies the slip ring "only while it has legs" (i.e. including the collapsed pill), while T11.4 states "Low-alpha shine ring from T3 applies only to the expanded state (T3 already specs this; if T3 ships first, no extra work)" — T3 does not spec expanded-only, and the stated execution order (T10 → T11 → … → T3) means T3 never ships first (T3 Approach; T11 Approach item 4; Tasks ordering line)
- [MAJOR] T10's fallback rule contradicts its own acceptance row: step 2 says fall back to the flat grid when "there are too few markets to row-ify (< 3 in a group)", but acceptance requires "one row per non-empty category" — whether a sub-3 group demotes only itself or the entire All view is unspecified (T10 Approach item 2 vs T10 Acceptance)
- [MINOR] T11.3 requires `.main` to gain `padding-bottom` "when the slip is expanded", but no CSS hook for slip-open state on an ancestor exists (`.combo-slip` is a fixed-position sibling `aside`) and `.main` is outside T11's declared scope (`.combo-slip*` block only) (T11 Scope; T11 Approach item 3)
- [MINOR] T2 specifies the literal `rgba(255,255,255,0.14)` sheen, contradicting C2's "No new hardcoded palette colors; derived tints use `color-mix(in srgb, var(--token) N%, transparent)`" (C2 vs T2 Approach)
- [MINOR] Success criterion 6 under-describes two tasks: the T3 bullet omits the combo-slip ring and the T7 bullet omits the crosshair value pill, so two shipped deliverables have no success criterion (Success criteria 6, bullets 3 and 7)
- [MINOR] Non-goal "No copy changes" contradicts T10 (new per-row `h2` category headings, counts, and "See all" links) and T11.1 (combined price added to the collapsed pill) (Out of scope / non-goals vs T10.1, T11.1)
- [MINOR] Risks mitigation "one shine border per screen (prize banner) — not on every card" contradicts T3, which also rings the combo slip on the same home screen (Risks → "AI-made" over-decoration vs T3)
- [MINOR] T6 says "Swap the four `toLocaleString()` strings" — only three of the four tiles use `toLocaleString()`; `{openCount}` is a raw number (`board-view.tsx:61–67`) (T6 Approach)
- [MINOR] T7 cites "chart classes ~1145–1168" but the `.chart-area` class it wires a `<path>` to is at `globals.css:1172`, outside the cited range (T7 Scope/Approach item 1)
- [MINOR] Three unresolved ambiguities an implementer must guess: T10 groups over `LOCAL_CATEGORIES` without saying to skip the `"All"` pseudo-category; T11 caps expanded width at a literal `min(20rem, …)`; SC6's smoke-route list omits `/events/[id]` which both T7 Verify and the Verification gate require (T10.1, T11.3, Success criterion 6)
- [MINOR] C1's verbatim AGENTS.md quote names categories "All, Sports, Music, Dining, and Hackathon", while the real `LOCAL_CATEGORIES` and `tests/home-shell.test.ts` use All, Sports, Club sports, Transit, Campus, Weather — the EP never flags the stale list even though T10 groups rows by that order (C1; T10.1)

PATCHES (L4):

**L4-P1 (MAJOR — hotfix commit status).** Replace:
> `**Hotfixes already on main (uncommitted working tree at EP time) — plan around them, do not redo or revert them:**`

with:
> `**Hotfixes already landed on main as commit `96ed84c` ("Fix smoke-test bugs: join-page entity, combo slip intrusiveness, outcome chip clipping, disabled confirm styling", 2026-11-14) — the working tree is clean for these files; plan around them, do not redo or revert them:**`

And replace:
> `These touched `src/app/globals.css`, `src/app/local/combo-context.tsx`, and `src/app/local/join-form.tsx`; T10/T11 below build on top of exactly this state.`

with:
> `Commit `96ed84c` touched `src/app/globals.css` (+12/−1), `src/app/local/combo-context.tsx` (removed the `setOpen(true)` in `addLeg`), `src/app/local/join-form.tsx` (literal `’` for the HTML entity), and `PROGRESS.md`. All line numbers in this EP are post-`96ed84c` (globals.css = 1,696 lines). T10/T11 below build on top of exactly this committed state.`

And in Risks, replace:
> `| T10/T11 colliding with the uncommitted main hotfixes | Survey records the hotfix diffs (`globals.css:887–893, 1574, 1681`; `combo-slip.tsx`, `combo-context.tsx`); tasks explicitly build on that state and never revert those hunks; before T10/T11 start, the implementer re-reads the live working tree (not this EP's line numbers) in case the hotfixes land as a commit first. |`

with:
> `| T10/T11 colliding with the landed hotfixes (`96ed84c`) | Survey records the hotfix hunks (`globals.css:887–893, 1574, 1681`; `combo-context.tsx`, `join-form.tsx`); tasks explicitly build on that state and never revert those hunks; before editing any CSS block, the implementer re-greps the selector in the live file rather than trusting this EP's line numbers. |`

**L4-P2 (MAJOR — line numbers):** merged into L1-P8 / L3-P9 / L3-P10 — apply once.

**L4-P3 (MAJOR — `@property` claim):** merged into L1-P3 — apply the merged row once (L1-P3's version carries the fallback mechanism; keep L4's "Baseline-available (Chrome 85+, Safari 16.4+, Firefox 128+)" phrasing inside it).

**L4-P4 (MAJOR — T3/T11 contradiction):** merged into L1-P4 + L3-P1/L3-P2 — final semantics: T11 first (class hooks + `.combo-slip-body` wrapper), T3 owns the ring, expanded-only (`.combo-slip-open::before`), half alpha, always-valid layered background.

**L4-P5 (MAJOR — T10 fallback ambiguity).** Replace T10 Approach item 2:
> `2. When a category is selected, a search query is present, or there are too few markets to row-ify (< 3 in a group), fall back to the existing `.forecast-list` grid unchanged — so deep links, search, and the category tests see exactly today's layout.`

with:
> `2. **Whole-view fallback (exactly two triggers):** if a category other than "All" is selected, **or** a non-empty search query is present, render today's `.forecast-list` grid unchanged — so deep links, search, and the category tests see exactly today's layout. **Per-group rule (never demotes the view):** inside the All view, a group with 1–2 markets still renders as its own `section.board-row`; the track simply does not overflow and the prev/next buttons and edge mask are suppressed (`.board-row-track:not(.is-overflowing)`). There is no market-count trigger for the whole-view fallback. Row mode is keyed on `category === "All" && query.trim() === ""` only, and applies on all three `tab` values (`live`, `futures`, `all`) — the horizon tabs are a time filter, not a browse filter, and each tab's "All" view gets its own set of rows built from `filtered`.`

And replace T10 Acceptance opening:
> `home "All" view shows one row per non-empty category with ~1.5–3 cards visible per viewport width and clear scroll affordance;`

with:
> `home "All" view shows one row per non-empty category (groups taken from `LOCAL_CATEGORIES` order, skipping the `"All"` entry itself and any empty group) with ~1.5–3 cards visible per viewport width and clear scroll affordance; 1–2-card rows render as non-overflowing rows with no arrows;`

**L4-P6 (MINOR — T11 `.main` scope/mechanism):** merged into L2-MINOR-4 scope line and L1-P13 approach text — apply once; prefer the `.app:has(.combo-slip-open) .main` selector (padding applies only while expanded).

**L4-P7 (MINOR — hardcoded sheen color).** In T2 Approach, replace:
> `a 40%-wide `linear-gradient(105deg, transparent, rgba(255,255,255,0.14), transparent)` strip`

with:
> `a 40%-wide `linear-gradient(105deg, transparent, color-mix(in srgb, var(--accent-text) 14%, transparent), transparent)` strip (token-derived per C2 — no new literal colors)`

**L4-P8 (MINOR — SC6 bullets).** Replace:
> `   - the prize banner carries a slow gold shine border (T3);`

with:
> `   - the prize banner carries a slow gold shine border, and the expanded combo slip carries the same ring at half alpha (T3);`

And replace:
> `   - the market-detail chart has a gradient area under the leading line and a draw-in reveal (T7);`

with:
> `   - the market-detail chart has a gradient area under the leading line, a draw-in reveal, and a crosshair value pill while scrubbing (T7);`

**L4-P9 (MINOR — copy non-goal):** merged into L2-MAJOR-1b — apply once.

**L4-P10 (MINOR — "one shine border per screen").** Replace in Risks:
> `one shine border per screen (prize banner) — not on every card.`

with:
> `shine borders are limited to two elements total (prize banner, and the expanded combo slip at half alpha) — never on cards or tables.`

**L4-P11 (MINOR — T6 counts, T11 width, SC6 routes, AGENTS category list).**
- T6 Approach: `Swap the four `toLocaleString()` strings for `<NumberTicker value={...} />`` → `Swap the three `toLocaleString()` strings and the raw `{openCount}` for `<NumberTicker value={...} />` (four tiles total)`
- T11.3: `cap expanded width at `min(20rem, …)`` → `cap expanded width at `min(20rem, calc(100vw - var(--space-6)))` (down from today's `22rem` at `globals.css:1671`)`
- Success criterion 6 preamble: `on `/`, `/markets/<id>` (any id from `src/app/live-forecasts.ts`, e.g. `sunday-high-ksbp`), `/portfolio`, `/leaderboard`, `/join`` → `on `/`, `/markets/<id>` (any id from `src/app/live-forecasts.ts`, e.g. `sunday-high-ksbp`), `/events/<id>`, `/portfolio`, `/leaderboard`, `/join``
- Append to the C1 block, immediately after the quote: `> **Survey note (not part of the quote):** AGENTS.md's category list ("All, Sports, Music, Dining, and Hackathon") predates the local-markets build. The live `LOCAL_CATEGORIES` (`src/app/local/categories.ts`) and `tests/home-shell.test.ts` assert All, Sports, Club sports, Transit, Campus, Weather (plus Academics in data). T10 groups rows by the live `LOCAL_CATEGORIES` order; the binding assertion is the test file, and AGENTS.md is not edited by this EP.`
