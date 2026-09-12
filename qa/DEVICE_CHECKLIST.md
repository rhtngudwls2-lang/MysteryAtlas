# Required Android acceptance — all NOT RUN

These are the remaining gates, not claims of successful verification.

1. Clean debug install in airplane mode. Launch and confirm 0 / 3 and OBSERVER, world geometry and three case locations (nearby Ohio/New Haven markers may cluster).
2. Pan and pinch in portrait and landscape; zoom controls and clusters must remain usable. At maximum zoom, a coincident cluster opens a selectable case list.
3. Tap Bloop marker. Preview must show `VERDICT: ???`, evidence-quality explanation and approximate coordinate note.
4. Start → briefing → theory. Continue must be disabled before choice. Choose unknown creature. Advance all three evidence cards individually, then reveal.
5. Confirm EXPLAINED, chosen creature versus Antarctic ice, completion check and 1 / 3. Open sources and bookmark.
6. Return to map, force-stop with `adb shell am force-stop org.mysteryatlas.prototype`, then relaunch via launcher. Confirm 1 / 3, investigated marker, bookmark and theory retained.
7. Random must select one of the other two cases. Complete it and confirm 2 / 3. Return voluntarily to the map and start the third case; complete to reach INVESTIGATOR, 3 / 3.
8. After all complete, Random must safely reopen a case. Daily must remain fixed on repeated use the same date; test a new emulator date separately.
9. Switch 한국어 → English → 한국어. Verify both UI and all case stages, including year and source descriptions. Test fresh installation on an English and a Korean device locale.
10. Archive must reflect category completion, revealed statuses only, bookmarks and reopen behavior. Check sources for every case.
11. Recreate Activity/rotate on theory and every evidence stage. Stage and selected theory must remain. Test process kill and relaunch separately from Activity recreation.
12. Long-press title in debug. Confirm first tap/start/complete timings, marker/random/archive counters, elapsed session duration and CASE 1 → CASE 2 entry route. Reopening case 1 must not be conversion.
13. On a test-only modified data build, corrupt one case, then the entire cases JSON. App must load remaining cases or show safe empty state; random/daily disabled with no cases. Corrupt world JSON and verify no crash. Restore the shipping JSON afterward.
14. Large font (200%), narrow display, landscape, Android 8 / API 26 and Android 16 / API 36: bottom-sheet/button access, system back and safe drawing insets. Test TalkBack names for map markers.
15. Review `adb logcat -b crash -d` after the complete flow. Record APK SHA256, device model/API, screenshots and real PASS/FAIL in `BUILD_STATUS.md`.
