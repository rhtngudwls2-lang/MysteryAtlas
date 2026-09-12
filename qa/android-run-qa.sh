#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

# This script runs only on a disposable emulator, never the user's phone.
atlas_package="org.mysteryatlas.prototype.v2"
atlas_runner="${atlas_package}.test/androidx.test.runner.AndroidJUnitRunner"
atlas_evidence="build/android-qa"
atlas_app="build/qa-input/app/app-debug.apk"
atlas_test="build/qa-input/test/app-debug-androidTest.apk"
command -v adb >/dev/null || { echo 'BLOCKED: adb / Android execution environment is unavailable'; exit 2; }
[[ -f "$atlas_app" && -f "$atlas_test" ]] || { echo 'BLOCKED: app and instrumentation APK inputs are unavailable'; exit 2; }
[[ "$(adb shell getprop ro.kernel.qemu 2>/dev/null | tr -d '\r')" == 1 ]] || { echo 'BLOCKED: exactly one running disposable Android emulator is required'; exit 2; }
# Keep previous evidence separately; no previous PNG may satisfy this run's gates.
if [[ -d "$atlas_evidence" ]]; then
  atlas_previous="$(mktemp -d build/android-qa-previous.XXXXXX)"
  mv "$atlas_evidence" "$atlas_previous/evidence"
fi
mkdir -p "$atlas_evidence/screenshots"
atlas_installed=0

collect_evidence() {
  atlas_exit=$?
  trap - EXIT
  set +e
  if [[ "$atlas_installed" != 1 ]]; then
    echo 'No runtime captures: exact APK installation and app-data reset did not complete.' > "$atlas_evidence/runtime-not-started.txt"
    exit "$atlas_exit"
  fi
  adb logcat -d -v threadtime > "$atlas_evidence/logcat.txt" 2>&1
  adb logcat -b crash -d -v threadtime > "$atlas_evidence/crash-logcat.txt" 2>&1
  adb shell dumpsys package "$atlas_package" > "$atlas_evidence/package.txt" 2>&1
  adb shell dumpsys activity activities > "$atlas_evidence/activities.txt" 2>&1
  adb shell uiautomator dump /sdcard/atlas-qa-final.xml > "$atlas_evidence/hierarchy-command.txt" 2>&1
  adb pull /sdcard/atlas-qa-final.xml "$atlas_evidence/final-hierarchy.xml" >> "$atlas_evidence/hierarchy-command.txt" 2>&1
  adb exec-out screencap -p > "$atlas_evidence/screenshots/99-final-device.png"
  adb pull "/sdcard/Android/data/$atlas_package/files/screenshots/." "$atlas_evidence/screenshots/" > "$atlas_evidence/screenshot-pull.txt" 2>&1
  # Restore disposable emulator settings after capturing any failing layout.
  adb shell wm size reset > "$atlas_evidence/display-reset.txt" 2>&1
  adb shell wm density reset >> "$atlas_evidence/display-reset.txt" 2>&1
  adb shell settings put system font_scale 1.0 >> "$atlas_evidence/display-reset.txt" 2>&1
  python3 - "$atlas_evidence" "$atlas_exit" <<'PY'
import hashlib,json,sys
from pathlib import Path
root=Path(sys.argv[1]);files=[]
for path in sorted((root/'screenshots').glob('*.png')):
    b=path.read_bytes()
    if b.startswith(b'\x89PNG\r\n\x1a\n'):
        files.append({'name':path.name,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()})
(root/'screenshot-manifest.json').write_text(json.dumps({'scriptExitCode':int(sys.argv[2]),'screenshots':files},indent=2)+'\n')
PY
  exit "$atlas_exit"
}
trap collect_evidence EXIT

# Verify that both installed APKs are the exact bytes produced by build-debug.
python3 - "$atlas_app" "$atlas_test" "$atlas_evidence" <<'PY'
import hashlib,importlib.util,json,os,shutil,sys
from pathlib import Path
records=list(Path('build/qa-input/evidence').rglob('apk-provenance.json'))
assert len(records)==1, 'Missing or ambiguous APK build identity'
r=json.loads(records[0].read_text())
spec=importlib.util.spec_from_file_location('atlas_identity','qa/android-record-build.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
assert r['sourceIdentity']['sha256']==module.source_identity()['sha256'], 'Installed APK build inputs differ from the current source'
for path,key in zip(sys.argv[1:3],['app','instrumentation']):
    raw=Path(path).read_bytes()
    assert hashlib.sha256(raw).hexdigest()==r[key]['sha256'], f'{key} APK hash mismatch'
    assert len(raw)==r[key]['bytes'], f'{key} APK byte count mismatch'
if os.environ.get('GITHUB_SHA'):
    assert r['commit']==os.environ['GITHUB_SHA'], 'APK and tested commit differ'
shutil.copyfile(records[0],Path(sys.argv[3])/'apk-provenance.json')
PY

adb wait-for-device
adb shell getprop > "$atlas_evidence/device-properties.txt"
adb shell wm size > "$atlas_evidence/display.txt"
adb shell wm density >> "$atlas_evidence/display.txt"
adb shell settings get system font_scale >> "$atlas_evidence/display.txt"
adb logcat -c
adb logcat -b crash -c
adb install -r -t "$atlas_app"
adb install -r -t "$atlas_test"
adb shell pm clear "$atlas_package"
atlas_installed=1

run_instrumentation() {
  atlas_class="$1"
  atlas_phase="$2"
  shift 2
  set +e
  timeout 900 adb shell am instrument -w -r -e class "$atlas_class" "$@" "$atlas_runner" 2>&1 | tee "$atlas_evidence/$atlas_phase.txt"
  atlas_adb_exit=${PIPESTATUS[0]}
  set -e
  if ! python3 qa/android-check-instrumentation.py "$atlas_evidence/$atlas_phase.txt" "$atlas_evidence/$atlas_phase.xml"; then
    return 1
  fi
  return "$atlas_adb_exit"
}

run_instrumentation org.mysteryatlas.V2FlowTest flow
adb shell am force-stop "$atlas_package"
adb shell am start -W -n "$atlas_package/org.mysteryatlas.MainActivity" > "$atlas_evidence/relaunch.txt"
run_instrumentation org.mysteryatlas.V2PersistenceTest persistence
adb shell am force-stop "$atlas_package"
run_instrumentation org.mysteryatlas.V2LocalePersistenceTest locale-persistence

adb shell wm size 900x2000
adb shell wm density 400
adb shell settings put system font_scale 1.0
adb shell am force-stop "$atlas_package"
run_instrumentation org.mysteryatlas.V2DisplayTest display-narrow -e qa_variant narrow

adb shell wm size reset
adb shell wm density reset
adb shell settings put system font_scale 1.3
adb shell am force-stop "$atlas_package"
run_instrumentation org.mysteryatlas.V2DisplayTest display-font130 -e qa_variant font130

adb shell settings put system font_scale 2.0
adb shell am force-stop "$atlas_package"
run_instrumentation org.mysteryatlas.V2DisplayTest display-font200 -e qa_variant font200
adb shell settings put system font_scale 1.0
adb shell am force-stop "$atlas_package"
run_instrumentation org.mysteryatlas.V2RuleRegressionTest rule-regressions

# Screenshot production is a required output, independent of JUnit success.
adb pull "/sdcard/Android/data/$atlas_package/files/screenshots/." "$atlas_evidence/screenshots/" > "$atlas_evidence/screenshot-pull.txt" 2>&1
python3 - "$atlas_evidence/screenshots" <<'PY'
from pathlib import Path
import sys
images=[p for p in Path(sys.argv[1]).glob('*.png') if p.read_bytes().startswith(b'\x89PNG\r\n\x1a\n') and p.name!='99-final-device.png']
required={'01-home.png','02-explore.png','03-cooper.png','04-evidence.png','05-rabbit-hole.png','06-search.png','07-saved.png'}
required.update(f'20-{variant}-{screen}.png' for variant in ['narrow','font130','font200'] for screen in ['home','explore','article','evidence'])
missing=required-{p.name for p in images}
assert not missing, f'Required Android screen captures missing or invalid: {sorted(missing)}'
print(f'Captured {len(images)} Android screenshots for independent visual review')
PY
adb logcat -b crash -d -v threadtime > "$atlas_evidence/crash-logcat.txt"
python3 - "$atlas_evidence/crash-logcat.txt" <<'PY'
from pathlib import Path
import re,sys
log=Path(sys.argv[1]).read_text(errors='replace')
assert not re.search(r'Process: org\.mysteryatlas\.prototype\.v2(?:[,:\s]|$)|>>> org\.mysteryatlas\.prototype\.v2(?:[:\s]|$)',log), 'App crash found; inspect crash-logcat.txt'
PY
