# Independent Red Team review — local V2

Reviewer: `/root/independent_red_team`, separate from implementation and first-pass reviewers. Date: 2026-09-12. Sole app baseline: supplied ZIP and extracted `project/`. Current user removes GitHub prerequisites and forbids GitHub access; no GitHub path was used or required here.

## Current decision

**Final bounded source/host Red Team gate: PASS. All four reported source/QA defects or risks were corrected and independently re-read. Executed host integrity, 16 parser regressions and 6 build-identity regressions PASS. Final Product/Android approval: NOT APPROVED.** Actual compile/lint/assembleDebug, APK installation, runtime behavior and seven Android renders remain unavailable; this is not a GitHub blocker.

## Independent evidence

- Read HANDOFF in full. Compared current project against original ZIP bytes without changing the archive. All 53 original project files remain. All five supplied images retain their exact original bytes. Six articles are byte-identical; Mary Celeste changes only the reported English “An intact vessel” phrase to “A vessel still afloat”. No app or content was recreated by this reviewer.
- Independently executed `bash qa/run-host-checks.sh`: content integrity PASS (7 articles, 18 evidence records, 12 source records, 5 images), followed by all 16 real parser subprocess regression tests PASS. These tests validate host QA logic, not Android functionality.
- Read production Kotlin and modified functions against the original source. Status/hook rows, finite Rabbit path state, deterministic title/alias-first search, completed-reading state, retryable preference read failure, cancellable article load and image-failure semantics are present. Source presence is not executed Kotlin behavior.
- Inspected the full four-class Android test suite, Gradle files, local build wrapper, instrumentation script, strict log parser and source/APK provenance recorder.
- Independently observed no Gradle, sdkmanager, adb, emulator or Kotlin compiler launcher. Java reports 17.0.20. `javac` is not on PATH, but `java -m jdk.compiler/com.sun.tools.javac.Main -version` succeeds (`javac 17.0.20`); therefore a missing Java compiler must not be alleged from the absent launcher alone.
- The project contains no APK and no captured Android PNG. Public approved boards or packaged artwork cannot substitute for Android renders. Parent download evidence reports official Gradle/SDK probes ending in timeout; this reviewer did not repeat them.
- Exact snapshot and changed-file list are in `independent-red-team-evidence.json`. Existing first-pass reports contain older hashes and unresolved initial statuses; final corrections require appended re-review conclusions.

## RT-01 — local QA runner does not enforce a disposable emulator

Priority: medium; local safety/verification contract gap, confirmed by source inspection. `qa/android-run-qa.sh` describes a disposable emulator, but the inspected script has no explicit emulator or single-device check before installing APKs, clearing app data and changing display/font settings. Its EXIT trap itself issues device mutations. Local reuse could target an attached physical phone, and an early failure could still trigger reset commands.

Required minimal correction: validate exactly one intended online emulator and prove emulator identity before registering the mutating EXIT trap or issuing install/clear/settings commands. Reject a physical or ambiguous device. No device was contacted in this review.

## RT-02 — local.properties-only SDK configuration fails provenance

Priority: medium; local build contract mismatch, confirmed by source inspection. `build-local.sh` accepts an SDK supplied through `local.properties`, but `qa/android-record-build.py:sdk_tool` reads only `ANDROID_HOME` or `ANDROID_SDK_ROOT`. In a standard local.properties-only setup, Gradle may build successfully and provenance then fails with “Android SDK path is not available”.

Required minimal correction: resolve the same SDK configuration for both build and provenance, or explicitly reject unsupported configuration at preflight. Preserve the actual SDK tool checks; do not fabricate provenance or a Git commit.

## Remaining evidence boundaries

- Source fixes must not be converted to runtime PASS. Search ranking, graph revisits, reading-offset/completion persistence, image-failure behavior and transient-storage recovery need real Android execution. Prepared targeted tests, if added, remain NOT RUN without Android.
- The original suite does not fully assert reading offsets across independent processes, all source intents, all failure paths, and every Rabbit state. A suite PASS would cover only its actual assertions.
- Shared-image notices must reach every subject-specific image call site. The separate UX re-review identified the inline-image caption/alt case; the final source now passes the shared-art notice through both the inline image description and caption.
- APK identity must refer to actual generated bytes, and Android QA must install those exact bytes. A build-input digest alone cannot prove an APK was compiled from them. The build script should generate provenance only after a successful build; stale evidence must not pass a rerun.
- Final Product and seven-screen visual gates are unapproved until exact-APK execution and real Android captures exist. Missing GitHub synchronization alone is never grounds to block local Product, Editorial, Fact or source Engineering review.

## Independence

This reviewer edited only this report and its evidence JSON. It authored no production, article, image, test or build implementation. The final re-review and hash stamp below supersede the initial snapshot for app/test/script files. Changes after this stamp require targeted re-review.


## Final independent correction re-review

All source/tests/scripts were declared stable by the implementation owner and then independently re-read. Exact current file hashes are in `independent-red-team-reviewed-files.sha256`; `independent-red-team-evidence.json` records the manifest digest and build-input identity. This reviewer did not implement the fixes.

| Finding | Final disposition | Independently checked evidence |
|---|---|---|
| RT-01 disposable emulator enforcement | CLOSED IN SOURCE | Runner checks adb, both APK inputs, and `ro.kernel.qemu == 1` before registering its trap or mutating the device; ambiguous default adb selection fails. `atlas_installed` prevents runtime capture/reset paths before successful exact-APK installation and app-data reset. |
| RT-02 SDK configuration mismatch | CLOSED; HOST TESTS PASS | `sdk_directory()` resolves env or local.properties, decodes Android Studio backslash escapes, and handles a relative SDK root. Independently executed all six source-identity/SDK tests: 6 passed, zero failed. |
| RT-03 stale screenshots could satisfy a rerun | CLOSED IN SOURCE | Existing `build/android-qa` evidence moves into a separately created previous-evidence directory before creating a fresh capture directory. Old PNGs cannot satisfy the current required-name gate. SourceIdentity and actual APK hash/byte-count comparisons run before installation. |
| RT-04 Rabbit-depth test assumes offscreen lazy item exists | CLOSED IN PREPARED TEST | The final Flow test explicitly scrolls `rabbit_list` to `rabbit_depth` before each 1 → 2 → 1 depth assertion. This preserves legitimate restored list position while making the target query valid. No Android run is claimed. |

Additional final source observations:

- Reading completion now recognizes either a fully reached end marker or a resting viewport beyond that marker; it does not depend on stopping precisely on a single item. The user-facing label discloses that “read” means reaching the narrative end.
- The prepared Flow test waits for DataStore completion, scrolls to the real Cooper money section (index 7 in the current content), records durable index/offset plus actual list scroll semantics, and leaves the app. The independent-process persistence test checks those saved values, then actual restored list semantics and the visible money section before any new scroll. This is a meaningful prepared assertion; **it has not executed**.
- Three new `V2RuleRegressionTest` methods exercise actual production related-path logic, normalized/ranked search and the asynchronous image-failure UI. The UI-test manifest dependency already exists. They remain **NOT RUN**, not host-test passes.
- Source no longer conflates write errors with catalog errors; storage retry preserves the last good state and re-subscribes. Injected disk-failure recovery remains untested and is not closed as an Android behavior.
- `bash -n qa/android-run-qa.sh` passed after the final runner changes. This validates Bash syntax only.
- The final diff preserves all original project files, all five original image bytes and six untouched article files; the one article change remains the narrow factual phrase. No Kotlin/Compose compiler has validated the new app or test source.

## Final limits and verdict

No unresolved confirmed source defect remains within this independent diff/host review. This is a bounded **SOURCE_REVIEW_PASS**, not a guarantee that the APK compiles or works. Actual Android compile, lint, assembleDebug, APK provenance/signing, installation, seven-screen rendering, touch/scroll/back behavior, saves/locale/read-position durability and crash checks remain unexecuted because the observed toolchain/runtime is unavailable. External source-intent opening, article-load failure and injected storage-failure recovery are still uncovered by the current prepared suite and must remain explicit QA gaps.

The final Product gate must remain **FAIL / NOT APPROVED for delivery** until actual APK and Android evidence exist. The source/host work itself is completed and approved within the evidence above; GitHub is irrelevant to that result. The separate Fact report's limited Phaistos full-text access and provenance scope must also survive final reporting. No APK filename, byte size, SHA-256, install success or Android screenshots may be invented from the source ZIP.
