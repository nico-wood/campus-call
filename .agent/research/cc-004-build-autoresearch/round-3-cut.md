# Round 3 — Cut completeness and tests

Scored against commit 2fcab26.

DIMENSION: Cut completeness and tests
SCORE: 9.6
BLOCKING: 0
MAJOR: 1
MINOR: 1
GATE: FAIL

FINDINGS:
- Major: `identifierName` misses `(startDeviceDemo)(...)`, `startDeviceDemo!(...)`, `(0, startDeviceDemo)(...)`, and `foo.startDeviceDemo(...)`. It also misses an alias initialized through those forms outside an effect.
- Minor: `eval` or `new Function` inside an effect stays green. Not blocking.

PATCHES: Unwrap parentheses, non-null assertions, `as`/`satisfies`, and comma expressions. Count a property access whose name is `startDeviceDemo`, and track aliases initialized through those forms. The only resolved call must be nested in `onStartDemo`.

COMMANDS: npm test exit 0 (9 files, 52 tests). npm run lint exit 0. npm run typecheck exit 0. `scripts/score.ps1` is not in 2fcab26 or fcbb9ea.
