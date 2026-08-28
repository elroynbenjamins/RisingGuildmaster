# Guildmaster

Mobile-first fantasy guild management prototype built with Expo, React Native, and TypeScript.

## Run

```sh
npm install
npm start
```

Use `npm run android`, `npm run ios`, or scan the Expo QR code. Run the domain tests with `npm test` and the strict compiler check with `npm run typecheck`.

## Privacy

Guildmaster's public privacy policy is available at:

https://rising-guildmaster-privacy.expo.app/privacy-policy.html

The policy covers local save data, Google Mobile Ads (AdMob), advertising privacy choices, retention, deletion, security, and contact information. The Android app also links to this page from **Settings → Privacy & Ads**.

## Current milestone

- Seeded, data-driven hero generation
- Four races, six classes, six traits, and four timed conditions
- Generic flat, percentage, and conditional modifier pipeline
- Equipment slots and reversible equipment effects
- Guild state and a three-candidate recruitment flow
- Guild roster and full hero detail views
- Twelve foundational enemies plus the Chapter 1 Goblin Chieftain boss, shared abilities, and loot references
- Runtime enemy instances with stat scaling, resistances, conditional effects, auras, and regeneration
- Data-driven enemy combat skills, prioritized behaviors, cooldowns, targeting, conditions, and turn resolution
- Six hero classes (including Ranger) with shared combat skills, mana/stamina, and player-controlled tactical actions
- Party selection and three playable multi-encounter quests with gold, loot, XP, leveling, injuries, and persistent guild saves
- 7×5, 9×7, and 11×9 tactical boards with movement actions, weighted pathfinding, range, line of sight, AoE previews, and D20 attack rolls
- Data-driven forest, mountain, shallow-water, cave, and hideout battlefields with visible terrain rules
- A three-room Goblin Cave Hideout contract progressing from narrow tunnels into a grand command room
- Eldoria world map with five regions, five settlements, connected travel, events, lore, and persistent world state
- Data-driven Chapter 1 campaign progression, branching Chieftain choice, regional unlocks, and boss rewards
- Twelve level-10 subclasses (two for each base class) using the existing modifier and combat-skill registries

Chapters 2–5, expanded terrain, companion runtime behavior, crafting, and meta-progression remain future milestones.

See [docs/architecture.md](docs/architecture.md) for system boundaries and extension points.
