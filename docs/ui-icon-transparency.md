# Shared UI icon transparency fix

Completed September 12, 2026.

The 36 shared UI icons had opaque dark backdrops in their PNGs. `GameIcon` also filled its container even when `framed={false}`. The fix adds transparent cutouts and removes the unframed fill, so navigation, resource symbols, activity shortcuts and other shared icons inherit their surrounding panel color. Framed icons retain the deliberate themed frame. Images use `contain` to preserve their silhouettes.

All 36 references in `src/data/ui/gameIconArt.ts` now point to `assets/artwork-v2/icons/game-transparent/`. Original icons remain in `assets/artwork-v2/icons/game/`. This pass covers shared UI symbols; portrait backdrops and full skill illustrations remain separate artwork.

Cutouts were created with the built-in image generation tool using each original as a reference. Prompts and selected source paths are recorded in `output/icon-transparency/generation-attempts.json`. Early outputs with painted checkerboards were rejected; every installed output has a real alpha channel. No programmatic background-removal method was used.

`scripts/install-transparent-ui-icons.py` validates the generated alpha channel and uses the existing `optimize-generated-art.py` resize/compression function. All runtime assets remain 384×384 RGBA PNGs. The 36 selected generated masters total 42,866,543 bytes; their runtime versions total 5,957,876 bytes.

## Validation

- All 36 runtime icons decode as 384×384 RGBA with transparent and opaque pixels.
- All 36 static asset references resolve; no missing files.
- TypeScript passes.
- Browser phone previews at 320px and 390px high contrast load without image or runtime errors. Navigation, resources and key shortcuts visually blend into their panels. These previews were captured after the first 18 icons were linked; their displayed icons are unchanged by the final 18 links.
- The complete 36-icon gallery was inspected on slate and light parchment at 104px and at 17/29/42px samples. All 185 displayed images load.
- No new native device build was produced for this asset/style-only change.

Review: `output/icon-transparency/index.html`, with `gallery-dark.png`, `gallery-light.png`, and phone screenshots alongside it. Rebuild the gallery with `node scripts/build-icon-transparency-review.cjs`.
