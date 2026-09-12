# Independent Functional QA — final local V2 review

Reviewer: functional_review, independent of the V2 app implementation and the coordinator's final app/test/runner changes. Date: 2026-09-12. No GitHub interaction.

**Final Android Functional QA: BLOCKED / NOT APPROVED.** Local source and host checks were completed. Runtime functional acceptance remains unexecuted because this environment has no Gradle 8.13, Android SDK or adb/Android execution environment. This limitation is independently scoped to Android execution, not to GitHub. No screenshot, APK, Kotlin compile or app behavior is claimed as verified.

## Evidence actually executed

- Initial parser adversarial audit: 10 fixtures against the delivered parser; 3 false-PASS cases (missing scheduled result, unfinished test, duplicate terminal result). `qa/local-validation/instrumentation-parser-audit.json` preserves the before-fix evidence.
- This reviewer authored only the parser fix and `qa/test_instrumentation_parser.py`: **16/16 actual host regression PASS**, exit 0. These are synthetic runner logs passed to the real parser, not Android app executions. Log: `instrumentation-parser-regression.txt`.
- Final coordinator execution evidence read: `host-final.txt` and `final-checks.json`: offline content integrity, **16 parser tests and 6 build-identity tests PASS**, combined host exit 0. Shell syntax exit 0.
- `local-build-final.txt`: actual preflight exit 2, `Gradle 8.13 unavailable; wrapper JAR is not bundled` and `Android SDK path unavailable`.
- `android-runtime-preflight.txt`: actual preflight exit 2, `adb / Android execution environment is unavailable`.
- Parser final independent approval belongs to Independent Red Team, since this reviewer authored its correction. I do not self-approve that code.

## Findings corrected and source-reviewed

| Original finding | Final source-level review | Execution limit |
|---|---|---|
| V1 checklist remained active | V1 document archived at `archive/v1/DEVICE_CHECKLIST.md`; active checklist now names V2 package, seven screens, saved/read state, errors and identity requirements | Checklist is preparation, not evidence |
| Rabbit cycles lacked visited/exhausted state | Visited/read labels, explicit exhausted-branch text and Explore action, path links, `relatedPath` truncation and invalid-edge guard added | Runtime click behavior and rendering NOT RUN |
| No depth contract assertions | Flow now checks depth 1 → 2 → Back → 1; dedicated rule test checks earlier-path revisit preserves graph edges and same-node depth | Prepared Android tests NOT RUN |
| Reading state absent / position restoration unasserted | Narrative-end completion, reading/read labels and DataStore completion storage added. Flow captures stored Cooper index/offset plus actual semantic scroll value; new process compares both and verifies visible `section_money` | Android persistence and actual scroll restoration NOT RUN |
| Storage errors silently resembled empty saved state | Read errors propagate; ViewModel retains last known state, shows distinct storage error and Retry re-subscribes; save/language writes guarded | No executed fault injection; write/read recovery unverified |
| Image decode failure looked permanently loading | `art_loading` / `art_error` / `art_ready` separated with explicit unavailable-image text; dedicated missing-image regression prepared | Android image fallback test NOT RUN |
| Search had no exact-name priority regression | Normalized exact alias/title outranks metadata; dedicated fullwidth/punctuation fixture prepared | Kotlin rule test NOT RUN |
| QA runner could use old evidence or capture before identity/install | Preflight checks adb, app/test inputs and a disposable emulator; previous output moved aside; source/APK hashes checked; captures guarded until installation/data reset completes | Host syntax reviewed; no emulator execution |

Final prepared-test correction independently confirmed: all three Rabbit depth assertions first scroll `rabbit_list` to `rabbit_depth`, so a restored offscreen LazyColumn header is not queried before it is composed. This fixes the source-identified assertion hazard; the corrected Android test remains NOT RUN.

## Prepared Android coverage versus remaining gaps

The Flow test prepares four-tab navigation, Home, empty Saved/Search, Korean Cooper article and evidence/source-section scrolling, related navigation and depth/Back, Explore/category, Cooper search/opening, save/unsave/resave, Recent, locale changes, activity recreation, forced catalog error/Retry, read completion and a stored reading-position handoff. Persistence and Locale tests prepare independent-process bookmark/recent/scroll/completion/nondefault-English persistence. Display tests prepare 360dp and font 1.3/2.0 captures. Three Rule tests prepare path truncation, exact-alias relevance and missing-image fallback. **All Android tests are NOT RUN.**

Precise remaining acceptance gaps:

- Source links have only their section reached; no external URL launch, app-return or no-handler fallback assertion has run or been added.
- Storage read/write faults and Retry are source-reviewed but no fault-injection test has run or been added. Catalog forced error is different from DataStore failure. Article corruption/retry and airplane-mode launch are also unexecuted.
- New reading-completion test proves a positive completion condition only when eventually executed; it does not independently test that opening/partially reading a previously unread article stays incomplete.
- Rabbit exhausted branch and visited labels now exist, but no prepared UI test explicitly clicks the exhausted-branch Explore action or earlier-path link. Missing-ID rejection is source-reviewed, not app-runtime tested.
- Search rule fixtures cover exact alias and normalized punctuation; Korean keyword/person/place/category behavior has not been exercised in Android UI.
- Article force-stop restoration now has a concrete prepared offset/visible-content assertion; tab/list scroll and arbitrary nested Back/process restoration remain incompletely asserted.
- Evidence screenshots anchor to the Evidence heading, with no individual evidence-label/body assertions. Semantics text presence cannot establish full text visibility, clipping, visual hierarchy or accessibility order.
- Display variants cover Home/Explore/Article/Evidence; remaining screens, TalkBack, system/IME overlap, landscape and other API versions have no actual rendering evidence.

## Seven requested actual Android screens

| Screen | Prepared required capture | Actual artifact |
|---|---|---|
| Home | `01-home.png` | NOT PRODUCED |
| Explore | `02-explore.png` | NOT PRODUCED |
| Article | `03-cooper.png` | NOT PRODUCED |
| Evidence | `04-evidence.png` | NOT PRODUCED |
| Rabbit Hole | `05-rabbit-hole.png` | NOT PRODUCED |
| Search | `06-search.png` | NOT PRODUCED |
| Save | `07-saved.png` | NOT PRODUCED |

The runner requires these seven names plus twelve display-variant PNGs. It tests PNG signatures, not complete image decoding, screen identity or visual quality. The new fresh-output handling prevents prior local PNGs satisfying a new run. Final independent visual inspection against the three approved references is still mandatory after any real run.

## Acceptance conclusion

The feasible host/inspection work is complete and concrete discovered defects were corrected in source. **No overall Functional PASS is issued.** Actual Android compile/lint/assembleDebug, all instrumentation, exact-byte APK installation and seven-screen rendering remain individually BLOCKED by the unavailable local Android toolchain. The prepared-but-unexecuted tests and the still-uncovered cases above remain explicit handoff requirements.

## Final reviewed source SHA-256

- `app/src/main/java/org/mysteryatlas/AtlasViewModel.kt`: `24072526c3de95f33cabc93ba3d970aa686541d88b996e87a426dc5d4fb518bb`
- `app/src/main/java/org/mysteryatlas/data/Progress.kt`: `9ac596202b4221e81a21487460fa34f9e6217dd041af4ac05c9f77aa72a1444c`
- `app/src/main/java/org/mysteryatlas/data/Content.kt`: `2f251348ab8666d856c8d003a5201eda58cd1b8670bea5531c709cdcd5addc0b`
- `app/src/main/java/org/mysteryatlas/ui/AtlasApp.kt`: `68ad17172f694022467e04cb1c9ca665e3280c9a6ef117f2cd82e9b04346326e`
- `app/src/main/java/org/mysteryatlas/ui/Components.kt`: `68d23ab44e83ce3d75b5279f8cf080828f73b65ecac5b2dcc0cc8c7f2916730c`
- `app/src/androidTest/java/org/mysteryatlas/V2FlowTest.kt`: `f3dea2cc8b7711114523fa8016926fc73b8ef6a207813f8a0f725dd663a68815`
- `app/src/androidTest/java/org/mysteryatlas/V2PersistenceTest.kt`: `d5d57640ed4b70f20782935aa4737fae3b0328ca4afe1f2ff52fbba3452c5537`
- `app/src/androidTest/java/org/mysteryatlas/V2RuleRegressionTest.kt`: `191fe44461cccd43ed35bf103c0df0d9cff075aff37afdbecc0adcfdfbe83d80`
- `qa/android-run-qa.sh`: `e006c6041645e3c28387135023d550f26274d2061f15ae76534aea206fe32f49`
- `qa/DEVICE_CHECKLIST.md`: `376e269e4bafc4848dd0df124cde2d16f97efd06b0071c4a78e9da2a2421d509`
- `qa/android-check-instrumentation.py`: `66d9273ed74e4af2db3694bcb0a955068a5e433a2a552f3df5d0d1906b4fbf95`
- `qa/test_instrumentation_parser.py`: `5c80b47fbba5d03af654feec255a1a9773bdf5f919e5b3521a2ede460a8a5d3a`
