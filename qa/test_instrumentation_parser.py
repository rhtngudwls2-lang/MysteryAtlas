#!/usr/bin/env python3
"""Host regression tests for accepting only complete Android runner logs.

These execute the actual result parser. They do not execute the Android app.
"""
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from xml.etree import ElementTree as ET

PARSER = Path(__file__).with_name("android-check-instrumentation.py")


def event(test="one", code=0, total=1, current=1, stack=None):
    fields = {
        "class": "org.mysteryatlas.FixtureTest", "current": current,
        "numtests": total, "test": test,
    }
    if stack is not None:
        fields["stack"] = stack
    return "".join(f"INSTRUMENTATION_STATUS: {key}={value}\n" for key, value in fields.items()) + f"INSTRUMENTATION_STATUS_CODE: {code}\n"


RUNNER_OK = "INSTRUMENTATION_CODE: -1\n"


class InstrumentationParserTest(unittest.TestCase):
    def check_log(self, raw, expected):
        with tempfile.TemporaryDirectory(prefix="atlas-parser-") as directory:
            log, xml = Path(directory) / "runner.txt", Path(directory) / "runner.xml"
            log.write_text(raw)
            result = subprocess.run([sys.executable, str(PARSER), str(log), str(xml)], capture_output=True, text=True)
            self.assertEqual(result.returncode, expected, result.stdout + result.stderr)
            suite = ET.parse(xml).getroot()
            problem_count = int(suite.get("failures")) + int(suite.get("errors"))
            self.assertEqual(problem_count == 0, expected == 0)

    def test_complete_single(self):
        self.check_log(event(code=1) + event() + RUNNER_OK, 0)

    def test_complete_multiple(self):
        raw = event(code=1, total=2) + event(total=2)
        raw += event("two", 1, 2, 2) + event("two", 0, 2, 2)
        self.check_log(raw + RUNNER_OK, 0)

    def test_crlf_and_multiline_stack(self):
        raw = event(code=1) + event(code=-2, stack="java.lang.AssertionError\n at a.b.C.run(C.kt:2)") + RUNNER_OK
        self.check_log(raw.replace("\n", "\r\n"), 1)

    def test_assertion_failure(self):
        self.check_log(event(code=1) + event(code=-2) + RUNNER_OK, 1)

    def test_skipped_is_not_acceptance(self):
        self.check_log(event(code=1) + event(code=-3) + RUNNER_OK, 1)

    def test_zero_tests(self):
        self.check_log(RUNNER_OK, 1)

    def test_process_crash(self):
        self.check_log(event(code=1) + "INSTRUMENTATION_RESULT: shortMsg=Process crashed.\n" + RUNNER_OK, 1)

    def test_runner_abort(self):
        self.check_log(event(code=1) + event() + "INSTRUMENTATION_ABORTED: reason\n" + RUNNER_OK, 1)

    def test_missing_final_code(self):
        self.check_log(event(code=1) + event(), 1)

    def test_started_second_never_completed(self):
        self.check_log(event(code=1, total=2) + event(total=2) + event("two", 1, 2, 2) + RUNNER_OK, 1)

    def test_expected_two_but_only_one_completed(self):
        self.check_log(event(code=1, total=2) + event(total=2) + RUNNER_OK, 1)

    def test_duplicate_terminal(self):
        self.check_log(event(code=1) + event() + event() + RUNNER_OK, 1)

    def test_duplicate_start(self):
        self.check_log(event(code=1) + event(code=1) + event() + RUNNER_OK, 1)

    def test_terminal_without_start(self):
        self.check_log(event() + RUNNER_OK, 1)

    def test_inconsistent_declared_count(self):
        self.check_log(event(code=1) + event(total=2) + RUNNER_OK, 1)

    def test_invalid_declared_count(self):
        self.check_log(event(code=1, total="bogus") + event(total="bogus") + RUNNER_OK, 1)


if __name__ == "__main__":
    unittest.main(verbosity=2)
