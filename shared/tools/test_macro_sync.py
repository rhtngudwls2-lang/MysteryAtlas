"""Fixture tests use two existing published article/media records, never invented facts."""
import copy
import hashlib
import json
import shutil
import tempfile
import unittest
import zipfile
from pathlib import Path

from macro_sync import apply, load_source, plan_sync
from sync_content import ROOT, dump, validate

LIVE = ROOT / "shared" / "content"
MANIFEST = json.loads((LIVE / "visual-manifest.json").read_text())


def fixture_case(root: Path, key: str) -> None:
    (root / "articles").mkdir(parents=True, exist_ok=True)
    (root / "media").mkdir(parents=True, exist_ok=True)
    shutil.copy2(LIVE / "articles" / f"{key}.json", root / "articles" / f"{key}.json")
    for row in MANIFEST["assets"]:
        if row["caseId"] == key:
            shutil.copy2(LIVE / "media" / row["fileName"], root / "media" / row["fileName"])
    rows = [row for row in MANIFEST["assets"] if row["caseId"] == key]
    existing = json.loads((root / "visual-manifest.json").read_text())["assets"] if (root / "visual-manifest.json").exists() else []
    dump(root / "visual-manifest.json", {"schemaVersion": "1.0", "sourcePack": "test-existing-durable", "assets": existing + rows})


class MacroSyncTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name) / "fixture-repo"
        self.target = self.root / "shared" / "content"
        self.source = Path(self.tmp.name) / "durable"
        fixture_case(self.target, "crystal-skull")
        fixture_case(self.source, "crystal-skull")

    def load_plan(self):
        obj = load_source(self.source)
        return obj, plan_sync(obj, self.target)

    def append(self):
        fixture_case(self.source, "acoustic-kitty")

    def test_noop_dry_run_does_not_write(self):
        before = hashlib.sha256((self.target / "articles" / "crystal-skull.json").read_bytes()).hexdigest()
        _, plan = self.load_plan()
        self.assertEqual((plan["addArticles"], plan["addImages"], plan["updateArticles"]), ([], [], []))
        self.assertEqual(before, hashlib.sha256((self.target / "articles" / "crystal-skull.json").read_bytes()).hexdigest())
        self.assertFalse((self.root / ".sync-checkpoints").exists())

    def test_append_and_apply_preserves_existing(self):
        self.append()
        before = (self.target / "articles" / "crystal-skull.json").read_bytes()
        obj, plan = self.load_plan()
        self.assertEqual(plan["addArticles"], ["acoustic-kitty"])
        self.assertEqual(plan["addVisualGroups"], 2)
        self.assertEqual(len(plan["addImages"]), 4)
        checkpoint = apply(obj, self.target, plan, self.root)
        self.assertIsNotNone(checkpoint)
        self.assertEqual((self.target / "articles" / "crystal-skull.json").read_bytes(), before)
        self.assertEqual(validate(False, root=self.root)["articles"], 2)
        self.assertTrue((checkpoint / "checkpoint.json").exists())

    def test_newer_same_canonical_id(self):
        path = self.target / "articles" / "crystal-skull.json"
        base = json.loads(path.read_text())
        base["contentVersion"] = "1.0"
        dump(path, base)
        changed = copy.deepcopy(base)
        changed["contentVersion"] = "1.1"
        dump(self.source / "articles" / path.name, changed)
        obj, plan = self.load_plan()
        self.assertEqual(plan["updateArticles"], ["crystal-skull"])
        apply(obj, self.target, plan, self.root)
        self.assertEqual(json.loads(path.read_text())["contentVersion"], "1.1")

    def test_same_or_older_version_rejected(self):
        path = self.source / "articles" / "crystal-skull.json"
        obj = json.loads(path.read_text())
        obj["contentVersion"] = "0.1"
        dump(path, obj)
        with self.assertRaisesRegex(ValueError, "strictly newer"):
            self.load_plan()

    def test_mixed_revision_scales_do_not_compare_directly(self):
        path = self.source / "articles" / "crystal-skull.json"
        candidate = json.loads(path.read_text())
        candidate["contentVersion"] = "1.1"
        dump(path, candidate)
        with self.assertRaisesRegex(ValueError, "strictly newer"):
            self.load_plan()
        old_batch = candidate["mediaPackage"]["batch"]
        import re
        number = int(re.search(r"BATCH(\d+)", old_batch).group(1))
        candidate["mediaPackage"]["batch"] = re.sub(r"BATCH\d+", f"BATCH{number + 1}", old_batch)
        dump(path, candidate)
        self.assertEqual(self.load_plan()[1]["updateArticles"], ["crystal-skull"])
        current_path = self.target / "articles" / "crystal-skull.json"
        current = json.loads(current_path.read_text())
        current["contentVersion"] = "1.0"
        dump(current_path, current)
        candidate.pop("contentVersion")
        dump(path, candidate)
        with self.assertRaisesRegex(ValueError, "strictly newer"):
            self.load_plan()

    def test_duplicate_canonical_id_rejected(self):
        article = json.loads((self.source / "articles" / "crystal-skull.json").read_text())
        from macro_sync import Source
        obj = Source()
        obj.article(article)
        with self.assertRaisesRegex(ValueError, "Duplicate.*canonicalId"):
            obj.article(article)

    def test_duplicate_asset_id_rejected(self):
        from macro_sync import Source
        obj = Source()
        manifest = json.loads((self.source / "visual-manifest.json").read_text())
        obj.manifest(manifest)
        with self.assertRaisesRegex(ValueError, "Duplicate assetId"):
            obj.manifest(manifest)

    def test_missing_ko_rejected(self):
        self.remove_locale("ko")
        with self.assertRaisesRegex(ValueError, "Missing KO/EN"):
            load_source(self.source)

    def test_missing_en_rejected(self):
        self.remove_locale("en")
        with self.assertRaisesRegex(ValueError, "Missing KO/EN"):
            load_source(self.source)

    def remove_locale(self, locale):
        manifest = self.source / "visual-manifest.json"
        data = json.loads(manifest.read_text())
        removed = [r["fileName"] for r in data["assets"] if r["locale"] == locale]
        data["assets"] = [r for r in data["assets"] if r["locale"] != locale]
        dump(manifest, data)
        for name in removed:
            (self.source / "media" / name).unlink()

    def test_sha_mismatch_rejected(self):
        blob = next((self.source / "media").glob("*.png"))
        blob.write_bytes(blob.read_bytes() + b"corrupt")
        with self.assertRaisesRegex(ValueError, "SHA mismatch"):
            load_source(self.source)

    def test_broken_claim_source_ref_rejected(self):
        path = self.source / "articles" / "crystal-skull.json"
        data = json.loads(path.read_text())
        data["claims"][0]["sourceRefs"] = ["NO_SUCH_SOURCE"]
        dump(path, data)
        with self.assertRaisesRegex(ValueError, "Broken claim sourceRef"):
            load_source(self.source)

    def test_orphan_asset_rejected(self):
        blob = next((self.source / "media").glob("*.png"))
        shutil.copy2(blob, self.source / "media" / "orphan__ko.png")
        with self.assertRaisesRegex(ValueError, "Source articles/images/manifest mismatch"):
            load_source(self.source)

    def test_unexpected_delete_rejected(self):
        path = self.source / "visual-manifest.json"
        data = json.loads(path.read_text())
        data["delete"] = ["crystal-skull"]
        dump(path, data)
        with self.assertRaisesRegex(ValueError, "Unexpected delete"):
            load_source(self.source)

    def test_nested_durable_asset_groups_pack(self):
        rows = json.loads((self.source / "visual-manifest.json").read_text())["assets"]
        groups = []
        for ko in [row for row in rows if row["locale"] == "ko"]:
            en = next(row for row in rows if row["assetId"] == ko["assetId"] and row["locale"] == "en")
            groups.append({"canonicalId": ko["caseId"], "assetId": ko["assetId"],
                           "role": ko["role"], "kind": ko["assetKind"],
                           "rightsStatus": ko["rightsStatus"], "isDocumentaryEvidence": False,
                           "isReconstruction": ko["isReconstruction"], "captionKo": ko["captionKo"],
                           "captionEn": ko["captionEn"], "altKo": ko["altKo"], "altEn": ko["altEn"],
                           "sourceRefs": ko["sourceRefs"], "localizedFiles": {
                               loc: {k: row[k] for k in ("fileName", "sha256", "width", "height")}
                               for loc, row in (("ko", ko), ("en", en))}})
        nested = Path(self.tmp.name) / "images.zip"
        with zipfile.ZipFile(nested, "w") as z:
            for path in (self.source / "media").glob("*.png"):
                z.write(path, path.name)
        pack = Path(self.tmp.name) / "MEDIA_READY.zip"
        with zipfile.ZipFile(pack, "w") as z:
            z.writestr("MysteryAtlas_PRODUCTIZED_crystal-skull.json", (self.source / "articles" / "crystal-skull.json").read_bytes())
            z.writestr("VISUAL_MANIFEST.json", json.dumps({"assetGroups": groups}).encode())
            z.write(nested, "visuals.zip")
        parsed = load_source(pack)
        self.assertEqual(len(parsed.groups), 2)
        self.assertEqual(plan_sync(parsed, self.target)["addImages"], [])


if __name__ == "__main__":
    unittest.main()
