import type { EncounterDefinition, EncounterEnemyGroup } from "../../game/quests/questTypes";

type GroupSpec = [enemyDefinitionId: string, count: number, level: number, difficultyMultiplier?: number];
const grandHeroes = [{ x: 0, y: 3 }, { x: 0, y: 4 }, { x: 0, y: 5 }, { x: 1, y: 4 }];
const warfrontHeroes = [{ x: 0, y: 4 }, { x: 0, y: 5 }, { x: 0, y: 6 }, { x: 1, y: 5 }];
const grandEnemies = [{ x: 8, y: 2 }, { x: 8, y: 4 }, { x: 8, y: 6 }, { x: 9, y: 3 }, { x: 9, y: 5 }];
const warfrontEnemies = [{ x: 12, y: 3 }, { x: 12, y: 5 }, { x: 12, y: 7 }, { x: 13, y: 4 }, { x: 13, y: 6 }];
function makeEncounter(id: string, battlefieldId: string, specs: GroupSpec[], warfront = false): EncounterDefinition {
  const positions = warfront ? warfrontEnemies : grandEnemies; let cursor = 0;
  const enemies: EncounterEnemyGroup[] = specs.map(([enemyDefinitionId, count, level, difficultyMultiplier]) => ({ enemyDefinitionId, count, level, ...(difficultyMultiplier ? { difficultyMultiplier } : {}), spawnPositions: positions.slice(cursor, cursor += count) }));
  return { id, battlefieldId, heroSpawnPositions: warfront ? warfrontHeroes : grandHeroes, enemies };
}

const definitions: Array<[string, string, GroupSpec[], boolean?]> = [
  ["rl_forest_wolf_pack", "roguelite_forest_ruins", [["dire_wolf", 3, 5]]],
  ["rl_forest_goblin_foragers", "roguelite_forest_ruins", [["goblin_scout", 2, 5], ["goblin_archer", 2, 5]]],
  ["rl_forest_silkwood", "roguelite_forest_ruins", [["giant_spider", 2, 5], ["webspinner", 1, 5]]],
  ["rl_forest_alpha_elite", "roguelite_forest_ruins", [["dire_wolf", 1, 6, 1.35], ["dire_wolf", 2, 6]]],
  ["rl_forest_broodguard_elite", "roguelite_forest_ruins", [["spider_broodguard", 1, 6, 1.15], ["giant_spider", 2, 6]]],
  ["rl_forest_serpent_boss", "serpent_sunken_grove", [["great_forest_serpent", 1, 7, 1.18], ["dire_wolf", 2, 6]]],
  ["rl_forest_queen_boss", "spider_queen_sanctum", [["spider_queen", 1, 7, 1.12], ["spiderling_swarm", 2, 6]]],

  ["rl_arctic_wolf_hunt", "roguelite_arctic_shelf", [["dire_wolf", 3, 7], ["frost_wisp", 1, 7]]],
  ["rl_arctic_wisp_front", "roguelite_arctic_shelf", [["frost_wisp", 3, 7]]],
  ["rl_arctic_orc_crossing", "roguelite_arctic_shelf", [["orc_raider", 2, 7], ["frost_wisp", 1, 7]]],
  ["rl_arctic_troll_elite", "roguelite_arctic_shelf", [["troll", 1, 8, 1.12], ["frost_wisp", 2, 8]]],
  ["rl_arctic_whitefang_elite", "roguelite_arctic_shelf", [["dire_wolf", 2, 8, 1.25], ["frost_wisp", 2, 8]]],
  ["rl_arctic_yeti_boss", "white_maw_lair", [["frostmarch_yeti", 1, 10, 1.12], ["frost_wisp", 2, 9]], true],
  ["rl_arctic_troll_king_boss", "white_maw_lair", [["troll", 1, 10, 1.55], ["dire_wolf", 2, 9]], true],

  ["rl_jungle_spider_column", "roguelite_jungle_temple", [["giant_spider", 3, 6], ["webspinner", 1, 6]]],
  ["rl_jungle_flood_hunters", "roguelite_jungle_temple", [["dire_wolf", 2, 6], ["giant_spider", 2, 6]]],
  ["rl_jungle_brood", "roguelite_jungle_temple", [["spiderling_swarm", 3, 6], ["spider_broodguard", 1, 6]]],
  ["rl_jungle_crocodile_elite", "roguelite_jungle_temple", [["sewer_crocodile", 1, 7, 1.08], ["giant_spider", 2, 7]]],
  ["rl_jungle_broodguard_elite", "roguelite_jungle_temple", [["spider_broodguard", 2, 7, 1.10]]],
  ["rl_jungle_serpent_boss", "serpent_sunken_grove", [["great_forest_serpent", 1, 8, 1.25], ["webspinner", 2, 7]]],
  ["rl_jungle_queen_boss", "spider_queen_sanctum", [["spider_queen", 1, 8, 1.18], ["spider_broodguard", 2, 7]]],

  ["rl_waste_raider_column", "roguelite_ash_wastes", [["orc_raider", 3, 7], ["bandit", 1, 7]]],
  ["rl_waste_broken_sentries", "roguelite_ash_wastes", [["ironbound_sentry", 2, 7], ["wardstone_wisp", 1, 7]]],
  ["rl_waste_scavengers", "roguelite_ash_wastes", [["bandit", 3, 7], ["orc_raider", 1, 7]]],
  ["rl_waste_captain_elite", "roguelite_ash_wastes", [["bandit_captain", 1, 8, 1.25], ["bandit", 3, 8]]],
  ["rl_waste_sentry_elite", "roguelite_ash_wastes", [["ironbound_sentry", 2, 8, 1.15], ["wardstone_wisp", 2, 8]]],
  ["rl_waste_chainbreaker_boss", "chainbreaker_lift", [["ghorak_chainbreaker", 1, 9, 1.18], ["orc_raider", 2, 8]], true],
  ["rl_waste_warden_boss", "hollow_forge_core", [["hollow_warden", 1, 9, 1.12], ["wardstone_wisp", 2, 8]], true],

  ["rl_desert_tomb_robbers", "roguelite_desert_tomb", [["bandit", 3, 6], ["bandit_captain", 1, 6]]],
  ["rl_desert_buried_goblins", "roguelite_desert_tomb", [["goblin_scout", 2, 6], ["goblin_archer", 2, 6]]],
  ["rl_desert_awakened_guard", "roguelite_desert_tomb", [["skeleton", 2, 6], ["ironbound_sentry", 1, 6]]],
  ["rl_desert_captain_elite", "roguelite_desert_tomb", [["bandit_captain", 2, 7, 1.15], ["bandit", 2, 7]]],
  ["rl_desert_troll_elite", "roguelite_desert_tomb", [["troll", 1, 7, 1.20], ["goblin_archer", 2, 7]]],
  ["rl_desert_chainbreaker_boss", "chainbreaker_lift", [["ghorak_chainbreaker", 1, 8, 1.22], ["bandit", 2, 8]], true],
  ["rl_desert_warden_boss", "hollow_forge_core", [["hollow_warden", 1, 8, 1.08], ["skeleton_archer", 2, 8]], true],

  ["rl_undead_bone_patrol", "roguelite_necropolis", [["skeleton", 2, 5], ["skeleton_archer", 2, 5]]],
  ["rl_undead_hungry_dead", "roguelite_necropolis", [["zombie", 3, 5]]],
  ["rl_undead_grave_guard", "roguelite_necropolis", [["skeleton", 2, 5], ["zombie", 2, 5]]],
  ["rl_undead_plague_elite", "roguelite_necropolis", [["zombie", 2, 6, 1.30], ["skeleton_archer", 2, 6]]],
  ["rl_undead_iron_coffin_elite", "roguelite_necropolis", [["ironbound_sentry", 1, 6, 1.20], ["skeleton", 3, 6]]],
  ["rl_undead_warden_boss", "hollow_forge_core", [["hollow_warden", 1, 7, 1.08], ["skeleton", 2, 7]], true],
  ["rl_undead_brood_queen_boss", "spider_queen_sanctum", [["spider_queen", 1, 7, 1.08], ["zombie", 2, 7]]],
];
export const ROGUELITE_ENCOUNTERS: Record<string, EncounterDefinition> = Object.fromEntries(definitions.map(([id, battlefieldId, groups, warfront]) => [id, makeEncounter(id, battlefieldId, groups, warfront)]));
