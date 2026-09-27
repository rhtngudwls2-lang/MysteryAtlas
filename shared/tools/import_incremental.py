"""Merge durable visual packs without rewriting existing canonical content or PNGs."""
import argparse, hashlib, io, json, zipfile
from pathlib import Path
from sync_content import ARTICLES, MEDIA, CONTENT, dump, validate

p=argparse.ArgumentParser()
p.add_argument('packs', nargs='+', type=Path)
p.add_argument('--source-pack', required=True)
p.add_argument('--expected-articles', type=int, required=True)
p.add_argument('--expected-images', type=int, required=True)
a=p.parse_args()
articles={}; rows={}; blobs={}
def visit(source, depth=0):
    if depth>6: raise ValueError('Nested archive limit')
    with zipfile.ZipFile(source) as z:
        for e in z.infolist():
            if e.is_dir(): continue
            name=Path(e.filename).name
            if '..' in Path(e.filename).parts or Path(e.filename).is_absolute() or e.file_size>30_000_000: raise ValueError('Unsafe archive entry')
            raw=z.read(e)
            if name.endswith('.zip'): visit(io.BytesIO(raw),depth+1)
            elif name.endswith('.png'):
                if name in blobs and blobs[name]!=raw: raise ValueError('Conflicting PNG '+name)
                blobs[name]=raw
            elif name.endswith('.json') and 'PRODUCTIZED_' in name:
                obj=json.loads(raw); key=obj['canonicalId']
                if key in articles and articles[key]!=obj: raise ValueError('Conflicting article '+key)
                articles[key]=obj
            elif name.endswith('.json') and 'MANIFEST' in name:
                for row in json.loads(raw)['assets']:
                    key=row['fileName']
                    if key in rows and rows[key]!=row: raise ValueError('Conflicting manifest '+key)
                    rows[key]=row
for pack in a.packs: visit(pack)
manifest=json.loads((CONTENT/'visual-manifest.json').read_text())
existing={r['fileName']:r for r in manifest['assets']}
for key,obj in articles.items():
    if not key or any(c not in 'abcdefghijklmnopqrstuvwxyz0123456789-' for c in key): raise ValueError('Invalid canonical ID')
    dest=ARTICLES/(key+'.json')
    if dest.exists() and json.loads(dest.read_text())!=obj: raise ValueError('Existing article differs: '+key)
for key,row in rows.items():
    if key not in blobs or hashlib.sha256(blobs[key]).hexdigest()!=row['sha256']: raise ValueError('SHA mismatch '+key)
    if key in existing and existing[key]!=row: raise ValueError('Existing manifest differs '+key)
    dest=MEDIA/key
    if dest.exists() and dest.read_bytes()!=blobs[key]: raise ValueError('Existing image differs '+key)
if set(rows)!=set(blobs): raise ValueError('Manifest/image mismatch')
if len(set(p.stem for p in ARTICLES.glob('*.json'))|set(articles))!=a.expected_articles: raise ValueError('Article total mismatch')
if len(set(existing)|set(rows))!=a.expected_images: raise ValueError('Image total mismatch')
for key,obj in articles.items():
    dest=ARTICLES/(key+'.json')
    if not dest.exists(): dump(dest,obj)
for key,blob in blobs.items():
    dest=MEDIA/key
    if not dest.exists(): dest.write_bytes(blob)
existing.update(rows)
dump(CONTENT/'visual-manifest.json',{'schemaVersion':'1.0','sourcePack':a.source_pack,'assets':list(existing.values())})
validate(False)
