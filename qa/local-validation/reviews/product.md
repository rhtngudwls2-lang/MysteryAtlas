# Independent Product review — final source re-review

Reviewer: `/root/product_review`, independent of the implementation owner. Date: 2026-09-12.

**Product source review: PASS for the reviewed local seven-story implementation.** All five original Product findings and the completion-marker regression found during re-review are corrected in the inspected source. **Full Android Product Gate: NOT RUN / unverified, not PASS.** No build, installation, Android execution or real seven-screen rendering was performed or claimed by this reviewer. GitHub was not required or accessed.

## Corrected findings and verification scope

| Finding | Final source evidence | Decision |
|---|---|---|
| Related revisit created nonexistent adjacency | `data/Content.kt:38–39` truncates an existing path; `AtlasViewModel.kt:45–51` checks edited edges, `:63` supports explicit path revisit. Cooper → Mary Celeste → Dyatlov → Wow → Dyatlov now yields Cooper → Mary Celeste → Dyatlov. | SOURCE PASS / closed |
| Public rows omitted hook/status | `ui/Components.kt:71–82` includes status, full localized headline, hook, read time, canonical title and optional reading state; narrow/large-font layout stacks. All existing StoryRow call sites share this implementation. | SOURCE PASS / closed; fit unrendered |
| Rabbit loop / exhaustion / false just-read wording | `ui/AtlasApp.kt:144–149` shows Current connection, clickable path history, visited/reading/read labels, a finite-branch message and Explore action. Connection reasons and non-causation notice remain. | SOURCE PASS / closed |
| Search had no ranking | `data/Content.kt:40–49` normalizes NFKC and locale-independent case, prioritizes exact title/alias, partial title/alias, headline, metadata, then stable ID. `AtlasViewModel.kt:73` uses this rule. | SOURCE PASS / closed; UI/Android execution unverified |
| Reading/read state absent | `data/Progress.kt:10,16,22,28` persists completed IDs; `AtlasViewModel.kt:72` writes completion; `ui/AtlasApp.kt:161,166,168` shows reading state and explicitly defines Read as reaching the story end. | SOURCE PASS / closed |
| Re-review found completion skipped on fling or restore past marker | `ui/AtlasApp.kt:116–119` now also recognizes `firstVisibleItemIndex > 3+a.sections.size`, not just the visible marker; `:133` is that marker after three leading items + article sections. Idle restoration beyond it therefore qualifies by source logic. | SOURCE PASS / closed; real scroll test pending |

I independently checked 3,570 transitions from the actual 14-edge catalog against the truncating-path invariant with a host model. No duplicate route nodes or invented adjacency remained in that oracle. This supports the rule design and confirms the original concrete counterexample's expected correction; it does **not** execute the Kotlin implementation or certify runtime behavior.

The original 4-tab / 5-Home-section / 8-category source checks remain satisfied. The seven bundled articles and fourteen valid related targets remain real inventory, popularity remains honestly unavailable with separate editor picks, and no active V1 map/game mechanism was found. No additional blocking Product source regression was observed in the five reread implementation files.

## Remaining scope and risks

- Actual discovery → article → related → save → return; seven actual Android screens; back/scroll/process restoration; all new reading-state behavior; 360dp and large-font fit remain unverified until a final APK is executed.
- The core reading criterion is reaching the end of editorial body, not cognitive proof of reading; the visible label says this explicitly. Evidence and sources continue below it.
- The existing richer draft/publication-state and content-revision contracts are not fully modeled. No actual draft leak exists in this reviewed seven-file inventory. Differently dated future content also needs explicit date sorting; current publication dates are identical. These remain recorded future-content risks, not newly asserted current broken flows.
- This source PASS cannot be used as an aggregate Product Gate PASS while Android execution is absent.

## Exact final reviewed source hashes

| Path relative to project | SHA-256 |
|---|---|
| `app/src/main/java/org/mysteryatlas/AtlasViewModel.kt` | `24072526c3de95f33cabc93ba3d970aa686541d88b996e87a426dc5d4fb518bb` |
| `app/src/main/java/org/mysteryatlas/data/Content.kt` | `2f251348ab8666d856c8d003a5201eda58cd1b8670bea5531c709cdcd5addc0b` |
| `app/src/main/java/org/mysteryatlas/data/Progress.kt` | `9ac596202b4221e81a21487460fa34f9e6217dd041af4ac05c9f77aa72a1444c` |
| `app/src/main/java/org/mysteryatlas/ui/Components.kt` | `68d23ab44e83ce3d75b5279f8cf080828f73b65ecac5b2dcc0cc8c7f2916730c` |
| `app/src/main/java/org/mysteryatlas/ui/AtlasApp.kt` | `68ad17172f694022467e04cb1c9ca665e3280c9a6ef117f2cd82e9b04346326e` |
| `app/src/main/assets/v2/catalog.json` | `3233976158b21f8da49c01010fdc339d1b88422560ac93ac5047b3689e074881` |

Machine-readable final evidence: `product-static-final.json`. Original pre-fix hashes/counterexample: `product-static-evidence.json`. The implementation owner authored all app fixes; this reviewer wrote only review/evidence files.

---

# Historical initial review — findings below have the final disposition above

The following preserves the initial review and original line references. Its initial FAIL is historical; current source status and remaining Android limits are given above.

# Independent Product review — Mystery Atlas V2 local validation

Reviewer: independent Product reviewer `/root/product_review`; no app implementation performed by this reviewer.
Date: 2026-09-12.
Target: verified handoff project; original baseline local commit recorded in HANDOFF `418f05d0b6ae2ecc8415f831ad2b203b0a9aaf06`. Exact reviewed file hashes and executed host counterexample are in `product-static-evidence.json`.
Precedence: current user local-only execution request > HANDOFF > execution context. GitHub was neither required nor accessed. V1 parallel installation and absent cross-package migration are disclosed latest HANDOFF choices, not newly inferred failures.

## Decision

**Initial Product source review: FAIL.** Core IA and bundled inventory pass static review, but concrete card-contract and related-path defects exist. **Android Product flow/visual approval: NOT RUN / unverified.** This reviewer has not built, installed, or executed the app and has not received real Android screenshots. Missing GitHub synchronization is not a Product blocker.

## Confirmed passing source checks

| Requirement | Source evidence | Result and limit |
|---|---|---|
| Exactly four main tabs | `app/src/main/java/org/mysteryatlas/ui/AtlasApp.kt:66` declares Home, Explore, Saved, Search | SOURCE PASS; not tap-tested |
| Five Home sections in approved order | `AtlasApp.kt:70–93`: today Hero; most-read unavailable/editor picks; Rabbit Hole; categories; new records | SOURCE PASS; viewport composition not verified |
| Popularity honesty | `AtlasApp.kt:88–89`: explicit readership-data-coming-soon subtitle plus separate editor-picks text, no fabricated counts or ranking | SOURCE PASS |
| Eight approved Korean category names | `app/src/main/assets/v2/catalog.json`, executed exact-set comparison in `product-static-evidence.json` | SOURCE PASS |
| Empty categories honest | Three actual zero-inventory categories: beyond, creatures, hidden; `AtlasApp.kt:98,102` uses Coming soon and Explore categories action | SOURCE PASS; screen not rendered |
| Five core plus two connected articles | Inventory: cooper, voynich, mary-celeste, dyatlov, wow, rohonc, phaistos; all seven article paths exist and case IDs match | HOST DATA PASS |
| Related links resolve | All 14 edges have valid non-self targets and nonempty KO/EN connection reasons | HOST DATA PASS; traversal state has separate FAIL below |
| Continuous article structure | `AtlasApp.kt:110–129`: Hero, metadata, title/hook, read time, summary, ordered sections, Evidence, sources/verification, imagery notice, Rabbit Hole and related rows | SOURCE PASS; readability and source-opening behavior unverified |
| Separate case status / Evidence labels | `Components.kt:47`, `AtlasApp.kt:123–131` and `Content.kt:31` | SOURCE PASS; missing case status on compact rows is separate FAIL |
| Discovery → article → related → save → return wiring | `AtlasViewModel.kt:30–37,40`, `AtlasApp.kt:84,103,128,136,142,147` | SOURCE PRESENT; real persistence/back/scroll remains NOT RUN |
| Save/remove/empty/recent/reopen implementation | `Progress.kt:24–27`, `AtlasApp.kt:144–152` | SOURCE PRESENT; no Android persistence claim |
| Tab/article/category state preservation mechanism | `AtlasApp.kt:50`, article LazyListState at `:106–107`, SavedStateHandle stack at `AtlasViewModel.kt:20–37` | SOURCE PRESENT; restoration behavior unverified |
| No active V1 game/map | `app/src/main` scan finds no map/rank/game state or old JSON assets; V1 JSON is outside app assets under `archive/v1/` | SOURCE PASS; ordinary historical words such as “investigation” in articles are content, not V1 code |
| Generated-image notice | `AtlasApp.kt:76,111,120,127`, `Components.kt:43` | SOURCE PRESENT; prominence/readability needs actual rendering |

## Findings requiring correction

### P1 — Related-path revisit invents a graph edge

- Source: `app/src/main/java/org/mysteryatlas/AtlasViewModel.kt:32`, `ArrayList(path.value.filter{it!=id}+id)`.
- Counterexample uses the actual catalog: `cooper → mary-celeste → dyatlov → wow → dyatlov` is a sequence of valid clicked edges.
- Current update yields `[cooper, mary-celeste, wow, dyatlov]`. `mary-celeste → wow` is not an edited related edge. Displayed depth becomes 4 rather than returning to the existing Dyatlov point at depth 3. Thus the state is a reordered distinct-visit list, not the current path required by the design contract.
- Executed evidence: `product-static-evidence.json`, check `rabbit_revisit_counterexample`. This is a host counterexample to the directly inspected Kotlin expression, not a claim of Android execution.
- Proposed correction: on revisit, truncate the existing path through the original index of the target; on new valid related navigation append; keep root/non-related opening at one element. Validate adjacency and depth with the actual cycle above and verify Back restoration in Android when available.

### P1 — Public compact story rows omit required hook and case status

- Source: `app/src/main/java/org/mysteryatlas/ui/Components.kt:59–63`.
- `StoryRow` displays thumbnail, canonical title, localized headline and read time, but no `story.hook` and no `story.status`.
- Affected visible destinations: Home new records (`AtlasApp.kt:93`), category (`:103`), related rows in Article (`:128`), Search (`:142`), Saved (`:147`) and Recent (`:152`).
- Requirement: execution-context §5 requires Hero/thumbnail + LocalizedHeadline + LocalizedHook + case status + locale read time on cards. Existing data already contains missing copy; regeneration is unnecessary.
- Proposed correction: include localized hook and textual status in the shared row component; retain full headline and adapt row layout at 360dp / large fonts. Verify actual overflow after building, rather than assuming the added text fits.

### P2 — Rabbit Hole loops have no visited/exhaustion affordance

- Source: `app/src/main/java/org/mysteryatlas/ui/AtlasApp.kt:133–137`.
- Every related target is always displayed under “Choose your next question,” with no visited label and no exhausted-current-path state or explicit Explore action. Existing graph contains several cycles, including the Voynich/Rohonc/Phaistos component.
- Requirement: related inventory must not masquerade as infinitely new content; exhausted routes offer another path, read/visited marking and discovery return.
- Proposed correction: visibly label targets already in the path or recent-reading state; show honest completion/exhaustion copy when all outgoing targets have been visited; keep a visible Explore action. Do not remove valid links arbitrarily.
- Related copy issue: when Rabbit Hole is entered directly from Home, `AtlasViewModel.kt:34` seeds Cooper and `AtlasApp.kt:135` calls it “지금 읽은 이야기 / YOUR CURRENT STORY,” even when no article was opened. Prefer a neutral path/current-story label or distinguish entry context.

### P2 — Search ignores the required relevance ordering

- Source: `app/src/main/java/org/mysteryatlas/AtlasViewModel.kt:43–44`.
- Normalized filtering covers useful KO/EN titles, aliases, people, places, tags and categories. However it returns catalog-order matches with a single `contains` predicate. There is no exact title/alias > headline > metadata scoring.
- This is a directly observed requirements omission; the current seven-item inventory does not by itself prove a harmful ranking for a specific user query.
- Proposed correction: extract deterministic match scoring with stable tie-breaking. Verify exact alias beats a different case’s metadata match, plus mixed punctuation/case and KO/EN variants.

### P2 — No explicit reading/read state or completion criterion

- Source: `app/src/main/java/org/mysteryatlas/data/Progress.kt:12,18–27`, `AtlasApp.kt:106–107,144–152`.
- State records bookmarks, recent IDs and numeric list positions. It does not store completed IDs or define a read threshold, and UI does not present 읽는 중/읽음 or equivalent.
- Requirement: execution-context §5 requests reading/read status from automatic location using an explicit criterion, separate from game progression.
- Proposed correction: use a documented content-reading threshold, such as reaching the end of editorial/Evidence content; persist completion idempotently, retain it after return to the start, and show reading/read state in Saved/Recent. Do not claim scrolling to the end proves the text was cognitively read. Real Android verification remains necessary.

## Non-blocking implementation observations

- Catalog `publicationState`, content revision, richer normalized entities and full locale-market variant contracts in the early execution context are not fully modeled by this implementation. The current seven supplied entries all have complete article files and known publication dates; no current draft leak was found. Treat future catalog growth as requiring explicit publication-state validation rather than inventing an existing leak.
- Home new-record selection uses catalog `takeLast(3)` at `AtlasApp.kt:93`; all seven current `publishedAt` values equal 2026-09-12, so no current wrong-date ordering is demonstrated. Sort explicitly before adding differently dated inventory.
- Keep final source-only corrections distinct from runtime approval. Passing JSON or source checks cannot satisfy the requested seven actual Android screens.

## Android verification still required

Actual Home / Explore / Article / Evidence / Rabbit Hole / Search / Save flow; bookmark/save/remove across process restart; tab/list/article scroll retention; Back through related paths; KO/EN search and empty states; error recovery; 360dp and large-font rendering; no crashes or hidden touch targets. The reason these remain unverified is absent execution evidence, not GitHub state. The implementation owner must attach environment findings/build output separately.

## Independence and re-review

This reviewer wrote only review/evidence files under `qa/local-validation/reviews/` and made no app source, article, image, test or build configuration edits. A source re-review is required after owner fixes; the initial line numbers and hashes describe the pre-fix state. Even a corrected source PASS must keep Android Product approval unverified until the actual APK is executed.
