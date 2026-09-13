# Mystery Atlas — verification status

## Web V3 release candidate

Baseline: `main@a6ac8c188e23e49eee265518fb0cda1fcb73c059`. Work is isolated on `codex/mystery-atlas-v3-web`; no Android source or build configuration is changed.

Product Spec Restore Addendum implementation adds Quick Preview, local reactions, country/category discovery, typed Rabbit Hole edges, narrative image sequencing, market/brand configuration, future-locale registration, canonical/editorial separation, and provider-neutral analytics/content/community/entitlement interfaces. The nine verified launch records remain unchanged in count and no new factual content or image was generated.

| Gate | Status | Evidence |
|---|---|---|
| Next.js static production build | PASS (local) | 49 pages exported, including both locales and all 18 localized case routes |
| ESLint / TypeScript | PASS (local) | `npm run lint`; `npm run typecheck` |
| Unit tests | PASS (local) | 9/9: catalog, 15-claim migration, schema, locale reading strategies, search fields, 100-record scale fixture, relations, image de-duplication, market config |
| Internal links | PASS (local) | 48 generated HTML pages and every root-relative link checked against static output |
| Browser smoke | PASS (local) | 20/20 across Chromium Pixel 7 and desktop projects; locale, Quick Preview, reactions, country discovery, typed Rabbit Hole, search, save persistence, metadata, sitemap/robots, evidence and reading time |
| Basic accessibility | PASS (local) | axe WCAG A/AA serious/critical checks on four core surfaces in both viewport projects after contrast correction |
| Render review | PASS for RC | Home and case views inspected at mobile and desktop sizes; missing imagery is visibly disclosed |
| Public deployment | NOT RUN — approval required | Production origin, public host and publish action deliberately unset |

The separate Web CI workflow passed on the restored Product Spec branch head `a0f8e1cc36436d037923462d673784424b505644` in GitHub Actions run `34760417261`. Canonical URLs use `https://mystery-atlas.example` until an approved free deployment hostname is known.

## Android V2

The V3 Source of Truth identifies `a6ac8c188e23e49eee265518fb0cda1fcb73c059` as the verified V2 commit and records successful real-phone testing, a successful Android CI/build path, tests of seven major screens, and an existing debug APK. Exact historical CI run and artifact identifiers were not supplied, so no new identifiers are invented here. V3 work does not alter `app/` or the Android workflow.

The historical detail below predates the verified V2 handoff and is retained only as implementation provenance. Where it conflicts with the preceding verified handoff status, the preceding status controls.

## Verified V1 baseline

- Repository: `rhtngudwls2-lang/MysteryAtlas`.
- Baseline main: `144c8f69bde3174c7190a22774e8ed3cf339a9d5`; all 36 source ZIP blobs matched the live commit.
- GitHub Actions run `34670668444`, job `103491294554`: host QA, debug APK build and artifact upload succeeded.
- V1 APK: `app-debug.apk`, 11,589,966 bytes, SHA256 `c2ea8d61b4dfd1d783695772df136f619ccc4858e7fd42dee5ca1200c8a18e3a`.
- Android installation and launch: confirmed by the user for V1. V1 commercial/UX/visual quality failed and is not inherited by V2.

## Historical pre-V2 execution block

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
