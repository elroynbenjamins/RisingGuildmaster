export const WORLD_DEFINITION = { id: "eldoria", name: "Eldoria", startingRegionId: "greenveil", travelEventChance: .20 } as const;
export const REGIONAL_ENEMY_POOLS: Record<string, string[]> = {
  greenveil: ["goblin_scout", "goblin_archer", "goblin_brute", "dire_wolf", "giant_spider", "bandit"],
  shadowfen: ["skeleton", "skeleton_archer", "zombie", "giant_spider"],
  iron_hills: ["orc_raider", "bandit", "bandit_captain", "troll", "goblin_brute"],
  frostmarch: ["dire_wolf"],
  ashlands: ["orc_raider", "troll"],
};
