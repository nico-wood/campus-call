# Round 1 — Cut completeness and tests

Scored against commit f0be717.

DIMENSION: Cut completeness and tests
SCORE: 9.6
BLOCKING: 0
MAJOR: 1
MINOR: 1
GATE: FAIL

FINDINGS:
- Major: The first-paint assertion is closed. The submit half is not. `startDeviceDemo(` is only required to sit between `function onStartDemo` and the later component `return (`, and only the first `useEffect(() => { ... }, [])` is scanned. A second empty-deps effect in that span can be the only `startDeviceDemo(` call while `onSubmit={onStartDemo}` and `type="submit"` stay true.
- Minor: the rejection test still skips an 81-character name and `ada@example.c`.

PATCHES: Bound the only `startDeviceDemo(` to the brace-matched body of `onStartDemo`. Assert every `useEffect` omits `startDeviceDemo` and `onStartDemo`, and that the only other `onStartDemo` reference is `onSubmit={onStartDemo}`. Keep the first-paint assertion. Add the 81-character name and `ada@example.c` to the rejection test.

COMMANDS: npm test exit 0 (9 files, 52 tests). npm run lint exit 0. npm run typecheck exit 0. `scripts/score.ps1` is not in f0be717 or fcbb9ea.
