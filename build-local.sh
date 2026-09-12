#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
atlas_missing=0
command -v java >/dev/null || { echo 'BLOCKED: JDK 17 unavailable'; atlas_missing=1; }
command -v gradle >/dev/null || { echo 'BLOCKED: Gradle 8.13 unavailable; wrapper JAR is not bundled'; atlas_missing=1; }
[[ -n "${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}" || -f local.properties ]] || { echo 'BLOCKED: Android SDK path unavailable'; atlas_missing=1; }
[[ "$atlas_missing" == 0 ]] || exit 2
bash qa/run-host-checks.sh
gradle --no-daemon --stacktrace :app:compileDebugKotlin :app:lintDebug :app:assembleDebug :app:assembleDebugAndroidTest
python3 qa/android-record-build.py
