#!/usr/bin/env python3
"""Offline integrity gates. These checks do not claim Android execution or factual truth."""
import hashlib
import json
import re
import sys
import xml.etree.ElementTree as ET
from datetime import date
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "app/src/main/assets"
REPORT = []
EPISTEMIC = {
    "CONFIRMED", "SUPPORTED", "DISPUTED", "ALLEGED", "UNVERIFIED",
    "DEBUNKED", "OUTDATED", "CLAIM", "LEGEND",
}
SLUG_ID = re.compile(r"[a-z0-9][a-z0-9_-]*")
EVIDENCE_ID = re.compile(r"(?:[a-z0-9][a-z0-9_-]*|[CRL][0-9]{2})")
RELATION_TYPES = {
    "similar_case", "same_country", "same_era", "same_theme",
    "related_person", "related_place", "derived_conspiracy",
    "skeptical_explanation", "evidence_pattern", "question_based",
}
HTTP_SOURCE_EXCEPTIONS = {
    "http://www.ianridpath.com/ufo/rendlesham2.html",
}
CORE = {"cooper", "voynich", "mary-celeste", "dyatlov", "wow"}
REQUIRED_CATEGORIES = {
    "우리는 혼자인가", "죽음 너머에서", "설명할 수 없는 것들", "역사가 설명하지 못한 것들",
    "신과 악마 사이", "인간이 아니었던 것들", "사라진 사람들, 남겨진 흔적", "누군가는 숨기고 있다",
}


def require(condition, detail):
    if not condition:
        raise AssertionError(detail)


def passed(detail):
    REPORT.append({"check": detail, "status": "PASS"})
    print("PASS", detail)


def read_json(path):
    def unique_pairs(pairs):
        result = {}
        for key, value in pairs:
            require(key not in result, f"Duplicate JSON key: {path}: {key}")
            result[key] = value
        return result
    return json.loads(path.read_text(encoding="utf-8"), object_pairs_hook=unique_pairs)


def text(value, where):
    require(isinstance(value, str) and value.strip(), f"Missing text: {where}")
    require("\ufffd" not in value, f"Invalid Unicode replacement character: {where}")
    require(not re.search(r"\b(?:TODO|Lorem ipsum|PLACEHOLDER_TEXT)\b", value, re.I), f"Unfinished copy: {where}")


def localized(value, where):
    require(isinstance(value, dict), f"Expected localized object: {where}")
    for language in ("ko", "en"):
        text(value.get(language), f"{where}.{language}")


def dated(value, where):
    text(value, where)
    try:
        parsed = date.fromisoformat(value)
    except ValueError as error:
        raise AssertionError(f"Invalid ISO date: {where}: {value}") from error
    require(parsed <= date.today(), f"Future verification/publication date: {where}")


def unique_ids(items, where, pattern=SLUG_ID):
    require(isinstance(items, list), f"Expected array: {where}")
    ids = [entry.get("id") for entry in items]
    require(all(isinstance(i, str) and pattern.fullmatch(i) for i in ids), f"Invalid IDs: {where}")
    require(len(ids) == len(set(ids)), f"Duplicate IDs: {where}")
    return set(ids)


def asset_path(value, where):
    text(value, where)
    path = (ASSETS / value).resolve()
    require(path.is_relative_to(ASSETS.resolve()), f"Asset path escapes package: {where}")
    require(path.is_file(), f"Missing asset: {where}: {value}")
    return path


def main():
    catalog = read_json(ASSETS / "v2/catalog.json")
    require(catalog.get("schemaVersion") == 2, "V2 catalog schema version must be 2")
    categories = catalog["categories"]
    stories = catalog["cases"]
    category_ids = unique_ids(categories, "categories")
    case_ids = unique_ids(stories, "cases")
    require(CORE <= case_ids, "Missing core content")
    require(len(category_ids) == 8, "The approved navigation requires eight categories")
    require({c["name"]["ko"] for c in categories} == REQUIRED_CATEGORIES, "Category names differ from approved specification")
    required_image_paths = set()
    for category in categories:
        for field in ("name", "hook"):
            localized(category[field], f"category {category['id']}.{field}")
        asset_path(category["image"], f"category {category['id']}.image")
        required_image_paths.add(category["image"])
    passed(f"V2 schema, {len(case_ids)} unique cases, eight approved bilingual categories")

    article_count = evidence_count = source_count = 0
    for story in stories:
        identifier = story["id"]
        for field in ("canonicalTitle", "year", "resolutionCode"):
            text(story.get(field), f"{identifier}.{field}")
        for field in ("headline", "hook", "status", "country"):
            localized(story.get(field), f"{identifier}.{field}")
        require(story["headline"]["ko"] != story["canonicalTitle"], f"Canonical-title-only card: {identifier}")
        for language in ("ko", "en"):
            minutes = story["minutes"][language]
            require(isinstance(minutes, int) and not isinstance(minutes, bool) and 1 <= minutes <= 60, f"Invalid reading time: {identifier}.{language}")
        require(story["categoryIds"] and set(story["categoryIds"]) <= category_ids, f"Unknown or empty categories: {identifier}")
        for field in ("tags", "aliases"):
            require(isinstance(story.get(field), list) and story[field], f"Search metadata missing: {identifier}.{field}")
            for value in story[field]:
                text(value, f"{identifier}.{field}")
        for field in ("persons", "locations", "dates"):
            require(isinstance(story.get(field), list), f"Extensible entity collection missing: {identifier}.{field}")
        dated(story["publishedAt"], f"{identifier}.publishedAt")
        require(story["related"], f"Dead-end article: {identifier}")
        targets = []
        for edge in story["related"]:
            target = edge["caseId"]
            require(target in case_ids and target != identifier, f"Broken/self Rabbit Hole link: {identifier}->{target}")
            localized(edge["reason"], f"related reason {identifier}->{target}")
            relation = edge.get("type")
            if relation is not None:
                require(isinstance(relation, dict) and len(relation) == 1, f"Invalid Rabbit Hole type: {identifier}->{target}")
                relation_name, relation_value = next(iter(relation.items()))
                require(relation_name == relation_value and relation_name in RELATION_TYPES, f"Unknown Rabbit Hole type: {identifier}->{target}")
            targets.append(target)
        require(len(targets) == len(set(targets)), f"Duplicate Rabbit Hole targets: {identifier}")
        if story.get("image"):
            asset_path(story["image"], f"{identifier}.image")
            required_image_paths.add(story["image"])
        else:
            images = story.get("images")
            require(isinstance(images, list) and images, f"Missing image metadata: {identifier}")
            hero = next((image for image in images if image.get("role") == "hero"), None)
            require(
                hero is not None
                and SLUG_ID.fullmatch(hero.get("id", ""))
                and hero.get("path") == ""
                and isinstance(hero.get("provenance"), str)
                and hero["provenance"].strip()
                and hero.get("reconstruction") is False,
                f"Invalid missing-image state: {identifier}",
            )

        article = read_json(asset_path(story["article"], f"{identifier}.article"))
        require(article["caseId"] == identifier, f"Article belongs to wrong case: {identifier}")
        dated(article["verifiedAt"], f"{identifier}.verifiedAt")
        localized(article["summary"], f"{identifier}.summary")
        section_ids = unique_ids(article["sections"], f"{identifier}.sections")
        evidence_ids = unique_ids(article["evidence"], f"{identifier}.evidence", EVIDENCE_ID)
        source_ids = unique_ids(article["sources"], f"{identifier}.sources")
        require(section_ids and evidence_ids and source_ids, f"Incomplete article: {identifier}")
        for source in article["sources"]:
            for field in ("title", "publisher"):
                text(source[field], f"{identifier}.{source['id']}.{field}")
            source_url = source["url"]
            url = urlparse(source_url)
            secure_url = url.scheme == "https" and url.netloc and not url.username and not url.password
            require(secure_url or source_url in HTTP_SOURCE_EXCEPTIONS, f"Invalid HTTPS source URL: {identifier}.{source['id']}")
            dated(source["accessedAt"], f"{identifier}.{source['id']}.accessedAt")
        for section in article["sections"]:
            text(section["type"], f"{identifier}.{section['id']}.type")
            localized(section["title"], f"{identifier}.{section['id']}.title")
            localized(section["body"], f"{identifier}.{section['id']}.body")
            require(set(section.get("sourceIds", [])) <= source_ids, f"Unknown section source: {identifier}.{section['id']}")
            if section.get("image"):
                asset_path(section["image"], f"{identifier}.{section['id']}.image")
                required_image_paths.add(section["image"])
        for evidence in article["evidence"]:
            require(evidence["status"] in EPISTEMIC, f"Evidence conflates fact/claim/legend: {identifier}.{evidence['id']}")
            localized(evidence["text"], f"{identifier}.{evidence['id']}.text")
            require(evidence["sourceIds"] and set(evidence["sourceIds"]) <= source_ids, f"Untraceable evidence: {identifier}.{evidence['id']}")
        article_count += 1
        evidence_count += len(evidence_ids)
        source_count += len(source_ids)
        passed(f"{identifier}: bilingual article, live asset paths, evidence/source references and Rabbit Hole targets")

    manifest = read_json(ASSETS / "v2/image-rights.json")
    unique_ids(manifest["images"], "image rights")
    licensed_paths = set()
    for image in manifest["images"]:
        path = asset_path(image["path"], "image rights path")
        require(image["path"] not in licensed_paths, f"Duplicate image provenance: {image['path']}")
        licensed_paths.add(image["path"])
        require(image["type"] == "AI_GENERATED_EDITORIAL_ILLUSTRATION", f"Review required for new image type: {image['path']}")
        require(image["rightsBasis"] == "DIRECTLY_GENERATED_FOR_THIS_PROJECT", f"Missing accepted rights basis: {image['path']}")
        require(image["isEvidence"] is False, f"Generated image marked as historical evidence: {image['path']}")
        for field in ("rightsNote", "generator", "prompt", "limitations", "originalSha256"):
            text(image.get(field), f"{image['path']}.{field}")
        localized(image["caption"], f"{image['path']}.caption")
        localized(image["alt"], f"{image['path']}.alt")
        require(image["bytes"] == path.stat().st_size, f"Image size differs from provenance: {image['path']}")
        require(image["sha256"] == hashlib.sha256(path.read_bytes()).hexdigest(), f"Image hash differs from provenance: {image['path']}")
        require(len(image["dimensions"]) == 2 and min(image["dimensions"]) >= 600, f"Insufficient source image dimensions: {image['path']}")
    require(required_image_paths <= licensed_paths, f"Unlicensed referenced image: {required_image_paths - licensed_paths}")
    packaged = {p.relative_to(ASSETS).as_posix() for p in (ASSETS / "images").glob("*") if p.is_file()}
    require(packaged <= licensed_paths, f"Untracked packaged image: {packaged - licensed_paths}")
    passed(f"All {len(licensed_paths)} packaged images have matching hashes, dimensions and generation provenance")

    manifest_xml = ET.parse(ROOT / "app/src/main/AndroidManifest.xml").getroot()
    require(not manifest_xml.findall("uses-permission"), "Offline prototype unexpectedly declares permissions")
    android = "{http://schemas.android.com/apk/res/android}"
    app = manifest_xml.find("application")
    require(app is not None and app.get(android + "allowBackup") == "false", "Cloud backup must remain disabled")
    require(not any(node.get(android + "exported") == "true" for node in app.findall("provider") + app.findall("service") + app.findall("receiver")), "Unreviewed exported component")
    for legacy in ("cases.json", "world.json"):
        require(not (ASSETS / legacy).exists(), f"V1 data/map still shipped: {legacy}")
    require(not (ROOT / "app/src/androidTest/java/org/mysteryatlas/CoreFlowTest.kt").exists(), "Obsolete map/game test still enabled")
    passed("Offline permission/backup gate; V1 content, map and game test absent from active app")
    passed(f"TOTAL: {article_count} articles, {evidence_count} evidence records, {source_count} source records")
    print("NOTE: Static integrity checks only. Fact accuracy, Android runtime and visual quality require independent evidence.")


if __name__ == "__main__":
    try:
        main()
    except (AssertionError, KeyError, ValueError, OSError, TypeError) as error:
        REPORT.append({"check": str(error), "status": "FAIL"})
        print("FAIL", error, file=sys.stderr)
        sys.exit(1)
    finally:
        output = ROOT / "build/qa/host-integrity.json"
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(json.dumps({"scope": "OFFLINE_STATIC_INTEGRITY_ONLY", "checks": REPORT}, ensure_ascii=False, indent=2), encoding="utf-8")
