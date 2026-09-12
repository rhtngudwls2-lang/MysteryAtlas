import json,re,xml.etree.ElementTree as ET
from pathlib import Path
root=Path(__file__).resolve().parents[1]
a=root/'app/src/main/assets'
cases=json.loads((a/'cases.json').read_text()); ui=json.loads((a/'ui.json').read_text())
required='id slug title_en title_ko country_code region_en region_ko latitude longitude year_label primary_category secondary_tags status evidence_score hook_en hook_ko briefing_en briefing_ko theory_choices evidence_cards verified_facts myth_vs_fact assessment_en assessment_ko source_records related_case_ids estimated_read_minutes source_verified coordinate_verified content_reviewed'.split()
assert len(cases)==3
ids={c['id'] for c in cases};assert len(ids)==3
for c in cases:
 assert set(required)<=c.keys()
 assert -90<=c['latitude']<=90 and -180<=c['longitude']<=180
 assert 1<=c['evidence_score']<=4
 assert c['status'] in ['UNSOLVED','PARTLY_EXPLAINED','EXPLAINED','LEGEND']
 assert c['theory_choices'] and len(c['evidence_cards'])==3
 assert set(c['related_case_ids'])<=ids-{c['id']}
 source_ids={s['id'] for s in c['source_records']}
 for e in c['evidence_cards']: assert set(e['source_ids'])<=source_ids
 def bilingual(x):
  if isinstance(x,dict):
   if 'en' in x or 'ko' in x: assert x.get('en') and x.get('ko')
   for v in x.values():bilingual(v)
  elif isinstance(x,list):
   for v in x:bilingual(v)
 bilingual(c)
 for key in ['title','region','hook','briefing','assessment']:assert c[key+'_en'] and c[key+'_ko']
 print('PASS content schema, bilingual fields and source references:',c['id'])
assert {c['id']:c['status'] for c in cases}=={'bloop':'EXPLAINED','wow':'UNSOLVED','voynich':'UNSOLVED'}
for k,v in ui.items():assert v['en'] and v['ko']
for f in (root/'app/src/main/java').rglob('*.kt'):
 for key in re.findall(r'\bt\("([\w]+)"\)',f.read_text()): assert key in ui,(f,key)
print('PASS UI localization keys and verdict classification')
manifest=ET.parse(root/'app/src/main/AndroidManifest.xml').getroot()
assert not manifest.findall('uses-permission')
assert manifest.find('application').get('{http://schemas.android.com/apk/res/android}allowBackup')=='false'
print('PASS zero declared permissions; cloud backup disabled')
for polygon in json.loads((a/'world.json').read_text()):
 assert len(polygon)%2==0 and len(polygon)>=6
 assert all(-180<=v<=180 for v in polygon[::2]) and all(-90<=v<=90 for v in polygon[1::2])
print('PASS original map geometry bounds')
print('NOTE: These are host checks, not Android build or runtime tests.')
