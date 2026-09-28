"""Import a durable MEDIA_READY pack once; validate canonical content on every build.

No network dependencies. Article JSON in shared/content/articles remains authoritative.
The Web receives a generated, locale-aware media copy during the build.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import re
import shutil
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CONTENT = ROOT / 'shared' / 'content'
ARTICLES = CONTENT / 'articles'
MEDIA = CONTENT / 'media'
WEB_MEDIA = ROOT / 'web' / 'public' / 'media'

def dump(path: Path, obj: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

def import_pack(pack: Path) -> None:
    articles: dict[str, dict] = {}
    manifest_rows: dict[str, dict] = {}
    blobs: dict[str, bytes] = {}

    def visit(stream: Path | io.BytesIO, depth: int = 0) -> None:
        if depth > 6:
            raise ValueError('Nested pack exceeds depth limit')
        with zipfile.ZipFile(stream) as archive:
            for entry in archive.infolist():
                name = entry.filename
                if entry.is_dir():
                    continue
                if '..' in Path(name).parts or entry.file_size > (25_000_000 if name.endswith('.zip') else 3_000_000):
                    raise ValueError(f'Unsafe pack entry {name}')
                raw = archive.read(entry)
                filename = Path(name).name
                if name.endswith('.zip'):
                    visit(io.BytesIO(raw), depth + 1)
                elif name.endswith('.png'):
                    if filename in blobs and blobs[filename] != raw:
                        raise ValueError(f'Conflicting image {filename}')
                    blobs[filename] = raw
                elif 'PRODUCTIZED_' in filename and name.endswith('.json'):
                    article = json.loads(raw)
                    key = article.get('canonicalId')
                    if not isinstance(key, str) or not re.fullmatch(r'[a-z0-9-]+', key) or key in articles:
                        raise ValueError(f'Conflicting canonicalId {key}')
                    articles[key] = article
                elif 'MANIFEST' in filename and name.endswith('.json'):
                    for row in json.loads(raw)['assets']:
                        key = row['fileName']
                        if key in manifest_rows:
                            raise ValueError(f'Duplicate manifest entry {key}')
                        manifest_rows[key] = row

    visit(pack)
    if not articles or not manifest_rows or set(manifest_rows) != set(blobs):
        raise ValueError(f'Pack content mismatch: {len(articles)} articles, {len(manifest_rows)} manifest rows, {len(blobs)} images')
    ARTICLES.mkdir(parents=True, exist_ok=True)
    MEDIA.mkdir(parents=True, exist_ok=True)
    for key, article in articles.items():
        dump(ARTICLES / f'{key}.json', article)
    for key, blob in blobs.items():
        (MEDIA / key).write_bytes(blob)
    dump(CONTENT / 'visual-manifest.json', {'schemaVersion': '1.0', 'sourcePack': pack.name, 'assets': list(manifest_rows.values())})
    print(f'Imported {len(articles)} articles and {len(blobs)} localized images from {pack.name}')

def validate(copy_web: bool) -> dict:
    manifest = json.loads((CONTENT / 'visual-manifest.json').read_text(encoding='utf-8'))
    visual_rows = manifest['assets']
    visual_by_file = {row['fileName']: row for row in visual_rows}
    files = sorted(ARTICLES.glob('*.json'))
    issues: list[str] = []
    if not files or not visual_rows or len(visual_by_file) != len(visual_rows):
        issues.append(f'Invalid article / manifest count: {len(files)} articles, {len(visual_rows)} visual rows')
    for row in visual_rows:
        name = row['fileName']
        path = MEDIA / name
        if not path.is_file():
            issues.append(f'Missing image {name}')
            continue
        if hashlib.sha256(path.read_bytes()).hexdigest() != row['sha256']:
            issues.append(f'Image checksum failed {name}')
        if row.get('locale') not in ('ko', 'en') or row.get('width', 0) <= 0 or row.get('height', 0) <= 0:
            issues.append(f'Invalid image locale or dimensions {name}')
        for field in ('captionKo', 'captionEn', 'altKo', 'altEn', 'role', 'sourceRefs'):
            if not row.get(field):
                issues.append(f'Missing visual {field}: {name}')
        if row.get('rightsStatus') != 'PROJECT_ORIGINAL' or row.get('isDocumentaryEvidence'):
            issues.append(f'Unsupported visual rights/evidence status {name}')

    index = []
    seen = set()
    for path in files:
        article = json.loads(path.read_text(encoding='utf-8'))
        key = article.get('canonicalId')
        if key != path.stem or key in seen or article.get('schemaVersion') != '2.0':
            issues.append(f'Invalid canonical article {path.name}')
            continue
        seen.add(key)
        copy = article.get('localizedCopy', {})
        if set(copy) != {'ko', 'en'}:
            issues.append(f'Invalid locales {key}')
            continue
        ko_blocks = copy['ko'].get('blocks', [])
        en_blocks = copy['en'].get('blocks', [])
        ko_ids = [block.get('blockId') for block in ko_blocks]
        en_ids = [block.get('blockId') for block in en_blocks]
        if ko_ids != en_ids or not ko_ids or len(set(ko_ids)) != len(ko_ids):
            issues.append(f'Invalid paired block IDs {key}')
        for loc in ('ko', 'en'):
            for field in ('headline', 'hook'):
                if not copy[loc].get(field):
                    issues.append(f'Missing {loc}.{field}: {key}')
            # Earlier durable batches store the boundary in the paired final
            # narrative block; later batches also repeat it as a top-level field.
            if not copy[loc].get('factBoundary') and not any(
                block.get('type') == 'FACT_BOUNDARY' and block.get('textKo' if loc == 'ko' else 'textEn')
                for block in copy[loc].get('blocks', [])
            ):
                issues.append(f'Missing {loc} fact boundary: {key}')
            for block in copy[loc].get('blocks', []):
                if any(not block.get(field) for field in ('blockId', 'type', 'headingKo', 'headingEn', 'textKo', 'textEn')):
                    issues.append(f'Incomplete {loc} block {key}:{block.get("blockId")}')
        if not any(block.get('type') == 'FACT_BOUNDARY' for block in ko_blocks):
            issues.append(f'Missing fact boundary {key}')
        source_ids = {s.get('sourceId') for s in article.get('sources', [])}
        if not source_ids or len(source_ids) != len(article.get('sources', [])):
            issues.append(f'Duplicate or missing sources {key}')
        for source in article.get('sources', []):
            if not source.get('url') or not source.get('title') or not source.get('publisher'):
                issues.append(f'Invalid source {key}:{source.get("sourceId")}')
        for claim in article.get('claims', []):
            if any(not claim.get(field) for field in ('claimId', 'status', 'statementKo', 'statementEn')):
                issues.append(f'Incomplete claim {key}:{claim.get("claimId")}')
            if not claim.get('sourceRefs') or not set(claim['sourceRefs']).issubset(source_ids):
                issues.append(f'Invalid claim sources {key}:{claim.get("claimId")}')
        for image in article.get('visuals', []):
            if any(not image.get(field) for field in ('assetId', 'role', 'captionKo', 'captionEn', 'altKo', 'altEn')) or image.get('rightsStatus') != 'PROJECT_ORIGINAL':
                issues.append(f'Incomplete / unsupported visual {key}:{image.get("assetId")}')
            if not set(image.get('sourceRefs', [])).issubset(source_ids):
                issues.append(f'Invalid image sources {key}:{image.get("assetId")}')
            for loc in ('ko', 'en'):
                variant = image.get('localizedFiles', {}).get(loc, {})
                row = visual_by_file.get(variant.get('fileName', ''))
                if row is None or variant.get('sha256') != row.get('sha256') or row.get('caseId') != key or row.get('assetId') != image.get('assetId') or row.get('locale') != loc or row.get('role') != image.get('role'):
                    issues.append(f'Invalid {loc} visual mapping {key}:{image.get("assetId")}')
        meta = article['metadata']
        if any(not meta.get(field) for field in ('primaryGenre', 'resolution')):
            issues.append(f'Missing article metadata {key}')
        hero = next((v for v in article['visuals'] if v['role'] == 'HERO_CONTEXT'), article['visuals'][0])
        index.append({
            'canonicalId': key,
            'title': {'ko': article['identity']['canonicalTitleKo'], 'en': article['identity']['canonicalTitleEn']},
            'headline': {loc: copy[loc]['headline'] for loc in ('ko', 'en')},
            'hook': {loc: copy[loc]['hook'] for loc in ('ko', 'en')},
            'aliases': article['identity']['aliasesKo'] + article['identity']['aliasesEn'] + meta.get('searchAliases', []),
            'genre': meta['primaryGenre'], 'genres': meta.get('secondaryGenres', []),
            'countries': meta.get('countries') or [], 'regions': meta.get('regions') or [],
            'era': meta.get('era', ''), 'resolution': meta.get('resolution', ''),
            'places': meta.get('places', []), 'people': meta.get('people', []),
            'dateRange': meta.get('dateRange') or {},
            'related': meta.get('relatedCases', []),
            'heroAssetId': hero['assetId'],
            'heroFile': {loc: hero['localizedFiles'][loc]['fileName'] for loc in ('ko', 'en')},
            'heroCaption': {loc: hero[f'caption{loc.capitalize()}'] for loc in ('ko', 'en')},
            'heroAlt': {loc: hero[f'alt{loc.capitalize()}'] for loc in ('ko', 'en')},
            'readMinutes': {
                'ko': max(1, (article['quality']['koBodyChars'] + 649) // 650),
                'en': max(1, (article['quality']['enBodyWords'] + 199) // 200),
            },
            'publication': article['publication'],
        })
    if issues:
        raise ValueError('Import validation failed:\n' + '\n'.join(issues[:80]))
    dump(CONTENT / 'index.json', {'schemaVersion': '1.0', 'sourcePack': manifest['sourcePack'], 'items': index})
    loader_lines = [
        '// Generated by shared/tools/sync_content.py. Do not edit by hand.',
        'export const productizedLoaders: Record<string, () => Promise<unknown>> = {',
    ]
    for item in index:
        key = item['canonicalId']
        loader_lines.append(f'  "{key}": () => import("../../../shared/content/articles/{key}.json"),')
    loader_lines.append('};')
    (ROOT / 'web' / 'src' / 'content' / 'productized-loaders.generated.ts').write_text('\n'.join(loader_lines) + '\n', encoding='utf-8')
    if copy_web:
        WEB_MEDIA.mkdir(parents=True, exist_ok=True)
        for row in visual_rows:
            src = MEDIA / row['fileName']
            dest = WEB_MEDIA / row['fileName']
            if not dest.exists() or dest.stat().st_size != src.stat().st_size:
                shutil.copyfile(src, dest)
    report = {'articles': len(index), 'visualGroups': len(visual_rows) // 2, 'localizedImages': len(visual_rows), 'sourcePack': manifest['sourcePack'], 'errors': 0}
    print(json.dumps(report, ensure_ascii=False))
    return report

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--pack', type=Path, help='Import a durable nested MEDIA_READY zip')
    parser.add_argument('--copy-web', action='store_true')
    options = parser.parse_args()
    if options.pack:
        import_pack(options.pack)
    validate(options.copy_web)
