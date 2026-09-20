# Rising Guildmaster — gameplay-focused store screenshots

## Updated version 1 listing text

- `play-store-description-en-US.md`: app name, short description, and full description. Paste each section's body into the corresponding Play Console field; omit the Markdown headings.
- `version-1-release-notes-en-US.txt`: initial launch notes, including the `en-US` locale tags used in Play Console.

This is first-release marketing copy for the intended redesigned release. The app configuration still declares version `0.1.0`; writing version 1 release notes does not change the binary's version or resolve the pending branch integration.

Upload these five images in order. Each is 1080 × 1920 RGB PNG, without transparency.

1. `01-recruit-your-heroes.png` — Three recruits. One contract. Three actual recruitment cards are cropped to portraits, identities, roles, fees, salaries, and estimated potential.
2. `02-command-the-battle.png` — Read the danger. Make your move. The real tactical board is paired with five captured combat skills from a level-12 ranger: Bow Shot, Multi Shot, Ensnaring Arrow, Evasive Step, and Volley. Four class skills were unlocked through `learnClassSkill`, respecting the four available skill points. Each actual skill button is cropped above its truncated in-game label; the full skill names appear as readable editorial captions. This is an editorial skill showcase, not a claim that all five buttons fit simultaneously in the phone's scrolling skill bar.
3. `03-explore-eldoria.png` — A whole world. Your next story. The complete in-game world map and its region markers are shown.
4. `04-choose-your-path.png` — Risk the fight. Claim the treasure. Actual route choices and a separate boss-node excerpt highlight dungeon decisions.
5. `05-lead-your-guild.png` — Your guild. Your legacy. The guild-hall artwork, dashboard resources, and current order form a focused view of guild management.

`preview-five-screenshots.png` is a review contact sheet, not an upload screenshot. `sources/` contains captures and crops for reproducibility. The ZIP contains the five final screenshots, updated listing and release text, and this guide.

These are editorial layouts composed from genuine React Native web captures with an isolated staged save. Gameplay pixels, names, portraits, stats, and controls are not AI-generated or retouched. Cropping, scaling, and rearranging excerpts is used for marketing; no full-screen layout is implied. The large headlines and captions are marketing text. The recruitment fixture uses the game's candidate generator with seed 72019 and a four-hero roster; it depicts the game's one-contract-per-batch mechanic without requiring comparison during the tutorial.

Capture source: preserved visual redesign, commit `3ab399f`. That redesign is now integrated with current gameplay in commit `69c436a` on local `main`, with 850 passing tests and verified screen captures. Build 12 is the integrated replacement for build 11. The panels remain curated gameplay examples; the current app also includes the newer recruitment filters and gameplay controls. Do not use build 11 for this visual release.

To recapture archer abilities after exporting the updated isolated fixture, run `node scripts/capture-marketing-details.cjs --archer`, then `node scripts/compose-store-marketing.cjs --archer-only`. Only panel 2 and the review contact sheet are re-rendered.

Reproduction: `scripts/capture-marketing-details.cjs` captures the candidate cards and world map from `.codex-tmp/redesign-store-preview/web-export`. The isolated fixture imports RecruitmentScreen and initializes recruitment using the real service. Capture-only test IDs identify candidate panels and the map. `scripts/compose-store-marketing.cjs` performs documented source crops and renders the five layouts. It also uses the previously verified raw combat, dungeon, and guild captures in `output/play-store-refreshed`.
