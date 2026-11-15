---
name: wrap-up
description: >-
  Campus Call session wrap-up. Use when the user says /wrap-up in this
  repository. Writes the handoff under docs/brain/entries.
---

# Wrap-up

This is the `/wrap-up` procedure for Campus Call. The handoff is a new file under `docs/brain/entries/`. The team-brain command that writes `C:/lec-brain` and opens a pull request on `compuwood/lec-agent-config` does not apply in this repository.

## Steps

1. Ask: "Anything else to capture before I wrap up?" Wait until the user adds notes or says to go ahead.
2. Read `docs/brain/README.md` and `docs/overnight/STATE.md`.
3. Run `git branch --show-current`. If the branch is `wip/*`, stop and ask. Do not write the note on that branch.
4. Write `docs/brain/entries/YYYY-MM-DD-HHMM-handoff.md` using local time. Include **Completed**, **In Progress**, **Blocked**, **Next Up**, and **Key Decisions**. Use absolute dates, file paths, commit ids, and URLs. Never put a secret, token, password, or email in the note.
5. Add one dated bullet at the top of `## Now` in `docs/overnight/STATE.md` that points at the new entry.
6. Append a short note to `PROGRESS.md`.
7. Leave the chat open. Do not commit, push, or deploy unless the user asks in this session.
8. End with: "Wrapped up Campus Call session. Next time, say `/resume` to pick up — or I'll auto-orient silently."
