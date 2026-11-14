---
name: vitest-patterns
description: How Campus Call splits Vitest and Playwright. Use when adding a unit test or an end-to-end test.
---

# Vitest patterns

`npm test` is `vitest run tests`. That suite is the unit gate. Do not point it at `evals/` or `e2e/`.

- Pure modules (`lmsr`, `brier`, `scoring`, `ledger`) stay in `tests/` with no DOM and no network.
- Do not change a locked assertion. The LMSR example is `toBeCloseTo(5.124948, 6)`.
- Do not skip, delete, or weaken a test to make a task look done.
- `npm run test:evals` is the market generator. It must pass with no network and no API key.
- Playwright is only `e2e/campus-call.spec.ts`, on desktop 1280x720 and mobile 390x844. Do not add a second browser suite.
- Do not install Testing Library or jsdom until a React component exists and a unit test needs to render it. The current tests do not.

The score script is `scripts/score.ps1`. Do not edit it. A red unit suite is expected until the pure modules exist. After they exist, a red suite is a failure to fix, not a reason to change the tests.
