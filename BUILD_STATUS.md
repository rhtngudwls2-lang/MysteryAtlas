# Mystery Atlas V2 — verification status

**V2 local implementation is being checkpointed. Android compilation, instrumentation and visual approval are not yet verified.** This file must be updated from actual CI/runtime evidence, not from authored source or intended behavior.

## Verified V1 baseline

- Repository: `rhtngudwls2-lang/MysteryAtlas`.
- Baseline main: `144c8f69bde3174c7190a22774e8ed3cf339a9d5`; all 36 source ZIP blobs matched the live commit.
- GitHub Actions run `34670668444`, job `103491294554`: host QA, debug APK build and artifact upload succeeded.
- V1 APK: `app-debug.apk`, 11,589,966 bytes, SHA256 `c2ea8d61b4dfd1d783695772df136f619ccc4858e7fd42dee5ca1200c8a18e3a`.
- Android installation and launch: confirmed by the user for V1. V1 commercial/UX/visual quality failed and is not inherited by V2.

## Current execution block

The GitHub integration rejected branch creation with HTTP 403, `Resource not accessible by integration`. No alternative write route was attempted. V2 changes have not been pushed and no V2 CI build or emulator run is claimed. The configured CI pipeline requires the repository connection to have the necessary authenticated access before execution.

## V2 gates

| Gate | Status | Required evidence |
|---|---|---|
| Existing build foundation retained | Configured; new run pending | Same pinned Gradle/plugin versions; successful V2 build |
| V1 installation/data isolation | Configured; runtime pending | `.v2` application ID, versionCode 2, installed package identity |
| Content/schema/relations/rights checks | Pending | Current host QA results tied to V2 commit |
| Kotlin/Compose and instrumentation compilation | NOT RUN | Successful `assembleDebug` and `assembleDebugAndroidTest` |
| Android lint | NOT RUN | `lintDebug` report |
| APK provenance and certificate match | NOT RUN | `apk-provenance.json`; main/test signer certificates; APK hashes |
| Home/Explore/Article/Rabbit Hole/Save/Search | NOT RUN | Passing `V2FlowTest` and actual screen captures |
| Force-stop/relaunch persistence | NOT RUN | Passing `V2PersistenceTest` after a separate shell force-stop/relaunch, plus `V2LocalePersistenceTest` in another process for the nondefault language |
| Actual Android rendering | NOT RUN | Seven required baseline screenshots plus 12 required captures from 360dp / font 1.3 / font 2.0 instrumentation variants |
| Crash-free tested flows | NOT RUN | Instrumentation result and crash/logcat evidence |
| Independent Product/UX/Editorial/Fact/Red Team approval | NOT RUN | Explicit review of the tested artifact and rendered output |

## Test environment and artifact identity

The authoring container has Java 17.0.20 and `jdk.compiler`, but no local Android SDK, Gradle, adb or emulator. The CI job is configured for a single API 35 Google APIs x86_64 Pixel 7 emulator with KVM.

The final main APK is built once with its instrumentation APK, uploaded by `build-debug`, then downloaded and hash-verified by `android-qa`. The emulator job installs those exact bytes and does not rebuild the main app. Screenshot and diagnostic collection is attempted even when tests fail.

V2 uses `org.mysteryatlas.prototype.v2`, versionCode 2. It does not overwrite V1. No production signing key is included; the debug signer is scoped to a CI build, and cross-run update compatibility is not claimed. V1 bookmarks and settings remain in the separately installed V1 app; V2 does not claim an automatic cross-package data migration.

## Remaining limits

One API 35 emulator cannot establish all supported Android versions, real-device performance, all screen sizes or commercial readiness. A build or host-test PASS does not grant functional, visual, editorial or fact approval. No AAB/Play release, payment flow or production deployment is implied by this test pipeline.
