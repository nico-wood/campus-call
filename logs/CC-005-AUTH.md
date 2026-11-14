# CC-005 authenticated participant adapter

EP / parent / status / attempt / base commit

CC-005 / One balance / additive implementation green, independent Mode B pending / 1 / 43605f3

## Goal and resulting behavior

Added a server-side email-code verification boundary without changing the closed QR door, device demo, existing session modules, grant implementation, example confirms, migrations, or existing test assertions.

`src/app/participant-auth.ts` requests a Supabase email code, verifies it using the auth service, rechecks the returned access token against `/auth/v1/user`, and derives the account UUID and normalized email there. Only then does it issue the existing server-memory session object and invoke the existing grant through an identity-bound injected client. This path never creates or automatically confirms a user through the admin API. A repeat grant remains granted 0 and wrote false.

The server signs a bounded session cookie only after successful code verification. The cookie is HttpOnly, SameSite=Strict, and Secure on HTTPS; auth tokens are absent from the JSON response. Later server adapters can call `resolveParticipant` to verify the signature, expiry, and current auth-service identity. A plain browser session object, header flag, unsigned token, or submitted account UUID cannot create this session.

`src/app/participant-auth-handler.ts` and `src/app/api/participant/auth/route.ts` expose same-origin JSON POST actions `request-code` and `verify-code`. Both require the staged `entry=qr`/`event=hackathon` pair and validated name/email. Requests and auth responses are bounded, auth calls time out and refuse redirects, errors are generic, and a bounded process-local limiter supplements provider limits. No UI was added in this stage.

## Checks

- `npm.cmd test`: exit 0, 13 files and 97 tests (12 new auth/API tests).
- `npm.cmd run typecheck`: exit 0.
- `npx.cmd eslint src/app/participant-auth.ts src/app/participant-auth-handler.ts src/app/api/participant/auth/route.ts tests/participant-auth.test.ts`: exit 0.
- `npm.cmd run build`: exit 0; `/api/participant/auth` appears as a dynamic route.
- `git diff --check`: exit 0.

The first typecheck after adding tests caught a test-only empty ProcessEnv missing the required NODE_ENV field. Fixed the fixture and reran all checks above. No assertions were weakened.

## Gates and limitations

Mode B has not run on this implementation. Mode C is not applicable: no screen changed. One balance remains open because there is no visible verified enrollment control yet, and no real email-delivery/database grant integration was executed from this API.

Runtime configuration requires `SUPABASE_URL`, `SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY`), and `SUPABASE_SERVICE_ROLE_KEY`. Values are consumed by server code only; no environment file was opened or values printed. The Supabase email template must deliver the OTP token for this code-based flow, and delivery/provider limits require verification. The session expires after at most one hour; refresh and sign-out are future work. Process-local limits need shared provider/edge enforcement for public deployment.

Auth contract references: https://supabase.com/docs/reference/javascript/auth-signinwithotp and https://supabase.com/docs/reference/javascript/auth-verifyotp .

Hosted confirmation migration remains local only and no hosted migration was applied. No push, preview, production deployment, or TASKS change occurred. Other sessions' uncommitted presentation files and shared progress history are excluded from this implementation commit.

Milestone commit: `Add verified participant email boundary`.

Next: fresh Mode B review, then compatible staged enrollment controls and actual OTP/grant verification before claiming a visitor grant path. Identity-bound confirmation and portfolio integration remain open.
