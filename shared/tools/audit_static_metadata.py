"""Audit every exported KO/EN article's preview metadata and JSON-LD."""
import json
from html.parser import HTMLParser
from pathlib import Path
from sync_content import ROOT
r=ROOT/'web/out'
idx=json.loads((ROOT/'shared/content/index.json').read_text())
ids={x['canonicalId'] for x in idx['items']}
legacy={x['id'] for x in json.loads((ROOT/'app/src/main/assets/v2/catalog.json').read_text())['cases']}|{'rendlesham','loch-ness'}
class P(HTMLParser):
 def __init__(self): super().__init__();self.meta={};self.link=[];self.scripts=[];self.in_json=False;self.title='';self.in_title=False
 def handle_starttag(self,t,a):
  x=dict(a)
  if t=='meta':self.meta[x.get('name') or x.get('property')]=x.get('content')
  if t=='link':self.link.append(x)
  if t=='script' and x.get('type')=='application/ld+json':self.in_json=True;self.scripts.append('')
  if t=='title':self.in_title=True
 def handle_data(self,d):
  if self.in_json:self.scripts[-1]+=d
  if self.in_title:self.title+=d
 def handle_endtag(self,t):
  if t=='script':self.in_json=False
  if t=='title':self.in_title=False
issues=[];legacy_missing=[];og_missing=[]
for loc in ('ko','en'):
 for slug in sorted(ids|legacy):
  f=r/loc/'cases'/slug/'index.html'
  if not f.is_file():issues.append((loc,slug,'missing route'));continue
  p=P();p.feed(f.read_text())
  base=f'https://rhtngudwls2-lang.github.io/MysteryAtlas/{loc}/cases/{slug}/'
  links=lambda rel,lang=None:[x['href'] for x in p.link if x.get('rel')==rel and (lang is None or x.get('hreflang')==lang)]
  checks={'title':bool(p.title.strip()),'description':bool(p.meta.get('description')),'canonical':links('canonical')==[base],
    'hreflang-ko':links('alternate','ko')==[base.replace('/'+loc+'/','/ko/')],
    'hreflang-en':links('alternate','en')==[base.replace('/'+loc+'/','/en/')],
    'og:title':bool(p.meta.get('og:title')),'og:description':bool(p.meta.get('og:description')),
    'og:image':bool(p.meta.get('og:image')),'twitter:title':bool(p.meta.get('twitter:title')),
    'twitter:description':bool(p.meta.get('twitter:description')),'twitter:image':bool(p.meta.get('twitter:image'))}
  for k,okay in checks.items():
   if not okay:issues.append((loc,slug,k))
  obj=[]
  for s in p.scripts:
   try: obj.append(json.loads(s))
   except Exception:issues.append((loc,slug,'malformed JSON-LD'))
  art=[x for x in obj if isinstance(x,dict) and x.get('@type')=='Article']
  if not art:legacy_missing.append((loc,slug))
  elif art[0].get('mainEntityOfPage')!=base or art[0].get('inLanguage')!=loc or not art[0].get('image'):
   issues.append((loc,slug,'Article JSON-LD mismatch/image missing'))
print(json.dumps({'checked':2*len(ids|legacy),'productized':len(ids),'legacy':len(legacy),'issues':issues[:40],'issueCount':len(issues),'missingArticleJsonLd':legacy_missing[:20],'missingArticleJsonLdCount':len(legacy_missing)},ensure_ascii=False))
if issues or legacy_missing:
 raise SystemExit(1)
