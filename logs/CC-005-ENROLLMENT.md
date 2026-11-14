# CC-005 staged verified enrollment

CC-005 / One balance / local implementation green, Mode B round 1 passed per coordinator, Mode C pending / attempt 2 for real-delivery flow / base 9312b6c.

## Result and scope

Added `VerifiedEnrollment` as a sibling of the unchanged device-demo form, rendered only through the existing staged QR enrollment path. Email-code request/verification uses the accepted server API. The initial door stays closed and displays no grant amount; after actual server verification, the client loads the recorded balance. Existing Start demo, validation/session behavior, example no-write confirms, query rules and tests remain unchanged. New invalid fields expose an associated error and receive focus before any network request.

`src/app/participant-account.ts` and `/api/participant/account` derive the account UUID only from a fresh authenticated resolution of the signed cookie. GET paginates and sums that account's ledger, reads only its four hackathon receipt types, and responds private/no-store. Invalid, stale, ambiguous duplicate or absent cookies cannot read the ledger. Reads, response size and pagination are bounded; malformed upstream data remains unavailable. Same-origin DELETE clears the HttpOnly cookie. The new UI preserves a visible unavailable/retry state instead of inventing a balance.

No confirmation integration was added. Another session's unrelated ticket code and presentation files are excluded.

## Actual local integration evidence

`node scripts/check-participant-enrollment.mjs` exited 0. It loads local runtime credentials into memory and passes them only through a child-process environment, starts an isolated local Next listener, uses a synthetic test address with the local Mailpit service, and never prints mail contents, codes, cookies, tokens or raw CLI status. It verifies:

- Invalid input focuses its first invalid field and makes zero auth requests.
- The provider actually delivers the numeric OTP; one wrong OTP refuses, followed by actual successful OTP verification.
- The visitor path inserts a 1,000-credit grant and reads 1,000 remaining with no positions.
- A second actual grant RPC, using the fresh authenticated UUID and the same email in uppercase, returns false and leaves the balance 1,000.
- A browser reload preserves the verified session and balance. A posted query account ID cannot select another account.
- Sign out clears the cookie and the next account read returns 401.
- No page runtime errors or horizontal overflow at 1280, 390 or 375 pixels.

Sanitized summary: `outputs/participant-enrollment/summary.json`. Real screenshots: `initial-1280.png`, `initial-390.png`, `initial-375.png`, `invalid-390.png`, `code-390.png`, `wrong-code-390.png`, `verified-1280.png`, `verified-390.png`, `verified-375.png` in the same directory. These are evidence for a fresh Mode C grader, not a writer's visual score.

The first actual delivery attempt correctly failed: the default local email contained a magic link rather than a numeric code. Added `supabase/templates/email-code.html` with the provider's `{{ .Token }}` variable and local magic-link/confirmation template paths in `supabase/config.toml`. A data-preserving local stop/start loaded them; no reset, migration or hosted operation occurred, and `enable_confirmations` stayed unchanged. The subsequent real-delivery run passed. Earlier harness setup also corrected a parser error before enrollment and Windows Docker PATH formatting; raw subprocess errors are withheld because captured CLI status contains credentials.

Template contract: [Supabase local email templates](https://supabase.com/docs/guides/local-development/customizing-email-templates), [Supabase template variables](https://supabase.com/docs/guides/auth/auth-email-templates).

## Checks

- `npm.cmd test`: exit 0, initially 14 files/105 tests, including eight account-read/logout regressions. Current shared tree rerun at 13:01 PT passed 15 files/110 tests; existing assertions unchanged.
- `npm.cmd run typecheck`: exit 0.
- Focused ESLint on the four application files, account test and integration runner: exit 0. One documented runner-only suppression prevents attaching raw captured credential-bearing CLI output as an exception cause.
- `npm.cmd run build`: exit 0. Other concurrent ticket code appears in the shared build but is not part of this implementation.
- `node --check scripts/check-participant-enrollment.mjs`: exit 0.
- `git diff --check`: exit 0.

## Remaining boundaries

Coordinator reports fresh full Mode B round 1 passed after the template/accessibility/duplicate-cookie refinements: correctness 9.85, security 9.9, cut/tests 9.85, UI code 9.9; weighted 9.875, blocking 0/major 0. Parent records the gate. Mode C has not finished scoring the real screenshots. Hosted email templates/provider delivery and shared abuse controls are not configured or verified. Hosted confirmation schema remains unapplied and forbidden; real participant spending is not accepted. Session cookies expire within one hour; sign out is browser-local and does not claim to revoke all provider sessions. No secrets, environment-file reads, hosted changes, push or deployment. TASKS remains unchanged.

Shared-tree verification exposed an unrelated external ticket mobile anchor that violated the existing QR navigation-context assertions. Its owner changed the control to a non-navigation button; this writer added focus to its existing scroll behavior at the coordinator's request. Full 110-test suite then passed. That external file and unresolved ticket-model change remain unstaged and outside this implementation commit.

Next: independent Mode B and rendered Mode C; then resolve the concurrent ticket-model conflict before confirmation/portfolio work. Local implementation milestone commit: `Add staged verified enrollment and account reads`.
