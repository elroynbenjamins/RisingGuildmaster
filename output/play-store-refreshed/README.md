# Refreshed store screenshots — redesigned interface

These five newly rendered panels show the preserved visual redesign from commit `3ab399f` on `codex/main-before-github-sync-20260920`: the War Table with guild-hall art, active-order strip, Adventurers roster, refined icons/navigation, world map, dungeon routes, and tactical combat.

## Recommended screenshot upload order

1. `store-1-world.png`
2. `store-2-raid.png`
3. `store-3-heroes.png`
4. `store-4-dungeon.png`
5. `store-5-guild.png`

All five are 1080 × 1920 RGB PNGs without transparency. They use actual game screen captures with short promotional headings. The gameplay pixels are not generated or retouched. The matching unframed PNGs are included. `store-panels-preview.png` is a review sheet only.

Captures use React Native web at a 432 × 768 viewport, scaled 2.5×, with an isolated staged party. They are not Android device captures. The War Table introduction is marked already seen in the fixture, so the screenshot shows the dashboard itself. No player saves or production source files were changed.

## Release compatibility

These replace the older-looking screenshots in `play-store-2026-09`. They are a preview of the preserved redesign, NOT evidence that it has been merged into main. Build 11 still contains the previous interface. Integrate the redesign with current main and build a matching release before using these on the published listing.

Capture source: `.codex-tmp/redesign-store-preview` (isolated archive of the preserved branch, using its source and artwork). Entry: `scripts/store-preview-entry.ts`. Export: `web-export`. Local fixture adds the `onOpenActivity` callback and sets `war_table_v2_tutorial_seen=true`.

Capture command from repository root (PowerShell):

```powershell
$env:STORE_CAPTURE_ROOT='.codex-tmp/redesign-store-preview/web-export'
$env:STORE_CAPTURE_OUT='output/play-store-refreshed'
node scripts/capture-store.cjs
node scripts/compose-store-panels.cjs
```

The corrected feature graphic and release/listing text are included for convenience. Promotional artwork provenance and prompts are recorded in `artwork-correction-v2.md`.
