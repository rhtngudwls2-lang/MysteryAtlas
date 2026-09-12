# Mystery Atlas V2 — Android acceptance checklist

Status: prepared checklist, NOT an execution report. Consult `qa/local-validation/LOCAL_VALIDATION.md` for this local session.
Package: `org.mysteryatlas.prototype.v2`. Use a disposable emulator, never clear the user's V1 or V2 phone data.

## Identity and environment
- Build `:app:compileDebugKotlin :app:lintDebug :app:assembleDebug :app:assembleDebugAndroidTest` from the recorded source identity.
- Record final app/test APK bytes, SHA-256, package, version and signer; install those same bytes for all checks.
- Run `qa/android-run-qa.sh` only with the recorded APKs, SDK tools and a disposable emulator.

## Seven real screens
- Home: all five sections, honest readership status, Hero image/title/hook/CTA, four bottom tabs.
- Explore: eight approved categories; populated and empty category paths.
- Article: complete Cooper story, reconstruction disclosures, summary, timeline, claims/facts, related stories.
- Evidence: five distinct evidence labels, source correspondence, source links.
- Rabbit Hole: legitimate edges, depth, Back, revisits truncate the path, visited markers, exhausted branch → Explore.
- Search: KO/EN, punctuation, aliases, people/places/categories, relevance ordering, empty results and keyboard.
- Save: add/remove, reading/read labels, empty state, recent history and reopen.

## Functional and accessibility checks
- Force-stop and independent process retain bookmarks, nondefault locale, recent history and reading position.
- Activity recreation and tab switching preserve list/Article position and valid Back navigation.
- Read status changes only after the narrative-end marker is reached; persist across a new process.
- DataStore read/write error shows a distinct message, preserves last known state, and Retry re-subscribes.
- Missing image shows an explicit placeholder; unavailable article and catalog errors recover through Retry.
- App works offline; source URLs open externally or provide a visible fallback.
- Inspect all seven screens at ordinary width; Home/Explore/Article/Evidence also at 360dp, fontScale 1.3 and 2.0.
- Check ≥48dp touch targets, TalkBack labels/order, meaningful saved-state shape, IME/system-inset overlap and truncation.
- Review actual PNGs against approved VisualReferences. Screenshot existence or successful build is not Visual/Product PASS.

## Independent gate
Product / UX-Design / Editorial / Fact / Engineering / Functional QA / Independent Red Team must review the same final source/APK identity and evidence. Record PASS/FAIL/BLOCKED/NOT RUN for the precise tested scope. Rebuild and re-render after product changes.
