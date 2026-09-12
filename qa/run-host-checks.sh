#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
python3 qa/check_content.py
python3 qa/test_instrumentation_parser.py
python3 qa/test_build_identity.py
