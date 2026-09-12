# Mystery Atlas V2 content source ledger

Drafting completed 2026-09-12. Author: content implementation agent. Independent editorial/fact approval is still required. No self-approval is recorded.

## Scope and method

Seven complete bilingual records: five core cases plus Rohonc and Phaistos. Cooper is the lead article. Related-case edges are editorial thematic links, not claims that cases share a perpetrator or cause. Eight approved categories are preserved; categories without published cases must have an honest empty state. No view counts, popularity counts or fabricated timestamps are supplied.

Reading times use ceil(Korean character count / 650) and ceil(English word count / 200), including headings, evidence text and captions; minimum one minute. Headline/hook and source titles are excluded. English words are counted with the regex \b[\w’-]+\b, not whitespace splitting; image captions are included when present. This is an estimate, not measured user analytics.

All five planned hero assets are generated illustrations. Article image captions explicitly disavow documentary/evidence status. Rohonc and Phaistos temporarily reuse a general archive illustration; neither caption calls it the actual artefact. The image-rights manifest belongs to the image implementation owner, not this content ledger. No internet image is downloaded by this author.

## Source checks and limits

### cooper

- [D.B. Cooper Hijacking](https://www.fbi.gov/history/cases-and-criminals/db-cooper-hijacking) — Federal Bureau of Investigation; checked 2026-09-12.
- [A Byte Out of History — D.B. Cooper (2006 archive)](https://archives.fbi.gov/archives/news/stories/2006/november/dbcooper_112406) — Federal Bureau of Investigation; checked 2026-09-12.
- [D.B. Cooper Redux (2007 archive)](https://archives.fbi.gov/archives/news/stories/2007/december/dbcooper_123107) — Federal Bureau of Investigation; checked 2026-09-12.

### voynich

- [The Beinecke Cipher (Voynich) Manuscript](https://beinecke.library.yale.edu/beinecke/collections/beinecke-cipher-voynich-manuscript) — Yale Library; checked 2026-09-12.
- [Deciphering a mysterious manuscript](https://news.yale.edu/2025/02/21/deciphering-mysterious-manuscript) — Yale News; checked 2026-09-12.

### mary-celeste

- [The mystery of the Mary Celeste](https://www.rmg.co.uk/stories/maritime-history/mystery-mary-celeste) — Royal Museums Greenwich; Andrew Choong Han Lin, curator; checked 2026-09-12.

### dyatlov

- [Mechanisms of slab avalanche release and impact in the Dyatlov Pass incident in 1959](https://www.nature.com/articles/s43247-020-00081-8) — Gaume & Puzrin; Communications Earth & Environment (2021); checked 2026-09-12.
- [Dyatlov Pass research project](https://geomechanics.ethz.ch/project-list/Dyatlov_pass.html) — ETH Zurich, Institute for Geotechnical Engineering; checked 2026-09-12.

### wow

- [The Big Ear Wow! Signal — 30th Anniversary Report](https://www.bigear.org/Wow30th/wow30th.htm) — Jerry R. Ehman; Ohio State University Radio Observatory / NAAPO; checked 2026-09-12.
- [Arecibo Wow! II: Revised Properties of the Wow! Signal from Archival Ohio SETI Data](https://arxiv.org/abs/2508.10657) — Méndez et al.; arXiv preprint (2025); checked 2026-09-12.

### rohonc

- [Experiences in the Historiography of the Rohonc Codex](https://ep.liu.se/ecp/158/006/ecp19158006.pdf) — Benedek Láng; HistoCrypt 2019 / Linköping University Electronic Press; checked 2026-09-12.

### phaistos

- [The Phaistos Disc](https://heraklionmuseum.gr/en/exhibit/the-phaistos-disc/) — Heraklion Archaeological Museum; checked 2026-09-12.

Cooper: official FBI current overview and 2006/2007 archives were read. Archive dates remain explicit; the 2007 views of Larry Carr are attributed assessments. McCoy is described as ruled out in the FBI account, never identified as Cooper. A separate identity-candidates section now also includes Kenneth Christiansen: the 2007 FBI archive states a magazine had named him, while FBI noted mismatching description and parachuting expertise. These are explicitly historical FBI descriptions, not new identity findings. No recent DNA claim is asserted. Initial route is Portland to Seattle; 36 passengers released; exact invented minute timestamps removed; $5,800 recovery retained. FBI 2016 resource redirection is not equated with a solved case.

Voynich: Yale’s collection page and 2025 Yale News were inspected. Material dating is not confused with translation. The display year follows the broad dating language on the collection page and carries a question mark. No exact translation or author is asserted.

Mary Celeste: the curator-authored Royal Museums Greenwich account was read. Its story is summarised briefly; the article does not copy invented warm-meal or bloody-sword folklore. The date uses December to avoid nautical/civil calendar ambiguity. No claim that the vessel vanished is made.

Dyatlov: the 2021 original research paper was read. It reports the 2020 prosecutor conclusion and provides a proposed physical mechanism. The article shows EXPLANATION_SUPPORTED instead of pretending no explanation exists. A model is not framed as proof of every action. ETH project page is a supporting institutional source.

Wow!: the observer’s 30th-anniversary report and the 2025 research preprint abstract/HTML were read. The 2025 work is explicitly a preprint; no verified extraterrestrial sender is asserted. The often-cited 72 seconds is qualified as a recorded window, not exact emission duration. 2025 revised numerical frequency/position are not reproduced, avoiding conflating incompatible calibrations.

Rohonc: the full 2019 HistoCrypt review by Benedek Láng was read. The 2018 paper is mentioned as discussed in that source, not claimed independently read (publisher full text returned 403). The story does not say nobody has proposed a reading; nor does it claim universal acceptance.

Phaistos: the museum’s exact official exhibit URL and indexed excerpt were checked. Direct fetch returned 502; only facts visible in the official excerpt are used: Minoan artefact, clay, spiral inscriptions, small stamps, 241 signs. A subsequent official indexed excerpt gave c. 1700–1650 BC, but its exact result URL was not independently reproducible; the display now conservatively uses Minoan period rather than those dates. No discoverer, language, decoding or function absent from the official excerpts is asserted. The direct-link access limitation must remain visible to independent QA; do not represent it as a full-text source check.

## Evidence labels

CONFIRMED, DISPUTED, CLAIM, LEGEND and DEBUNKED are separate schema values. LEGEND is available in the UI but no legend is invented merely to fill the taxonomy. Case resolutionCode is independent of Evidence.status. DEBUNKED is used for explicitly refuted propositions (no Cooper cash found, Conan Doyle as literal survivor testimony, 6EQUJ5 as a decoded sentence), not to claim a solved entire case.

## Publication gate

JSON structural validity is a technical check only. The author has not awarded Product, UX, Editorial, Fact, Functional QA, or Red Team PASS. An independent reviewer must inspect source-to-claim mappings, rendering, captions, empty states and any subsequent changes before publication.

Parent-requested editorial revision: removed the duplicate Cooper archive-image section; retained night-image with narrative body and FBI sourceIds. Android renderer supplies the reconstruction label. Recomputed Cooper reading time after adding the named-candidates section. Independent approval remains pending.

Independent reviewer revision: clarified the proposition under each DISPUTED/CLAIM/DEBUNKED badge; replaced Rohonc/Phaistos generic method paragraphs with source-grounded physical details. Rohonc date label now explicitly identifies the accession record. Optional localizedYear metadata was added for the renderer. All reading times were recalculated.
