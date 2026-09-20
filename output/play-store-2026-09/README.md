# Rising Guildmaster — September release assets

## HOLD — visual branch reconciliation required

These captures accurately reflect GitHub main at 0952b9f and production AAB build 11. However, the redesigned War Table dashboard, activity strip, and other local visual refinements are preserved on `codex/main-before-github-sync-20260920` and are absent from this main branch. Do not treat these screenshots or build 11 as the final intended visual release. Integrate the intended refinements with the newer gameplay fixes and recapture/rebuild before publishing. The feature graphic and copy remain reusable.

Upload `feature-graphic-1024x500.png` as the Google Play feature graphic: 1024 × 500, RGB PNG without transparency.

Recommended polished store panels are 1080 × 1920 RGB PNGs, with an unchanged gameplay capture occupying most of each panel and a short editorial headline. Upload in this order:

1. `store-1-world.png` — Your next legend starts here.
2. `store-2-raid.png` — Every position. Every decision.
3. `store-3-heroes.png` — Gather your party. Find your legends.
4. `store-4-dungeon.png` — Choose a path. Face the unknown.
5. `store-5-guild.png` — Lead the heroes. Shape their legacy.

The original unframed captures are also included, at 1080 × 1920:

1. `world.png` — explore Eldoria.
2. `raid.png` — tactical raid combat.
3. `heroes.png` — recruit and develop a roster.
4. `dungeon.png` — branching dungeon routes.
5. `guild.png` — guild management.

`contact-sheet.png` and `store-panels-preview.png` are review sheets; do not upload them as screenshots. The panels are reproducible with `scripts/compose-store-panels.cjs` after `scripts/capture-store.cjs` captures the game.

These are fresh captures of the current React Native web components at phone dimensions, using an isolated staged save. They are not Android device captures. No player saves were changed. The fixture is only for screenshots; the production package retains `node_modules/expo/AppEntry.js` as its entry point.

`release-notes-en-US.txt` contains initial release notes with Play Console locale tags. `store-listing-en-US.md` includes an app name, short description, and full listing description.

The promotional image was created with the built-in image generator using the game's portrait reference sheet and app crest, then resized to the required RGB export dimensions. It is promotional illustration, not gameplay.

Final generation prompt:

Use case: ads-marketing. Create a Google Play feature graphic for Rising Guildmaster in a wide 1024x500 composition. Reference image 1 is the game's hero portrait style: finely detailed pixel art with natural proportions, dark teal shadows and warm gold highlights, not blocky. Reference image 2 is the guild crest identity. Compose a beautifully lit medieval guild hall and misty mountainous forest backdrop, with the human armored warrior and hooded female elf ranger from reference 1 grouped at right, waist-up, faithful faces and clothing. On the left, a small gold shield crest inspired faithfully by reference 2 above large highly legible antique gold lettering exactly 'RISING' and 'GUILDMASTER'. Elegant restrained composition, confident adventurous mood, crisp pixel texture, subtle blue rim light. Keep title and faces inside generous 8% safe margins. No other text, no awards, no store badges, no fake gameplay UI. Output a finished landscape promotional illustration, ideally exactly 1024x500 pixels.

Asset specification reference: https://support.google.com/googleplay/android-developer/answer/9866151?hl=en
