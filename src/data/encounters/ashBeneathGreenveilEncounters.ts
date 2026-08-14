import type { EncounterDefinition } from "../../game/quests/questTypes";

const grandHeroes = [{ x: 0, y: 3 }, { x: 0, y: 4 }, { x: 0, y: 5 }, { x: 1, y: 4 }];
const warfrontHeroes = [{ x: 0, y: 4 }, { x: 0, y: 5 }, { x: 0, y: 6 }, { x: 1, y: 5 }];
export const ASH_BENEATH_GREENVEIL_ENCOUNTERS: Record<string, EncounterDefinition> = {
  ashscale_grove_encounter: { id: "ashscale_grove_encounter", battlefieldId: "scorched_greenveil_grove", heroSpawnPositions: grandHeroes, enemies: [{ enemyDefinitionId: "ashscale_vermin", count: 4, level: 3, spawnPositions: [{ x: 8, y: 2 }, { x: 8, y: 4 }, { x: 8, y: 6 }, { x: 9, y: 4 }] }] },
  scale_collector_camp_encounter: { id: "scale_collector_camp_encounter", battlefieldId: "scale_collector_camp", heroSpawnPositions: grandHeroes, enemies: [{ enemyDefinitionId: "cinder_touched_bandit", count: 2, level: 4, spawnPositions: [{ x: 8, y: 3 }, { x: 8, y: 5 }] }, { enemyDefinitionId: "bandit", count: 2, level: 4, spawnPositions: [{ x: 9, y: 2 }, { x: 9, y: 6 }] }, { enemyDefinitionId: "bandit_captain", count: 1, level: 5, difficultyMultiplier: 1.05, spawnPositions: [{ x: 9, y: 4 }] }] },
  hollow_scale_vault_guard: { id: "hollow_scale_vault_guard", battlefieldId: "hollow_scale_vault", heroSpawnPositions: warfrontHeroes, enemies: [{ enemyDefinitionId: "ashscale_vermin", count: 3, level: 5, spawnPositions: [{ x: 11, y: 3 }, { x: 11, y: 5 }, { x: 11, y: 7 }] }, { enemyDefinitionId: "wardstone_wisp", count: 2, level: 5, spawnPositions: [{ x: 12, y: 4 }, { x: 12, y: 6 }] }] },
  wardstone_scale_guardian_encounter: { id: "wardstone_scale_guardian_encounter", battlefieldId: "hollow_scale_vault", heroSpawnPositions: warfrontHeroes, enemies: [{ enemyDefinitionId: "wardstone_scale_guardian", count: 1, level: 6, difficultyMultiplier: 1.12, spawnPositions: [{ x: 13, y: 5 }] }, { enemyDefinitionId: "wardstone_wisp", count: 2, level: 5, spawnPositions: [{ x: 11, y: 3 }, { x: 11, y: 7 }] }] },
};
