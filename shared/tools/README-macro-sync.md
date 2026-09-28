# Durable Web content sync

Run from the repository root. The source can be the `shared/content` directory of a verified snapshot, a durable MEDIA_READY ZIP, or a directory containing non-overlapping durable ZIP packages. It accepts flat `assets` manifests and `assetGroups` manifests, including nested visual ZIPs.

```bash
python3 shared/tools/macro_sync.py --source /path/to/durable-pack-or-dir --target web --dry-run
python3 shared/tools/macro_sync.py --source /path/to/durable-pack-or-dir --target web --apply --verify
```

Dry-run is the default even if `--dry-run` is omitted. It reads the current Web tree, verifies the supplied article/visual/PNG relationships, compares canonical IDs and SHA-256, and prints a JSON plan. It does not write target files. The `--apply` command stages a complete candidate tree, calls the existing content validator, creates a `.sync-checkpoints/<timestamp>/checkpoint.json` with backups and hashes, writes only changed articles/new images/manifest/index/loader, and validates again. `--verify` runs lint, typecheck, unit, build and static link check with the Pages preview base path. Review the plan and checkpoint before commit/push; neither operation is automatic.

Existing article changes require a **strictly greater** explicit `contentVersion`/`editorialVersion` when both sides have one, or a greater numeric `mediaPackage.batch` when both sides have that provenance. Editorial versions are never compared directly with Batch numbers. Ambiguous or older changes fail for editorial review. An existing PNG filename with a changed SHA fails; use a versioned asset filename. There is no automatic deletion. Partial packages must include complete KO/EN pairs and all visuals referenced by each supplied article. Duplicate canonical IDs/assets, missing pairs, orphan files, SHA failures, bad URL syntax and dangling claim/visual source references stop before applying. A command failure after a successful apply retains its local checkpoint; examine it and the target tree before committing. Restore by replaying the backed-up paths and removing paths whose `oldSha256` is null, or revert an isolated Git commit.

For simulation against a temporary snapshot, pass `--content-root /path/to/fixture-repo`; it must contain `shared/content` and need not be the live checkout. This does not change the runtime tree. Do not use in-progress Chat material as the source: input should be a closed durable package.
