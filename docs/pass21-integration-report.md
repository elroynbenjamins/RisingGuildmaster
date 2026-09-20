# Pass 1–21 integration report

Validated on 2026-09-12 against repository HEAD `05511ef` and the existing working tree. Pass 22 was not started.

## Source and preservation

- Authoritative handoff: `RisingGuildmaster_Main.zip`, SHA-256 `73c02af4031238f0bb89d0b4f1e42c96155415f78f6f9bf9fe26ec12f35f6b51`.
- Extracted 724 project files into a temporary directory, excluding dependencies, Git data, caches, and generated output. Compared paths and SHA-256 hashes before copying.
- Imported 58 new files and 75 changed files; 591 files already matched. Removed the obsolete, unreferenced `src/screens/HomeScreen.tsx` as specified by Pass 7.
- Kept all 1,350 existing asset files, including uncommitted optimized artwork. Verified 1,358 preservation hashes covering assets, package/lockfile configuration, Expo/EAS configuration, ignore files, the repository-only Vitest configuration, and the local `scripts/optimize-generated-art.py` script.
- Package manifests, lockfile, app.json, and eas.json already matched the ZIP. No environment, signing, secret, or Git-history changes were needed. No node_modules files were imported or tracked. Build output stays under the ignored `.codex-export/` directory.

## Substantial modules

- `App.tsx`, `src/navigation/appRoutes.ts`, and `src/game/quests/questCombatCompletionService.ts`: routing and mission completion boundaries, contextual navigation, tutorial routes.
- `src/game/save/`: independent slots, explicit schema migration, backup recovery, and protected future saves; integrated through `src/state/GuildContext.tsx` and the main menu.
- `src/game/heroes/heroLoyaltyService.ts`, `src/game/economy/`, `src/game/campaign/campaignReadinessService.ts`, and quest data/resolution: loyalty, planner, healing, catch-up guidance, location-bound one-clear rewards.
- `src/game/dungeons/`, `src/game/bosses/`, `src/game/archives/`, and combat UI: temporary boons/pacts, normal boss phases separated from raids, archive rewards, basic-attack borders, and combat feedback.
- Guild, Quest Board, Heroes, Hero Detail, Recruitment, Deployment, World/Region, Rewards, Inventory, Crafting, and Training screens: supplied Pass 8–21 presentation and supporting services.
- Imported 23 new test files and the save-schema, architecture, pass-log, and UI-roadmap documentation.

## Conflicts and repairs

1. The old icon validator required 13 retired atlas images, while the repository and ZIP both render newer standalone icons. Updated validation to check every referenced UI/equipment PNG for existence, PNG signature, and square dimensions of at least 256px. Existing registry-coverage tests remain enabled; no artwork was restored or changed.
2. The supplied deployment test omitted a required non-null assertion for its known quest fixture. Corrected the fixture typing.
3. Chapter 1/2 campaign fixtures omitted the existing Brambleford side-quest and fourth-hero prerequisites. Updated those fixtures to represent completion of the starter journey; kept production progression gates and their dedicated tests intact.
4. Updated the Mosswatch expectation to the handoff's intended level-2 catch-up recommendation.
5. Added the missing victory/defeat/journal narrative for the existing `brambleway_road_ambush` quest. Preserved the quest and its starter journey behavior.
6. Added failing regression cases proving that a corrupt or empty primary with no backup could fall through to a stale legacy save. Fixed loading to report the occupied slot as protected instead, without altering either payload. Added checks for future-save overwrite refusal and serialized writes across both slots.
7. Removed unused screen variables/imports and trailing whitespace found during the integration audit. No duplicate replacement modules or remaining HomeScreen imports were found.

## Validation results

| Check | Result |
| --- | --- |
| `pnpm install --frozen-lockfile` | PASS; already up to date, manifest and lockfile unchanged |
| `pnpm typecheck` | PASS, including after unused-code cleanup |
| `pnpm check:release` | PASS: release config, icons, TypeScript, full tests |
| Complete Vitest suite | PASS: 173 files, 754 tests; no tests disabled |
| Icon validation | PASS: 192 standalone icons in two active registries |
| Expo prebuild configuration resolution | PASS; existing plugins and Android identity retained |
| Android production export with Hermes | PASS; 2,487 modules bundled and a 4.3 MB Hermes bundle emitted to `.codex-export/pass21-android` |
| Preservation hashes | PASS: 1,358/1,358 unchanged |
| `git diff --check` | PASS |

The initial Android export was blocked from executing Hermes inside the sandbox. The scoped export retry outside the sandbox succeeded without changing project configuration. pnpm's optional update-metadata request failed under restricted networking; dependency installation itself exited successfully.

## Save and gameplay compatibility

- Historical single-save keys still migrate into Slot 1; Slot 2 stays independent. Raw v0 and envelope v1 payloads migrate to schema v2. Old primary payloads are retained as recovery snapshots.
- Corrupt primaries recover from valid backups. Future-version primaries are protected from fallback and overwrite. A corrupt primary without a backup remains protected, and a healthy second slot remains available.
- Per-slot autosaves remain serialized. Existing legacy progression, entitlement, portrait, world-state, and dungeon compatibility tests pass. No on-device player data was read, deleted, or reset during validation.
- Daily healing remains the supplied integer-HP implementation: `max(1, round(maxHP * 0.1))`, capped at max HP, with fallen heroes excluded. It does not compound from current HP.
- Tests cover one-clear completion/reward behavior, location restrictions, top-four campaign guidance, boon/pact selection and stacking, raid exclusion from normal boss mechanics, crafting blockers/hidden material sources, and Training Yard projections/catch-up advice.
- Reviewed the basic-attack border path: valid targets require an available basic attack, an unused action, valid range/target checks, and no selected skill mode. Quick Skill targeting takes precedence; the solid red border and accessibility/tutorial explanations are present.

## Remaining manual checks

- Install a signed Android build on a device and smoke-test migration from a real pre-update save, switching both slots, and restarting the app. This run validated a Hermes export, not a signed APK/AAB or device installation.
- Review touch targeting, red attack borders, reduced effects/motion, and the new management screens on small displays.
- The preserved iOS AdMob configuration still uses Google's test app ID; configure it before an iOS production release.
- The optional strict unused-symbol audit still reports existing React imports and unrelated legacy symbols. The repository's configured TypeScript check passes; enabling additional lint rules across the project is separate cleanup.
