# Campus Call: shared goal for every agent

Read this with `AGENTS.md`, `TASKS.md`, `SETUP.md`, and `research/10-build-spec.md` before doing any EP. The locked build spec is the product authority. This brief summarizes it; it does not replace it.

Build a phone-friendly campus forecasting experience for the hackathon. A visitor can understand it from examples, enter through the event QR, receive 1,000 virtual credits once after email and name, and independently confirm four team forecasts using one shared balance. The event must work as a compelling demo and have a verified path to real participant use across phones.

- Home: campus example questions, category filters, search, portfolio. Every campus example is labeled Example; confirming it changes no position or balance.
- QR: direct hackathon event, no detour through Home.
- Four tickets: a main-prize 1st/2nd/3rd ranking, OpenAI, Startup Launch, Best Use of AI. Duplicate team choices are allowed. Challenge options require confirmed entry. Each ticket has its own credit amount and confirmation. Overspend writes nothing.
- One balance: grants and spends are persistent and transactional for real participants. Browser storage alone cannot satisfy the real once-per-email requirement.
- Lock: Sunday 15 November 2026, noon PT (`2026-11-15T20:00:00Z`), checked on the server. The participant guide is the sole schedule source.
- Team cards: require a project link; show sourced project/link health, feasibility, public-profile background, and the five official rubric rows with reasons. Unknown stays unknown. No private-profile access or invented evidence.
- Probabilities: Campus Call estimates, distinct from judge scores. Populated award distributions total 100%; no confirmed entrants means no invented distribution.
- Admin demo: only a trusted admin can spend demo credits on the Chick-fil-A question. Everyone else gets a preview.
- Prize: 50% of what this team actually receives, top ten geometric ranks, zero pool if it wins nothing. Tax line accompanies dollar amounts. No endorsement claims. Use exact rules from the locked spec.
- Final demo rank measures the four tickets against human-confirmed official results; it is separate from the retained Brier harness.

Words on screen: forecast, position, market probability, points, virtual credits. Preserve existing math, tests, SQL and AI harness. The parked YES/NO trading app is not the product front door.

## Authority and readiness

On 13 November 2026 Nico authorized a team lead and specialist agents to choose how best to build toward this goal. Routine technical/product details can be resolved by specialists and recorded in `DECISIONS.md`; do not repeatedly ask Nico to choose implementation details. Changes to this final goal require user direction.

The team brain is the clone at `C:/lec-brain`. Do not read or write `~/.claude/second-brain.md`. The checked-in locked spec and this brief supply context to every agent. Quality for the overnight run is the autonomous TierraDex gate chain in `docs/overnight/LEAD-PROMPT.md`.

Build the runnable local demonstration first, then complete the real-account implementation and verification. Fixtures and device-local demo identity must be conspicuously labeled and isolated. They do not constitute participant-ready grants, a live leaderboard or cash eligibility. Never silently fall back from live mode to demo mode.

No hosted migrations without the explicit authorization required by `SETUP.md`. No production deployment or push. Use the existing Campus Call hosts only. Missing deployment credentials, hosted authorization or external team facts must produce an honest release blocker, not a claim of full completion.
