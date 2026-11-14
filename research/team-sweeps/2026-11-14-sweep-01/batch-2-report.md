# First sweep: batch 2

Observed through 2026-11-14T19:24:57Z (11:24 a.m. Pacific, 14 November 2026).

Coverage: 30 named team labels and all 86 associated roster rows received targeted public member searches. These are check-in labels, not an independently verified eligible field. Private emails were not included in queries or outputs. Missing GitHub is not a penalty: the live guide permits app-builder/project-share links.

## Current product leads

| Team | Evidence status | Product | Progress / next evidence |
|---|---|---|---|
| A2B Labs | team named product statement implementation unverified | Self-described legacy-code modernization tool using an interactive plain-English intermediate specification, human review toggles and side-by-side equivalence tests. | Parent directly observed a Nov12 Discord team-named pitch; implementation, repo and live link unlocated in this public sweep. |
| Click | member product statement implementation unverified | Audrey Stephenson describes jewelry plus a companion app to help people meet and stay connected; a follow-up calls it fashion technology. | Parent observed Nov11 recruiting post self-reporting early prototype and customer research; Nov13 follow-up says still working on fashion technology. No public implementation inspected. |
| FSH | strong candidate current entry | Zero-Wait: restaurant discovery by location/distance/cuisine, with wait-time collection/calling described as a future service. | Default branch at ad0441ceeedf45c0468830da45161d313de8eca8 contains a location/selection wizard and restaurant discovery/wait-time-sort API code. README says backend does not place AI calls. The inspected page ends after restaurant selection without a visible wait-result view. Runtime, provider key, deployment and calling service unverified. Latest inspected default commit: 2026-11-14T07:15:50Z. Repo pushed_at 19:13:40Z does not establish a newer default-branch implementation. Dev branch4023dbf4bd6e6d56ec500fc225db1713eb262a0c README documents a confirmation dialog and waiting-screen call-flow preview, explicitly says calls/reservations are not made and calling service is unconnected. call_backend branch7b6ce21e472a03a3b90dd972ae0c8d263a81ba6a exists; full implementation not inspected. |
| Gavin | plausible current entry | Shortage Rollout Checker: planned hospital medication-shortage policy rollout verification, simulation, ripple projection and read-only monitoring. | Nov14 builder plan and source scaffold at 199252cb562ad5ee2e780bd1f14a5132d6395f7c. FastAPI main exposes only /health; reviewed rollout_checker.py and policy_parser.py contain docstrings only; policy setup page contains heading/text only; AI client only defines model configuration. Detailed plan is not completed functionality. Last observed commit12:52:50Z. |
| Mission Impromptable | strong candidate current entry | SiliconOS (FabZero repository): architecture workbench for describing a workload, comparing supported accelerator architectures and inspecting verification evidence. | Main branch is README-only, but codex/siliconos-demo at84fcae1000f056f869b6b84a28804b98cb7b6a48 has server.py, hardware/, siliconos/, tests/ and web/. Branch README describes INT8 matrix multiplication/INT32 accumulation, RTL verification and generic synthesis; these execution results are self-reported and not reproduced. It explicitly says live Groq API validation, physical FPGA deployment and public hosting are pending. Other public branches codex/ai-rtl-generation and drew-branch exist, not fully inspected. |
| Study Abroad Student Companion | plausible current entry | Travel Abroad / TRVLR: proposed student social platform for meeting travel companions and coordinating trips across study-abroad programs. | Repository created2026-11-14T04:46:17Z, pushed18:55:43Z. At5c56736e531da75e9d4043cda21b80d0bf41867a root lists README.md, AGENTS.md and docs/ only. README explicitly calls concept stage, proposed features and unvalidated problem/customer/business model. No app implementation or deployment observed. |

## Every team and member

Every member below was searched by name plus GitHub and university, then with a GitHub-focused exact-name web query. Selected candidates were checked against public GitHub API/profile/repository evidence. Search phrases and source rows are retained in batch-2-findings.json.

### A2B Labs

Project status: team named product statement implementation unverified.

Self-described legacy-code modernization tool using an interactive plain-English intermediate specification, human review toggles and side-by-side equivalence tests.

Progress: Parent directly observed a Nov12 Discord team-named pitch; implementation, repo and live link unlocated in this public sweep.

- **Joshua Torres** (source row 228): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.
- **Nick Gonzalez** (source row 333): plausible public profile. Public profile identifies Nick Gonzalez as a fourth-year Cal Poly Business Administration student, consistent with roster; identity not confirmed. A Discord A2B Labs author using nickiee_g introduces himself as Nick/fourth-year IS (parent observed); handle-to-person match remains plausible.
  Sources: [1](https://www.linkedin.com/in/nicolas-gonzalez-9943b1395)

Project and attribution evidence:
- [Source](https://discord.com/channels/1564416101239103542/1564416148529741964/1570700873485652091): Parent observed author nickiee_g explicitly name A2B Labs and describe product; author introduces himself as Nick/fourth-year IS. Handle-to-Nick Gonzalez remains plausible, not confirmed. Source date: 2026-11-12 23:24 PT.

Next checks: Use explicit A2B Labs/product terms for next public repo search. Confirm author/roster link and inspect the specification/equivalence-test workflow.

### Atlas Engine

Project status: not located.

Unknown; team name alone is insufficient to establish product.

Progress: Unknown; no attributable current project inspected.

- **Adrian Montano** (source row 11): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.
- **Andrew Montano** (source row 35): plausible public profile. Public profile names Andrew Montano Lopez and Electrical Engineering at Cal Poly; consistent field/school but fuller surname and identity need confirmation.
  Sources: [1](https://www.linkedin.com/in/andrew-montano-lopez-a30249253)
- **Francisco Vejar Mata** (source row 150): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.
- **Zahid Soto** (source row 452): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.

Project and attribution evidence:

Next checks: Locate an official/team-published project link or corroborated public profile. Repeat public repository inspection after the next project-link checkpoint.

### Bay Innovations

Project status: current entry not located prior work found.

Unknown current product. Jack Gross's public prior work includes FlipScan, Acme Finance Agents and CURB; none attributed to this entry.

Progress: Jack-Gross public repos queried; FlipScan pushed Sep23, CURB Sep23 and finance agents Aug31, all preceding this weekend. Useful prior experience, not current build progress.

- **Aidan Mawani** (source row 16): plausible public profile. Public school-linked biography lists Cal Poly Business Administration/Finance and Hack4Impact product management; year text may be stale. Background context only.
  Sources: [1](https://www.sloakpsi.com/amawani)
- **Jack Gross** (source row 191): strong public profile match. Self-authored GitHub profile links the same LinkedIn account, states Cal Poly class of 2028 and product-management/building work. Prior FlipScan and Acme Finance Agents build-night wins are self-reported; neither is established as this weekend's submission.
  Sources: [1](https://github.com/Jack-Gross), [2](https://www.linkedin.com/in/jacktgross)
- **James Juha** (source row 205): plausible public profile. Public profile matches Cal Poly business/finance context; no attributable current project or developer profile found.
  Sources: [1](https://www.linkedin.com/in/james-juha)
- **Nathan Yee** (source row 327): plausible public profile. Public portfolio describes Cal Poly Computer Science, Cal Poly Racing software work and expected 2030 graduation, consistent with roster. Reject robotics repo lane_follower as an uncorroborated same-name hit.
  Sources: [1](https://us.bold.pro/my/nathan-yee-s)

Project and attribution evidence:
- [Source](https://github.com/Jack-Gross/Jack-Gross/blob/b4a2c53d191a2656511a132ada63771e856b38c7/README.md): Self-authored profile crosslinks prior projects and LinkedIn; does not identify Bay Innovations's current submission. Source date: 2026-09-23.
- [Source](https://github.com/Jack-Gross/flipscan): Prior AI thrift-scanning build-night project; not treated as current hackathon entry. Source date: 2026-09-23T23:31:53Z.

Next checks: Find Nathan Yee's corroborated developer account or a team-published project link. Check whether current project is hosted under another member or organization.

### BYOP

Project status: not located.

Unknown; team name alone is insufficient to establish product.

Progress: Unknown; no attributable current project inspected.

- **Nina Lopes** (source row 343): plausible public profile. Public profile matches Cal Poly Journalism; describes marketing/PR and startup-related work. No evidence tying a particular product to BYOP.
  Sources: [1](https://www.linkedin.com/in/nina-lopes-30914b332)
- **Sam Cowan** (source row 385): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.

Project and attribution evidence:

Next checks: Locate an official/team-published project link or corroborated public profile. Repeat public repository inspection after the next project-link checkpoint.

### Campusfuel

Project status: not located.

Unknown; team name alone is insufficient to establish product.

Progress: Unknown; no attributable current project inspected.

- **Jakob Li** (source row 203): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.
- **Jennifer Nakano** (source row 213): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.
- **Kaiden Campbell** (source row 235): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.
- **Sidhant Binani** (source row 406): plausible public profile. Public profile matches first-year Industrial Technology and Packaging at Cal Poly. No current project identified.
  Sources: [1](https://www.linkedin.com/in/sidhantbinani)

Project and attribution evidence:

Next checks: Locate an official/team-published project link or corroborated public profile. Repeat public repository inspection after the next project-link checkpoint.

### Click

Project status: member product statement implementation unverified.

Audrey Stephenson describes jewelry plus a companion app to help people meet and stay connected; a follow-up calls it fashion technology.

Progress: Parent observed Nov11 recruiting post self-reporting early prototype and customer research; Nov13 follow-up says still working on fashion technology. No public implementation inspected.

- **Audrey Stephenson** (source row 49): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.
- **Dona Liang** (source row 118): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.
- **Ethan Lee** (source row 144): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.
- **Sabine Chung** (source row 379): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.

Project and attribution evidence:
- [Source](https://discord.com/channels/1564416101239103542/1564416148529741964/1570216116368711764): Parent observed Audrey Stephenson post requesting developer/EE support and describing product, early prototype and customer research; these are unverified self-reports. Source date: 2026-11-11 15:18 PT.

Next checks: Find team-published project identity and public demo. Verify what jewelry hardware/app functionality exists and inspect research evidence.

### CPMWP

Project status: not located.

Unknown; team name alone is insufficient to establish product.

Progress: Unknown; no attributable current project inspected.

- **AJ Schoenberger** (source row 20): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.
- **Eros Brunel** (source row 143): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.
- **Kaleb  Lum** (source row 237): plausible public profile. Public profile matches Cal Poly engineering context; no attributable current project identified.
  Sources: [1](https://www.linkedin.com/in/kaleblum)
- **Wyatt Rantz** (source row 446): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.

Project and attribution evidence:

Next checks: Locate an official/team-published project link or corroborated public profile. Repeat public repository inspection after the next project-link checkpoint.

### Dev dudes

Project status: not located.

Unknown; team name alone is insufficient to establish product.

Progress: Unknown; no attributable current project inspected.

- **brennen johnson** (source row 72): same name candidates unverified. Exact-fullname API returns two accounts; public BeeJay805 projects include CAD tools, multi-agent experiments and a CSC2050 lab, but no sufficient school/team corroboration. Do not attribute these projects to participant or current entry.
  Sources: [1](https://github.com/BeeJay805), [2](https://github.com/BrennenMicronet)
- **Eli Szuchan** (source row 130): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.
- **Hudson Muus** (source row 182): plausible public profile. Public profile matches junior General Engineering transfer at Cal Poly; lists SolidWorks/MATLAB training. A liked post containing a repo is not evidence he authored it.
  Sources: [1](https://www.linkedin.com/in/hudson-muus-55m)

Project and attribution evidence:

Next checks: Locate an official/team-published project link or corroborated public profile. Repeat public repository inspection after the next project-link checkpoint.

### Equipe

Project status: not located.

Unknown; team name alone is insufficient to establish product.

Progress: Unknown; no attributable current project inspected.

- **Calvin Armstrong** (source row 84): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.
- **Louis  Pilod** (source row 269): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.

Next checks: Locate an official/team-published project link or corroborated public profile. Repeat public repository inspection after the next project-link checkpoint.

### FitYourBuild

Project status: not located.

Unknown; team name alone is insufficient to establish product.

Progress: Unknown; no attributable current project inspected.

- **Ariel Hoffman** (source row 41): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.
- **Brody  Luke** (source row 76): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.

Next checks: Locate an official/team-published project link or corroborated public profile. Repeat public repository inspection after the next project-link checkpoint.

### FSH

Project status: strong candidate current entry.

Zero-Wait: restaurant discovery by location/distance/cuisine, with wait-time collection/calling described as a future service.

Progress: Default branch at ad0441ceeedf45c0468830da45161d313de8eca8 contains a location/selection wizard and restaurant discovery/wait-time-sort API code. README says backend does not place AI calls. The inspected page ends after restaurant selection without a visible wait-result view. Runtime, provider key, deployment and calling service unverified. Latest inspected default commit: 2026-11-14T07:15:50Z. Repo pushed_at 19:13:40Z does not establish a newer default-branch implementation. Dev branch4023dbf4bd6e6d56ec500fc225db1713eb262a0c README documents a confirmation dialog and waiting-screen call-flow preview, explicitly says calls/reservations are not made and calling service is unconnected. call_backend branch7b6ce21e472a03a3b90dd972ae0c8d263a81ba6a exists; full implementation not inspected.

- **Francis Phil Corpuz** (source row 149): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.
- **Harold Huynh** (source row 170): strong public profile match. Public personal-site source explicitly states first-year CS at Cal Poly; current CPVC-Hackathon commits also name Harold Huynh alongside teammate Steven Mossman.
  Sources: [1](https://github.com/HaroldHuynh), [2](https://haroldhuynh.github.io/)
- **Steven Mossman** (source row 418): strong public profile match. Exact-fullname GitHub search plus self-authored profile stating Steven/Cal Poly CS and current repository commits naming Steven Mossman corroborate account. Current repo has teammate Harold Huynh commits.
  Sources: [1](https://github.com/speedisparrow), [2](https://speedisparrow.vercel.app/)

Project and attribution evidence:
- [Source](https://github.com/speedisparrow/CPVC-Hackathon/blob/ad0441ceeedf45c0468830da45161d313de8eca8/README.md): README names Zero-Wait and documents restaurant discovery and a future calling service; no backend AI calls. Source date: 2026-11-14T07:15:50Z.
- [Source](https://github.com/speedisparrow/CPVC-Hackathon/blob/ad0441ceeedf45c0468830da45161d313de8eca8/src/app/page.tsx): Source implements location, distance, cuisine and restaurant selection; no end-to-end runtime test performed. Source date: 2026-11-14T07:15:50Z.
- [Source](https://github.com/speedisparrow/CPVC-Hackathon/commit/fd0ba5304e67a47219ff1b2309f01c598fac5b81): Commit identity links HaroldHuynh, corroborating second roster teammate. Source date: 2026-11-14T06:48:26Z.
- [Source](https://github.com/speedisparrow/CPVC-Hackathon/blob/4023dbf4bd6e6d56ec500fc225db1713eb262a0c/README.md): Development branch documents more complete preview flow, but explicitly unconnected calling service.

Next checks: Inspect calling-backend branch and track merge/integration; do not equate branch name with a working service. Observe restaurant discovery and the complete wait-time workflow in a permitted demo. Confirm Francis's account, challenge entry, target user research and customer evidence.

### Gavin

Project status: plausible current entry.

Shortage Rollout Checker: planned hospital medication-shortage policy rollout verification, simulation, ripple projection and read-only monitoring.

Progress: Nov14 builder plan and source scaffold at 199252cb562ad5ee2e780bd1f14a5132d6395f7c. FastAPI main exposes only /health; reviewed rollout_checker.py and policy_parser.py contain docstrings only; policy setup page contains heading/text only; AI client only defines model configuration. Detailed plan is not completed functionality. Last observed commit12:52:50Z.

- **Gavin Luong** (source row 157): strong public profile match. Exact-fullname GitHub account and personal-site source (second-year CS at Cal Poly) fit roster; commits name Gavin Luong.
  Sources: [1](https://github.com/GavinjonL), [2](https://gavinjonl.github.io/)
- **Kaylie Hurst** (source row 242): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.
- **Logan Chook** (source row 266): plausible public profile. Exact-fullname API search returns lagoo0n; its MustangLink repository aligns with prior Devpost work. Past KiroHacks participation is not the current entry.
  Sources: [1](https://github.com/lagoo0n), [2](https://devpost.com/loganchook)
- **Sabrina Quan** (source row 380): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.

Project and attribution evidence:
- [Source](https://github.com/GavinjonL/Shortage-Rollout-Checker/blob/199252cb562ad5ee2e780bd1f14a5132d6395f7c/docs/Shortage_Rollout_Checker_Builder_Plan.md): Nov14 hackathon plan defines hospital-pharmacy workflow, fictional data and validation still needed. Source date: 2026-11-14.
- [Source](https://github.com/GavinjonL/Shortage-Rollout-Checker/blob/199252cb562ad5ee2e780bd1f14a5132d6395f7c/backend/app/main.py): Only /health registered in inspected main.py. Source date: 2026-11-14T12:52:50Z.
- [Source](https://github.com/GavinjonL/Shortage-Rollout-Checker/blob/199252cb562ad5ee2e780bd1f14a5132d6395f7c/backend/app/services/rollout_checker.py): Inspected service is a docstring placeholder. Source date: 2026-11-14T12:52:50Z.

Next checks: Confirm project-to-team link and whether another repo/branch contains implementation. Recheck APIs/services beyond scaffolding and obtain a permitted demo. Look for pharmacist validation, challenge selection and actual AI functionality.

### HaSu Labs

Project status: not located.

Unknown; team name alone is insufficient to establish product.

Progress: Unknown; no attributable current project inspected.

- **Harshita Bharath** (source row 171): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.
- **Suer Lan** (source row 419): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.

Next checks: Locate an official/team-published project link or corroborated public profile. Repeat public repository inspection after the next project-link checkpoint.

### Investment Suggestions

Project status: not located.

Unknown; team name alone is insufficient to establish product.

Progress: Unknown; no attributable current project inspected.

- **Andrew Villegas** (source row 36): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.
- **Olivia Cook** (source row 348): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.

Next checks: Locate an official/team-published project link or corroborated public profile. Repeat public repository inspection after the next project-link checkpoint.

### Jamvibe

Project status: not located.

Unknown; team name alone is insufficient to establish product.

Progress: Unknown; no attributable current project inspected.

- **Andrew  Silvas** (source row 32): plausible public profile. Public profile matches Cal Poly Business Administration (2025–2029); no attributable Jamvibe project found.
  Sources: [1](https://www.linkedin.com/in/andrew-silvas-business-real-estate)

Project and attribution evidence:

Next checks: Locate an official/team-published project link or corroborated public profile. Repeat public repository inspection after the next project-link checkpoint.

### Kevin

Project status: not located.

Unknown; team name alone is insufficient to establish product.

Progress: Unknown; no attributable current project inspected.

- **Carly Waldeck** (source row 90): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.
- **Lexi Hegarty** (source row 258): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.

Next checks: Locate an official/team-published project link or corroborated public profile. Repeat public repository inspection after the next project-link checkpoint.

### LAMS

Project status: not located.

Unknown; team name alone is insufficient to establish product.

Progress: Unknown; no attributable current project inspected.

- **Max Paul** (source row 303): plausible public profile. Public self-authored post describes Junior Go-To-Market Engineer experience at Section while finishing Cal Poly business degree. No attributable LAMS submission found.
  Sources: [1](https://www.linkedin.com/posts/max-paul-323596362_as-the-summer-comes-to-an-end-i-want-to-activity-7495899317870878720-9CnM)

Project and attribution evidence:

Next checks: Locate an official/team-published project link or corroborated public profile. Repeat public repository inspection after the next project-link checkpoint.

### Mission Impromptable

Project status: strong candidate current entry.

SiliconOS (FabZero repository): architecture workbench for describing a workload, comparing supported accelerator architectures and inspecting verification evidence.

Progress: Main branch is README-only, but codex/siliconos-demo at84fcae1000f056f869b6b84a28804b98cb7b6a48 has server.py, hardware/, siliconos/, tests/ and web/. Branch README describes INT8 matrix multiplication/INT32 accumulation, RTL verification and generic synthesis; these execution results are self-reported and not reproduced. It explicitly says live Groq API validation, physical FPGA deployment and public hosting are pending. Other public branches codex/ai-rtl-generation and drew-branch exist, not fully inspected.

- **Christopher Sepka** (source row 98): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.
- **Drew Nakamura** (source row 122): strong public profile match. Prior Devpost Cal Poly project and public account's FPGA/assembly work corroborate likely roster match; FabZero repository explicitly names Nov13–15 CPVC/CPOCB/CPE event.
  Sources: [1](https://github.com/drew-nakamura), [2](https://devpost.com/drew-nakamura/challenges)

Project and attribution evidence:
- [Source](https://github.com/drew-nakamura/FabZero/blob/5ea8480d34980210b42d83279d1e45475c99af19/README.md): Explicit event reference establishes an event-specific repo; root listing has only this file. Source date: 2026-11-14T01:33:41Z.
- [Source](https://github.com/drew-nakamura/main-street-ai-society): Prior community AI-literacy project, explicitly May2 KiroHacks; not current entry. Source date: 2026-05-02.
- [Source](https://github.com/drew-nakamura/FabZero/blob/84fcae1000f056f869b6b84a28804b98cb7b6a48/README.md): Nondefault branch defines SiliconOS scope and outstanding live-AI/hardware/hosting gates. Source directories exist; reported test/synthesis success not reproduced.

Next checks: Track nondefault branches as well as main. Observe reproducible simulation demo, hardware evidence, live API and customer validation. Confirm team/submission mapping and challenge selection.

### Optimizers

Project status: not located.

Unknown; team name alone is insufficient to establish product.

Progress: Unknown; no attributable current project inspected.

- **Devon Kirtley** (source row 112): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.
- **Noah Heryford** (source row 344): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.

Next checks: Locate an official/team-published project link or corroborated public profile. Repeat public repository inspection after the next project-link checkpoint.

### rAI

Project status: not located.

Unknown; team name alone is insufficient to establish product.

Progress: Unknown; no attributable current project inspected.

- **Aidan Berryman** (source row 14): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.
- **Aiden Ransom** (source row 19): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.
- **Elliott Haney** (source row 137): plausible public profile. Public profile matches Cal Poly Business Administration context; no current project located.
  Sources: [1](https://www.linkedin.com/in/elliott-haney)
- **Saurish Suman** (source row 394): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.

Project and attribution evidence:

Next checks: Locate an official/team-published project link or corroborated public profile. Repeat public repository inspection after the next project-link checkpoint.

### Sam and Tylers Team

Project status: not located.

Unknown; team name alone is insufficient to establish product.

Progress: Unknown; no attributable current project inspected.

- **Sam Kirschner** (source row 386): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.
- **Tyler Gilbert** (source row 436): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.

Next checks: Locate an official/team-published project link or corroborated public profile. Repeat public repository inspection after the next project-link checkpoint.

### Serra

Project status: not located.

Unknown; team name alone is insufficient to establish product.

Progress: Unknown; no attributable current project inspected.

- **Elias Santillan** (source row 131): plausible public profile. Exact-fullname API match is Everesth23, but no public repos returned in combined public search. University source documents same-name contributor to prior MathPath AI project; identity linkage remains provisional.
  Sources: [1](https://github.com/Everesth23), [2](https://dxhub.calpoly.edu/ai-summer-camp-archive/2025-csu-ai-summer-camp-projects/delta61-csu/)
- **Kiyan Arshadi** (source row 248): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.
- **mili L** (source row 316): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.

Project and attribution evidence:

Next checks: Locate an official/team-published project link or corroborated public profile. Repeat public repository inspection after the next project-link checkpoint.

### Slow Hours

Project status: not located.

Unknown; team name alone is insufficient to establish product.

Progress: Unknown; no attributable current project inspected.

- **Aurey Taylor** (source row 50): plausible public profile. Public profile describes Cal Poly personal-finance club work, consistent school/business context; no Slow Hours product established.
  Sources: [1](https://www.linkedin.com/in/aureytaylor)
- **Lera Korniichuk** (source row 256): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.
- **Matthew Flynn** (source row 298): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.

Project and attribution evidence:

Next checks: Locate an official/team-published project link or corroborated public profile. Repeat public repository inspection after the next project-link checkpoint.

### Study Abroad Student Companion

Project status: plausible current entry.

Travel Abroad / TRVLR: proposed student social platform for meeting travel companions and coordinating trips across study-abroad programs.

Progress: Repository created2026-11-14T04:46:17Z, pushed18:55:43Z. At5c56736e531da75e9d4043cda21b80d0bf41867a root lists README.md, AGENTS.md and docs/ only. README explicitly calls concept stage, proposed features and unvalidated problem/customer/business model. No app implementation or deployment observed.

- **Andrew Hamers** (source row 34): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.
- **Lucky Smart** (source row 274): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.
- **Margaret Mehl** (source row 288): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.
- **Philippe Bakhirev** (source row 358): plausible public profile. Public profile matches Cal Poly Electrical Engineering and describes Sandia internship experience; source year may be stale. Current submission unlocated. Exact-fullname GitHub API returns Ph1llyCheeSteak; public StudyAbroad repo fits team label, but profile-to-roster identity is still provisional.
  Sources: [1](https://github.com/Ph1llyCheeSteak), [2](https://www.linkedin.com/in/philippe-bakhirev)

Project and attribution evidence:
- [Source](https://github.com/Ph1llyCheeSteak/StudyAbroad/blob/5c56736e531da75e9d4043cda21b80d0bf41867a/README.md): Concept-stage README defines product, proposed target segment and validation questions; no claim of implemented features.

Next checks: Confirm Philippe's account/team association. Inspect later branches/commits for actual implementation. Look for student interviews and demand evidence.

### Tarica Bojak

Project status: not located.

Unknown; team name alone is insufficient to establish product.

Progress: Unknown; no attributable current project inspected.

- **Alexander Tarica** (source row 26): plausible public profile. Public self-authored post describes senior Cal Poly entrepreneurship/architecture context and landscape-design/referral-program work. No current team product established.
  Sources: [1](https://www.linkedin.com/posts/alexandertarica_i-just-wrapped-up-my-summer-internship-at-activity-7499239633667534848-BPwz)
- **Jasmine  Bojak** (source row 208): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.

Project and attribution evidence:

Next checks: Locate an official/team-published project link or corroborated public profile. Repeat public repository inspection after the next project-link checkpoint.

### Team Hobbs

Project status: not located.

Unknown; team name alone is insufficient to establish product.

Progress: Unknown; no attributable current project inspected.

- **Anthony D'Onofrio** (source row 39): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.
- **Brenen Clay** (source row 71): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.
- **Hayden Hobbs** (source row 174): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.
- **Nermin Galesic** (source row 328): plausible public profile. Public profile matches Cal Poly finance-focused Business Administration and sophomore context. No current project established.
  Sources: [1](https://www.linkedin.com/in/nermingalesic)

Project and attribution evidence:

Next checks: Locate an official/team-published project link or corroborated public profile. Repeat public repository inspection after the next project-link checkpoint.

### ToGo

Project status: not located.

Unknown; team name alone is insufficient to establish product.

Progress: Unknown; no attributable current project inspected.

- **Anna  Mikhay** (source row 37): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.
- **Grace Mills** (source row 162): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.
- **Melissa Ho** (source row 307): plausible public profile. Public profile matches Cal Poly Computer Engineering and sophomore education. Do not match same-name Google/Taiwan GitHub account meihua without corroboration.
  Sources: [1](https://www.linkedin.com/in/melissa-ho3478)

Project and attribution evidence:

Next checks: Locate an official/team-published project link or corroborated public profile. Repeat public repository inspection after the next project-link checkpoint.

### Twofold

Project status: current entry not located prior work found.

Unknown current product. Prior AskBetter prompt-analysis app links Adrian Valenzuela and Matthew Phan, but is a May KiroHacks project.

Progress: Prior public project evidence and strong Matthew Phan profile match exist. Queried mattphanm repositories contain no inspected November current-entry repo; latest listed owned repo is October lpl-financial-team-34. Team may use another owner/organization.

- **Adrian Valenzuela** (source row 12): plausible public profile. Public profile matches senior Cal Poly software engineering; prior AskBetter Devpost explicitly lists Adrian. GitHub exact name has multiple candidates; adrianvalenz describes 15 years' experience and is not accepted as this participant.
  Sources: [1](https://www.linkedin.com/in/adrian-jael-valenzuela), [2](https://devpost.com/avalen81)
- **Giovanni Peila** (source row 159): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.
- **Matthew Phan** (source row 299): strong public profile match. GitHub public profile links @calpoly and matching LinkedIn. University source names Matthew Phan in prior PolyPrompt second-place Starly team and AI summer-camp project. None establishes Twofold's current entry.
  Sources: [1](https://github.com/mattphanm), [2](https://www.linkedin.com/in/matthewphanm)

Project and attribution evidence:
- [Source](https://devpost.com/software/askbetter): May KiroHacks project lists Adrian Valenzuela and MattPhan Phan; useful prior collaboration, not this weekend's submission. Source date: 2026-05-03.
- [Source](https://noyce.calpoly.edu/about/news/polyprompt-advancing-responsible-ai-innovation-at-cal-poly/): University article credits Matthew Phan in prior Starly second-place team; background only.

Next checks: Find Giovanni Peila and the correct Adrian GitHub account. Find Twofold's actual entry; do not relabel old projects as current.

### Vibe Bugs

Project status: not located.

Unknown; team name alone is insufficient to establish product.

Progress: Unknown; no attributable current project inspected.

- **Hope Foley** (source row 180): same name candidate unverified. Exact-fullname search returns hfoley; public profile has Azure/data-lake workshop repositories and no Cal Poly linkage. Do not attribute to roster participant.
  Sources: [1](https://github.com/hfoley)
- **Kianna Wong** (source row 246): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.
- **Lydia Jiang** (source row 284): same name candidate unverified. Exact-fullname API search returns lydia0523; no school/team corroboration obtained, so do not attribute.
  Sources: [1](https://github.com/lydia0523)
- **Yazabeth Baza** (source row 450): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.

Project and attribution evidence:

Next checks: Locate an official/team-published project link or corroborated public profile. Repeat public repository inspection after the next project-link checkpoint.

### wowie warriors

Project status: not located.

Unknown; team name alone is insufficient to establish product.

Progress: Unknown; no attributable current project inspected.

- **Brooks Allen** (source row 77): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.
- **Caeden Cooley** (source row 79): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.
- **Riley Fong** (source row 365): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.
- **Zeke Smith** (source row 453): not located. No attributable public developer profile located in the first-pass search. This does not establish absence of a profile or work.

Next checks: Locate an official/team-published project link or corroborated public profile. Repeat public repository inspection after the next project-link checkpoint.

## Interpretation and repeat-sweep rules

- Product statements and code inspection are separate evidence. No external code was executed, no app login used, and no reported test success reproduced.
- Track source SHA and branch, not just repo pushed_at. FabZero's main branch conceals substantial nondefault-branch work; Zero-Wait also has a newer development flow.
- Unretrievable live URLs have unknown health, not failed health.
- Prior projects establish possible experience only. They are not substituted for the current submission.
- Candidate identity, team-to-project mapping, final eligibility, challenge entry, customer demand and pitch remain separate checks.
- No winning probabilities or unsupported rubric grades are assigned from this sweep.
