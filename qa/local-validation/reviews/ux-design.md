# Independent UX-Design review — final local source review

> **Final reviewed status:** Targeted static UX findings UX-01–UX-05 are CLOSED; static source review PASS within the stated scope. **Overall Android UX/Visual gate remains BLOCKED**, because no real Android renders or runtime measurements exist. The initial FAIL and intermediate notes below are retained as a correction history, not the final source verdict. See the final closure section and hashes at the end.

- Reviewer: `/root/ux_review`, independent from implementation author; no source edits by this reviewer.
- Date: 2026-09-12.
- Sole source: verified handoff `project/`; HANDOFF latest instructions precede execution-context details. Current user order removes GitHub as a local QA prerequisite.
- Initial verdict: **FAIL (concrete source-level omissions)**. Actual Android visual approval: **BLOCKED pending an executable Android runtime and renders**. Neither status is caused by GitHub.
- Scope: HANDOFF full text, approved execution context, all three original reference boards opened visually, five unchanged WebP assets opened visually, Compose UI/theme/navigation and prepared instrumentation source inspected.
- No APK was supplied to this reviewer. No screenshot here is an actual Android render. Reference boards are approved direction only.

## Reviewed source identity

| File | SHA-256 |
|---|---|
| `app/src/main/java/org/mysteryatlas/ui/AtlasApp.kt` | `d10bc28c290ac44b304c9d500def9bc016981b9f7ff76d34950675222d6b56b0` |
| `app/src/main/java/org/mysteryatlas/ui/Components.kt` | `5402cb9803c5e210936f875c1fe282ea92319ff1ff4f34a4744aff6c3f7c577e` |
| `app/src/main/java/org/mysteryatlas/ui/Theme.kt` | `416cf629a1ff03b4543323c5a9389f569d2624dbedb3c0d95406828d823ce6d4` |
| `app/src/main/java/org/mysteryatlas/AtlasViewModel.kt` | `a0046b3cd42884a0042f8da76f020a37b703f7e25f8b656695adf5ed6873cfc6` |

Line references below refer to this initial snapshot, not any later correction.

## Concrete source defects and smallest corrections

1. **UX-01 / P1 — list cards omit required information.** `ui/Components.kt:59–63`, `StoryRow`, renders only canonical title, headline and read time beside the image. Localized hook and case status are missing on Search, Saved, Category, Recent, Home new-record and related-story rows. Approved context §5 requires hero/thumbnail, localized headline, localized hook, status and read time for public cards. Add the existing localized hook and status pill in this shared component. No article regeneration is needed.
2. **UX-02 / P1 — Rabbit Hole does not show already visited alternatives or finite-inventory state.** `ui/AtlasApp.kt:133–137` renders every related target under “next question” with no visited marker and no exhausted-path message. `AtlasViewModel.kt` already stores `path`; use it to mark or separate previously visited stories, show “this path is explored” when appropriate, and offer existing Explore. Label a path visit as visited, not as completed reading. This is a static contract failure, not a claim of runtime navigation failure.
3. **UX-03 / P2 — source typography falls below the approved supporting-text baseline.** `ui/Theme.kt:21` sets `labelSmall=13sp`; status pills, read-time and source/caption labels inherit it. Home illustration label is explicit `11sp` at `ui/AtlasApp.kt:76`; brand subtitle is `9sp` at `ui/Components.kt:65`; bottom-tab labels use `13sp` at `ui/AtlasApp.kt:67`. Approved direction starts secondary information at 14sp. Raise meaningful metadata/captions to 14sp; treat any purely decorative brand subtitle separately or remove it under constrained width. Verify runtime after adjustment; increasing font size can expose row constraints.
4. **UX-04 / P2 — saved state has only a color change for sighted readers.** `ui/Components.kt:48` always draws the same outline bookmark, changing Amber/Ivory only. Semantics correctly include selected state and a localized action label. Add a visibly different filled/bookmarked glyph or explicit saved-state text, keeping the existing accessibility label.
5. **UX-05 / P2 — shared manuscript image is not identified as unrelated thematic art.** `assets/v2/catalog.json:646` assigns `images/voynich.webp` to Phaistos, while the opened asset shows an open botanical manuscript, not a disc. Rohonc shares it at line 565. Generic reconstruction text at `ui/AtlasApp.kt:111` and generic image alt at `ui/Components.kt:43` do not disclose the subject mismatch. Keep existing assets; add explicit story-specific thematic-art caption/alt, or use a neutral existing-code placeholder. Do not regenerate images merely for this fix.

## Layout risks requiring actual Android rendering

These are risks grounded in source constraints, not proven clipping defects:

- Home `ui/AtlasApp.kt:83–86` places the read CTA, 48dp save action and read time in one non-wrapping Row. At 360dp and 1.3/2.0 font scaling, the later items receive little width. An adaptive FlowRow or two-row layout is the smallest preventive correction.
- `ui/Components.kt:60–62` always reserves a 94dp thumbnail plus 14dp gap; Saved additionally reserves a save button in `ui/AtlasApp.kt:147`. At 360dp/2.0 the remaining title/hook text column is very narrow. Use stacked/full-width rows at narrow width or enlarged fonts, keeping full titles instead of ellipsizing.
- Home badge/illustration row `ui/AtlasApp.kt:76`, Saved header row `:145`, and brand/language header `:40–44` need narrow/large-font examination. Flexible header height exists, but no actual constraints capture was supplied.
- All article sections are unbounded text rather than fixed-height text boxes; this is a useful source-level safeguard. Article images remain fixed-height crops and must be reviewed for legible composition in the final viewport.
- Material IconButton/Button/NavigationBarItem components are used, with primary CTAs set to minimum 50/52dp. This is credible touch-target intent, not a measured 48dp runtime pass. TalkBack, focus order, safe insets and IME behavior remain not executed.

## Direction and hierarchy assessment from source/assets only

The deep ink/panel palette, ivory body text, limited amber, strong 30sp headline, 17sp/28sp body, image heroes, cards, summary panel, explicit evidence labels and four tabs correspond to the approved dark editorial/documentary direction. The five 1200×800 images are consistent atmospheric editorial assets and were preserved. This supports source/design-direction alignment; it does not approve final Android visual quality.

Calculated solid-color WCAG relative-luminance contrast from actual source tokens:

| Text | On #090F13 | On #121D24 |
|---|---:|---:|
| Ivory #F2EEE5 | 16.65:1 | 14.78:1 |
| Muted #B7BFC5 | 10.35:1 | 9.19:1 |
| Amber #D9AF68 | 9.44:1 | 8.38:1 |

These six solid-color pairs exceed 4.5:1. This does not measure text over changing image/gradient backgrounds, translucency, disabled states or actual rendered pixels.

Home source retains all five sections, honest readership-data placeholder, separate editor picks, and no invented counts. Explore has all eight categories and a one-column fallback below 370dp or above fontScale 1.3, plus empty-category alternatives. Article preserves continuous reading with summary, body sections, evidence/source attribution and related edges. Evidence labels distinguish all five statuses with text as well as color. Save/Search have explicit empty states. Navigation uses SaveableStateHolder, per-article list state, DataStore reading positions and a saved back stack; source intent is coherent, but execution remains untested.

## Seven-screen evidence matrix

| Screen | Source review | Actual Android rendering |
|---|---|---|
| Home | Five sections present; action/metadata responsive fixes recommended | BLOCKED — no render |
| Explore | Eight categories, actual counts, one-column fallback and empty alternative present | BLOCKED — no render |
| Article | Hero, summary, structured sections, sources and continuation present | BLOCKED — no render |
| Evidence | Five distinct status labels plus publisher attribution present | BLOCKED — no render |
| Rabbit Hole | FAIL UX-02 | BLOCKED — no render |
| Search | Matching rows omit required hook/status (UX-01); empty state present | BLOCKED — no render |
| Save | Rows omit required hook/status (UX-01); state indicator UX-04; empty state present | BLOCKED — no render |

Environmental evidence: this reviewer ran `shutil.which` for `gradle`, `adb`, `emulator`, `sdkmanager`; all returned None. `qa/local-validation/local-build-initial.txt` records “BLOCKED: Install Gradle 8.13 … No wrapper JAR is bundled.” These findings establish the currently advertised toolchain is absent; parent execution owns broader environment/network investigation. GitHub was not called and is irrelevant to this source review.

## Gate boundary

Prepared instrumentation records expected Home/Explore/Article/Evidence/Rabbit Hole/Search/Save screenshots and functionality, but test source is not execution evidence. At least 360dp, fontScale 1.0/1.3/2.0, actual image/title/CTA viewport review, TalkBack labels/order, keyboard overlap and measured touch sizes remain necessary for final UX PASS. Correcting this report’s source defects may move the static verdict to PASS, but must not turn actual Android Visual BLOCKED into PASS.


## Independent targeted source re-review — correction round 1

Reviewer `/root/ux_review` independently re-read the current `Components.kt`, `Theme.kt`, `AtlasApp.kt`, `AtlasViewModel.kt`, and `relatedPath` implementation after parent implementation changes. No actual Android screenshots or APK were available.

| Original issue | Re-review result | Current source evidence |
|---|---|---|
| UX-01 mandatory row fields | CLOSED in source | `Components.kt:71–83`: status, headline, hook, canonical title, read time; adaptive stacked layout at actual maxWidth <310dp or fontScale >1.3 |
| UX-02 finite Rabbit Hole | CLOSED in source | `AtlasApp.kt:144–150`: path buttons, visited/reading labels, all-related-visited message and Explore action; `Content.kt` relatedPath truncates cycle to existing ancestor |
| UX-03 secondary typography | CLOSED in source | `Theme.kt:21` labelSmall 14sp; Home note and bottom labels 14sp; Brand subtitle 14sp |
| UX-04 visible saved state | CLOSED in source | `Components.kt:33,60`: filled versus outline bookmark plus existing selected semantics |
| UX-05 shared image disclosure | PARTIALLY FIXED; one inline call site remains | Article hero, cards, rows and Rabbit current-story call sites disclose shared subject art. `AtlasApp.kt:130` still renders Rohonc/Phaistos inline voynich.webp with generic caption/alt |

Home hero badge/actions and Saved header now wrap with FlowRow. The list-card thumbnail/text squeeze risk is reduced by actual-constraint-based stacking. Explicit `art_error` distinguishes failed loads from pending loads and gives a localized placeholder. Saved/Recent reading labels now distinguish in-progress from “Read · reached the end of the story”; the UI makes the completion criterion explicit. None of these static corrections is an actual layout/touch/TalkBack/rendering pass.

Required final small correction for UX-05: pass `sharedImageNote(story,lang)` to the inline `Art` call and use it as the inline caption when non-null. Both affected existing article files contain an image section, so this is a reachable disclosure gap.

Current source hashes at this re-review:

| File | SHA-256 |
|---|---|
| `app/src/main/java/org/mysteryatlas/ui/AtlasApp.kt` | `64f526d03ee1d492ea704415e713247ef79264920c2ee212405b868bb220ca72` |
| `app/src/main/java/org/mysteryatlas/ui/Components.kt` | `68d23ab44e83ce3d75b5279f8cf080828f73b65ecac5b2dcc0cc8c7f2916730c` |
| `app/src/main/java/org/mysteryatlas/ui/Theme.kt` | `c1f5320d0af29993d15a9cd3589365d594c7a1c41b91e3345f5a3af2c9ff60c4` |
| `app/src/main/java/org/mysteryatlas/AtlasViewModel.kt` | `24072526c3de95f33cabc93ba3d970aa686541d88b996e87a426dc5d4fb518bb` |
| `app/src/main/java/org/mysteryatlas/data/Content.kt` | `2f251348ab8666d856c8d003a5201eda58cd1b8670bea5531c709cdcd5addc0b` |

Actual Android UX/Visual gate remains **BLOCKED**, with 7/7 runtime screens unavailable. Local source review itself was performed and is not blocked by GitHub.


## Final independent closure — correction round 2

Reviewer `/root/ux_review` read the actual updated inline image code at `app/src/main/java/org/mysteryatlas/ui/AtlasApp.kt:130`. The inline `Art` now receives `sharedImageNote(story,lang)` as its description and the visible caption uses the same note with a normal reconstruction-caption fallback. Both existing Rohonc and Phaistos image sections therefore disclose that the shared manuscript art does not depict the named artifact. **UX-05 CLOSED in source.** No images or articles were regenerated for this correction.

The current completion detection at `AtlasApp.kt:118` also covers scrolling beyond the story-end marker, while the visible reading label continues to state the actual criterion (reached the end of the story). This observation does not constitute Android execution validation.

**Final static UX review: PASS for the reviewed source contract and closure of UX-01–UX-05.** There are no remaining concrete source defects from this targeted review. Narrow/large-font wrapping, first viewport composition, image crops and overlay contrast, actual 48dp touch areas, TalkBack order, keyboard/insets and runtime navigation/reading-state restoration remain unverified. **Final UX/Visual approval: BLOCKED, not PASS**, pending real Android 7-screen evidence at 360dp and required font scales. GitHub status has no bearing on this local review.

Final reviewed source hashes:

| File | SHA-256 |
|---|---|
| `app/src/main/java/org/mysteryatlas/ui/AtlasApp.kt` | `68ad17172f694022467e04cb1c9ca665e3280c9a6ef117f2cd82e9b04346326e` |
| `app/src/main/java/org/mysteryatlas/ui/Components.kt` | `68d23ab44e83ce3d75b5279f8cf080828f73b65ecac5b2dcc0cc8c7f2916730c` |
| `app/src/main/java/org/mysteryatlas/ui/Theme.kt` | `c1f5320d0af29993d15a9cd3589365d594c7a1c41b91e3345f5a3af2c9ff60c4` |
| `app/src/main/java/org/mysteryatlas/AtlasViewModel.kt` | `24072526c3de95f33cabc93ba3d970aa686541d88b996e87a426dc5d4fb518bb` |
| `app/src/main/java/org/mysteryatlas/data/Content.kt` | `2f251348ab8666d856c8d003a5201eda58cd1b8670bea5531c709cdcd5addc0b` |

This reviewer made no implementation edits. Screenshots reviewed were the three approved direction boards and the five existing assets only; none was represented as Android output.
