"""Read the supplied roster without exporting email addresses."""
import collections
import hashlib
import json
from pathlib import Path
import xml.etree.ElementTree as ET
import zipfile
import sys

sys.stdout.reconfigure(encoding='utf-8')

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'ai-hackathon-check-ins-2026-11-14-1103.xlsx'
OUT = ROOT / 'research/team-sweeps/2026-11-14-sweep-01'
NS = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
FIELDS = {'A': 'name', 'C': 'university', 'D': 'college', 'E': 'major', 'F': 'year', 'G': 'team'}
with zipfile.ZipFile(SOURCE) as archive:
    strings = [''.join(x.itertext()) for x in ET.fromstring(archive.read('xl/sharedStrings.xml')).findall('m:si', NS)] if 'xl/sharedStrings.xml' in archive.namelist() else []
    def value(cell):
        if cell.get('t') == 's':
            return strings[int(cell.find('m:v', NS).text)]
        if cell.get('t') == 'inlineStr':
            return ''.join(cell.find('m:is', NS).itertext())
        node = cell.find('m:v', NS)
        return node.text if node is not None else ''
    rows = ET.fromstring(archive.read('xl/worksheets/sheet1.xml')).findall('.//m:row', NS)
    records = []
    for row in rows[1:]:
        record = {'source_row': int(row.get('r'))}
        for cell in row:
            column = ''.join(filter(str.isalpha, cell.get('r')))
            if column in FIELDS:
                record[FIELDS[column]] = value(cell).strip()
        if record.get('name'):
            records.append(record)
teams = collections.defaultdict(list)
for record in records:
    teams[record.get('team', '').strip() or 'Unassigned'].append(record)
assigned = sorted((name for name in teams if name != 'Unassigned'), key=str.casefold)
OUT.mkdir(parents=True, exist_ok=True)
data = {'source_file': SOURCE.name, 'source_sha256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(), 'sheet': 'ai-hackathon-check-ins-2026-11-', 'roster_rows': len(records), 'named_team_labels': len(assigned), 'unassigned_rows': len(teams.get('Unassigned', [])), 'teams': dict(teams)}
(OUT / 'roster-no-emails.json').write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding='utf-8')
for i in range(3):
    batch = {name: teams[name] for name in assigned[i::3]}
    (OUT / f'batch-{i+1}-roster.json').write_text(json.dumps(batch, indent=2, ensure_ascii=False), encoding='utf-8')
print(json.dumps({key: data[key] for key in ('roster_rows', 'named_team_labels', 'unassigned_rows')}))
for i, name in enumerate(assigned):
    print(f'{i+1:02} [batch {i%3+1}] {name}: ' + ', '.join(r['name'] for r in teams[name]))
