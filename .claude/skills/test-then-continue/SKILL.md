---
name: test-then-continue
description: Run the project test command after a behavior change and only continue if tests pass. Use after editing app code, before marking a TASKS.md item done, and before a milestone commit.
---

# Test, then continue

## When to use

Use after you change application behavior, and before you mark a task complete or commit a milestone.

## Steps

1. Detect the test command:
   - If `package.json` has a `scripts.test` entry, run `npm test`.
   - Otherwise, if a clearly documented project test command exists (for example in a Makefile), run that.
   - If no test command exists, record that in `PROGRESS.md` and continue. Do not run bare `npm test` when there is no test script; npm's default test script exits with a failure.
2. If tests fail, fix the failure and run the tests again. Do not start the next `TASKS.md` item while tests are red.
3. If tests fail because they are wrong, update them to match the intended behavior. Do not delete tests or skip them just to make the task look done.
4. Write the command you ran and the result in `PROGRESS.md`.

## Do not

- Do not treat a failing test run as success.
- Do not remove or disable tests to get a green run.
