# Mode C surfaces — Join / Sign-in form spacing (2026-11-15)

Base: `http://localhost:3000` (Next.js dev). Reported defect under test: **Sign in button sits too close to the phone input** (user report, 2026-11-15). Root cause: the `<form>` inside `.enrollment` had no flex/gap, so fields and the submit button stacked flush. Fix applied in `src/app/globals.css` (`.enrollment form` flex column, `gap: var(--space-4)`; `.enrollment .confirm` `margin-top: var(--space-2)`).

| Surface | Route | Source file | Viewports | States |
| --- | --- | --- | --- | --- |
| Sign-in form | `/join?mode=signin` | `src/app/join/page.tsx` → `src/app/local/join-form.tsx` | mobile/tablet/desktop × light/dark | empty form, signin mode |
| Join form | `/join` | same | mobile/tablet/desktop × light/dark | empty form, join mode (shares form styles) |

Captures: `.ui-autoresearch/captures/JoinSignin/` and `.ui-autoresearch/captures/JoinForm/`. Auth: none required.
