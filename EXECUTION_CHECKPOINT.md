# Mystery Atlas V2 — execution checkpoint

Checkpoint date: 2026-09-12. This is implementation source, NOT an APK and NOT an approved Android render.

## Verified blocker

The connected GitHub integration can read the original repository, but `create_branch` was denied by GitHub with HTTP 403, `Resource not accessible by integration` (create-reference endpoint). No write or build was completed. `list_installations` returned an empty installations array; the GitHub plugin is enabled/installed. No GitHub CLI credentials are available. This is an integration authorization problem, not a compile failure or an automatic approval-review rejection. Do not retry the same mutation through alternate tools to circumvent this denial. A user-owned GitHub reconnection/authorization step is needed before publishing.

Original repository: https://github.com/rhtngudwls2-lang/MysteryAtlas
Confirmed remote main: `144c8f69bde3174c7190a22774e8ed3cf339a9d5`.
Intended work branch: `codex/mystery-atlas-v2` (creation was denied; it does not yet exist).
Source location: `/workspace/scratch/cd32e8b0f2b8/implementation/MysteryAtlas-main`.

## Implemented, not runtime-approved

- Native Compose Home, Explore/Category, Article, Evidence Layer, Rabbit Hole, Search, Saved and Recent.
- Four bottom navigation destinations, DataStore bookmarks/language/recent/reading position, locale/market-capable text lookup.
- Seven bilingual articles, full Cooper lead article, five generated image assets with provenance. All generated imagery is editorial reconstruction, not historical evidence.
- V1 content archived; map, pins, zoom, theory choices, progress stages and rank removed from the active app.
- V2 application ID `org.mysteryatlas.prototype.v2`, versionCode 2, to preserve the installed V1 and its data. It does not import data across Android app sandboxes.
- Existing build-debug pipeline preserved, with instrumentation/lint and a separate API35 emulator job that tests the exact final APK bytes.
- Six planned instrumentation invocations, 34 logical checks, and 24 expected screenshots including required seven views and large-font/narrow layouts. These are authored tests, not executed results.

## Completed checks

- `bash qa/run-host-checks.sh`: PASS for schema, 7 unique articles, 8 categories, KO/EN values, 18 evidence records, 12 source records, related targets and 5 image hashes/provenance.
- Independent Fact Verification and Editorial **source-text** review: PASS after fixes to Cooper candidates, Evidence wording, Rohonc accession year, Phaistos chronology and reading time. Screen-level review remains pending.
- Engineering script syntax and instrumentation log parser fixtures: PASS. Static Kotlin/Compose inspection only; no compiler result.
- `git diff --check`: PASS.

## Outstanding mandatory gates

1. Restore authorized GitHub write/workflow access and recheck remote main before creating the branch. Do not change repository visibility.
2. Publish this source snapshot through the authorized GitHub workflow. Keep original main intact until a reviewed, working candidate is ready.
3. Run GitHub Actions, fix real build/lint/runtime failures. Two identical failed methods must not be repeated a third time.
4. Download emulator evidence and inspect actual Android Home, Explore, Cooper top, Evidence, Rabbit Hole, Search and Saved. Add a labeled REAL ANDROID RENDER contact sheet only after screenshots exist.
5. Independent Product, UX/Design, Editorial, Fact, Engineering, Functional QA and Red Team must inspect the real outputs. Any critical FAIL blocks overall PASS; fix and re-render.
6. Retrieve the exact tested APK artifact, verify hash/identity/size and make it available to the user. Do not claim an APK exists before obtaining it.

The current environment has Java 17 but no installed Gradle/Android SDK/adb/emulator. Do not silently accept additional SDK legal agreements or move to browser-based GitHub writes after an integration authorization failure. The existing CI route is the intended execution environment.

## Handoff roles

Implementation owner: root. Content author: fact_rights_review. Independent content reviewer: independent_fact_editorial. Build/CI author and cross-code reviewer: engineering_review. Functional test author/reviewer: functional_qa. Asset author: visual_assets. Product/UX/independent Red Team reviewer from Part 1: visual_product_review. Authors may not give final approval to their own implementations.

Approved references remain the three original user attachments from Part 1. The approved visual direction must be evaluated against Android screenshots, not against source code or generated artwork alone.
