#!/usr/bin/env python3
"""Host regressions for ZIP source identity / SDK lookup; never mock a successful APK build."""
import importlib.util
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("atlas_build_identity", Path(__file__).with_name("android-record-build.py"))
identity = importlib.util.module_from_spec(spec)
spec.loader.exec_module(identity)


class BuildIdentityTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.original_root = identity.ROOT
        identity.ROOT = self.root
        (self.root / "app/src/main").mkdir(parents=True)
        (self.root / "app/src/main/Example.kt").write_text("class Example\n")
        (self.root / "app/build.gradle.kts").write_text("// build input\n")
        self.env = patch.dict(os.environ, {}, clear=True)
        self.env.start()

    def tearDown(self):
        self.env.stop()
        identity.ROOT = self.original_root
        self.temp.cleanup()

    def test_zip_without_git_has_stable_nonempty_identity(self):
        self.assertFalse((self.root / ".git").exists())
        first = identity.source_identity()
        self.assertEqual(first, identity.source_identity())
        self.assertEqual(2, len(first["files"]))
        self.assertEqual(64, len(first["sha256"]))

    def test_changed_app_or_test_source_changes_identity(self):
        first = identity.source_identity()["sha256"]
        (self.root / "app/src/main/Example.kt").write_text("class Changed\n")
        second = identity.source_identity()["sha256"]
        self.assertNotEqual(first, second)
        (self.root / "app/src/androidTest").mkdir()
        (self.root / "app/src/androidTest/Check.kt").write_text("class Check\n")
        self.assertNotEqual(second, identity.source_identity()["sha256"])

    def test_build_outputs_and_qa_reports_do_not_change_identity(self):
        first = identity.source_identity()
        for name in ["app/build/generated/Example.kt", "build/qa/results.json", "qa/local-validation/report.md"]:
            path = self.root / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text("generated output\n")
        self.assertEqual(first, identity.source_identity())

    def test_local_properties_sdk_dir_with_escaped_spaces(self):
        (self.root / "local.properties").write_text("# Android Studio\nsdk.dir=/opt/android\\ sdk\n")
        self.assertEqual(Path("/opt/android sdk"), identity.sdk_directory())

    def test_environment_sdk_wins_over_local_properties(self):
        (self.root / "local.properties").write_text("sdk.dir=/unused\n")
        with patch.dict(os.environ, {"ANDROID_HOME": "/chosen"}):
            self.assertEqual(Path("/chosen"), identity.sdk_directory())

    def test_missing_sdk_fails_explicitly(self):
        with self.assertRaisesRegex(RuntimeError, "Android SDK path"):
            identity.sdk_directory()


if __name__ == "__main__":
    unittest.main(verbosity=2)
