# Rising Guildmaster

Mobile-first pixel-fantasy guild-management RPG built with Expo, React Native, and TypeScript.

## Run

```sh
npm install
npm start
```

Use `npm run android`, `npm run ios`, or scan the Expo QR code. Run the domain tests with `npm test` and the strict compiler check with `npm run typecheck`.

## Current game systems

- Two independent local guild save slots with autosave backup recovery and explicit save-schema migrations.
- Nine authored campaign chapters with side quests, settlement travel, branching decisions, regional progression, and mechanically reactive campaign bosses.
- Tactical D20 combat on multiple board sizes with movement/pathfinding, terrain, line of sight, AoE, conditions, cooldowns, enemy AI, boss phases, and double-tap basic attacks.
- Dedicated Raids kept above normal bosses as eight-hero/two-squad encounters with bespoke multi-phase objectives and weekly prestige progression.
- Roguelite dungeons with routes, events, merchants, rest nodes, elites, bosses, temporary Boons/Pacts, scoring, and rotating records.
- Tavern-style hero recruitment with tactical-role fit, scouting uncertainty, projected contract/payroll impact, reservations/refreshes, salary, loyalty, relationships, histories, personal progression, subclasses, skill trees, equipment, readiness, injuries, and training.
- Guild economy with payroll, tavern income, gathering, alchemy, construction timers, regional threats, and crisis operations, plus game-like Blacksmith/Tailor/Jeweler Workshops with recipe blocker explanations, real roster-upgrade filtering, material source hints, repairs/enchanting, and workshop construction previews.
- A Guild Training Yard with visible capacity slots, active-program progress, projected XP/readiness/return day, facility upgrades, campaign catch-up caps, and direct Side Quest guidance when the top-four roster falls below post-Chieftain campaign recommendations.
- A selectable icon-driven 7-day Guild Calendar with projected treasury, urgency states, Advance to Day, and Jump to Next Milestone.
- Mission Intel tied to Monster Manual discovery, plus claimable Monster Manual, Lore, Skill Codex, and Hero Codex progression rewards.
- Account-level content entitlements, Gems, rewarded ads, ad removal, daily login support, and permanent purchase protection outside individual guild saves.
- Pixel-oriented mobile UI foundation with compact game panels, a War Table-style Guild Command Center, a Guild Notice Board for quests, a tavern-like Recruitment Board, a Field Deployment party-preparation screen with balanced auto-fill/readiness/loadout/intel/supply checks, portrait-led adventurer roster cards and RPG character sheets, a Quartermaster Armory with upgrade/tradeoff and durability/repair guidance, Field Command world/route planning with Local Route Boards, a tactical combat HUD with initiative plates and red double-tap attack borders, staged post-quest Reward Chest / XP / level-up / rarity feedback, numeric main-tab action badges, a persistent Active Orders strip, and a reviewable Guildmaster Handbook for the current tutorial rules.

## Architecture

Game content is data-driven under `src/data`; pure game/domain logic lives under `src/game`; screens and state coordinate presentation. App route types live under `src/navigation` instead of inside `App.tsx`, and finished quest persistence is resolved by the domain quest-completion service rather than the root component.

Save persistence is documented in [docs/save-schema.md](docs/save-schema.md). General system boundaries are in [docs/architecture.md](docs/architecture.md).

## Privacy

Rising Guildmaster's public privacy policy is available at:

https://elroynbenjamins.github.io/rising-guildmaster/privacy/

The policy covers local save data, Google Mobile Ads (AdMob), advertising privacy choices, retention, deletion, security, and contact information. The Android app also links to this page from **Settings → Privacy & Ads**.
