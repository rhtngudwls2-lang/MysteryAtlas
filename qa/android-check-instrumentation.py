#!/usr/bin/env python3
"""Turn raw AndroidJUnitRunner status into a strict CI result and JUnit XML."""
import re
import sys
from collections import Counter
from pathlib import Path
from xml.etree import ElementTree as ET

log_path = Path(sys.argv[1])
xml_path = Path(sys.argv[2])
raw = log_path.read_text(errors="replace").replace("\r", "")
current = {}
completed = []
started = []
declared_counts = []
stack_key = None
for line in raw.splitlines():
    item = re.match(r"INSTRUMENTATION_STATUS: ([^=]+)=(.*)", line)
    if item:
        stack_key = item.group(1)
        current[stack_key] = item.group(2)
        continue
    status = re.match(r"INSTRUMENTATION_STATUS_CODE: (-?\d+)", line)
    if status:
        code = int(status.group(1))
        if "numtests" in current:
            declared_counts.append(current["numtests"])
        if code == 1:
            started.append(dict(current))
        else:
            completed.append({**current, "statusCode": code})
        current = {}
        stack_key = None
    elif stack_key and not line.startswith("INSTRUMENTATION_"):
        current[stack_key] = current.get(stack_key, "") + "\n" + line

tests = [event for event in completed if event.get("test")]
runner_codes = re.findall(r"^INSTRUMENTATION_CODE: (-?\d+)$", raw, re.M)
runner_ok = bool(runner_codes) and runner_codes[-1] == "-1"
errors = []
if not tests:
    errors.append("Instrumentation executed zero identifiable tests")
if not runner_ok:
    errors.append("AndroidJUnitRunner did not report successful runner completion")
if re.search(r"^INSTRUMENTATION_(?:FAILED|ABORTED):|^INSTRUMENTATION_RESULT: shortMsg=", raw, re.M):
    errors.append("Instrumentation runner reported failure, abort or crash")
unexpected = [event for event in completed if event["statusCode"] != 0 and not event.get("test")]
if unexpected:
    errors.append("Unattributed instrumentation failure: " + repr(unexpected))

# A successful runner code does not prove that every scheduled test completed.
# Reject contradictory or incomplete status streams before accepting the gate.
valid_counts = []
for count in declared_counts:
    if not re.fullmatch(r"[1-9]\d*", count):
        errors.append("Invalid declared test count: " + repr(count))
    else:
        valid_counts.append(int(count))
if len(set(valid_counts)) > 1:
    errors.append("Inconsistent declared test counts: " + repr(sorted(set(valid_counts))))
elif valid_counts and valid_counts[0] != len(tests):
    errors.append(f"Declared {valid_counts[0]} tests but received {len(tests)} terminal test results")

def identity(event):
    return (event.get("class", "unknown"), event.get("test", ""))

starts = Counter(identity(event) for event in started if event.get("test"))
finishes = Counter(identity(event) for event in tests)
if any(count > 1 for count in finishes.values()):
    errors.append("Duplicate terminal test results: " + repr(dict(finishes)))
if any(count > 1 for count in starts.values()):
    errors.append("Duplicate test starts: " + repr(dict(starts)))
if starts - finishes:
    errors.append("Started tests did not complete: " + repr(dict(starts - finishes)))
if finishes - starts:
    errors.append("Terminal test results have no matching start: " + repr(dict(finishes - starts)))

failed = [test for test in tests if test["statusCode"] != 0]
suite = ET.Element("testsuite", name=log_path.stem, tests=str(len(tests) + len(errors)), failures=str(len(failed)), errors=str(len(errors)))
for test in tests:
    node = ET.SubElement(suite, "testcase", classname=test.get("class", "unknown"), name=test["test"])
    if test["statusCode"] != 0:
        # An intended acceptance gate that is skipped is not a PASS.
        ET.SubElement(node, "failure", message=f"Instrumentation status {test['statusCode']}").text = test.get("stack", repr(test))
for error in errors:
    node = ET.SubElement(suite, "testcase", classname="instrumentation.runner", name=error)
    ET.SubElement(node, "error", message=error).text = raw[-12000:]
xml_path.parent.mkdir(parents=True, exist_ok=True)
ET.ElementTree(suite).write(xml_path, encoding="utf-8", xml_declaration=True)
print(f"{log_path.stem}: {len(tests)} tests, {len(failed)} non-passing tests, {len(errors)} runner errors")
raise SystemExit(1 if failed or errors else 0)
