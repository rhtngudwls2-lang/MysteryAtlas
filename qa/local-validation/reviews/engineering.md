# Independent local Engineering review

Reviewed the supplied V2 source on 2026-09-12. This review used the handoff source only. No GitHub connector, API, browser, remote read, remote write, or remote build was attempted.

## Verdict

**Initial static Engineering gate: FAIL (E1 and E2 required correction).**

**Correction re-review: SOURCE_REVIEW_PASS within the inspected static scope. E1, E2 and E4 are corrected in source; no remaining confirmed Engineering source defect was found.** Android compilation, lint, build and runtime confirmation remain unavailable, so the full Engineering release gate remains **BLOCKED**, not PASS.

**Android compilation, Android lint, assembleDebug, installation and runtime: BLOCKED in the observed local environment; not PASS.** The parent validation run records the exact toolchain and download-probe evidence. This reviewer observed Java 17 available, `build-local.sh` exiting 2 because Gradle is absent, no Gradle launcher/SDK/emulator in the collected local paths, and no bundled wrapper executable/JAR. These are environment observations, separate from the code findings below.

This is source inspection, not a substitute for a Kotlin compiler, Android lint, APK signing verification or real Android rendering. No screenshot was generated or approved by this review.

## Reviewed scope

- Full `HANDOFF.md` and its local-versus-remote evidence boundaries.
- Root/app Gradle settings, properties, wrapper properties and Android manifest/resources.
- All seven production Kotlin files: Activity, ViewModel, data repositories, theme, components and all screens.
- The original two instrumentation source files (four test classes), plus the added `V2RuleRegressionTest.kt`; host content checker, Android runner and APK provenance recorder.
- Existing `.github/workflows/android-build.yml`, source inspection only.
- Bundled article/image paths and relationship contracts.

## Findings

### E1 — Preference read failure silently freezes saved state for the process

**Priority: high. Initial status: FAIL.**

Original locations: `app/src/main/java/org/mysteryatlas/data/Progress.kt:18-22`, `app/src/main/java/org/mysteryatlas/AtlasViewModel.kt:16,29`, `app/src/main/java/org/mysteryatlas/ui/AtlasApp.kt:48-49`.

The preferences flow catches an `IOException`, emits `emptyPreferences()`, then completes. Its mapping returns `ready=true` with empty bookmarks/recent/positions and the default Korean language. `stateIn(..., SharingStarted.Eagerly, ...)` retains that last value; catalog retry does not start a new preference collection. If the disk error was transient, later successful preference edits do not restore observation in that process. The screen can therefore show apparently lost saves and nonresponsive save/language changes with no storage-error notice.

This is a control-flow finding; the storage fault has not been injected on Android. The relevant platform contract says collecting the DataStore flow again retries a failed disk read. Catching and emitting a replacement is not retrying. [Android DataStore API](https://developer.android.com/reference/androidx/datastore/core/DataStore), [Kotlin retryWhen API](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/retry-when.html).

Minimal correction: retain the last successfully read user state, expose a distinct preference-load failure, and explicitly restart its collection when Retry is requested. Avoid presenting empty preferences as a successful read. Keep cancellation propagation. A meaningful Android check should cause an initial read failure, recover the storage, retry, then verify the prior save/language data and a subsequent save update.

Correction re-review: `ProgressRepository.flow` now propagates read failures. The ViewModel preserves its last `UserState`, exposes `storageError`, and owns a cancelable user-collection Job restarted by `retryStorage()`. The UI exposes a distinct error and Retry action. Cancellation is rethrown. This removes the identified permanently-completed-flow defect by source inspection. Device fault injection is still NOT RUN.

### E2 — Local APK provenance recorder assumes a Git checkout

**Priority: medium. Initial status: FAIL for ZIP-based local build recording.**

Original location: `qa/android-record-build.py:57`.

When `GITHUB_SHA` is absent, the recorder unconditionally invokes `git rev-parse HEAD`. This supplied project has no `.git`; running local `git rev-parse --show-toplevel` produced `fatal: not a git repository`. Even after valid app/test APKs become available, the script would fail before writing their provenance record.

Minimal correction: preserve the existing `GITHUB_SHA`/real-checkout path for CI and add an explicit local source-manifest identity for an extracted ZIP. Record a null Git commit when none exists; do not reuse the old handoff commit as if it identified modified final source. Include SHA-256 and sizes for the exact app/test APK bytes. Do not initialize a fake repository merely to satisfy provenance.

Correction re-review: the recorder now has a safe-import `source_identity()` function hashing the app/Gradle build inputs, stores `GITHUB_SHA` when supplied and null otherwise, and no longer invokes local Git. Its APK identity/signature checks remain. Actual APK inspection is still NOT RUN because no APK/toolchain is available.

### E3 — Reading-position persistence is not asserted by prepared Android tests

**Priority: medium. Status: verification gap, runtime NOT RUN.**

Locations: `ui/AtlasApp.kt:106-107`, `V2FlowTest.kt:103-106`, `V2PersistenceTest.kt:24-69`.

The app stores article list index and offset and restores `rememberLazyListState` from them. The prepared force-stop tests assert bookmark, language and recent history, but never assert the saved reading position after reopening or process restart. Existing scrolling checks only establish that scrolling is possible. A result from those tests cannot be reported as reading-position persistence PASS.

Minimal verification: scroll a specific article to a named section, wait until its position is durably observed, restart the application without clearing data, reopen the same article and verify the previously visible section/position. Run this on the same final APK as the other functional tests.

Correction re-review: `V2FlowTest` now reaches the narrative end, waits for persisted completion, scrolls to Cooper's `section_money` (current LazyColumn index 7), records the durable index/offset and actual scroll semantics, and leaves the app. The next-process `V2PersistenceTest` compares both stored values and actual reopened list semantics, then checks that `section_money` is displayed before making another scroll. This is a meaningful prepared persistence check. Its source gap is addressed; runtime remains NOT RUN.

The added `V2RuleRegressionTest` also checks an actual catalog-edge route revisit, exact-alias precedence over metadata using an adversarial fixture, full-width/punctuation normalization, no-result search and missing-image fallback ending its loading state. These are prepared Android tests, not host-executed application behavior.

### E4 — SDK configuration accepted by local build but rejected by provenance

**Priority: medium. First correction re-review: FAIL; subsequent correction re-review: source-corrected.**

Locations: revised `build-local.sh:7` and `qa/android-record-build.py:34-37`.

The local build preflight accepts either SDK environment variables or `local.properties`. Gradle also accepts `sdk.dir` in that file. The provenance recorder, called after building, checks only environment variables and would then fail for the valid `local.properties`-only configuration. Resolve the same SDK location in the recorder or before invoking it. If reading `local.properties`, handle its Java-properties escaping rather than treating backslashes literally.

This is a source contract mismatch, not a locally executed Android build failure.

Correction re-review: `sdk_directory()` now resolves environment variables or `sdk.dir` from `local.properties`, decodes the backslash escape forms used by Android Studio and resolves a relative SDK against the project root. `sdk_tool()` uses this common resolver. The six focused tests in `qa/test_build_identity.py` cover no-Git identity, changed app/test sources, ignored generated outputs, a local-properties SDK path with escaped spaces, environment precedence and missing SDK. The test source is appropriately scoped to host identity/resolution and does not manufacture APK or Android-success evidence. Parent validation owns the actual host-test execution result.

## Static checks with no defect found in the inspected source

- The original Android project and dependency pins remain: JDK 17, Gradle 8.13 installation by CI, AGP 8.13.2, Kotlin/Compose plugin 2.2.10, compile/target API 36, min API 26. Missing wrapper JAR/executable is explicitly documented, not a new regression.
- Both build types produce `org.mysteryatlas.prototype.v2`; versionCode is 2 and the Activity remains `org.mysteryatlas.MainActivity`. The planned test package/runner is consistent with the default test-application-ID suffix.
- No confirmed Kotlin syntax or API mismatch was established by source reading. This is explicitly not compile PASS.
- Catalog/article asset reads and bitmap decode use `Dispatchers.IO`; asset streams close through `use`.
- JSON content is tied to article IDs; duplicate stories, invalid related references and invalid evidence source references have guards, with further asset/contracts checked by the host validator.
- Bookmark mutation is performed inside DataStore's transaction rather than from a stale UI copy. Recent history is deduplicated and capped at 50.
- Navigation, active article, category, query and route stack use SavedStateHandle. Article loads ignore results for a different active article. Saved screen/list state is keyed by article/category rather than one common key.
- The current 7-case search searches both languages, canonical title, aliases, tags, people, places and category labels. Query changes are collected for Compose recomposition.
- Navigation edges from Home, Explore, categories, Search, Saved, Recent and Rabbit Hole lead to existing catalog entries in the validated bundled data. V1 map/game data resides under archive and is not referenced by production Kotlin.
- External source opening catches failures rather than crashing; the offline application declares no network/storage permission and disables backup.
- The CI build job and Android QA job are separate. QA downloads the produced APK/test APK, compares their byte hashes/sizes with the build provenance and installs those bytes. Required screenshots and crash-log inspection are separate requirements. No workflow was executed by this review.

## Remaining runtime-only questions

- Actual dependency resolution, Kotlin/Compose compilation and lint diagnostics.
- Correct startup/restoration and absence of crashes on API 26–36 devices.
- Real saved-state/read-position durability and transient-storage failure recovery.
- Actual back behavior, multilingual search/keyboard behavior, source intent behavior, image loading and memory use.
- Real clipping, overlap, contrast, touch targets and scrolling on 360dp and 1.3x/2.0x font configurations.
- Installation/signature/package identity of final APK bytes.

No Product, UX or Android runtime PASS follows from this static inspection. Re-review any corrections against a final source manifest, and leave unavailable runtime checks explicitly BLOCKED.

## Final correction review and evidence stamp

Final source/script review stamp updated at 2026-09-12T09:38:19.372600+00:00. The 42 reviewed build-input/configuration/test/script files are listed in `engineering-reviewed-files.sha256`, alongside `engineering-review-stamp.json`.

- Reviewed-file manifest SHA-256: `c4645053a60021080d83228acc9700956877eeab0f4a87450b0300ffb24d754d`.
- App/Gradle build-input manifest SHA-256: `44f0788ce80cc1a16c96d83478fce4e90afcef69736e3b194504a8af16c2ff2e`.
- E1, E2 and E4: source-corrected, independently re-read.
- E3: meaningful assertions added; Android execution still NOT RUN.
- Parent's persisted `final-checks.json` and `host-final.txt` were inspected: content integrity, 16 runner-log parser regressions and 6 build-identity/SDK regressions executed successfully. Shell syntax passed; local Android build preflight and Android runtime preflight each exited 2 for missing tools. These are not Android test results.
- The final Android runner rejects missing adb/APKs/non-emulator selection; archives earlier evidence; compares current source identity and exact APK byte identities before installation; and captures runtime evidence only after installation/reset. Its control flow preserves failing exit status and retains the separate mandatory screenshot/crash checks. The revised parser rejects missing/duplicate/unmatched results and contradictory test counts. Source-reading these mechanisms does not execute them on Android.

**Final bounded result: SOURCE_REVIEW_PASS; complete Android Engineering gate BLOCKED.** No remaining confirmed static Engineering bug is open in this snapshot. Source changes after the manifest above require a renewed review/stamp.

Final narrow re-review: only `V2FlowTest.kt` differed from the prior 42-file manifest. All three Rabbit Hole depth assertions now scroll `rabbit_list` to `rabbit_depth` first, accounting for the retained scroll position. The assertions and actual navigation remain intact. No broader review or unchanged host-test rerun was necessary; Android execution remains NOT RUN.
