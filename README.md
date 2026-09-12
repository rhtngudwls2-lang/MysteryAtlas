# Mystery Atlas V2 — Android

Native Android content app under implementation. The V2 product loop is discovery → article → related story → Rabbit Hole → save → return. The previous map and investigation game are being archived or removed. Do not use a successful APK build as evidence of product or visual approval.

## Build foundation

The working V1 foundation is retained: JDK 17, Gradle 8.13, Android Gradle Plugin 8.13.2, Kotlin/Compose plugin 2.2.10, compile/target SDK 36 and minimum SDK 26. GitHub Actions installs Gradle explicitly; a Gradle Wrapper JAR is not included.

V2 uses application ID `org.mysteryatlas.prototype.v2`, version code `2`, version name `0.2.0`. It can be installed alongside V1 (`org.mysteryatlas.prototype`) without uninstalling V1 or resetting its data. The namespace and Activity class remain `org.mysteryatlas` / `org.mysteryatlas.MainActivity`.

The test build is debug-signed. No signing key is committed. Cross-run debug signing continuity is not guaranteed; this is not a production Play release. The same main APK bytes and instrumentation APK produced in one CI run are installed in that run's emulator job.

## CI and evidence

`.github/workflows/android-build.yml` runs for main and `codex/mystery-atlas-v2` pushes, main pull requests, and manual dispatch.

1. `build-debug` runs host QA, builds the main APK, compiles the instrumentation APK, runs Android lint, and records APK hashes, package/version identity and signer certificate hashes.
2. `android-qa` downloads those exact APKs. It verifies their hashes and commit, starts one API 35 Google APIs x86_64 Pixel 7 emulator with KVM, and installs the downloaded APKs without rebuilding them.
3. It clears only V2 data on this disposable emulator, runs `org.mysteryatlas.V2FlowTest`, force-stops and relaunches the app, then runs `org.mysteryatlas.V2PersistenceTest`. A second force-stop precedes `V2LocalePersistenceTest`, which verifies the nondefault English preference before restoring Korean. `V2DisplayTest` then runs separately at 360dp width and at system font scales 1.3 and 2.0; display settings are reset even on failure.
4. AndroidJUnitRunner status is parsed explicitly. Test failure, skipped acceptance tests, runner failure, or zero executed tests fail the job. Seven named baseline screenshots and twelve display-variant screenshots must be produced. Independent visual review remains a separate gate.

Artifacts:

| Artifact | Contents |
|---|---|
| `MysteryAtlas-debug-apk` | The built `app-debug.apk` for V2 |
| `MysteryAtlas-V2-test-apk` | Its instrumentation APK |
| `MysteryAtlas-V2-build-evidence` | APK provenance and lint reports |
| `MysteryAtlas-V2-android-api35-evidence` | Device properties, installed package details, test logs/XML, screenshots and hashes, logcat, crash buffer, final UI hierarchy, APK provenance |

Artifact retention is 14 days. Final deliverables must be retrieved from the successful run rather than relying on indefinite artifact retention. Runtime evidence collection runs on test failure as well as success.

Instrumentation screenshots are written under the target app's `getExternalFilesDir(null)/screenshots`. No user storage permission is required. The CI script retrieves that directory before the emulator is stopped.

The emulator setup follows the maintainer's [Android Emulator Runner documentation](https://github.com/ReactiveCircus/android-emulator-runner). KVM, `google_apis`, `x86_64`, headless options and the action's boot timeout are explicit in the workflow.

## Verification boundaries

The authoring environment currently has Java 17 and the `jdk.compiler` module, but no local Android SDK, Gradle, adb or emulator. Android compilation and rendering must be verified through CI until an Android toolchain is available locally.

One API 35 emulator does not establish API 26 compatibility, every device configuration, real-device performance or commercial readiness. Source validation, build, functionality, accessibility, content/facts/rights, and independent visual review are separately tracked in `BUILD_STATUS.md`.

V1 repository and artifact verification succeeded before the pivot. V1's old source-only BLOCKED report is historical, not the current V1 outcome. V2 evidence must name the actual tested commit and artifact instead of inheriting V1 PASS claims.
