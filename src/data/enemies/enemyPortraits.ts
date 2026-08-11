export type EnemyPortraitAtlasId = "goblins" | "undead" | "beastsA" | "beastsB" | "bandits" | "orcs" | "constructs";
export interface EnemyPortraitCrop { atlasId: EnemyPortraitAtlasId; column: 0 | 1 | 2; row: 0 | 1 }

export const ENEMY_PORTRAITS: Record<string, EnemyPortraitCrop> = {
  goblin_scout: { atlasId: "goblins", column: 0, row: 0 }, goblin_archer: { atlasId: "goblins", column: 1, row: 0 }, goblin_brute: { atlasId: "goblins", column: 2, row: 0 }, goblin_wardbreaker: { atlasId: "goblins", column: 0, row: 1 }, goblin_chieftain: { atlasId: "goblins", column: 1, row: 1 }, goblin_sapper: { atlasId: "goblins", column: 2, row: 1 },
  skeleton: { atlasId: "undead", column: 0, row: 0 }, skeleton_archer: { atlasId: "undead", column: 1, row: 0 }, zombie: { atlasId: "undead", column: 2, row: 0 }, blackbridge_wraith: { atlasId: "undead", column: 0, row: 1 }, heartstone_revenant: { atlasId: "undead", column: 1, row: 1 },
  dire_wolf: { atlasId: "beastsA", column: 0, row: 0 }, giant_spider: { atlasId: "beastsA", column: 1, row: 0 }, spiderling_swarm: { atlasId: "beastsA", column: 2, row: 0 }, webspinner: { atlasId: "beastsA", column: 0, row: 1 }, spider_broodguard: { atlasId: "beastsA", column: 1, row: 1 }, spider_queen: { atlasId: "beastsA", column: 2, row: 1 },
  great_forest_serpent: { atlasId: "beastsB", column: 0, row: 0 }, sewer_crocodile: { atlasId: "beastsB", column: 1, row: 0 }, frost_wisp: { atlasId: "beastsB", column: 2, row: 0 }, frostmarch_yeti: { atlasId: "beastsB", column: 0, row: 1 }, carrion_crow_swarm: { atlasId: "beastsB", column: 1, row: 1 },
  bandit: { atlasId: "bandits", column: 0, row: 0 }, bandit_captain: { atlasId: "bandits", column: 1, row: 0 }, iron_laurel_enforcer: { atlasId: "bandits", column: 2, row: 0 },
  orc_raider: { atlasId: "orcs", column: 0, row: 0 }, troll: { atlasId: "orcs", column: 1, row: 0 }, ghorak_chainbreaker: { atlasId: "orcs", column: 2, row: 0 },
  ironbound_sentry: { atlasId: "constructs", column: 0, row: 0 }, wardstone_wisp: { atlasId: "constructs", column: 1, row: 0 }, hollow_warden: { atlasId: "constructs", column: 2, row: 0 },
};
