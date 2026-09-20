# Visual pass 22 — character identity and readable mobile screens

Implemented 12 September 2026, following the complete visual audit. This is the first improvement pass; the original audit remains a record of the earlier state.

## Artwork delivered

**15 dedicated NPC portraits** now cover the missing recurring expansion cast and the most obvious mismatched identities:

- Grandmother Pell; Postmistress Yara Quill; Commander Astrid Vale.
- Cinderkeeper Maela Rhun; Watch-Captain Mirelle Sorn; Archivist Nemea Quill; Envoy Tharos.
- Bellkeeper Orsa; Ferrymaster Neris Venn; Historian Pell Reed; Marshal Tavia Coal.
- Orra Bellkeeper (Stoneborn); Aestra Quiet-Reed (Veilborn); Bellsmith Orra Deepnote; Innkeeper Orro.

**4 dedicated skill icons** replace misleading aliases: Chain Lightning, Mist Step, Hunter's Mark and Ensnaring Arrow. Chain Lightning no longer displays Fireball and Mist Step no longer displays Frost Bolt. The remaining 32 aliases were retained for a subsequent icon pass.

The built-in image generation tool used the current hero portraits as visual references: crisp pixel clusters, dark teal/navy backgrounds, warm upper-left lighting, clear silhouettes and consistent bust framing. Stoneborn and Veilborn portraits also used their species-specific hero references. Skill icons used the existing pixel skill art as their reference and prioritize recognizable action silhouettes.

Final portrait files: `assets/artwork-v2/npcs/expansion-cast/`.

Final skill files: `assets/artwork-v2/skills/clarity-pass/`.

All prompts, original generated paths and production destinations are recorded in [the art manifest](visual-pass-22-art-prompts.json). Existing hero assets and earlier optimized artwork were preserved; new files use new paths.

## Same optimization as the other task

The completed resize pass in the other Guildmaster task was read and checked against `scripts/optimize-generated-art.py` before installing these files. The same function was applied **only to these 19 new images**:

| Asset | Production dimensions | Method |
|---|---|---|
| 15 portraits | 512 × 512 | Pillow Lanczos, reducing_gap=3.0, full-color PNG |
| 4 skill icons | 384 × 384 | Same resampling, full-color PNG |

PNG optimization and compression level 9 match the earlier pass. Generated source files remain available at their original paths. Total size fell from **29,078,481 bytes to 5,496,604 bytes** (about 81% smaller). Every output was reopened, decoded and checked for the exact intended dimensions. No palette reduction or JPEG conversion was used.

## Integration and UI changes

- A shared speaker resolver now serves campaign, quest and lore portraits. Named NPCs keep the same identity across all three surfaces; explicit fallback images remain available for generic speakers.
- Quest dialogue uses the canonical NPC portrait ID when a named identity is known. This fixes the grandmother/postmistress mismatch and Envoy Tharos's conflicting portraits.
- Vaelith, Morrowveil, Solkar, Admiral Nhal Veyr, Serekh, Hollow Warden and the captured goblin speaker reuse their existing enemy art through the shared resolver.
- All character speakers in the campaign/lore audit now resolve art. The two remaining non-portrait sources are Observatory Inscription and Iron Laurel Archive, intentionally treated as documents.
- Legacy NPC atlas coordinates are preserved. New NPCs are standalone entries without fictitious atlas coordinates.
- Inventory title wrapping keeps the upgrade badge inside a 320px viewport.
- Hero names wrap at normal widths; the portrait and identity stack below 380px. Full names remain visible rather than being ellipsized.
- Both skill trees show persistent names and state labels. Locked icons remain visible; three-column rows fit the 320px preview.
- Raid tabs and raid headings show existing boss portraits.
- Unlock cards show representative portraits for the offered classes/races, including campaign-unlocked peoples.
- The main menu uses the existing guild emblem, with title typography that fits the narrow preview.

## Verification

- 19 new image files decoded and verified at their production dimensions.
- Portrait registry: 87 NPCs, no missing NPC images; all enemy and skill definitions still resolve artwork.
- All 97 quest dialogue definitions resolve portraits across briefing, victory and defeat; no conflicting named NPC assignment remains.
- The campaign/lore audit has no unresolved character speakers. Its two document labels remain intentionally unillustrated.
- Ten updated preview samples were visually reviewed, covering 320px and 390px hero/inventory layouts, both skill trees, raid cards, unlock cards, the main menu and two corrected quest speakers. No image-load errors, runtime exceptions or document overflow occurred in these samples.
- New regression tests cover campaign/lore speaker completeness, cross-quest identity consistency, the known incorrect assignments and enemy/document resolution.
- TypeScript passes. The full suite recorded 757 passing tests and one balance-simulation timeout; an isolated single-worker recheck passed that simulation and all speaker tests. All 758 tests have therefore passed across the suite and recheck runs. No timeout threshold was raised.
- Android production export succeeded, including Hermes bytecode and the new bundled assets. The first sandboxed attempt could not execute Hermes; the approved local compiler run completed successfully.

The preview uses isolated React Native Web fixtures. Physical Android/iOS devices, enlarged system fonts, touch interaction and every modal/animation state are not certified by these screenshots. Gameplay rules and real saves were not changed.

## Still available for the next pass

The broader audit's map label sizing, roster/recruitment hierarchy, reward placement, additional service imagery, companion-style selection and remaining skill aliases are not all addressed here. Some occasional quest speakers still intentionally borrow generic portraits. These are separate from the campaign/lore missing-character mappings now resolved.

## Review files

- [New art and screen gallery](../output/visual-pass-22/index.html)
- [All new portraits at large, 52px and 32px sizes](../output/visual-pass-22/new-portraits.png)
- [New skill icons at large, 52px and 32px sizes](../output/visual-pass-22/new-skills.png)
- [Portrait mapping audit](../output/visual-pass-22/registry-audit.json)
- [Optimization measurements](../output/visual-pass-22/optimization.json)
- [TypeScript log](../output/visual-pass-22/typecheck.log)
- [Full test log](../output/visual-pass-22/tests.log)
- [Isolated recheck log](../output/visual-pass-22/recheck-tests.log)
- [Android export log](../output/visual-pass-22/android-export.log)

The reusable audit capture accepts `VISUAL_AUDIT_OUT` to keep this pass's evidence separate from the original audit. `scripts/build-visual-pass-review.cjs` rebuilds the new-art contact sheets and review gallery.
