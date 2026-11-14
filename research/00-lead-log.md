# Lead log — Campus Call

## 2026-11-13 — Phase A fan-out

User instructed the lead to run research agents 1–7 in parallel, one file each under `research/`, then synthesize. Phase B (feature build) stays stopped until Nico reviews the harness.

### Spawned

| Agent | File | Subagent |
| --- | --- | --- |
| 1 Use cases | research/01-use-cases.md | 01a1d7bc-d36b-78c3-ab47-a10aec1e613a |
| 2 Regulation | research/02-regulation.md | 01a1d7bc-d36b-78c3-ab47-a11899ba21d0 |
| 3 Phase A harness | research/03-build.md plus harness | 01a1d7bc-d36b-78c3-ab47-a1218955d6d0 |
| 4 Business | research/04-business-model.md | 01a1d7bc-d36b-78c3-ab47-a134276d13aa |
| 5 Hackathon markets | research/05-hackathon-markets.md | 01a1d7bc-d36b-78c3-ab47-a14059159f71 |
| 6 Pitch | research/06-pitch.md | 01a1d7bc-d36b-78c3-ab47-a15c97109058 |
| 7 Incentives | research/07-incentives.md | 01a1d7bc-d36b-78c3-ab47-a16031ca4f52 |

No extra sub-agents. Lead writes `research/00-summary.md` only after 1, 2, 4, 5, 6, 7 and Agent 3 Phase A are in.

### 2026-11-13 — prize-share economics

Nico stated prize amounts and a 300-person room, and set the prediction close at 11:30. One economics sub-agent was spawned to compare giving away 20, 25, 30, 40, and 50 percent, and to test whether 50/30/20 is the right split. No other agents. Phase B still stopped.

### 2026-11-13 18:32 PT — second brain

Local brain branch `brain/campus-call-2026-11-14-023227` holds a plan entry: EP-1162 done (Phase A), EP-1163 in progress (prize keep, own-team, attendance), EP-1164 blocked (Phase B), EP-1165 ready (organizer ask), EP-1166 backlog (lawyer before any cash announcement). Push and PR were not done. Waiting on Nico.

### 2026-11-13 — Phase A complete, synthesis written

All seven agents finished. No eighth agent was spawned. The files disagreed on the cash prize, the leaderboard sort, athletics markets, and how many hackathon questions were ready. Resolutions are in `research/00-summary.md`. Phase B was not started. The organizer draft was not sent. `git init` was not run.

### Why these seven agents, and no more

The seven workstreams write different files and do not need each other's output to start:

- Agents 1, 2, 4, 5, 6, 7 each own a single research note.
- Agent 3 owns `research/03-build.md`, the eval harness, and a draft `TASKS.md`.

A sequential loop would only add wait time. No eighth agent was spawned. The lead will write `research/00-summary.md` after agents 1, 2, 4, 5, 6, and 7 finish and Agent 3 finishes Phase A.

### Git

This folder is not a git repository. Project rules forbid `git init`. Agent 3 will write the harness and record in `PROGRESS.md` that the commit was skipped. Nico can initialize a repo later if he wants the harness committed.

### Hard rules repeated to every agent

No real-money stakes. Vocabulary is forecast, position, market probability, and points. No markets on individuals, grades, confidential exams, or single-person manipulation. No LinkedIn scraping. Cite sources. Never read `.env` files, print secrets, merge to production, or run `vercel --prod`. Do not post or send the organizer message.
