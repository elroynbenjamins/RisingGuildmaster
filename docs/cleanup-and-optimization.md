# Cleanup and optimization

Completed September 13, 2026.

- Removed 77 unused style definitions and nine unused imports, plus the unused mastery modifier helper.
- Removed the unused AtlasCrop component and the obsolete embedded equipment atlas module (457,488 bytes combined). Active portraits and equipment use standalone image registries.
- Removed 10 unreferenced legacy material icons. Each has an active replacement in assets/images/materials/complete; the removal manifest records the mapping.
- Losslessly recompressed 323 of 1406 PNGs, saving 2,372,133 bytes. Verified decompressed scanlines are identical before writing; dimensions, alpha, and metadata remain unchanged.
- Total measured reduction: 3,809,542 bytes (3.81 MB), excluding smaller style/import savings. This is a working-file reduction, not a measured APK or frame-rate improvement.
- Cached Temple treatment calculations by roster and Training Yard quotes by hero/guild state, avoiding repeated work on filter and selection changes.
- Updated the artwork validator for 512px portraits, 384px skills/icons, and 960×320 location art, covering all 77 race/class groups.

## Verification

- TypeScript passed after the code and memoization changes.
- Full suite: 775 tests passed across 174 files.
- All 1,384 static image/font references resolve.
- Artwork validation: 913 files passed; icon validation: 192 active registry icons passed.
- Six 320px browser previews: no runtime errors, broken images or document horizontal overflow.
- Twelve interaction assertions passed for Temple, Training Yard and Workshop.
- Native device performance and release package size were not benchmarked.

## Preserved intentionally

Source sheets, alternate artwork, portrait references and original opaque UI icons remain where development/review tools use them. Platform-specific native/web payment and advertising adapters remain; simple import scans can incorrectly flag those as unused. Historical preview galleries remain available.

## Evidence and reusable tool

- output/cleanup/code-changes.json
- output/cleanup/removed-assets.json
- output/cleanup/png-compression.json
- output/cleanup/preview and output/cleanup/interactions
- scripts/optimize-png-lossless.cjs defaults to a dry run; pass --write to apply verified smaller PNG streams.
