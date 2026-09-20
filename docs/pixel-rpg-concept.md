# Rising Guildmaster: pixel RPG concept

Concept created September 12, 2026 with the built-in image generation tool. The full prompt and references are recorded in `output/pixel-concept/generation.json`; the concept image is `output/pixel-concept/rising-guildmaster-pixel-rpg-concept.png`.

## Visual direction

- **Guild hall:** a furnished pixel interior with the war table, tavern and training entrances as navigation points. Keep one prominent current order below the scene and persistent navigation for direct access.
- **Recruitment:** atmospheric tavern backdrop, larger existing hero portraits, concise role and contract information, and clear Inspect / Sign actions. Details remain accessible in the dossier.
- **Combat:** legible dungeon tiles, recognizable character sprites, clear movement and target indicators, and a stable action tray with large skill buttons.
- **Shared presentation:** navy shadows, warm amber lighting, steel and brass, restrained pixel borders, readable body text, and visible pixel clusters consistent with the new hero portraits. Small torch, banner and idle animations could add life; support reduced effects.

This is an art and layout proposal, not an implemented redesign. Names, figures, skill labels, and navigation highlights in the generated image are illustrative. Production layouts must use the game's actual data and navigation state. The concept does not introduce new classes or combat rules.

Keep existing optimized runtime portraits at 512×512 and skill icons at 384×384. This larger presentation image is a design reference, not an asset to load into gameplay. A production pass should generate backgrounds and sprites separately and verify them at phone size. Use crisp scaling for new tile and sprite art; do not degrade the existing finely shaded portrait masters to force a coarser look.

## Recruitment change implemented

Reviewing Overview plus either Stats or Traits now unlocks the first contract immediately. The mandatory comparison step, its completion action, and its tutorial highlighting have been removed. Optional candidate comparison remains available. The free board refresh and second recruit steps are preserved.

Saves paused at the retired `compare_candidates` step migrate to `recruit_first`, preserving their reviewed candidate, visited tabs and other progress. Regression checks cover both historical raw saves and current save envelopes, including a save/reload round trip.

Validation: TypeScript passed. All 59 tests passed across onboarding economy gates, recruitment, recruitment presentation, save schema and save slots. The concept was visually inspected; the revised tutorial was verified through code and regression tests, without a new device playthrough.
