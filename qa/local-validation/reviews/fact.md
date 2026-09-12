# Independent Fact review — local V2

Review date: 2026-09-12. Reviewer role: independent Fact reviewer. Source of truth: extracted handoff/project. HANDOFF.md read before review. No GitHub tools or website used. The prior handoff's Fact PASS was not inherited.

## Decision and scope

**Final scoped verdict: PASS — reviewed local source content and attribution, after independent correction recheck.** Initial review found one narrow factual overstatement in English and one stale documentation statement; both are now corrected. This verdict is limited to the checked claims and supplied illustration metadata. Full publication/Android Fact approval still requires actual rendered captions, badges, and links to be checked on the final APK. The Phaistos full-text access limitation below remains open and is not represented as a completed verification.

Seven bilingual articles, catalog status/metadata, all 18 evidence propositions and their source IDs, all 12 source records, and the five-image rights manifest were reviewed. Live official/primary-source pages were checked. No evidence image or article was regenerated. Questions and explicitly labelled editorial inferences were distinguished from factual claims.

## Corrections reported to implementation owner

1. **F-01 — Mary Celeste / sections[id=facts].body.en.** “An intact vessel” overstates the ship's condition. The cited curator records damaged sails/rigging and water ingress. Minimal replacement: **“A vessel still afloat”**. The Korean wording only says the ship remained and does not require the same correction. The remaining boat/instrument/abandonment statements are appropriately qualified. [RMG curator account](https://www.rmg.co.uk/stories/maritime-history/mystery-mary-celeste)
2. **F-02 — SOURCES_AND_RIGHTS.md.** The unlabeled legacy record says no generated historical representations are included, which contradicts the five V2 assets. Preserve its body but add a prominent V1 archival/superseded notice pointing to `qa/CONTENT_SOURCES.md` and `app/src/main/assets/v2/image-rights.json`. This is documentation hygiene, not a reason to regenerate images.

## Independent source checks

| Record | Checked evidence and disposition |
|---|---|
| Cooper | FBI overview plus 2006/2007 archived accounts support date, route, ransom, four parachutes, 36 released passengers, recovered $5,800 in 1980, surviving items, and 2016 resource reallocation. Named candidates are not presented as identified perpetrators. Carr's 2007 survival assessment remains dated and attributed. Source content otherwise acceptable. |
| Voynich | Yale collection page and February 2025 Yale article support repository, 1912 acquisition, 1969 donation, unidentified script and no accepted translation in those sources. Broad 15–16C? label follows Yale's own collection dating and does not pretend radiocarbon age proves when words were written. Source content acceptable. |
| Mary Celeste | RMG curator supports voyage dates, missing people/boat/instruments, abandoned ship and uncertainty of cause. Conan Doyle fiction is correctly distinguished from testimony. F-01 corrected and independently rechecked. |
| Dyatlov | ETH project text and original Gaume/Puzrin research content support nine deaths, slope/traces/injury objections, wind accumulation plus slope-cut mechanism, and the distinction between physically plausible mechanism and a reconstruction of every action. Original paper also reports July 2020 prosecutor conclusion. Leading-explanation status is more accurate than an unqualified paranormal/unsolved framing. |
| Wow! | Observer Ehman's report supports intensity code, local August 15 date, later handwritten Wow annotation, and approximately 72-second observed window. The 2025 arXiv abstract reports revised parameters and a possible astrophysical explanation; it is labelled preprint, not established origin. No sender or exact emission duration is invented. Source content acceptable. |
| Rohonc | HistoCrypt 2019 paper supports approximately 450 pages, more than 80 biblical-looking images, MS K 114, 1838 accession, missing title page/uncertain detached-leaf order and discussion of 2018 publication. Its promising/convincing assessment is not inflated to every sign being solved. The actual 2018 decipherment paper was not independently read in this review. |
| Phaistos | Exact museum article returned fetch errors. Its official indexed excerpt independently supports clay, both sides, spiral placement, small stamps and 241 total signs. Full text was unavailable; this is a limited indexed-excerpt check, not a full-text source verification. No exact date, author or translation was added. Repository/period and unsettled-interpretation claims remain conservatively phrased; a full museum-page recheck remains desirable before publication. |

### URLs actually consulted

- [FBI current overview](https://www.fbi.gov/history/cases-and-criminals/db-cooper-hijacking)
- [FBI 2006 archive](https://archives.fbi.gov/archives/news/stories/2006/november/dbcooper_112406)
- [FBI 2007 archive](https://archives.fbi.gov/archives/news/stories/2007/december/dbcooper_123107)
- [Yale collection](https://beinecke.library.yale.edu/beinecke/collections/beinecke-cipher-voynich-manuscript)
- [Yale February 2025 article](https://news.yale.edu/2025/02/21/deciphering-mysterious-manuscript)
- [RMG Mary Celeste](https://www.rmg.co.uk/stories/maritime-history/mystery-mary-celeste)
- [ETH Dyatlov project](https://geomechanics.ethz.ch/project-list/Dyatlov_pass.html)
- [Original Dyatlov paper](https://www.nature.com/articles/s43247-020-00081-8) and [publisher PDF](https://www.nature.com/articles/s43247-020-00081-8.pdf): HTML failed at publisher redirect; PDF initially returned an 11-page document, subsequent retrieval was unreliable. The original paper's relevant text was also available as [publisher full text on ResearchGate](https://www.researchgate.net/publication/348850259_Mechanisms_of_slab_avalanche_release_and_impact_in_the_Dyatlov_Pass_incident_in_1959), identified by authors and DOI, not as a secondary commentary.
- [Ehman's 30th anniversary report](https://www.bigear.org/Wow30th/wow30th.htm)
- [Wow 2025 arXiv record/abstract](https://arxiv.org/abs/2508.10657)
- [Láng's HistoCrypt 2019 paper](https://ep.liu.se/ecp/158/006/ecp19158006.pdf)
- [Heraklion Phaistos exhibit](https://heraklionmuseum.gr/en/exhibit/the-phaistos-disc/): official indexed excerpt only; direct text unavailable.

## Evidence labels and images

CONFIRMED entries refer to observable records or publication existence. DEBUNKED is attached to an explicit false proposition, never an entire unresolved case. CLAIM/DISPUTED text contains the qualification next to the proposition. Related-case links are thematic, not shared-cause assertions. No legend was invented to fill an unused status.

All five delivered WebP hashes match their rights-manifest entries in this independent check. Every entry says AI_GENERATED_EDITORIAL_ILLUSTRATION and isEvidence=false. Article image text discloses reconstructions; Rohonc/Phaistos reuse is explicitly identified as general archive imagery. Wow's dish is explicitly disclaimed as the actual Big Ear instrument. The source code includes an Article hero reconstruction notice and an imagery explanation. This confirms intended text presence only; it does not prove visibility/readability on Android.

The original generation events and original PNG bytes are not present here, so their provenance is recorded as supplied metadata rather than independently re-enacted or legally certified. No external source photographs or sound recordings were fetched into the project by this reviewer.

## Remaining limits

- No real Android rendering was observed. Caption visibility, badge truncation, source-link routing and readability on device remain untested here.
- The Heraklion full article was inaccessible; the excerpt check must remain explicit.
- The Rohonc 2018 full decipherment and independent reproduction of that decipherment were outside this review; the article relies explicitly on the 2019 scholarly review.
- A limited source fact-check is not an assertion of exhaustive current scholarship or an independent historical investigation.

## Reviewed local file hashes (snapshot before correction recheck)

```text
3c1ab59ca3db7c47b910e6522ed7c7e3f71bee4ad21efe6d66aa4e460d285d13  app/src/main/assets/v2/articles/cooper.json
447a0f6663652290e937ffaef840b4077c8333c8a07c18e63a6f765f0a08e4e9  app/src/main/assets/v2/articles/dyatlov.json
63566988e0e6d53895f2480d781f30f5f0c2fa414cf0ac95c60996599669eff3  app/src/main/assets/v2/articles/mary-celeste.json
a3cdb8b06a96e421ee5de1cde8fb5ab9c33c1760b1010257fe67fffec5d5c547  app/src/main/assets/v2/articles/phaistos.json
103e17db77d1367f1b16f5f673c696358e38e4317e50a1b8651c39f1471c7cb6  app/src/main/assets/v2/articles/rohonc.json
6dc76a10f5c0f007296a8ca0d9e85219601439184e52c2bd9911111cf0d74f0a  app/src/main/assets/v2/articles/voynich.json
6d6e9512475152331bfd14acbb86ae2afc3f81af3bd87464a710629eaf004369  app/src/main/assets/v2/articles/wow.json
3233976158b21f8da49c01010fdc339d1b88422560ac93ac5047b3689e074881  app/src/main/assets/v2/catalog.json
5a07ec74a72e6c77ceba8ae59a5aea52d313aac88520d3a5c39a6d6dbcace7be  app/src/main/assets/v2/image-rights.json
fe1036e2885286d6537256adebe9292c086bd9e08f48c7a45b9392beec955aaf  SOURCES_AND_RIGHTS.md
83c5737f00731f37deca9bd29177ffda2194fb2a82b3c58257c7ca3f251294ae  qa/CONTENT_SOURCES.md
77bbe5f23fb4ae198a8993d72550ae476221ee902806e16ed3c166def0383d10  app/src/main/assets/images/cooper.webp
6b25f0b7707f10100d3fda05ce5ea0dbb39d8e4335f05c1588f410ebcb21f0cf  app/src/main/assets/images/dyatlov.webp
97272ede0f5655d6bc1033b0a9dba1512d4a113b4e619e74f659f1e4083c02fc  app/src/main/assets/images/mary-celeste.webp
f22ca79caf90774b8550862604926e24ae1d1a575585d61ff26fd9644bef9e73  app/src/main/assets/images/voynich.webp
2aad3b5bbc09abee1d5e624960bff23085dcfad5dfdd0f12030c8a77a0e3757b  app/src/main/assets/images/wow.webp
```

## Final independent correction recheck

Rechecked 2026-09-12 after implementation-owner notification. F-01 is resolved: comparison against the uploaded original ZIP proves the only change to `mary-celeste.json` is “An intact vessel” → “A vessel still afloat”. F-02 is resolved: the current rights file has the explicit V1 archival/superseded notice, both V2 paths are present, and the original document body remains byte-for-byte at the end of the file.

The `sharedImageNote` function now supplies a bilingual notice for Rohonc/Phaistos that the shared thematic illustration does not depict the artefact. Its text is wired into the Article hero and relevant card components. This is a positive source-code disclosure check only, not a rendered visibility check. The five WebP hashes were independently recomputed again and all still match the original image-rights manifest.

No further high-confidence factual correction is outstanding in the reviewed article text. The source-access, primary-study scope, provenance and Android-rendering limits above remain unchanged. No APK, build result, screenshot or final Product PASS was inferred from this Fact review.

### Final reviewed file hashes

```text
3c1ab59ca3db7c47b910e6522ed7c7e3f71bee4ad21efe6d66aa4e460d285d13  app/src/main/assets/v2/articles/cooper.json
447a0f6663652290e937ffaef840b4077c8333c8a07c18e63a6f765f0a08e4e9  app/src/main/assets/v2/articles/dyatlov.json
ca0957fd233af02c5e211695765be6fdf2dfc11e6d36f4ab70262ce9c4b615c9  app/src/main/assets/v2/articles/mary-celeste.json
a3cdb8b06a96e421ee5de1cde8fb5ab9c33c1760b1010257fe67fffec5d5c547  app/src/main/assets/v2/articles/phaistos.json
103e17db77d1367f1b16f5f673c696358e38e4317e50a1b8651c39f1471c7cb6  app/src/main/assets/v2/articles/rohonc.json
6dc76a10f5c0f007296a8ca0d9e85219601439184e52c2bd9911111cf0d74f0a  app/src/main/assets/v2/articles/voynich.json
6d6e9512475152331bfd14acbb86ae2afc3f81af3bd87464a710629eaf004369  app/src/main/assets/v2/articles/wow.json
3233976158b21f8da49c01010fdc339d1b88422560ac93ac5047b3689e074881  app/src/main/assets/v2/catalog.json
5a07ec74a72e6c77ceba8ae59a5aea52d313aac88520d3a5c39a6d6dbcace7be  app/src/main/assets/v2/image-rights.json
601b0e2e8b25c99249287a93863f02c85c8396a712ed0b0b5d08d16345ec2e6a  SOURCES_AND_RIGHTS.md
83c5737f00731f37deca9bd29177ffda2194fb2a82b3c58257c7ca3f251294ae  qa/CONTENT_SOURCES.md
68d23ab44e83ce3d75b5279f8cf080828f73b65ecac5b2dcc0cc8c7f2916730c  app/src/main/java/org/mysteryatlas/ui/Components.kt
64f526d03ee1d492ea704415e713247ef79264920c2ee212405b868bb220ca72  app/src/main/java/org/mysteryatlas/ui/AtlasApp.kt
77bbe5f23fb4ae198a8993d72550ae476221ee902806e16ed3c166def0383d10  app/src/main/assets/images/cooper.webp
6b25f0b7707f10100d3fda05ce5ea0dbb39d8e4335f05c1588f410ebcb21f0cf  app/src/main/assets/images/dyatlov.webp
97272ede0f5655d6bc1033b0a9dba1512d4a113b4e619e74f659f1e4083c02fc  app/src/main/assets/images/mary-celeste.webp
f22ca79caf90774b8550862604926e24ae1d1a575585d61ff26fd9644bef9e73  app/src/main/assets/images/voynich.webp
2aad3b5bbc09abee1d5e624960bff23085dcfad5dfdd0f12030c8a77a0e3757b  app/src/main/assets/images/wow.webp
```
