# Rising Guildmaster — Play Store graphics

Upload these three phone screenshots (1080 × 1920, RGB PNG):

1. `world.png` — Eldoria, its five regions and campaign exploration.
2. `raid.png` — White Maw raid combat, eight heroes and a telegraphed danger zone.
3. `dungeon.png` — branching Wardstone Depths routes, elites, treasure, rest and boss.

Upload `feature-graphic-1024x500.png` in the Feature graphic field (1024 × 500, RGB PNG).

The screenshots are actual React Native web screen captures at phone dimensions, using an isolated staged party. They are not generated gameplay images. No player saves were changed. The banner is generated promotional artwork, not a gameplay screenshot. Review the listing against the version you publish: the captures include the latest map sizing and dungeon icon fixes.

The promotional image used the built-in image generator with the existing guild seal and Eldoria map as visual references. Final prompt: Create a Google Play feature graphic for Rising Guildmaster; preserve the gold shield, crown, sword, quill and blue gems; compose the seal on the left and the exact title RISING GUILDMASTER on the right, against evergreen forests, snowy mountains and distant volcanic mountains. Crisp retro pixel art, dark teal, antique gold, safe margins, no fake gameplay, store logos, awards, prices or extra text. The generated result was exported to the required 1024 × 500 RGB format.

Official asset requirements: https://support.google.com/googleplay/android-developer/answer/9866151?hl=en

Capture fixture: `scripts/StorePreview.tsx`; isolated entry: `scripts/store-preview-entry.ts`; capture helper: `scripts/capture-store.cjs`. Production entry remains unchanged. The helper uses the bundled local Playwright/Sharp dependencies and an isolated headless browser. Never use the preview entry for a production build.
