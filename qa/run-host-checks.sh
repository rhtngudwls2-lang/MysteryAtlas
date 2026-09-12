#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
python3 qa/check_content.py
qa_classes="$(mktemp -d)"
trap 'rm -rf "$qa_classes"' EXIT
java -m jdk.compiler/com.sun.tools.javac.Main -d "$qa_classes" app/src/main/java/org/mysteryatlas/domain/AtlasRules.java qa/RulesTest.java
java -cp "$qa_classes" RulesTest
