# Mystery Atlas — Android Prototype source

**Build status: BLOCKED / FAIL. No APK or AAB has been produced.**
This is the recoverable native implementation, not a completed or runtime-verified deliverable.

## Build in an Android-capable environment

Requirements: JDK 17, Gradle 8.13, Android SDK Platform 36 and Build Tools 35.0.0, access to Google Maven, Maven Central and Gradle plugin repositories. Set `ANDROID_HOME` or use Android Studio's `local.properties`. The pinned AGP 8.13.2 / Gradle 8.13 combination supports API 36.

Import this directory in Android Studio and use installed Gradle 8.13 for the first sync. Or run:

```sh
bash build-local.sh
```

The Gradle wrapper binary is **not** included because tool downloads were blocked. With Gradle installed, `gradle wrapper --gradle-version 8.13` generates the official wrapper. No home-written downloader substitutes for it.

Expected outputs **after a successful build**, not existing files:

- `app/build/outputs/apk/debug/app-debug.apk` (automatically debug-signed)
- `app/build/outputs/bundle/release/app-release.aab` (unsigned test build structure; no release signing credentials)

No Play upload or account setup is part of this task. Do not publish the unsigned release build.

## Core loop

Map → marker preview → briefing → provisional theory → three manual evidence steps → reveal → persisted completion → map / related preview.

The preview never exposes status before investigation. Completed markers use a check, without status colours. Bookmark controls live in previews and verdicts. The archive shows only revealed classifications. The rank configuration is separate data. Settings support device language, Korean and English.

Long-press MYSTERY ATLAS at the top in a debug build to open the local Session Report. No analytics SDK, identifiers, network requests or telemetry exports exist. Reports cover the current process session, include background elapsed time, and survive Activity recreation through the ViewModel. A new process starts a new session. Distinct case IDs prevent reopening case 1 from being counted as CASE 1 → CASE 2. The entry route is retained to distinguish related-button prompts from map exploration.

Daily selection is deterministic over sorted IDs, prefers uninvestigated cases on the first selection that day, and persists the first selection for that date. The last 31 dates are retained. Local time-zone/date changes can change the daily date; no server is used.

## Small, replaceable components

- `data/Content.kt`: parse and validate each case independently on Dispatchers.IO; reject malformed cases instead of taking down the catalog.
- `data/Progress.kt`: DataStore preferences for theories, steps, completion, bookmarks, language, ranks and daily history; no cloud backup.
- `domain/AtlasRules.java`: Android-independent daily/random selection, spatial clustering and session transition rules.
- `map/AtlasMap.kt`: `MapRenderer` boundary and original offline schematic renderer; pinch/pan, zoom controls, clustered markers and brief focus motion.
- `ui/`: Compose Material 3 with charcoal/ivory/amber tokens and progressive disclosure.
- `metrics/`: process-local counters and a no-op case exit policy. It does not display ads.
- `assets/cases.json`, `ui.json`, `ranks.json`, `world.json`: local data and translations.

## Map decision and limitations

MapLibre Native and OpenFreeMap were evaluated as a keyless replacement path. This prototype source uses an original, intentionally coarse equirectangular world sketch so first-launch offline access requires no tile service or third-party asset download. Geometry is illustrative, not a navigation map. The visible credit is “Map: Mystery Atlas • schematic”. No OpenStreetMap/OpenFreeMap data or historical images are included. Do not falsely attribute this original sketch to those providers.

A future provider must keep its required attribution visible. OpenFreeMap documents `OpenFreeMap © OpenMapTiles Data from OpenStreetMap`; MapLibre has an offline package but that alone does not bundle a map. No migration is implemented here.

All coordinates are approximate, explicitly explained in previews, and deliberately have `coordinate_verified: false`. Bloop is a South Pacific discovery-area anchor, not a measured acoustic source. Wow is the Ohio observation site; Voynich is the present repository, not its place of authorship. Independent coordinate verification is outstanding.

## Validation

```sh
bash qa/run-host-checks.sh
```

Host checks validate JSON structure, both languages, source references, verdicts, original map bounds, no manifest permissions, and 15 Java rule assertions including 500 marker retention and the case conversion metric. They do not compile Compose or validate Android persistence.

After building and connecting a disposable emulator/device:

```sh
adb install -r app/build/outputs/apk/debug/app-debug.apk
adb shell pm clear org.mysteryatlas.prototype
gradle :app:connectedDebugAndroidTest
```

`pm clear` intentionally resets only this prototype's local progress on the test device. The instrumented test is authored but **not run**. Follow `qa/DEVICE_CHECKLIST.md` for force-stop persistence, gestures, source UI and crash checks. Do not mark delivery complete before those tests pass.

## Scope

Three cases only. No server, account, AI, location, permissions, AdMob, IAP, notifications, community, real-time content, user uploads or unclear-rights imagery. Reading time is an editorial target of about two minutes including choices and reflection, not a measured usability result.
