"""Validate first-sweep coverage and assemble reviewable research outputs."""
import collections
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
DIR = ROOT / 'research/team-sweeps/2026-11-14-sweep-01'
load = lambda name: json.loads((DIR / name).read_text(encoding='utf-8'))
roster = load('roster-no-emails.json')
discord = load('discord-findings.json')
teams = []
for batch in range(1, 4):
    expected = load(f'batch-{batch}-roster.json')
    findings = load(f'batch-{batch}-findings.json')
    assert {t['team'] for t in findings['teams']} == set(expected), f'Batch {batch} team mismatch'
    for team in findings['teams']:
        assert collections.Counter(m['name'] for m in team['members']) == collections.Counter(m['name'] for m in expected[team['team']]), team['team']
        for member in team['members']:
            assert member.get('search_queries'), f"Missing search record: {member['name']}"
    teams.extend(findings['teams'])
assert len(teams) == 90
assert sum(len(t['members']) for t in teams) == 261
assert len({t['team'] for t in teams}) == 90
unassigned = load('unassigned-discovery.json')
for source in unassigned['sources']:
    source['observed_at'] = '2026-11-14 (Pacific; exact per-source observation time not retained)'
for member in unassigned['members']:
    normalized = ' '.join(member['name'].casefold().split())
    if normalized in ['luke vieira', 'cameryn pina']:
        member['role_evidence'] = 'Live participant guide names this person as an organizer; do not assume competitor status.'
        member['role_source'] = 'https://cpvc-ai-hackathon-guide.vercel.app/#report'
    if normalized == 'ayden gregory':
        member['discord_project_evidence'] = next(o for o in discord['observations'] if o.get('name') == 'Ayden Gregory')
    if normalized == 'brian kennelly':
        member['discord_project_evidence'] = next(o for o in discord['observations'] if o.get('name') == 'Brian Kennelly')
    if normalized == 'joshua naim':
        member['followup_evidence'] = {'url': 'https://github.com/joshnaim1/rebalance/blob/2ae15a7732b32d8992e8a04f8f7d57a1da69e2d1/README.md', 'claim': 'Public README names Joshua Naim and Brian Li; describes a balance-board rehabilitation prototype explicitly for a Spring 2026 event. Prior project only; not this November entry.', 'observed_at': '2026-11-14 (Pacific)'}
    if normalized == 'sameer maheshwari':
        member['followup_evidence'] = {'url': 'https://sam2545.github.io/index.html', 'claim': 'Directly opened personal site identifies Sameer Maheshwari and Cal Poly SLO; supports a school-matched public portfolio lead. Site copy is old and does not identify a current hackathon entry.', 'observed_at': '2026-11-14 (Pacific)'}
(DIR / 'unassigned-discovery.json').write_text(json.dumps(unassigned, indent=2, ensure_ascii=False), encoding='utf-8')
assert len(unassigned['members']) == 189
assert sum(len(m['source_rows']) for m in unassigned['members']) == 193
assert sum(bool(m['search_queries']) for m in unassigned['members']) == 187

# Preserve agent snapshots; add independently collected cross-checks separately.
for team in teams:
    team['discord_cross_checks'] = [o for o in discord['observations'] if o.get('team') == team['team']]
    team['eligibility_status'] = 'Check-in roster association; final entry/eligibility not verified'
    team['rubric_scores'] = None
    team['winning_probabilities'] = None

names = collections.defaultdict(list)
for team, records in roster['teams'].items():
    for record in records:
        key = ' '.join(record['name'].casefold().split())
        names[key].append({'name': record['name'], 'team': team, 'source_row': record['source_row']})
duplicates = [rows for rows in names.values() if len(rows) > 1]
quality = {
    'raw_named_rows': 454, 'assigned_member_rows': 261, 'unassigned_rows': 193,
    'team_labels': 90, 'normalized_name_groups': len(names),
    'duplicate_name_groups': duplicates,
    'singleton_labels': {t: [r['name'] for r in rs] for t, rs in roster['teams'].items() if t != 'Unassigned' and len(rs) == 1},
    'admin_test_rows': [r for r in roster['teams']['Unassigned'] if r['name'].casefold() in ['admin cpvc', 'organizer review (test account)']],
    'guide_named_organizers_present_in_unassigned': ['Luke Vieira', 'Cameryn Pina'],
    'interpretation': 'Check-ins include unresolved membership, duplicate-name rows, organizers and administrative/test labels. No deduplication, team merge, eligibility removal or final competitor count inferred.'
}
(DIR / 'roster-quality.json').write_text(json.dumps(quality, indent=2, ensure_ascii=False), encoding='utf-8')
combined = {
    'sweep': 1, 'date_pt': '2026-11-14', 'source_file': roster['source_file'],
    'source_sha256': roster['source_sha256'],
    'method': 'Three agent batches, public web/GitHub discovery, read-only user-authorized Discord review, live guide/form verification. Public project code inspected without execution.',
    'coverage': {'team_labels': 90, 'assigned_member_rows': 261, 'unassigned_rows': 193, 'unassigned_name_groups': 189, 'unassigned_personal_searches': 187},
    'teams': sorted(teams, key=lambda t: t['team'].casefold()),
    'unassigned_project_claims': [o for o in discord['observations'] if o['kind'] == 'unassigned_project_claim'],
    'limitations': ['Not a final entrant list.', 'Current-project attribution and live functionality remain unverified unless explicitly stated.', 'Source claims, planned features, observed code and runtime behavior are separate.', 'No numerical probabilities or rubric grades justified across the full field yet.', 'App-builder/shared-chat entries mean GitHub-only discovery is incomplete.', 'A failed fetch or absent search result does not establish inactivity or broken software.']
}
(DIR / 'team-findings.json').write_text(json.dumps(combined, indent=2, ensure_ascii=False), encoding='utf-8')

def cell(value):
    if isinstance(value, (list, dict)):
        value = json.dumps(value, ensure_ascii=False)
    return str(value).replace('|', '\\|').replace('\n', ' ')

lines = ['# Hackathon research: first sweep', '', 'Research date: Saturday, November 14, 2026 (Pacific). This is a discovery baseline, not a ranking or a final list of eligible entrants.', '',
    '## Coverage and roster quality', '',
    '- 90 team labels and all 261 assigned member rows researched across three agents. Every assigned member has a recorded targeted search.',
    '- 193 blank-team rows retained separately: 189 normalized name groups, with 187 personal-name searches and two administrative/test labels excluded from personal research.',
    '- 454 source rows reduce to 446 normalized name strings, not 446 proven unique competitors. Eight repeated-name groups, including four assigned/unassigned overlaps, require reconciliation.',
    '- Three labels have one listed member: Jamvibe, LAMS, and Iryna\'s Gang. These are roster gaps to resolve, not eligibility decisions.',
    '- The guide identifies organizers among the blank-team rows. This check-in sheet cannot establish a final competitor count.', '',
    '## Strongest current product leads', '',
    '| Team | Product/evidence | What remains unknown |', '| --- | --- | --- |',
    '| Campus Call | Public repo and user project context establish the virtual-credit campus forecasting product. | Public deployment functionality and final submission state. |',
    '| FSH | Zero-Wait restaurant discovery and wait-time concept. Matching teammates in repo history. Main and dev source inspected; a separate call_backend branch exists. | Runtime health, full branch integration, actual AI calling and challenge choice. |',
    '| Cache us if you can | StageSight presentation rehearsal/AI coaching candidate on a member\'s crosslinked account, with current-window code and commits. | Explicit team/submission association and live functionality. |',
    '| Gavin | Medication-shortage policy rollout checker candidate. Plan describes hospital pharmacy users; inspected code is early scaffolding. | Team/submission attribution and implementation beyond inspected snapshot. |',
    '| Mission Impromptable | FabZero explicitly names this event. Development branch contains SiliconOS architecture workbench code, hardware, tests and web interface; default branch alone understates progress. | Independently verified simulations/tests, physical FPGA deployment and runtime behavior. |',
    '| VetPath | Team-named Discord recruiting post describes emergency-veterinary discovery for pet owners, plus reported interviews and preparation. | Repo/live link, implemented scope and independent validation. |',
    '| Click | Roster member\'s Discord post describes connected jewelry and an app, with a claimed early prototype and customer research. | Explicit Click project association, current implementation and validation. |',
    '| A2B Labs | Team-named Discord post describes legacy-code modernization using a human-reviewed plain-language specification and equivalence checks. | Author handle-to-roster match and working implementation. |',
    '| sudo arise | Member\'s new SAP repository has a title-only README. | Product and audience. A placeholder says little about unpublished team work. |',
    '| Study Abroad Student Companion | Candidate TRVLR repository describes social and trip coordination for students abroad. Inspected root has planning/documentation files. | Member identity, submission association and working implementation. |', '',
    'These ten labels have differing kinds of leads; this is not ten confirmed submissions or ten functioning apps. Remaining teams retain explicit unknowns. Prior hackathon wins and older coursework are background only.', '',
    '## Discord and official requirements', '',
    '- Reviewed the seven visible hackathon text channels. Showcase was empty; a server-wide github.com search returned no results. This is limited search coverage, not proof of absence.',
    '- The project-link form is already posted in resources. It accepts GitHub, app-builder, shared AI-chat or other project URLs, and requires link access without sign-in. Form answers were not available to us.',
    '- Live guide confirms GitHub is not required. Thus the earlier assumption that every team must have a public GitHub repo is not supported by the current guide/form.',
    '- Guide checkpoints: project link Saturday 2 PM PT, Sunday commitment/live link Saturday 8 PM PT, and final submission Sunday noon PT. Source: [participant guide](https://cpvc-ai-hackathon-guide.vercel.app/#due).',
    '- Rubric is execution/design 25, real problem/user 25, path to customers 20, pitch/demo 15, creative AI 15. Majors and code difficulty are explicitly not scored. Room winners advance to finals; room allocation matters to later forecasts.',
    '- Two extra proposals are attributable to blank-team names: Ayden Gregory\'s musician-practice app and Brian Kennelly\'s AI Sieve text-analysis dashboard. No final team or completed build established.',
    '- No messages were sent. No DMs, private form responses, credentials or participant emails were collected in research outputs.', '',
    '## Next sweep', '',
    '1. Resolve team-to-project mappings using posted links or a permitted organizer export of project fields. Check app-builder and shared-chat projects too.',
    '2. Revisit the known candidate repos at pinned commits and record new changes. Inspect core feature code; do not equate a plan or commit count with completion.',
    '3. Observe published live apps/demos without entering personal information. Mark health unknown when retrieval fails.',
    '4. Collect evidence of real users, customer access and the actual pitch. Verify challenge entries separately.',
    '5. Reconcile final team membership/eligibility and room allocation before attempting probabilities across the full field.', '',
    '## Full team index', '', '| Team | Members | Current project status | Repo leads |', '| --- | --- | --- | --- |']
for team in combined['teams']:
    display = {
        'not_located_in_first_sweep': 'Current project not located', 'not_located': 'Current project not located',
        'current_entry_not_located_prior_work_found': 'Prior work found; current entry unknown',
        'confirmed_from_user_project_context_and_public_repo': 'Project identified from user context/public repo',
        'candidate_current_event_project': 'Current-window candidate; team mapping unconfirmed',
        'candidate_placeholder_repository': 'Placeholder candidate; product unknown',
        'strong_candidate_current_entry': 'Strong current-entry candidate',
        'plausible_current_entry': 'Plausible current-entry candidate',
        'team_named_product_claim_from_discord': 'Team-named product statement; build unverified',
        'team_named_product_statement_implementation_unverified': 'Team-named product statement; build unverified',
        'member_product_statement_implementation_unverified': 'Member product statement; build unverified'
    }.get(team['project_status'], team['project_status'])
    links = ', '.join(f'[Repo]({url})' for url in team.get('repo_urls', [])) or 'Not located'
    lines.append('| ' + ' | '.join([cell(team['team']), cell(', '.join(m['name'] for m in team['members'])), cell(display), links]) + ' |')
lines += ['', '## Research files', '',
    '- `team-findings.json`: all 90 team records, members, sources, confidence/unknowns and next checks.',
    '- `batch-1-report.md`, `batch-2-report.md`, `batch-3-report.md`: detailed human-readable findings.',
    '- `discord-findings.json`: attributed project statements and live guide/form checks, with message links.',
    '- `unassigned-discovery.json`: blank-team search records and unverified public-profile leads.',
    '- `roster-quality.json`: duplicates, single-member labels and administrative/organizer anomalies.',
    '- Source workbook remains unchanged. Its email column was omitted from derived research files.', '']
(DIR / 'SUMMARY.md').write_text('\n'.join(lines), encoding='utf-8')

# Check research output files only; never inspect local secrets or unrelated files.
email = re.compile(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}')
for path in DIR.glob('*'):
    if path.suffix in ['.json', '.md']:
        content = path.read_text(encoding='utf-8')
        assert not email.search(content), f'Email-like string in {path.name}'
        if path.suffix == '.json':
            json.loads(content)
print(json.dumps({'validation': 'passed', 'teams': len(teams), 'assigned_rows': 261, 'unassigned_rows': 193, 'searches_unassigned': 187, 'email_scan': 'passed', 'source_unchanged': __import__('hashlib').sha256((ROOT / roster['source_file']).read_bytes()).hexdigest() == roster['source_sha256']}))
