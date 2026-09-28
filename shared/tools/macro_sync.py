"""Safe, incremental MEDIA_READY import for a Web content tree.

Default is read-only. Use --apply for a prevalidated merge; --verify additionally
runs the Web gates. An unchanged canonical article or PNG is never rewritten.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import os
import re
import shutil
import subprocess
import tempfile
import time
import zipfile
from collections import defaultdict
from itertools import zip_longest
from pathlib import Path
from urllib.parse import urlparse

from sync_content import ROOT, dump, validate

ID = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)*\Z")
SHA = re.compile(r"[a-f0-9]{64}\Z")
MAX_ENTRY = 30_000_000
MAX_ARCHIVE = 700_000_000


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def canonical(data: object) -> bytes:
    return json.dumps(data, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()


def row_from_group(group: dict, locale: str) -> dict:
    variant = group["localizedFiles"][locale]
    return {
        "assetId": group["assetId"], "caseId": group["canonicalId"],
        "role": group["role"], "assetKind": group["kind"], "locale": locale,
        "fileName": variant["fileName"], "sha256": variant["sha256"],
        "width": variant["width"], "height": variant["height"],
        "rightsStatus": group["rightsStatus"],
        "license": "Mystery Atlas project-original", "commercialUseAllowed": True,
        "derivativesAllowed": True, "attributionRequired": False,
        "isDocumentaryEvidence": group["isDocumentaryEvidence"],
        "isReconstruction": group.get("isReconstruction", False),
        "captionKo": group["captionKo"], "captionEn": group["captionEn"],
        "altKo": group.get("altKo") or group["captionKo"],
        "altEn": group.get("altEn") or group["captionEn"],
        "sourceRefs": group["sourceRefs"],
        "qaState": "FACT_QA_PASS_VISUAL_QA_PASS", "applicationState": "RIGHTS_QA_PASS",
    }


class Source:
    def __init__(self) -> None:
        self.articles: dict[str, dict] = {}
        self.rows: dict[str, dict] = {}
        self.blobs: dict[str, bytes] = {}
        self.groups: set[tuple[str, str]] = set()
        self.variants: set[tuple[str, str, str]] = set()
        self.source_name = ""

    def article(self, obj: dict) -> None:
        key = obj.get("canonicalId")
        if not isinstance(key, str) or not ID.fullmatch(key) or key in self.articles:
            raise ValueError(f"Duplicate or invalid canonicalId: {key}")
        self.articles[key] = obj

    def manifest(self, obj: dict) -> None:
        if "delete" in obj or "deleted" in obj:
            raise ValueError("Unexpected delete directive: explicit migration review required")
        if "assets" in obj:
            rows = obj["assets"]
        elif "assetGroups" in obj:
            rows = [row_from_group(group, locale) for group in obj["assetGroups"] for locale in ("ko", "en")]
        else:
            raise ValueError("Unsupported visual manifest")
        for row in rows:
            key = row["fileName"]
            group = (row["caseId"], row["assetId"])
            variant = (*group, row["locale"])
            if key in self.rows or variant in self.variants:
                raise ValueError(f"Duplicate assetId or filename: {group} {key}")
            self.rows[key] = row
            self.groups.add(group)
            self.variants.add(variant)
        self.source_name = obj.get("sourcePack") or obj.get("batch") or self.source_name

    def blob(self, name: str, data: bytes) -> None:
        if name in self.blobs:
            raise ValueError(f"Duplicate PNG: {name}")
        if not re.fullmatch(r"[a-z0-9_-]+__(?:ko|en)\.png", name):
            raise ValueError(f"Unsafe PNG filename: {name}")
        self.blobs[name] = data


def load_source(path: Path) -> Source:
    result = Source()
    path = path.resolve()
    if path.is_dir() and (path / "visual-manifest.json").is_file():
        result.manifest(json.loads((path / "visual-manifest.json").read_text()))
        for article in sorted((path / "articles").glob("*.json")):
            result.article(json.loads(article.read_text()))
        for media in sorted((path / "media").glob("*.png")):
            result.blob(media.name, media.read_bytes())
        result.source_name = result.source_name or path.name
    else:
        archives = sorted(path.rglob("*.zip")) if path.is_dir() else [path]
        if not archives or any(not archive.is_file() for archive in archives):
            raise ValueError(f"No durable package found at {path}")
        total = 0

        def visit(data: Path | io.BytesIO, depth: int = 0) -> None:
            nonlocal total
            if depth > 6:
                raise ValueError("Nested archive exceeds depth limit")
            with zipfile.ZipFile(data) as archive:
                for entry in archive.infolist():
                    if entry.is_dir():
                        continue
                    parts = Path(entry.filename).parts
                    if entry.filename.startswith("/") or ".." in parts or entry.file_size > MAX_ENTRY:
                        raise ValueError(f"Unsafe archive entry: {entry.filename}")
                    total += entry.file_size
                    if total > MAX_ARCHIVE:
                        raise ValueError("Archive exceeds expanded size limit")
                    raw = archive.read(entry)
                    name = Path(entry.filename).name
                    if name.endswith(".zip"):
                        visit(io.BytesIO(raw), depth + 1)
                    elif name.endswith(".png"):
                        result.blob(name, raw)
                    elif name.endswith(".json") and ("PRODUCTIZED_" in name or "articles/" in entry.filename):
                        result.article(json.loads(raw))
                    elif name.endswith(".json") and ("MANIFEST" in name or name == "visual-manifest.json"):
                        result.manifest(json.loads(raw))

        for archive in archives:
            visit(archive)
        result.source_name = path.name
    if not result.articles or not result.rows or set(result.rows) != set(result.blobs):
        raise ValueError(f"Source articles/images/manifest mismatch: {len(result.articles)}/{len(result.blobs)}/{len(result.rows)}")
    grouped: dict[tuple[str, str], set[str]] = defaultdict(set)
    asset_owner: dict[str, str] = {}
    for row in result.rows.values():
        name, locale = row["fileName"], row["locale"]
        owner, asset = row["caseId"], row["assetId"]
        if asset in asset_owner and asset_owner[asset] != owner:
            raise ValueError(f"Duplicate assetId across cases: {asset}")
        asset_owner[asset] = owner
        grouped[(owner, asset)].add(locale)
        if owner not in result.articles or not SHA.fullmatch(row["sha256"]) or sha(result.blobs[name]) != row["sha256"]:
            raise ValueError(f"Orphan asset or SHA mismatch: {name}")
        if not name.endswith(f"__{locale}.png"):
            raise ValueError(f"Wrong locale asset: {name}")
    for group, locales in grouped.items():
        if locales != {"ko", "en"}:
            raise ValueError(f"Missing KO/EN pair: {group}")
    for key, article in result.articles.items():
        source_ids = [s.get("sourceId") for s in article.get("sources", [])]
        if not source_ids or len(source_ids) != len(set(source_ids)):
            raise ValueError(f"Missing/duplicate sourceId: {key}")
        for source in article["sources"]:
            parsed = urlparse(source.get("url", ""))
            if parsed.scheme not in ("http", "https") or not parsed.netloc:
                raise ValueError(f"Malformed source URL: {key}:{source.get('sourceId')}")
        for claim in article.get("claims", []):
            if not claim.get("sourceRefs") or not set(claim["sourceRefs"]).issubset(source_ids):
                raise ValueError(f"Broken claim sourceRef: {key}:{claim.get('claimId')}")
        visual_ids = set()
        for visual in article.get("visuals", []):
            asset = visual.get("assetId")
            if asset in visual_ids or not set(visual.get("sourceRefs", [])).issubset(source_ids):
                raise ValueError(f"Duplicate assetId or broken visual sourceRef: {key}:{asset}")
            visual_ids.add(asset)
            for locale in ("ko", "en"):
                variant = visual.get("localizedFiles", {}).get(locale, {})
                row = result.rows.get(variant.get("fileName"))
                if row is None or row["sha256"] != variant.get("sha256") or (row["caseId"], row["assetId"], row["locale"]) != (key, asset, locale):
                    raise ValueError(f"Broken visual ref: {key}:{asset}:{locale}")
        if visual_ids != {asset for owner, asset in grouped if owner == key}:
            raise ValueError(f"Orphan visual group: {key}")
    return result


def version(article: dict) -> tuple[int, ...] | None:
    explicit = article.get("contentVersion") or article.get("editorialVersion")
    if isinstance(explicit, str) and re.fullmatch(r"\d+(?:\.\d+)*", explicit):
        return tuple(map(int, explicit.split(".")))
    batch = article.get("mediaPackage", {}).get("batch", "")
    match = re.search(r"BATCH(\d+)\b", str(batch), flags=re.IGNORECASE)
    return (int(match.group(1)),) if match else None


def strictly_newer(candidate: tuple[int, ...] | None, current: tuple[int, ...] | None) -> bool:
    if candidate is None or current is None:
        return False
    pairs = list(zip_longest(candidate, current, fillvalue=0))
    return tuple(a for a, _ in pairs) > tuple(b for _, b in pairs)


def plan_sync(source: Source, content: Path) -> dict:
    existing = {p.stem: json.loads(p.read_text()) for p in (content / "articles").glob("*.json")}
    current_manifest = json.loads((content / "visual-manifest.json").read_text())
    rows = {row["fileName"]: row for row in current_manifest["assets"]}
    if len(existing) != len(list((content / "articles").glob("*.json"))) or len(rows) != len(current_manifest["assets"]):
        raise ValueError("Target duplicate article/manifest entry")
    add, update, same = [], [], []
    for key, article in source.articles.items():
        before = existing.get(key)
        if before is None:
            add.append(key)
        elif canonical(before) == canonical(article):
            same.append(key)
        else:
            old_ver, new_ver = version(before), version(article)
            if not strictly_newer(new_ver, old_ver):
                raise ValueError(f"Existing article differs without strictly newer durable version: {key} ({old_ver} -> {new_ver})")
            update.append(key)
    add_rows, update_rows = [], []
    for name, row in source.rows.items():
        before = rows.get(name)
        media = content / "media" / name
        if before is None:
            if media.exists():
                raise ValueError(f"Orphan target PNG collision: {name}")
            add_rows.append(name)
        else:
            if not media.is_file() or sha(media.read_bytes()) != before["sha256"]:
                raise ValueError(f"Target SHA mismatch: {name}")
            if before["sha256"] != row["sha256"]:
                raise ValueError(f"Existing PNG SHA changed; use a new asset filename: {name}")
            if before != row:
                if row["caseId"] not in update:
                    raise ValueError(f"Manifest changed without newer article: {name}")
                update_rows.append(name)
    current_media = {p.name for p in (content / "media").glob("*.png")}
    if current_media != set(rows):
        raise ValueError(f"Target orphan/missing media: {len(current_media - set(rows))}/{len(set(rows) - current_media)}")
    groups = {(source.rows[n]["caseId"], source.rows[n]["assetId"]) for n in add_rows}
    return {"source": source.source_name, "targetArticles": len(existing), "sourceArticles": len(source.articles),
            "addArticles": sorted(add), "updateArticles": sorted(update), "sameArticles": len(same),
            "addVisualGroups": len(groups), "addImages": sorted(add_rows), "updateManifestRows": sorted(update_rows),
            "finalArticles": len(existing) + len(add), "finalVisualGroups": (len(rows) + len(add_rows)) // 2,
            "finalImages": len(rows) + len(add_rows), "deletes": 0}


def apply(source: Source, content: Path, plan: dict, root: Path) -> Path | None:
    if not (plan["addArticles"] or plan["updateArticles"] or plan["addImages"] or plan["updateManifestRows"]):
        return None
    with tempfile.TemporaryDirectory(prefix="mystery-atlas-sync-") as tmp:
        stage = Path(tmp)
        stage_content = stage / "shared" / "content"
        shutil.copytree(content, stage_content)
        for key in plan["addArticles"] + plan["updateArticles"]:
            dump(stage_content / "articles" / f"{key}.json", source.articles[key])
        for name in plan["addImages"]:
            (stage_content / "media" / name).write_bytes(source.blobs[name])
        manifest = json.loads((stage_content / "visual-manifest.json").read_text())
        index = {row["fileName"]: n for n, row in enumerate(manifest["assets"])}
        for name in plan["updateManifestRows"]:
            manifest["assets"][index[name]] = source.rows[name]
        manifest["assets"].extend(source.rows[name] for name in plan["addImages"])
        manifest["sourcePack"] = source.source_name
        dump(stage_content / "visual-manifest.json", manifest)
        report = validate(False, root=stage)
        if (report["articles"], report["visualGroups"], report["localizedImages"]) != (plan["finalArticles"], plan["finalVisualGroups"], plan["finalImages"]):
            raise ValueError("Staged totals differ from dry-run plan")
        generated = stage / "web" / "src" / "content" / "productized-loaders.generated.ts"
        destinations = [content / "articles" / f"{key}.json" for key in plan["addArticles"] + plan["updateArticles"]]
        destinations += [content / "media" / name for name in plan["addImages"]]
        destinations += [content / "visual-manifest.json", content / "index.json", root / "web" / "src" / "content" / "productized-loaders.generated.ts"]
        sources = [(stage_content / target.relative_to(content)) if target.is_relative_to(content) else generated for target in destinations]
        checkpoint = root / ".sync-checkpoints" / time.strftime("%Y%m%d-%H%M%S")
        checkpoint.mkdir(parents=True, exist_ok=False)
        baseline = subprocess.run(["git", "rev-parse", "HEAD"], cwd=root, capture_output=True, text=True, check=False).stdout.strip()
        records = []
        for target, candidate in zip(destinations, sources):
            rel = target.relative_to(root)
            backup = checkpoint / rel
            existed = target.exists()
            if existed:
                backup.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(target, backup)
            records.append({"path": str(rel), "oldSha256": sha(target.read_bytes()) if existed else None, "newSha256": sha(candidate.read_bytes())})
        dump(checkpoint / "checkpoint.json", {"baseHead": baseline, "plan": plan, "files": records})
        written = []
        try:
            for target, candidate in zip(destinations, sources):
                target.parent.mkdir(parents=True, exist_ok=True)
                temp_target = target.with_name(target.name + ".sync-tmp")
                shutil.copyfile(candidate, temp_target)
                os.replace(temp_target, target)
                written.append(target)
            post = validate(False, root=root)
            if (post["articles"], post["visualGroups"], post["localizedImages"]) != (plan["finalArticles"], plan["finalVisualGroups"], plan["finalImages"]):
                raise ValueError("Post-apply totals mismatch")
        except Exception:
            for target in reversed(written):
                backup = checkpoint / target.relative_to(root)
                if backup.is_file():
                    shutil.copy2(backup, target)
                else:
                    target.unlink(missing_ok=True)
            raise
        return checkpoint


def verify_web(root: Path) -> None:
    web = root / "web"
    for command in (["npm", "run", "lint"], ["npm", "run", "typecheck"], ["npm", "run", "test"], ["npm", "run", "build"], ["npm", "run", "check:static"]):
        subprocess.run(command, cwd=web, env={**os.environ, "NEXT_PUBLIC_MYSTERY_ATLAS_BASE_PATH": "/MysteryAtlas", "NEXT_PUBLIC_SITE_URL": "https://rhtngudwls2-lang.github.io"}, check=True)
    subprocess.run(["python3", "shared/tools/audit_static_metadata.py"], cwd=root, check=True)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True, help="Runtime content directory or durable nested ZIP/directory of ZIPs")
    parser.add_argument("--target", choices=["web"], default="web")
    parser.add_argument("--content-root", type=Path, default=ROOT, help="Repository root (fixture override)")
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--dry-run", action="store_true", help="Default; does not change target files")
    mode.add_argument("--apply", action="store_true", help="Prevalidate, checkpoint, then merge")
    parser.add_argument("--verify", action="store_true", help="After apply run lint, typecheck, unit, build, and static links")
    options = parser.parse_args()
    if options.verify and not options.apply:
        parser.error("--verify requires --apply")
    root = options.content_root.resolve()
    content = root / "shared" / "content"
    source = load_source(options.source)
    plan = plan_sync(source, content)
    print(json.dumps({"mode": "apply" if options.apply else "dry-run", **plan}, ensure_ascii=False))
    if options.apply:
        checkpoint = apply(source, content, plan, root)
        print(json.dumps({"checkpoint": str(checkpoint) if checkpoint else None, "applied": checkpoint is not None}))
        if options.verify:
            verify_web(root)


if __name__ == "__main__":
    main()
