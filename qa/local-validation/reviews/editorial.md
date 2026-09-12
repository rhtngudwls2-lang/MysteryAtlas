# Independent Editorial review — local V2

- Reviewer: independent Editorial agent `/root/editorial_review`, not implementation owner.
- Review date: 2026-09-12.
- Baseline: handed-off V2 project; latest user instruction permits local validation and targeted failure corrections, without GitHub access or regeneration.
- Scope: all seven KO/EN article JSON files, catalog headlines/hooks/statuses/related reasons, five packaged image files opened visually, image provenance/captions, shared card/article rendering source.
- Initially reviewed article/catalog/provenance content-set SHA-256: `ba3cd7464501e0f6dde5f0f6b717093f45318782af6457b2352fcba68687fcc8`.
- Re-reviewed current content-set SHA-256: `0a4ed24d4932d44410d529b82a54814eb7635a3fd2e4675061325de1a77a2745`. Digest construction: ordered paths catalog.json, image-rights.json, then article JSON names sorted; for each path relative to assets/v2, UTF-8 path + NUL + file bytes + NUL.
- Re-reviewed `Components.kt` SHA-256: `68d23ab44e83ce3d75b5279f8cf080828f73b65ecac5b2dcc0cc8c7f2916730c`.
- Previously re-reviewed `AtlasApp.kt` SHA-256: `64f526d03ee1d492ea704415e713247ef79264920c2ee212405b868bb220ca72`.
- Final delta-reviewed `AtlasApp.kt` SHA-256: `68ad17172f694022467e04cb1c9ca665e3280c9a6ef117f2cd82e9b04346326e`.
- Re-reviewed `articles/mary-celeste.json` SHA-256: `ca0957fd233af02c5e211695765be6fdf2dfc11e6d36f4ab70262ce9c4b615c9`.
- Android APK identity: unavailable to this reviewer; no execution or Android screenshot evidence reviewed.

## Judgment

**Editorial source review: PASS after independent source reinspection; E-01 closed.** No unresolved editorial source blocker remains in the reviewed revision.

**Article wording and packaged imagery: PASS within the source/assets review scope.** This is not factual re-verification against current external sources, actual Android rendered Editorial PASS, Visual PASS, or Product PASS.

**Actual Android rendered editorial quality: NOT RUN.** Required evidence includes the final app's seven main screens, paragraph readability, full Korean titles, illustration captions and article continuity on the intended phone widths/font scales.

## Corrected issue E-01 — independently rechecked

Initial finding: `app/src/main/java/org/mysteryatlas/ui/Components.kt`, `StoryRow` omitted `story.status` and `story.hook`. It rendered thumbnail, canonical title, localized headline and reading time only. Execution-context section 5 requires localized headline, hook, case status and reading time on cards. The larger `StoryCard` met this requirement, but `StoryRow` is used on Home new records, category lists, Search, Saved, Recent and article-related lists.

Verified correction: the shared `copy` composable in `StoryRow` now renders the existing localized status pill and localized hook as well as full headline, canonical title and reading time. Both side-by-side and stacked branches invoke the same `copy`, so the requirement is covered in both source paths. Rows use a stacked layout below 310dp available width or above 1.3 font scale. No fixed body height, `maxLines` or ellipsis was introduced. Actual Android behavior at the threshold and font scales remains untested.

Additional source reinspection confirmed that the Rabbit Hole current-connection panel now includes status metadata, localized hook and reading time. It no longer calls an unvisited initial connection a story just read.

The tiny Fact-requested English correction in Mary Celeste's `facts` section changes “An intact vessel” to “A vessel still afloat”. This improves precision while preserving the narrative and Korean-English meaning. Direct comparison against the supplied ZIP confirmed this is the only article text change. Catalog and image-rights JSON are unchanged; all five packaged WebP files still match the original ZIP bytes exactly.

## Completed source/content checks

| Check | Result and evidence |
|---|---|
| Cooper headline | PASS: exact approved Korean headline retained; English version conveys the same unresolved escape question. |
| Cooper completeness | PASS: 30-second summary plus 12 sections covering opening, timeline, jump, investigator assessment, recovered money, surviving evidence, established facts, competing possibilities, named candidates, current position, remaining questions and next records. Four evidence records and three FBI source entries present. |
| Five core stories + two related records | PASS: Cooper, Voynich, Mary Celeste, Dyatlov, Wow!, Rohonc and Phaistos each have complete KO/EN summary, ordered body sections, evidence and sources; no placeholder article or empty related target observed. |
| Headlines/hooks | PASS: clear curiosity tied to the actual article; no promise of a solved identity, decoded alien message or final decipherment that the body does not deliver. English and Korean do not introduce contradictory editorial outcomes. |
| Evidence language | PASS as wording review: statements distinguish records, models, proposals and conclusions. Cooper candidates are not presented as identified hijackers; the money recovery is distinguished from survival. Dyatlov's avalanche support is retained. Wow!'s characters are described as intensity readings, with the natural-origin proposal qualified. |
| Related reasons | PASS: all 14 catalog edges provide meaningful KO/EN reasons and connect distinct existing articles. Related text is thematic; Rabbit Hole source explicitly disclaims a causal connection. Runtime traversal is outside this review. |
| Readability in source | PASS: sections are broken into short paragraphs; headings, summary, timeline, image and evidence structures avoid one uninterrupted body. Cooper has 706 English words including headings/evidence; other articles have 239–267. KO non-whitespace counts are 1,697 for Cooper and 607–689 for others. These are content counts, not actual on-screen density measurements. |
| Reading-time plausibility | PASS for editorial plausibility: 4 minutes for Cooper and 2 for each shorter piece are reasonable estimates from the observed lengths. Calculation metadata/provenance was not established by this editorial review. |
| Popularity/stock honesty | PASS in source: Home retains “집계 준비 중” / “Readership data coming soon” and a separate editor's-picks label; no fabricated readership numbers or ranks found. Empty categories use preparation copy and actual available counts. |
| Images | PASS as packaged assets: all five 1200×800 WebP files opened; main subjects are recognizable and documentary/archival in tone. No visible UI/watermarks, real-person face allegations, invented document evidence, gore or supernatural spectacle. |
| Image transparency | PASS in wording/source: all five provenance records declare generated editorial illustration and `isEvidence=false`; article heroes have illustration captions, in-article image captions distinguish the records and an image-information section explains the generation. |
| Card component closure | PASS in source reinspection: all `StoryRow` layout branches include localized hook and case status. Shared card and Rabbit Hole current-connection content meet the required editorial fields. |
| Reused illustration disclosure | PASS in source reinspection: Rohonc/Phaistos now show “주제 공통 이미지 · 해당 유물의 모습이 아닙니다” / “Shared thematic illustration · not a depiction of this artifact” in rows, cards, article heroes and the Rabbit Hole current-connection panel, with matching accessibility descriptions at those locations. |

## Limits and non-blocking observations

- Rohonc and Phaistos reuse the manuscript illustration. Both bodies explicitly describe it as generic generated archive imagery, not the actual codex/disc; the correction adds visible shared-illustration disclosure before entering the article and at its hero. Reuse fits the preserved five-asset package, but subject specificity is still weaker for Phaistos. No new asset generation is requested by this review.
- The approved Cooper visual board was inspected as design direction only. Its invented/factually misleading details were not treated as requirements or evidence; the current source correctly avoids reproducing its false no-money-recovered narrative.
- Current external source validity/factual currency belongs to the separate Fact review. Source presence and carefully qualified wording do not establish factual PASS by themselves.
- Image crop/readability in card sizes, all title wrapping, paragraph density, caption legibility and the delivered application's continuity remain dependent on actual Android output. GitHub synchronization is not a prerequisite for those local checks.

## Changes by this reviewer

No implementation, article, image, test or build configuration changed. This review file is the only written artifact.

## Final byte-alignment check

The two narrow final `AtlasApp.kt` followups were independently inspected: reading completion also recognizes scrolling past the end-of-body marker, and inline article imagery now uses the same specific shared-illustration caption/accessibility description as Rohonc/Phaistos hero and card imagery. The completion change introduces no new editorial claim; behavioral correctness remains the Engineering/Functional QA scope. The inline-caption change improves consistency and does not modify the preserved illustrations or articles.

**Final Editorial source verdict remains PASS at the final `AtlasApp.kt` hash above. Actual Android rendered Editorial remains NOT RUN.** No broad rereview or new content generation was performed for these two changes.
