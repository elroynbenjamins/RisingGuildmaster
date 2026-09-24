# Rising Guildmaster recommendation pass log

## Pass 1 — Heroes, progression, side quests, saves

Implemented:
- Hero Loyalty state and contract renewal salary effects.
- Loyalty reactions to payroll, arrears, quest outcomes, injuries, and personal quest outcomes.
- End Day living-hero recovery fixed/verified at 10% of maximum HP, capped at maximum HP; fallen heroes remain at 0 HP.
- Campaign readiness check using the average level of the four highest-level heroes from the Goblin Chieftain stage onward.
- Campaign UI recommends Side Quests when the core four are behind the next campaign recommendation.
- Visible Side Quests are one-clear-only, tied to real settlements, and require travel.
- Chance-based one-time Side Quest material/hunt rewards are protected so the player is not denied the intended reward by having only one attempt.
- Campaign/Side Quest XP curve audit and tests so normal side content can keep a four-hero core aligned with campaign recommendations.
- Two independent save slots, legacy single-save migration into Slot 1, and per-slot serialized autosaves.

## Pass 2 — Guild Planner & calendar usability

Implemented:
- Seven-day Guild Planner forecast in Calendar & Finances.
- Forecast simulates the real guild calendar without mutating the live save.
- Planner highlights payroll, arrears, training completion, Training Hall upgrades, workshop construction, gathering returns, scouting returns, condition recovery, candidate deadlines, contract changes, and regional threat increases.
- Routine daily events (tavern income, HP recovery, readiness recovery) are summarized once instead of cluttering every calendar card.
- Projected treasury is shown for each forecast day.
- Added **Advance to Next Event**, searching up to 30 days for the next meaningful guild milestone instead of simply advancing to the next routine day.
- Multi-day advance confirmation lists crossed milestones, payroll warnings, routine recovery, and projected treasury.
- Multi-day resolution summary avoids flooding the UI with one routine event line per day.
- Gathering return text now uses the actual gathering mission name.

## Validation status

- TypeScript project check: PASS (`tsc --noEmit`).
- Release configuration check: PASS.
- Direct runtime smoke check for the new planner forecast and next-event advancement: PASS.
- Full Vitest suite cannot start in this Linux validation environment because the uploaded `node_modules` was produced on Windows and only contains the Windows Rolldown native binding. The source itself type-checks.
- Icon/artwork audit cannot run because the supplied source bundle does not contain the `assets/` directory.

## Next recommendation passes

1. Pass 3 — Quest preparation / Mission Intel.
2. Pass 4 — Stronger temporary builds in Roguelite Dungeons.
3. Pass 5 — More mechanically distinctive bosses.
4. Pass 6 — Collection/Archive rewards.
5. Pass 7 — Code-maintenance and save-schema cleanup.
6. Pass 8 — Command Center intelligence and attention routing.

## Pass 2.5 — No-asset pixel UI / game-feel foundation

Implemented without requiring the large artwork folder:
- Reworked the shared panel/button/tab styling toward sharper pixel-frame geometry instead of generic rounded mobile cards.
- Added reusable status chips and compact meters for game state.
- Hero roster cards now foreground portrait, level, HP, readiness, status, and loyalty with visual meters.
- Quest cards now surface recommended level, party/readiness, difficulty, one-clear status, travel/field information, and a single dominant action more clearly.
- Guild Command Center now starts with prioritized attention items instead of duplicating a long notification block.
- Quest results now use a short stamped mission-result reveal.
- Bottom navigation and combat/dialog frames were tightened to fit the pixel-management-RPG direction.

## Pass 3 — Mission Intel / quest preparation

Implemented:
- Added a Mission Intel service that converts Monster Manual discovery into useful pre-mission knowledge.
- Quest detail now shows intel coverage, expected enemy-unit count, known units, unknown units, known enemy roles, and known condition threats.
- Exact enemy identities remain hidden until their bestiary entries have been discovered; broad faction/encounter information remains available as normal briefing information.
- Intel therefore rewards exploration and Monster Manual completion without turning the preparation screen into a spoiler list.
- Added targeted Mission Intel tests and a direct runtime smoke check.

## Pass 4 — Roguelite temporary run builds

Implemented:
- Added temporary **Boons** and risk/reward **Pacts** to Roguelite Expeditions.
- Combat and treasure clears can offer three unique choices; the player must choose one before continuing the route.
- Current choices include Armor Class, movement, opening attack rolls, initiative, healing, gold, and rare-recipe bonuses, plus Pacts that trade stronger rewards/power for drawbacks.
- Chosen effects are applied to remaining tactical encounters, dungeon healing, room gold, and/or recipe odds as appropriate.
- The active expedition screen shows the current temporary run build, and the end-of-run screen records the build used.
- Already-selected choices are removed from later offer pools.
- Old saves are migrated with empty boon/pending-choice arrays so mid-run saves remain compatible.
- Added targeted boon tests for offer uniqueness, route locking, stacking/tradeoffs, and invalid selections.

## Updated next recommendation passes

1. Pass 5 — More mechanically distinctive bosses.
2. Pass 6 — Collection/Archive rewards.
3. Pass 7 — Code-maintenance and explicit save-schema cleanup.
4. Pass 8 — Command Center intelligence and attention routing.

## Validation after Pass 4

- TypeScript project check: PASS (`tsc --noEmit`).
- Release configuration check: PASS.
- Direct compiled runtime smoke for boon offers, route locking/unlocking, selection, and stacked Pact/Boon effects: PASS.
- A targeted Vitest launch was attempted, but Vitest cannot start in this Linux environment because the uploaded Windows `node_modules` lacks the required Linux/WASI Rolldown binding. This is an environment/native-module mismatch rather than a TypeScript/source failure.

## Pass 5 — Mechanically distinctive standard bosses (without diluting Raids)

Implemented:
- Wired the existing data-driven boss-threshold system into live tactical combat so standard/campaign bosses now react when HP thresholds are crossed.
- Added compact, boss-specific phase reactions across campaign and selected hunt bosses: limited reinforcements, short party debuffs, one-time boss recovery, and small one-time pressure pulses.
- Added a dedicated **BOSS PHASE** tactical panel with the phase announcement and a concise player-response hint.
- Boss reactions are one-shot and intentionally short. They do **not** create persistent arena objectives, multi-squad rules, or repeating hazard scripts.
- Raid quests are explicitly excluded from the standard boss-phase resolver. Their existing dedicated raid mechanic engine remains authoritative.
- Preserved Raid identity as the larger endgame layer: 8 heroes, two four-hero squads, 3–4 bespoke phases, largest tactical boards, persistent objectives, telegraphed hazards, entomb/interception/contracting-arena mechanics, weekly victory lockouts, and first-clear trophies.
- Renamed Chapter 7–9 quest copy from “three-stage mini-raid” to **three-stage boss assault** so the word **Raid** is reserved for the actual eight-hero mode.

### Pass 5 balance/validation

- TypeScript project check: PASS (`tsc --noEmit`).
- Release configuration check: PASS.
- Direct compiled runtime smoke: PASS. The Goblin Chieftain crossed its threshold, summoned exactly one reinforcement, and did not repeat it; a Broodheart Raid remained untouched by the standard boss resolver.
- Small Standard-difficulty simulation sample at recommended campaign levels remained beatable: Chieftain 8/8 wins, Ghorak 8/8, Vaelith 8/8. Later bosses produced noticeably more attrition (Ghorak/Vaelith averaged 3.5 survivors; Vaelith winners averaged ~65% remaining HP), so the pass adds tactical texture without turning campaign progression into a sudden wall.
- Targeted Vitest startup remains blocked in this Linux validation environment because the supplied Windows `node_modules` contains the Windows Rolldown native binding rather than the Linux/WASI binding.

## Raid identity rule going forward

Standard boss = four-hero fight with a few memorable reactive moments.

Raid = roster-level event requiring eight heroes/two squads, persistent encounter mechanics, larger arenas, more coordination, multi-phase encounter scripting, weekly lockout/prestige rewards, and a stronger presentation tier. New standard-boss mechanics should never cross that boundary.

## Next recommendation passes after Pass 5

1. Pass 6 — Collection / Archive rewards that make discovery completion mechanically worthwhile.
2. Pass 7 — Code-maintenance and explicit save-schema cleanup.
3. Pass 8 — Smarter Guild Command Center attention routing.

## Pass 6 — Archive / collection rewards

Implemented without requiring new artwork:
- Added claimable archive milestones so discovery now contributes directly to progression instead of being reference-only.
- **Monster Manual:** 25%, 50%, 75%, and 100% bestiary milestones plus a completion dossier for each enemy faction represented in the live enemy data.
- **Lore & Journal:** 25%, 50%, 75%, and 100% discovery milestones.
- **Skills & Abilities:** enemy-technique milestones based on the unique abilities attached to creatures the guild has actually encountered.
- **Heroes' Codex:** small roster-diversity milestones for representing multiple races and classes at the same time.
- Rewards grant modest **Guildmaster XP + guild reputation**. They are manually claimed for clearer game feedback and are permanently protected against duplicate claims through save-compatible world flags.
- Every archive screen now has a collapsible **Archive Rewards** section showing progress, READY states, reward values, and claimed milestones.
- Existing saves need no explicit migration because claim state is stored in the existing `worldFlags` dictionary.

### Combat readability addition requested during Pass 6

- When no Quick Skill is selected, every living enemy currently in basic-attack range now receives a **solid bright-red border around its tile**.
- The red border means the enemy can be immediately basic-attacked by double-tapping it.
- The border disappears when a Quick Skill is selected, preventing it from competing with skill-target highlighting.
- Combat Help, the guided first-battle tutorial, accessibility labels, and the Quick Skills hint now explain the red-border convention.
- The indicator is a separate overlay, so it remains visually distinct from movement ranges, selected-skill targets, Raid hazards/objectives, and the selected tile.

### Pass 6 validation

- Source-only TypeScript check (`App.tsx` + `src/**`): PASS.
- Release configuration validation: PASS.
- Direct compiled runtime smoke for faction dossier completion, one-time claiming, Guildmaster XP/reputation reward application, and persisted claim state: PASS.
- Full Vitest remains unavailable in this Linux environment from the uploaded Windows/pnpm `node_modules`: the ZIP does not preserve pnpm's internal dependency symlinks/native Rolldown layout. The new Vitest coverage has still been added in `tests/archiveRewards.test.ts` for the user's normal development environment.

## Next recommendation passes after Pass 6

1. Pass 7 — Explicit save-schema migrations and code-maintenance cleanup.
2. Pass 8 — Smarter Guild Command Center attention routing.

## Pass 7 — Save-schema safety and code-maintenance cleanup

Implemented without requiring artwork:
- Added an explicit persisted-save envelope in `src/game/save/saveSchema.ts` with **schema v2**, a stable format discriminator, and save timestamp metadata.
- Added an auditable migration chain: historical raw GuildState (**v0**) → transitional envelope (**v1**) → current envelope (**v2**).
- Historical raw/v1 saves are upgraded only after they deserialize and normalize successfully; their previous payload is preserved as the slot backup first.
- Moved GuildState field/default normalization into `guildStateMigration.ts` instead of leaving a growing migration block inside persistence I/O.
- Current-schema payloads are now validated strictly; malformed v1/v2 payloads are rejected instead of being partially guessed at.
- Added a dedicated unsupported-future-schema error. A save made by a newer build is **never treated as corruption and never replaced by an older backup**.
- Save slots now load independently. If one slot is newer/corrupt while the other is healthy, the healthy slot still appears normally.
- Failed/newer slots appear as **PROTECTED** on the main menu instead of **EMPTY**, with New Game disabled for that slot so a load problem cannot silently lead to overwriting the underlying data.
- Preserved the existing two per-slot autosave queues and primary/backup rotation.
- Extracted the application route union/helpers into `src/navigation/appRoutes.ts`.
- Extracted the complete persistent quest-combat resolution transaction from `App.tsx` into `questCombatCompletionService.ts`.
- Moved `QuestResultSummary` into the quest domain layer so navigation/domain code no longer imports a screen-layer type.
- Removed the unused legacy `HomeScreen.tsx`.
- Fixed a strict TypeScript narrowing issue in `equipmentResolver.ts` while doing the maintenance pass.
- Refreshed README/architecture documentation and added `docs/save-schema.md` as the migration policy for future releases.
- Added save-schema tests for current envelopes, raw/v1 migration, malformed saves, future-version rejection/protection, backup recovery, and round trips.

### Pass 7 validation

- Pass-7 domain TypeScript check: **PASS**.
- Release configuration validation: **PASS**.
- Changed-file TS/TSX syntax transpile audit: **PASS**.
- Direct save-service runtime smoke: **PASS** for v0→v2 migration, primary/backup rotation, corrupt-primary recovery, two-slot isolation, and future-version slot protection without modifying the protected payload.
- Direct quest-completion transaction runtime smoke: **PASS** for result creation, persistent one-time quest completion, chronicle persistence, hero outcomes, and the one-day post-quest calendar advance.
- Full Vitest remains unavailable in this Linux validation environment because the supplied Windows/pnpm `node_modules` does not contain the Linux/WASI Rolldown native binding. A reconstructed TypeScript environment was therefore used for the targeted domain checks; its React-Native JSX package graph produces unrelated JSX-component diagnostics in a full-project check, while the changed domain files pass strict compilation.

## Next recommendation pass after Pass 7

1. **Pass 8 — Smarter Guild Command Center / attention routing**, with one prioritized action surface for payroll, healing/readiness, training, recruitment deadlines, side-quest catch-up, contracts/loyalty, scouting/gathering returns, regional danger, and other things that actually need the Guildmaster's decision.

## Pass 8 — Guild Command Center / game-like attention routing

Implemented without new artwork:
- Rebuilt the Guild home screen around a **War Table / Command Center** presentation rather than a generic status dashboard.
- Added a compact top command banner showing treasury, reputation, field-ready roster count, current location, guild name, and Guild Day.
- Added a large **Current Order** panel for the single highest-priority objective.
- Added a separate data-driven **Guild Orders** board that ranks actionable decisions by urgency instead of forcing the player to inspect every subsystem manually.
- The order board can surface fallen heroes, salary arrears, payroll shortfalls, expiring/expired contracts, low loyalty, ready gathering expeditions, returned regional scouts, candidate deadlines, campaign level gaps, regional threats, available Guildmaster skill points, and unused training capacity.
- Orders route directly to the relevant screen (Temple, Finances, Gathering, Recruitment, Side Quests, World, Heroes, Training, or Guildmaster Skills).
- Added dedicated urgency/readiness visual language: red = urgent, gold = warning/deadline, green = ready to collect/use, blue = opportunity.
- Reframed quick actions as **Guild Facilities** with a stronger tile treatment and secondary location/function labels.
- Added **Calendar Watch** to the Guild screen, showing the next meaningful planner milestone plus the daily HP/readiness/tavern-income rules, while retaining direct End Day and 7-Day Planner actions.
- Recent party cards now behave more like compact roster pieces with level labels and stronger press feedback.
- Updated post-Chieftain campaign preparation priority: when the top-four average is below the next campaign battle and eligible one-time Side Quests exist, the main Guildmaster order now routes directly to **Side Quests** instead of defaulting to Training.

### Pass 8 validation

- Pass-8 domain TypeScript check: **PASS** for the new command-center service, priority logic, and command-center tests.
- Changed-file TS/TSX syntax transpile audit: **PASS** for `GuildScreen.tsx`, `App.tsx`, and both Guild domain services.
- Release configuration validation: **PASS**.
- Direct compiled runtime smoke: **PASS** for urgent fallen/arrears orders, command-order sorting, and post-Chieftain level-gap routing to one-time Side Quests.
- Full React-Native TypeScript/Vitest execution remains limited by the uploaded Windows/pnpm dependency layout in this Linux environment. The reconstructed dependency graph still produces the previously documented unrelated React-Native JSX type mismatch, while the changed non-UI domain files pass strict compilation.

## Recommended next no-asset UI passes

1. **Pass 9 — Quest Board as a real game board:** stronger quest stamps, location/risk/reward hierarchy, one dominant action, clearer one-time completion and travel state, and less explanatory text on the first scan.
2. **Pass 10 — Hero Roster as adventurer cards:** larger portrait hierarchy, role/readiness/loyalty at a glance, compact class/race identity, and clearer injured/busy/training states.
3. **Pass 11 — Combat game-feel pass:** stronger turn banners, impact feedback, damage/heal number hierarchy, intent/readiness cues, and restrained code-only hit feedback before bespoke effects/audio are available.

## Pass 9 — Quest Board game-like UI pass

Implemented without new artwork:
- Rebuilt the Quests home screen into a framed **Guild Notice Board** with current posting location and the top-four field-team average visible before the quest list.
- Reworked quest cards around a colored left rail and readiness plate so risk can be read before body copy: red Danger, gold Challenging/recommended, green Ready/completed, blue Routine.
- Added clearer quest stamps for Side Quest, Boss Contract, Best Match, Completed, and **One Clear · Rewards Once**.
- Made location hierarchy explicit on every posting and surfaced Level, Party, Battles, and Risk in a compact four-cell strip.
- Replaced plain reward text with icon-backed Gold, XP, and First-Clear reward tokens using the existing icon atlas.
- Added a compact optional Known Intel block instead of making every card permanently text-heavy.
- Reframed Campaign as a distinct **Story Order** and Dungeons/Operations/Raids as visually separate special activities, preserving Raid's stronger identity.
- Kept one dominant action per posting: Inspect & Prepare, High Risk inspection, Repeat, or Review Completed Quest.

### Pass 9 validation

- Changed Quest screen TSX syntax transpile audit: PASS.
- No quest availability, reward, completion, travel, or combat logic was changed; this pass is presentation-only around the existing quest services.

## Pass 10 — Hero Roster as adventurer cards

Implemented without requiring replacement artwork:
- Rebuilt the Heroes screen as a **Guild Hall / Hero Roster** instead of a generic searchable list.
- Added a permanent **Recruit** action to the roster header so recruitment is reachable even when the guild already owns heroes.
- Added a four-part roster command strip for Field Ready heroes, heroes needing attention, top-four average level, and unspent class skill points.
- Hero cards now use a stronger RPG hierarchy: class banner, large portrait, Level plate, race/class identity, field status, HP, readiness, XP-to-next-level, loyalty, contract time, and one clear Inspect action.
- Training heroes show the active training program and remaining days directly on their card.
- Injured heroes show the primary persistent condition and additional-condition count; fallen heroes show a Temple/revival state.
- Expiring/expired contracts and low loyalty are surfaced at roster level instead of requiring the hero detail sheet to discover them.
- Heroes with class-skill choices receive a prominent gold star badge on their roster card.
- Added class-specific accent rails/frames in code so each class reads differently before bespoke class frames/icons are available.
- Kept detailed equipment, attributes, traits, history, and relationships one tap deeper to avoid turning the roster into a spreadsheet.

## Pass 11 — Combat game-feel / tactical HUD pass

Implemented without new artwork:
- Added a compact battle HUD showing round, allied survivors, enemy survivors, and low-HP warnings before the tactical board.
- Rebuilt turn-order cards into sharper pixel-style initiative plates with ally/foe rails, HP strips, active-turn marker, and defeated state.
- Upgraded the active-turn banner with the acting hero/enemy portrait plus clear **MOVE READY / ACTION READY** state chips.
- Added tiny on-board HP bars to every living combat token and a critical-health `!` marker below 30% HP.
- Kept the previously added solid red enemy-tile border as the dedicated double-tap basic-attack cue.
- Added restrained code-only impact shake and border flash for hits, heavy hits, criticals, and defeats; both the in-game Reduce Combat Effects preference and OS Reduce Motion are respected.
- Improved floating combat feedback hierarchy: criticals and defeats are larger, defeated enemies display `DEFEATED`, downed heroes display `DOWN`, while healing/misses remain visually distinct.
- Improved combat inspection/current-turn/party panels with critical-HP state coloring and warnings.
- Reworked the D20 result card into a clearer RPG-style roll plate with stronger critical/miss presentation.
- Added `combatFeedbackService.ts` to keep health-band and impact-strength rules deterministic/testable, plus targeted unit coverage.

### Pass 11 validation

- Full TS/TSX syntax/transpile audit across 674 application/test source files: **PASS**.
- Release configuration validation: **PASS**.
- Direct runtime smoke for health-state thresholds and defeat-impact classification: **PASS**.
- Targeted reconstructed TypeScript check found no non-environment diagnostics in the Pass-11 files. The same React-Native JSX type mismatch from the reconstructed Linux dependency graph remains environment-only.
- Full Vitest remains blocked by the supplied Windows Rolldown native binding in this Linux environment.

## Pass 12 — World / travel game-feel and route planning

Implemented without requiring new artwork:
- Reworked the continent screen into a **Field Command / World Map** rather than a generic location list.
- Added a persistent guild-position plate showing the current region/settlement, field-party size, day, and ration stock.
- Region selection now opens a proper **Region Dossier** with quest completion, settlement discovery, threat, recommended level, and a compact progress meter.
- Added a deterministic travel-preview service for both regional and local journeys. Route planning now exposes travel days, party size, ration cost, rations remaining after travel, arrival day, level-risk state, payroll crossed on the journey, and blocking reasons before the player commits.
- Travel party planning now prefers the recent available field party (up to four heroes), with the highest-level available heroes used as the fallback rather than using the entire guild roster.
- Added stronger route states: Current Position, Route Ready, High Risk, Threat Active, Route Blocked, and Campaign Locked.
- Direct-road chips now expose whether the destination is campaign locked and how many days the road takes.
- Replaced the plain discovered-settlement text list with a compact **Travel Ledger** that highlights the guild's current position.
- Reworked regional maps into a **Local Route Board** with an at-a-glance regional order/discovery/threat summary, current-location markers, ready-order badges, and clearer map legend.
- Settlement inspection now previews local walking cost before travel: one day, field-party size, ration cost, arrival day, and remaining supplies.
- Settlement services are displayed as compact service chips instead of one long text string.
- Local quests are now presented as small game-like **Local Orders** with status, one-clear Side Quest labeling, recommended level, battle count, gold, XP, and an Open Order action only when appropriate.
- Completed one-clear Side Quests remain visibly stamped Complete instead of looking repeatable.
- Shared world-map chrome was tightened to sharper pixel-style borders instead of rounded app-like map cards.
- Added `worldMapPresentationService.ts` and targeted tests so travel/readiness/progress presentation stays deterministic and out of the screen components.

### Pass 12 validation

- Full source syntax parse audit across 676 TS/TSX files: **PASS**.
- Release configuration validation: **PASS**.
- Direct compiled runtime smoke for locked-route, under-level route, local-travel cost, and regional-progress summaries: **PASS**.
- Reconstructed strict TypeScript validation found no new non-environment diagnostics in the Pass-12 presentation service or World/Region screens. The reconstructed Linux dependency graph still produces the known React-Native JSX type mismatch globally.
- Full Vitest remains blocked by the supplied Windows Rolldown native binding in this Linux environment.

## Next recommendation pass after Pass 12

**Pass 13 — Hero Detail / RPG character sheet.** The roster is now game-like, but the individual hero screen can use the same visual hierarchy: identity and condition first, then combat role, equipment/loadout, progression/skills, loyalty/contract, traits/history, with secondary statistics progressively disclosed rather than shown as a long management page.

## Pass 13 — Hero Detail / RPG character sheet

Implemented without requiring new artwork:
- Rebuilt the individual hero screen from a long management page into a proper **Adventurer Character Sheet**.
- The header now leads with portrait, class accent, Level plate, race/class/subclass identity, tactical role, background, field status, and pending skill-point state.
- The default Sheet tab now prioritizes what matters before a quest: HP, readiness, mana where applicable, XP, combat profile, active conditions, equipment summary, progression choices, loyalty, and contract state.
- Added class-role labels such as Frontline Fighter, Ranged Striker, Healer / Support, Tank / Protector, and Arcane Marksman so a hero's tactical purpose is readable without inspecting raw stats.
- Added compact six-slot equipment preview on the Sheet with a direct **Open Gear** action; the full paper-doll, saved loadouts, equipment effects, and unequip controls remain in the Gear tab.
- Promoted pending skill/subclass choices into the main progression panel and retained the notification on the Skills tab.
- Added contract urgency directly to the hero sheet, including weekly pay, remaining days, loyalty meter, latest loyalty change, and a direct route to Contracts & Finances when renewal is close.
- Moved traits, personality, relationships, achievements, and the hero chronicle into a dedicated **Story** tab so character lore stays accessible without crowding field-management information.
- Kept detailed derived numbers behind the Stats tab instead of placing spreadsheet-like stat blocks at the top of the screen.
- Hero detail now resolves the live guild hero by ID, so equipment/loadout changes update the character sheet instead of leaving stale route data visible.
- Corrected the legacy recruitment detail wording from salary `/day` to the actual `gold/week` contract unit.
- Added shared `heroPresentation.ts` helpers so the roster and detail screen use the same class colors, duty states, contract urgency, and tactical-role language.

### Pass 13 validation

- Full TS/TSX syntax/transpile audit across 678 application/test source files: **PASS**.
- Release configuration validation: **PASS**.
- Direct compiled runtime smoke for field-ready/fallen states, contract urgency, and tactical role presentation: **PASS**.
- Reconstructed strict TypeScript validation found no new non-environment diagnostics in Hero Detail, Hero Roster, shared hero presentation, or App routing. The known React-Native JSX mismatch remains limited to the reconstructed Linux dependency graph.
- Full Vitest remains blocked by the supplied Windows Rolldown native binding in this Linux environment; targeted tests are included in `tests/heroPresentation.test.ts`.

## Next recommendation pass after Pass 13

**Pass 14 — Rewards, level-ups, and progression feedback.** The core screens now read more like a game. The next no-asset pass should make progression *feel* rewarding: stronger XP/level-up reveals, loot/reward staging, skill-point callouts, rare-drop hierarchy, and clearer post-quest next actions without adding long animations.

## Pass 14 — Rewards, level-ups, and progression feedback

Implemented without requiring new artwork:
- Rebuilt the post-quest reward section into a staged **Reward Chest** presentation instead of a flat rewards list.
- Reward results now expose the actual Gold, Reputation, Guildmaster XP, and base hero XP gained, including campaign-chapter completion Gold/Reputation that was previously applied but not clearly represented in the result summary.
- Added explicit Guildmaster progression snapshots so a Guildmaster level-up or new skill point is announced immediately with a direct route to the Guildmaster Skill Tree.
- Added per-hero XP snapshots to quest results: XP before, XP after, actual XP gained, skill points before/after, and level before/after.
- Hero progression cards now animate the XP bar, strongly announce Level Up, show actual per-hero XP rather than only the generic base reward, and surface newly reached progression gates.
- Level 5 now announces **Subclass Choice Unlocked** and Level 10 announces **Mastery Choice Unlocked** when crossed by a quest result.
- Newly earned class skill points receive their own milestone callout and a direct **Spend Skill Point** action.
- Added support for visibly banked XP when a hero is sitting at a current progression cap rather than making the player think XP vanished.
- Equipment rewards now use a rarity hierarchy (Common / Uncommon / Rare / Epic / Legendary), stronger rarity-colored pixel frames, item level/value context, and direct Inspect interaction.
- Crafting-pattern unlocks now have their own **Pattern Unlocked** card instead of blending into an ordinary loot list.
- One-clear Side Quest crafting materials explicitly state that their guaranteed reward has been secured and cannot simply be farmed again.
- The result flow now treats the first post-battle management action as the **Recommended Next Order** with a dominant primary button, while secondary follow-ups remain available below it.
- Reward reveal motion is intentionally short and respects the operating system's Reduce Motion setting.
- Added `questRewardPresentationService.ts` so XP wrapping, milestone detection, banked-XP state, and loot rarity presentation remain deterministic and testable.

### Pass 14 validation

- Full application TypeScript check (App + `src`, excluding the project's pre-existing test typing issues): **PASS** after reconstructing the uploaded pnpm top-level links in a temporary Linux validation environment.
- Full project TypeScript run reached only the pre-existing strict typing errors recorded at that time in older tests; no Pass-14 source diagnostics were reported.
- Targeted Pass-14 test TypeScript compilation: **PASS**.
- Direct runtime smoke for XP level-wrap math, subclass/skill milestones, and Rare-loot hierarchy: **PASS**.
- Direct quest-completion runtime smoke confirmed Gold, Reputation, Guildmaster XP, and per-hero XP snapshots are populated correctly: **PASS**.
- Full Vitest execution remains unavailable with the uploaded Windows/pnpm dependency layout in this Linux environment.

## Next recommendation pass after Pass 14

**Pass 15 — Calendar / Guild Planner visual game pass.** The planner logic is already strong; the next no-asset pass should make the week readable like a game calendar: day tiles, event icons, urgency colors, payroll/recovery/training/scouting markers, and a much clearer "what happens if I advance" preview rather than primarily textual rows.

## Pass 15 — Guild Calendar / Planner game-like UI

Implemented without requiring new artwork:
- Reworked the existing 7-day planner from wide text-heavy cards into a proper **Guild Calendar** with compact selectable day tiles.
- Every day now has an urgency state: Routine, Milestone, Watch, or Action Needed, with consistent muted/green/gold/red presentation.
- Added icon-first calendar markers for payroll, training, workshop completion, gathering, scouting, recovery, recruitment deadlines, contract changes, and regional threat using the existing game icon atlas.
- Tapping a day opens a larger **Selected Day** preview showing exactly what will resolve, projected treasury, payroll coverage, and the daily healing/readiness/tavern routine.
- Added a direct **Advance to Day X** action for the selected date, while keeping the safer confirmation dialog and the existing Jump to Next Milestone shortcut.
- Routine days explicitly remind the player that living heroes heal 10% max HP, resting heroes recover readiness, and the tavern contributes daily income.
- Reframed the screen header and finance summary into a more game-like command display with a current-day plate and icon-backed Treasury / Payroll / Arrears blocks.
- Added `guildPlannerPresentationService.ts` so calendar urgency, event labels, and icon selection remain deterministic and reusable outside the Finance screen.
- Added targeted unit coverage in `tests/guildPlannerPresentation.test.ts` for icon mapping, urgency precedence, and routine-day presentation.

### Pass 15 validation

- Full TS/TSX syntax/transpile audit across 683 application/test files: **PASS**.
- Release configuration validation: **PASS**.
- Direct compiled runtime smoke for planner icon mapping, warning/danger precedence, and routine-day fallback: **PASS**.
- Reconstructed strict TypeScript validation reports no non-environment diagnostics in the Pass-14/15 changed files. The known React-Native JSX type mismatch remains limited to the reconstructed Linux dependency graph.
- Full Vitest execution remains unavailable with the uploaded Windows Rolldown native dependency in this Linux environment; targeted tests are included in the project.

## Next recommendation pass after Pass 15

**Pass 16 — Navigation, notifications, and activity-state polish.** The major screens now feel game-like individually. The next no-asset pass should make moving between them feel like one cohesive game: stronger bottom-nav selected plates, contextual notification counters, clearer return paths, persistent current-task/activity summaries, and fewer cases where the player has to remember which menu contains the action they need.

## Pass 16 — Navigation, notifications, and active-order polish

Implemented without requiring new artwork:
- Reworked the five-tab bottom navigation into stronger pixel plates with a clearer selected state, corner accents, an ACTIVE marker, and compact numeric notification badges instead of relying only on red dots.
- Global action signals are now categorized by where the player can actually deal with them: Guild, Quests, World, Heroes, or Inventory.
- Notification badges only appear for urgent, warning, or claim-ready work; routine opportunities are intentionally silent so the navigation does not become permanently noisy.
- Quests can carry a contextual target. When the post-Chieftain level warning recommends one-clear Side Quests, tapping the badged Quests tab can open the Side Quests category directly.
- Added a persistent **Active Orders** strip below the resource header for work already underway: Training, Field Teams / Gathering, Regional Scouting, and an active Dungeon run.
- Active-order chips show useful short timing states such as `2D`, `1 READY`, `REPORT READY`, or `ACTIVE`, and open the matching subsystem directly.
- Separated active work from alerts: notification badges answer "what needs my attention?" while Active Orders answers "what is my guild doing now?".
- Added contextual return routing for Training, Gathering, Recruitment/Candidate inspection, Dungeon runs, and Gems & Support when opened from a main-tab activity/header shortcut. Back now returns to the main tab the player came from instead of always throwing them to Guild/Quests/Inventory.
- The global guild header now shows the total number of actionable orders, highlights negative treasury values, and uses a game-like numeric ready badge for the daily Gems claim.
- Updated the legacy notification dot geometry to a square pixel marker so older in-screen notifications match the new visual language.
- Added `guildActivityPresentation.ts` and expanded `actionNotifications.ts` so navigation behavior is deterministic and testable rather than screen-specific.

### Pass 16 validation

- Full TS/TSX syntax/transpile audit across 687 application/test source files: **PASS**.
- Release configuration validation: **PASS**.
- Strict reconstructed TypeScript check reports no non-environment diagnostics in the Pass-16 changed files; the known React-Native JSX type mismatch remains a validation-environment issue.
- Direct compiled runtime smoke confirmed navigation category routing, urgency/count aggregation, ready gathering status, training countdowns, and scouting countdowns: **PASS**.
- Added targeted coverage in `tests/navigationGameFeel.test.ts` for tab routing, Side Quest contextual navigation, and Active Orders presentation.
- Full Vitest remains unavailable with the uploaded Windows Rolldown native binding in this Linux environment.

## Next recommendation pass after Pass 16

**Pass 17 — Quest preparation / party assembly flow polish.** The major screens and navigation now feel connected. The next no-asset pass should make the transition from choosing an order to entering combat feel like a deliberate RPG deployment: compact party roles, readiness warnings, enemy-intel summary, formation/loadout checks, travel/time cost, consumable preparation, and a single clear Deploy action rather than several disconnected preparation pages.

## Pass 17 — Quest deployment / party assembly flow

Implemented without requiring new artwork:
- Rebuilt the party-selection screen into a deliberate **Field Deployment** flow rather than a plain hero checklist.
- Added a compact field-order plate with quest type, difficulty, recommended level, destination, encounter count, readiness cost, and projected return day.
- Added **Auto-fill Balanced** for ordinary quests. It prefers a frontline/support/ranged core when those roles are available, then fills remaining slots with the strongest field-ready heroes. Personal-quest heroes are forced into recommended parties when eligible.
- Kept the existing bespoke Raid auto-fill and two-squad slot structure; ordinary quest auto-fill does not replace Raid composition rules.
- Selected party slots now show tactical role labels and can be tapped to remove a hero directly.
- Added a deterministic **Deployment Check** that summarizes party average level, lowest post-deployment readiness, lowest HP percentage, role coverage, equipment readiness, Monster Manual intel coverage, and combat-potion stock.
- Deployment warnings now surface under-level parties, hard level gates, low health, unavailable/tired heroes, missing frontline/support coverage, damaged/broken equipment, missing healing potions, and completely unknown enemy rosters.
- Added code-driven deployment states: Select Party, Not Ready, High Risk, Watch, and Ready to Deploy.
- Roster rows now show each hero's tactical role, HP meter, current readiness, and predicted readiness after the quest cost is paid.
- Skill-check coverage and relationship chemistry remain visible as advisory preparation information.
- Squad Presets remain available but are collapsed by default so the primary deployment decision stays above secondary management tools.
- Reframed the existing calendar/payroll warning as part of deployment: the player sees the return day before committing and still receives the protected confirmation when payroll/time tutorial conditions require it.
- Final action is now one dominant **Deploy Party** order, with explicit high-risk wording when the party is below the recommended level.
- Added `questDeploymentService.ts` so role classification, equipment/supply/intel summaries, warning severity, and balanced auto-fill stay outside the React screen and remain testable.
- Added targeted unit coverage in `tests/questDeployment.test.ts`.

### Pass 17 validation

- Full TS/TSX syntax/transpile audit across 689 application/test files: **PASS**.
- Release configuration validation: **PASS**.
- Strict direct TypeScript compilation of the new deployment domain service and its dependency graph: **PASS**.
- Direct compiled runtime smoke confirmed balanced auto-fill, frontline/support/ranged coverage, readiness-after-deployment calculations, field supplies, and Monster Manual intel status: **PASS**.
- Full Vitest remains unavailable with the supplied Windows Rolldown native binding in this Linux environment; the targeted test file is included in the project.

## Next recommendation pass after Pass 17

**Pass 18 — Recruitment / Tavern game-like flow.** Recruitment is one of the remaining management systems that can still feel list-heavy. The next no-asset pass should present candidates like adventurers visiting a guild hall: stronger candidate cards, recruitment quality/fit signals, contract cost at a glance, scouting state, roster-cap pressure, comparison against current classes/roles, and one clear Hire / Pass decision without turning recruitment into a spreadsheet.

## Pass 18 — Recruitment Tavern + tutorial refresh

Implemented without requiring new artwork:
- Reframed Recruitment as a **Guildhaven Tavern / Adventurers for Hire** board rather than a generic candidate list.
- Added a recruitment command header with roster capacity, treasury, current living-roster payroll, and frontline/support/ranged coverage.
- Candidate cards now surface tactical role, public rarity/quality, whether the recruit fills a missing roster role, departure urgency, signing fee, weekly salary, contract length, and projected payroll after hire.
- Added explicit economy warnings for unaffordable fees and a treasury that would become tight immediately after the minimum signing fee.
- Candidate inspection is now an **Adventurer Dossier** with RPG role identity, Guild Fit summary, scouting/contract forecast, and game-like Overview / Stats / Traits / Contract tabs.
- Reworked the first recruitment tutorial around actual decisions: class/role, matching attributes, traits, upfront fee, weekly payroll, contract length, one-hire-per-batch refresh, and comparison tradeoffs.
- Added a permanent **Guildmaster Handbook** under Settings so tutorials can always be reviewed instead of being one-time-only knowledge.
- The Handbook now documents the current War Table, one-clear/location-bound Side Quests, balanced Deployment Check, solid-red-border double-tap basic attacks, End Day +10% max-HP healing, Guild Planner, hero loyalty/progression, travel/rations, Archive rewards/Mission Intel, dungeon Boons/Pacts, and the distinction between normal bosses and eight-hero Raids.
- Added first-time contextual primer panels for the renewed **War Table**, **Field Deployment Check**, and **Guild Planner**; each can be dismissed after it is understood while remaining reviewable through the Handbook.
- Updated the new-game tutorial introduction so it describes the larger staged onboarding path (Recruitment → first quest → combat → travel/management) and points players toward the Handbook.
- Added `recruitmentPresentationService.ts` so roster gaps, candidate fit, departure urgency, affordability, and projected payroll presentation are deterministic and testable.
- Added targeted coverage in `tests/recruitmentPresentation.test.ts` and `tests/tutorialGuide.test.ts`.

### Pass 18 validation

- TS/TSX parser audit across 695 application/test files: **PASS**.
- Release configuration validation: **PASS**.
- Strict standalone TypeScript compilation for the new recruitment-presentation and tutorial-guide domain modules: **PASS**.
- Direct compiled runtime smoke confirmed missing-role detection and a Cleric correctly receiving **FILLS SUPPORT GAP** against a frontline+ranged roster: **PASS**.
- Full Vitest remains unavailable in this Linux environment because the supplied dependency tree contains the Windows Rolldown native binding; the new targeted tests remain in the project for normal Windows/local CI execution.

## Next recommendation pass after Pass 18

**Pass 19 — Inventory / equipment game-feel overhaul.** The roster, character sheet, recruitment, deployment, world, quests, combat, and calendar now speak the same RPG language. The next no-asset pass should make Inventory feel equally game-like: rarity-led item cards, equipped/eligible hero context, comparison at a glance, durability warnings, clear salvage/craft/use decisions, and less spreadsheet-like item browsing.

## Pass 19 — Armory, Inventory & Equipment Game Feel
- Reframed Inventory as the Guild Quartermaster / Armory screen with stronger pixel-RPG hierarchy.
- Added possible-upgrade count, hero eligibility, durability state/meter, and an Upgrades-only filter.
- Added per-item presentation logic that classifies hero fit as likely upgrade, build tradeoff, sidegrade, likely downgrade, or unusable based on actual calculated stat changes.
- Rebuilt Item Detail as a Quartermaster Dossier with rarity framing, durability, special effects, hero-by-hero current gear comparison, direct repair, Equip, Sell, and Salvage actions.
- Added a first-time Armory tutorial and permanent Guildmaster Handbook topic explaining gear comparison, rarity, durability, repair, selling, and salvage.
- Added targeted inventory-presentation tests while preserving existing save data and equipment keys.

## Pass 20 — Guild Workshops & crafting game feel

Implemented without requiring the large asset folder:
- Rebuilt Crafting into a **Guild Workshops** screen with distinct Blacksmith, Tailor, and Jeweler plates, workshop levels, current capability counts, and construction state.
- Added recipe filters for **All / Craftable / Upgrades / Locked** so the player can immediately answer what can be made, what helps the roster, and what is still gated.
- Every recipe now explains its blocker instead of silently disabling the craft button: undiscovered pattern, missing workshop, insufficient workshop level, insufficient gold, or exact missing materials.
- Locked special recipes remain visually undiscovered and show only the way to obtain the pattern, avoiding reward spoilers.
- Recipe cards now use the Pass-19 equipment comparison rules to show actual eligible heroes, likely upgrades, and build tradeoffs rather than treating rarity as a power score.
- Material requirements are interactive. Tapping a material opens its description, owned/required count, and known source hints; named-monster sources remain hidden until that enemy exists in the Monster Manual.
- Workshop construction and upgrades now preview the capabilities unlocked at the target tier and show an in-progress meter with calendar routing.
- Expanded the Blacksmith **Repair Bench** with durability meters, per-item repair costs, and a Repair All order when the treasury can afford the total.
- Reframed Jeweler enchantments as deliberate one-slot build choices with explicit gold/material/workshop blockers.
- Added a contextual first-visit Workshop tutorial plus a permanent **Workshops & Crafting** Guildmaster Handbook topic.
- Added deterministic `craftingPresentationService.ts` and targeted tests for blocker reasons, upgrade filtering, hidden monster sources, and workshop unlock previews.

### Pass 20 validation

- Targeted TS/TSX syntax/transpile check for the new crafting service, Crafting screen, and tests: **PASS**.
- Full-project validation is rerun after Pass 21 in the same master source, because the uploaded pnpm `node_modules` does not contain reconstructed top-level Linux links by default.

## Pass 21 — Training Yard game feel

Implemented after the Pass-20 Workshop checkpoint:
- Rebuilt Training Hall into a **Guild Training Yard** with a facility identity, slot occupancy, completed-program count, upgrade progress, and a clearer current-day/treasury header.
- Active training is now represented by real slot cards showing hero, program, progress, XP reward, readiness on return, days remaining, and exact Ready Day.
- Empty facility slots are visible, so capacity is readable before the player starts selecting heroes.
- Program cards now surface duration, hero-adjusted gold cost, hero-adjusted XP reward, Training Hall level gate, and the explicit **XP ONLY** rule.
- Added a final **Training Order** preview before committing: current/projected level, XP reward, XP meters, projected readiness after calendar recovery, gold cost, training cap, return day, and every blocker when the order cannot begin.
- Added a projected Level Up callout when the selected program would cross the next level.
- Training Hall upgrades now have construction progress and calendar routing rather than only a completion-date line.
- Integrated campaign catch-up guidance directly into Training: after the Chieftain stage, an under-level top-four roster is told that one-clear Side Quests are the main active catch-up path, while Training supplements downtime/reserves. The screen can route directly to Side Quests.
- Added a contextual first-visit Training Yard tutorial and permanent **Training Yard** Handbook topic explaining availability, XP-only progression, readiness recovery, caps, and the intended Side-Quest relationship.
- Added deterministic `trainingPresentationService.ts` plus targeted tests for readiness projection, order/blocker presentation, session progress, and campaign catch-up advice.

### Pass 21 validation

- Targeted TS/TSX syntax/transpile validation for the new Training presentation service, Training screen, App route update, and tests: **PASS**.
- Full source syntax/transpile audit, release validation, targeted runtime checks, and final ZIP integrity are recorded in the final package validation below.

### Pass 20–21 final package validation

- Full syntax/transpile audit across **700 TS/TSX application and test files** (excluding declaration-only `.d.ts` files): **PASS**.
- Strict standalone TypeScript compilation of `craftingPresentationService.ts` and `trainingPresentationService.ts` with imported domain dependencies: **PASS**.
- Direct compiled runtime smoke covering workshop blockers, craft-ready state, hidden undiscovered monster sources, Training Order projection, readiness recovery, and post-Chieftain Side Quest guidance: **PASS**.
- Release configuration validation for `com.elroybenjamins.risingguildmaster`: **PASS**.
- Full Vitest remains unavailable in this Linux runtime because the bundled pnpm tree originates from the Windows project and does not include a Linux-compatible Rolldown native binding/top-level link layout. The new targeted Vitest files remain included for the normal project environment.
