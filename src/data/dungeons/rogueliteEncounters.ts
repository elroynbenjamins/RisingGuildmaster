import type { EncounterDefinition, EncounterEnemyGroup } from "../../game/quests/questTypes";

type GroupSpec = [enemyDefinitionId: string, count: number, level: number, difficultyMultiplier?: number];
const grandHeroes = [{ x: 0, y: 3 }, { x: 0, y: 4 }, { x: 0, y: 5 }, { x: 1, y: 4 }];
const warfrontHeroes = [{ x: 0, y: 4 }, { x: 0, y: 5 }, { x: 0, y: 6 }, { x: 1, y: 5 }];
const grandEnemies = [{ x: 8, y: 2 }, { x: 8, y: 4 }, { x: 8, y: 6 }, { x: 9, y: 3 }, { x: 9, y: 5 }];
const warfrontEnemies = [{ x: 12, y: 3 }, { x: 12, y: 5 }, { x: 12, y: 7 }, { x: 13, y: 4 }, { x: 13, y: 6 }];
function makeEncounter(id: string, battlefieldId: string, specs: GroupSpec[], warfront = false, minimumRoguelitePartyLevel?: number): EncounterDefinition {
  const positions = warfront ? warfrontEnemies : grandEnemies; let cursor = 0;
  const enemies: EncounterEnemyGroup[] = specs.map(([enemyDefinitionId, count, level, difficultyMultiplier]) => ({ enemyDefinitionId, count, level, ...(difficultyMultiplier ? { difficultyMultiplier } : {}), spawnPositions: positions.slice(cursor, cursor += count) }));
  return { id, battlefieldId, heroSpawnPositions: warfront ? warfrontHeroes : grandHeroes, enemies, ...(minimumRoguelitePartyLevel ? { minimumRoguelitePartyLevel } : {}) };
}

const definitions: Array<[string, string, GroupSpec[], boolean?, number?]> = [
  ["rl_forest_wolf_pack", "roguelite_forest_ruins", [["dire_wolf", 3, 5]]],
  ["rl_forest_goblin_foragers", "roguelite_forest_ruins", [["goblin_scout", 2, 5], ["goblin_archer", 2, 5]]],
  ["rl_forest_silkwood", "roguelite_forest_ruins", [["giant_spider", 2, 5], ["webspinner", 1, 5]]],
  ["rl_forest_brute_ambush", "roguelite_forest_ruins", [["goblin_brute", 1, 5], ["goblin_scout", 2, 5], ["goblin_archer", 1, 5]]],
  ["rl_forest_alpha_elite", "roguelite_forest_ruins", [["dire_wolf", 1, 6, 1.35], ["dire_wolf", 2, 6]]],
  ["rl_forest_broodguard_elite", "roguelite_forest_ruins", [["spider_broodguard", 1, 6, 1.15], ["giant_spider", 2, 6]]],
  ["rl_forest_ruk_elite", "roguelite_forest_ruins", [["ruk_one_eye", 1, 6], ["goblin_scout", 2, 6]]],
  ["rl_forest_pale_widow_elite", "roguelite_forest_ruins", [["pale_widow", 1, 7], ["spiderling_swarm", 2, 6]]],
  ["rl_forest_serpent_boss", "serpent_sunken_grove", [["great_forest_serpent", 1, 7, 1.18], ["dire_wolf", 2, 6]]],
  ["rl_forest_queen_boss", "spider_queen_sanctum", [["spider_queen", 1, 7, 1.12], ["spiderling_swarm", 2, 6]]],
  ["rl_forest_chieftain_boss", "roguelite_forest_ruins", [["goblin_chieftain", 1, 7, 1.18], ["goblin_brute", 1, 6], ["goblin_archer", 2, 6]]],

  ["rl_arctic_wolf_hunt", "roguelite_arctic_shelf", [["dire_wolf", 3, 7], ["frost_wisp", 1, 7]]],
  ["rl_arctic_wisp_front", "roguelite_arctic_shelf", [["frost_wisp", 3, 7]]],
  ["rl_arctic_orc_crossing", "roguelite_arctic_shelf", [["orc_raider", 2, 7], ["frost_wisp", 1, 7]]],
  ["rl_arctic_rimefang_patrol", "roguelite_arctic_shelf", [["rimefang_wolf", 3, 7], ["aurora_seer", 1, 7]]],
  ["rl_arctic_troll_elite", "roguelite_arctic_shelf", [["troll", 1, 8, 1.12], ["frost_wisp", 2, 8]]],
  ["rl_arctic_whitefang_elite", "roguelite_arctic_shelf", [["dire_wolf", 2, 8, 1.25], ["frost_wisp", 2, 8]]],
  ["rl_arctic_icebound_elite", "roguelite_arctic_shelf", [["icebound_warden", 2, 8, 1.12], ["aurora_seer", 1, 8]]],
  ["rl_arctic_blue_horn_elite", "northwatch_wall_breach", [["hroth_iceblood", 1, 8, 1.05], ["rimefang_wolf", 2, 8]], true],
  ["rl_arctic_yeti_boss", "white_maw_lair", [["frostmarch_yeti", 1, 10, 1.12], ["frost_wisp", 2, 9]], true],
  ["rl_arctic_troll_king_boss", "white_maw_lair", [["troll", 1, 10, 1.55], ["dire_wolf", 2, 9]], true],
  ["rl_arctic_pale_echo_boss", "glimmerlake_moon_gate", [["vaelith_pale_echo", 1, 9, 1.08], ["rimefang_wolf", 2, 8]], true],

  ["rl_jungle_spider_column", "roguelite_jungle_temple", [["giant_spider", 3, 6], ["webspinner", 1, 6]]],
  ["rl_jungle_flood_hunters", "roguelite_jungle_temple", [["dire_wolf", 2, 6], ["giant_spider", 2, 6]]],
  ["rl_jungle_brood", "roguelite_jungle_temple", [["spiderling_swarm", 3, 6], ["spider_broodguard", 1, 6]]],
  ["rl_jungle_venom_crossing", "roguelite_jungle_temple", [["webspinner", 2, 6], ["giant_spider", 1, 6], ["spiderling_swarm", 2, 6]]],
  ["rl_jungle_crocodile_elite", "roguelite_jungle_temple", [["sewer_crocodile", 1, 7, 1.08], ["giant_spider", 2, 7]]],
  ["rl_jungle_broodguard_elite", "roguelite_jungle_temple", [["spider_broodguard", 2, 7, 1.10]]],
  ["rl_jungle_pale_widow_elite", "roguelite_jungle_temple", [["pale_widow", 1, 7], ["webspinner", 2, 7]]],
  ["rl_jungle_serpent_boss", "serpent_sunken_grove", [["great_forest_serpent", 1, 8, 1.25], ["webspinner", 2, 7]]],
  ["rl_jungle_queen_boss", "spider_queen_sanctum", [["spider_queen", 1, 8, 1.18], ["spider_broodguard", 2, 7]]],
  ["rl_jungle_crocodile_boss", "roguelite_jungle_temple", [["sewer_crocodile", 1, 8, 1.28], ["spiderling_swarm", 2, 7]]],

  ["rl_waste_raider_column", "roguelite_ash_wastes", [["orc_raider", 3, 7], ["bandit", 1, 7]]],
  ["rl_waste_broken_sentries", "roguelite_ash_wastes", [["ironbound_sentry", 2, 7], ["wardstone_wisp", 1, 7]]],
  ["rl_waste_scavengers", "roguelite_ash_wastes", [["bandit", 3, 7], ["orc_raider", 1, 7]]],
  ["rl_waste_ashscale_pack", "roguelite_ash_wastes", [["ashscale_vermin", 3, 7], ["cinder_touched_bandit", 1, 7]]],
  ["rl_waste_captain_elite", "roguelite_ash_wastes", [["bandit_captain", 1, 8, 1.25], ["bandit", 3, 8]]],
  ["rl_waste_sentry_elite", "roguelite_ash_wastes", [["ironbound_sentry", 2, 8, 1.15], ["wardstone_wisp", 2, 8]]],
  ["rl_waste_mara_elite", "roguelite_ash_wastes", [["mara_half_coin", 1, 8], ["bandit", 2, 8]]],
  ["rl_waste_drogan_elite", "roguelite_ash_wastes", [["drogan_ash_tusk", 1, 8], ["orc_raider", 2, 8]]],
  ["rl_waste_chainbreaker_boss", "chainbreaker_lift", [["ghorak_chainbreaker", 1, 9, 1.18], ["orc_raider", 2, 8]], true],
  ["rl_waste_warden_boss", "hollow_forge_core", [["hollow_warden", 1, 9, 1.12], ["wardstone_wisp", 2, 8]], true],
  ["rl_waste_cinder_keeper_boss", "roguelite_ash_wastes", [["cinder_keeper", 1, 9, 1.38], ["ashbound_sentinel", 2, 8]]],
  ["rl_waste_laurel_elite", "roguelite_ash_wastes", [["laurel_vanguard", 2, 10, 1.12], ["laurel_arbalest", 2, 10]], false, 10],
  ["rl_waste_varkesh_boss", "skyvault_upper_aerie", [["varkesh_gilded_rupture", 1, 13, 1.08], ["brass_honor_guard", 2, 12]], true, 12],

  ["rl_desert_tomb_robbers", "roguelite_desert_tomb", [["bandit", 3, 6], ["bandit_captain", 1, 6]]],
  ["rl_desert_buried_goblins", "roguelite_desert_tomb", [["goblin_scout", 2, 6], ["goblin_archer", 2, 6]]],
  ["rl_desert_awakened_guard", "roguelite_desert_tomb", [["skeleton", 2, 6], ["ironbound_sentry", 1, 6]]],
  ["rl_desert_glasswing_swarm", "roguelite_desert_tomb", [["glasswing_stalker", 2, 6], ["ashscale_vermin", 2, 6]]],
  ["rl_desert_captain_elite", "roguelite_desert_tomb", [["bandit_captain", 2, 7, 1.15], ["bandit", 2, 7]]],
  ["rl_desert_troll_elite", "roguelite_desert_tomb", [["troll", 1, 7, 1.20], ["goblin_archer", 2, 7]]],
  ["rl_desert_ashbound_elite", "roguelite_desert_tomb", [["ashbound_sentinel", 2, 7, 1.12], ["glasswing_stalker", 1, 7]]],
  ["rl_desert_chainbreaker_boss", "chainbreaker_lift", [["ghorak_chainbreaker", 1, 8, 1.22], ["bandit", 2, 8]], true],
  ["rl_desert_warden_boss", "hollow_forge_core", [["hollow_warden", 1, 8, 1.08], ["skeleton_archer", 2, 8]], true],
  ["rl_desert_ash_herald_boss", "roguelite_desert_tomb", [["solkar_ash_herald", 1, 8, 1.18], ["ashbound_sentinel", 2, 7]]],

  ["rl_undead_bone_patrol", "roguelite_necropolis", [["skeleton", 2, 5], ["skeleton_archer", 2, 5]]],
  ["rl_undead_hungry_dead", "roguelite_necropolis", [["zombie", 3, 5]]],
  ["rl_undead_grave_guard", "roguelite_necropolis", [["skeleton", 2, 5], ["zombie", 2, 5]]],
  ["rl_undead_mire_procession", "roguelite_necropolis", [["drowned_legionnaire", 2, 6], ["mire_lurker", 2, 6]]],
  ["rl_undead_plague_elite", "roguelite_necropolis", [["zombie", 2, 6, 1.30], ["skeleton_archer", 2, 6]]],
  ["rl_undead_iron_coffin_elite", "roguelite_necropolis", [["ironbound_sentry", 1, 6, 1.20], ["skeleton", 3, 6]]],
  ["rl_undead_gravewater_elite", "roguelite_necropolis", [["gravewater_hexer", 2, 7, 1.10], ["drowned_legionnaire", 2, 7]]],
  ["rl_undead_hadrik_elite", "roguelite_necropolis", [["hadrik_bonecaller", 1, 7], ["skeleton", 2, 7]]],
  ["rl_undead_warden_boss", "hollow_forge_core", [["hollow_warden", 1, 7, 1.08], ["skeleton", 2, 7]], true],
  ["rl_undead_brood_queen_boss", "spider_queen_sanctum", [["spider_queen", 1, 7, 1.08], ["zombie", 2, 7]]],
  ["rl_undead_bell_widow_boss", "bell_widow_tower", [["bell_widow", 1, 7, 1.05], ["gravewater_hexer", 2, 7]], true],
  ["rl_undead_archivist_echo_boss", "morrowveil_archive_core", [["morrowveil_archivist", 1, 8, 1.05], ["drowned_legionnaire", 2, 7]], true],
];
export const ROGUELITE_ENCOUNTERS: Record<string, EncounterDefinition> = Object.fromEntries(definitions.map(([id, battlefieldId, groups, warfront, minimumLevel]) => [id, makeEncounter(id, battlefieldId, groups, warfront, minimumLevel)]));
