# Architecture

The application is split into three directional layers:

1. `src/data` contains immutable content definitions. Content references typed IDs and generic modifiers; it does not execute game rules.
2. `src/game` contains pure domain types and functions. It has no dependency on React Native and is directly unit-testable.
3. `src/state` and `src/screens` coordinate domain actions and rendering. Screens never own formulas or mutate hero base attributes.

## Stat pipeline

`base attributes -> flat attribute modifiers -> percentage attribute modifiers -> derived formulas -> flat/percentage derived modifiers`

All percentage values are decimal fractions. Conditional modifiers receive a small calculation context (currently HP ratio), allowing traits, races, equipment, and future effects to share one evaluator.

## Persistence boundary

Heroes and guild state contain JSON-safe data only. Definitions and functions are resolved from IDs when calculating. A save adapter can therefore serialize the state without serializing behavior.

## Extension points

- Add content by defining new typed records in `src/data`.
- Add modifier targets centrally in `src/game/modifiers/types.ts`.
- Quest/combat systems should consume `calculateHeroStats` output rather than recalculate attributes.
- Persistence is centralized in `src/game/save`; UI state remains unaware of storage details.

## Enemy foundation

Enemy definitions, abilities, loot references, and encounter compositions live under `src/data`. Runtime enemies are created from definitions by `src/game/enemies` and never mutate their source data. Ability services interpret numeric trigger, aura, condition, and regeneration fields generically; adding an enemy that uses an existing effect requires data only. Level and difficulty multipliers are explicit factory inputs so later encounter scaling can be added without changing enemy definitions.

## Combat actions

`src/data/skills` owns reusable combat actions and `src/data/enemyBehaviors` owns prioritized AI rules. The modules under `src/game/combat` independently handle damage, targeting, cooldowns, temporary modifiers, conditions, passives, auras, turn ordering, and turn resolution. Runtime cooldowns and effects live on instances or combat units; definitions remain immutable. Conditional effects use declarative HP-ratio fields rather than enemy-ID branches.

## Playable quest loop

The quest loop supports 7×5, 9×7, and 11×9 tactical grids. `src/game/combat/grid` owns Manhattan distance, weighted pathfinding, terrain costs, movement, line of sight, AoE areas, and spawning. Forest, mountain, water, cave-wall, and barricade rules are data-driven. `CombatState` is authoritative; board components only render state and send tap intents. D20 rolls exclusively use the central seeded RNG.

World, settlement, event, lore, campaign-node, and campaign-choice definitions live in `src/data`. Serializable `WorldState` is part of the guild save. Pure services validate travel, prerequisites, checks, choices, unlocks, flags, and rewards, leaving the map as a projection of state.

Heroes store only a nullable subclass ID. Level and base-class validation live in `src/game/progression/subclasses`; subclass definitions reuse the existing modifier pipeline and hero combat-skill registry.

Parties reference serializable hero IDs. Quest and encounter definitions remain immutable while `ActiveQuest` and `CombatState` hold run-time progress. `combatEngine` is the session coordinator, but delegates all action resolution—hero and enemy—to the same `skillResolver`. Quest results are the only layer allowed to translate combat outcomes into persistent guild gold, inventory, XP, attribute growth, HP, and lasting conditions. Active combat is deliberately excluded from saves; guild state is persisted through the save adapter.
