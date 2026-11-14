# 14 November 2026, 12:57 PT — ticket behavior needs coordination

The shared working tree now includes another session's uncommitted `hackathon-bundle.ts`, `hackathon-bundle-service.ts`, `hackathon-team-roster.json` and `/api/hackathon/ticket` route. These describe six picks submitted together and allocation of the entire balance (30/20/20/10/10/10). This differs from the locked four independent confirmations with user-chosen amounts in `research/10-build-spec.md`.

This session did not author, remove, stage, commit or accept those files. The user has been asked which intended behavior governs. Continue independent verified enrollment work; hold conflicting ticket implementation until clarification. Do not overwrite another session's changes or treat the bundle as a participant-ready path: its referenced `confirm_hackathon_bundle` RPC has not been established by this session, and roster entries remain unverified.

No locked spec or plan was edited. Browser enrollment writer remains the sole implementation writer in this agent tree. Existing local identity/grant stage and its acceptance are independent of the ticket choice.
