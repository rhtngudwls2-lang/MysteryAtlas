#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
command -v java >/dev/null || { echo 'JDK 17 required'; exit 2; }
command -v gradle >/dev/null || { echo 'BLOCKED: Install Gradle 8.13, then rerun. No wrapper JAR is bundled.'; exit 2; }
[[ -n "${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}" || -f local.properties ]] || { echo 'BLOCKED: Android SDK 36 required'; exit 2; }
gradle --no-daemon :app:assembleDebug :app:bundleRelease
