# Round 2 — Cut completeness and tests

Scored against commit 5a6149b.

DIMENSION: Cut completeness and tests
SCORE: 9.6
BLOCKING: 0
MAJOR: 1
MINOR: 0
GATE: FAIL

FINDINGS: Major — a helper can call `startDeviceDemo (` with whitespace before `(`, or a string can desync `braceBody`, while the expects stay green. The natural second-effect case is now red. The 81-character name, `ada@example.c`, and the first-paint omission are asserted.

PATCHES: Parse `src/app/qr-enrollment.tsx` with the TypeScript parser. Require one call whose callee is `startDeviceDemo`, including whitespace or a comment before `(`, nested only in `onStartDemo`. Fail if any `useEffect` argument reaches `startDeviceDemo` or `onStartDemo`, including an alias. Keep exactly two `onStartDemo` identifiers: the function and `onSubmit={onStartDemo}`. Keep the first-paint assertion and the 81-character name and `ada@example.c` rejections.

COMMANDS: npm test exit 0 (9 files, 52 tests). npm run lint exit 0. npm run typecheck exit 0. `scripts/score.ps1` is not in 5a6149b or fcbb9ea.
