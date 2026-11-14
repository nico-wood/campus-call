# Round 0 — Cut completeness and tests

Scored against product commit fcbb9ea.

DIMENSION: Cut completeness and tests
SCORE: 9.4
BLOCKING: 0
MAJOR: 1
MINOR: 1
GATE: FAIL

FINDINGS:
- Major: `starts demo only from the explicit action after a valid name and email` never renders `QrEnrollment` or submits it. The empty-store check only runs before the test itself calls `startDeviceDemo`. Missing assertion: a demo record appears only after the Start demo submit, not after render, input, or `useEffect`. `keeps the client door off the live-session module` only rejects an inline `onChange` that calls `startDeviceDemo`; a `useEffect` or other helper can call it and stay green. `shows the demo form only for the staged QR pair` checks that `>Start demo<` is present, not that first paint omits `Demo on this device`.
- Minor: `rejects an empty name, a blank email, and a malformed email without writing` does not cover an 81-character name or a one-letter final email label (`ada@example.c`), so those `DECISIONS.md` checks can be removed without a failure.

PATCHES: In `tests/enrollment.test.ts`, assert `startDeviceDemo(` occurs only inside `onStartDemo`, that the form has `onSubmit={onStartDemo}` and `type="submit"`, and that the `useEffect` body does not call it. In `expectHackathonOnly` for `"qr"` in `tests/hackathon-door.test.ts`, assert the static markup does not contain `Demo on this device`.

COMMANDS: npm test exit 0 (9 files, 52 tests passed). npm run lint exit 0. npm run typecheck exit 0. `scripts/score.ps1` is not in commit fcbb9ea.
