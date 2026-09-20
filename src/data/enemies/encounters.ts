import type { EncounterTemplate } from "../../game/enemies/enemyTypes";
export const ENCOUNTERS: Record<string, EncounterTemplate> = {
  goblin_patrol: { id: "goblin_patrol", name: "Goblin Patrol", enemies: [{ enemyDefinitionId: "goblin_scout", count: 2 }, { enemyDefinitionId: "goblin_archer", count: 1 }] },
  goblin_muscle: { id: "goblin_muscle", name: "Goblin Muscle", enemies: [{ enemyDefinitionId: "goblin_brute", count: 1 }, { enemyDefinitionId: "goblin_scout", count: 2 }] },
  graveyard: { id: "graveyard", name: "Graveyard", enemies: [{ enemyDefinitionId: "skeleton", count: 2 }, { enemyDefinitionId: "skeleton_archer", count: 1 }] },
  zombie_pack: { id: "zombie_pack", name: "Zombie Pack", enemies: [{ enemyDefinitionId: "zombie", count: 2 }, { enemyDefinitionId: "skeleton", count: 1 }] },
  wolf_pack: { id: "wolf_pack", name: "Wolf Pack", enemies: [{ enemyDefinitionId: "dire_wolf", count: 3 }] },
  spider_nest: { id: "spider_nest", name: "Spider Nest", enemies: [{ enemyDefinitionId: "giant_spider", count: 2 }] },
  highway_robbery: { id: "highway_robbery", name: "Highway Robbery", enemies: [{ enemyDefinitionId: "bandit", count: 2 }, { enemyDefinitionId: "bandit_captain", count: 1 }] },
  orc_raid: { id: "orc_raid", name: "Orc Raid", enemies: [{ enemyDefinitionId: "orc_raider", count: 2 }] },
  troll_mini_boss: { id: "troll_mini_boss", name: "Troll Mini-Boss", enemies: [{ enemyDefinitionId: "troll", count: 1 }] },
};
