#!/usr/bin/env python3
"""Record the APK bytes and certificates that the emulator job must install."""
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "app/build/outputs/apk/debug/app-debug.apk"
TEST = ROOT / "app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk"
EXPECTED_PACKAGE = "org.mysteryatlas.prototype.v2"


def source_identity():
    """Stable build-input identity works for both an extracted ZIP and a CI checkout."""
    files = []
    for path in sorted(ROOT.rglob("*")):
        if not path.is_file():
            continue
        relative = path.relative_to(ROOT)
        if any(part in {".git", ".gradle", "build", "__pycache__"} for part in relative.parts):
            continue
        if relative.parts[0] not in {"app", "gradle"} and relative.as_posix() not in {
            "settings.gradle.kts", "build.gradle.kts", "gradle.properties"
        }:
            continue
        files.append({"path": relative.as_posix(), "sha256": hashlib.sha256(path.read_bytes()).hexdigest()})
    payload = "".join(f"{entry['sha256']}  {entry['path']}\n" for entry in files)
    return {"type": "sha256-build-input-manifest", "sha256": hashlib.sha256(payload.encode()).hexdigest(), "files": files}


def sdk_directory():
    sdk = os.environ.get("ANDROID_HOME") or os.environ.get("ANDROID_SDK_ROOT")
    if not sdk and (ROOT / "local.properties").is_file():
        text = (ROOT / "local.properties").read_text()
        match = re.search(r"^\s*sdk\.dir\s*[=:]\s*(.+)$", text, re.M)
        if match:
            # Android Studio writes sdk.dir using Java-properties backslash escapes.
            sdk = re.sub(r"\\u([0-9a-fA-F]{4})|\\(.)", lambda m: chr(int(m[1], 16)) if m[1] else {"t": "\t", "n": "\n", "r": "\r", "f": "\f"}.get(m[2], m[2]), match[1].strip())
    if not sdk:
        raise RuntimeError("Android SDK path is not available")
    path = Path(sdk)
    return path if path.is_absolute() else ROOT / path


def sdk_tool(name):
    candidates = list((sdk_directory() / "build-tools").glob(f"*/{name}"))
    candidates.sort(key=lambda p: tuple(int(n) for n in re.findall(r"\d+", p.parent.name)))
    if not candidates:
        raise RuntimeError(f"Android SDK tool missing: {name}")
    return str(candidates[-1])


def inspect(apk):
    raw = apk.read_bytes()
    signing = subprocess.check_output(
        [sdk_tool("apksigner"), "verify", "--print-certs", str(apk)], text=True
    )
    certificates = re.findall(r"Signer #\d+ certificate SHA-256 digest: (\S+)", signing)
    if not certificates:
        raise RuntimeError(f"No verified signer certificate for {apk.name}")
    badging = subprocess.check_output([sdk_tool("aapt"), "dump", "badging", str(apk)], text=True)
    package = re.search(r"^package: name='([^']+)' versionCode='([^']*)' versionName='([^']*)'", badging, re.M)
    if not package:
        raise RuntimeError(f"Could not read package identity: {apk.name}")
    return {
        "file": apk.name,
        "bytes": len(raw),
        "sha256": hashlib.sha256(raw).hexdigest(),
        "applicationId": package.group(1),
        "versionCode": int(package.group(2)) if package.group(2).isdigit() else None,
        "versionName": package.group(3),
        "signerCertificateSha256": certificates,
    }


def main():
    app, test = inspect(APP), inspect(TEST)
    assert app["applicationId"] == EXPECTED_PACKAGE, app
    assert app["versionCode"] == 2, app
    assert test["applicationId"] == EXPECTED_PACKAGE + ".test", test
    assert app["signerCertificateSha256"] == test["signerCertificateSha256"], "App/test signatures differ"
    record = {
        "schemaVersion": 2,
        "commit": os.environ.get("GITHUB_SHA"),
        "sourceIdentity": source_identity(),
        "runId": os.environ.get("GITHUB_RUN_ID"),
        "runAttempt": os.environ.get("GITHUB_RUN_ATTEMPT"),
        "app": app,
        "instrumentation": test,
        "signingScope": "Same-run debug signing; no promise of cross-run update compatibility. V1 installs are isolated by the .v2 application ID.",
    }
    output = ROOT / "build/qa/apk-provenance.json"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(record, indent=2) + "\n")
    print(json.dumps(record, indent=2))


if __name__ == "__main__":
    main()
