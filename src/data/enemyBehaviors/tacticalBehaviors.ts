import type { EnemyRole } from "../../game/enemies/enemyTypes";
import type { TacticalBehavior } from "../../game/combat/tacticalAiTypes";

export const TACTICAL_BEHAVIORS: Record<string, TacticalBehavior> = {
  carrion_crow_swarm: { preferredRange: 1, targetPriority: "lowest_hp" },
  goblin_sapper: { preferredRange: 3, retreatRange: 1, targetPriority: "highest_damage" },
  blackbridge_wraith: { preferredRange: 3, retreatRange: 1, targetPriority: "highest_damage" },
  iron_laurel_enforcer: { preferredRange: 1, targetPriority: "highest_damage" },
  heartstone_revenant: { preferredRange: 2, targetPriority: "highest_damage" },
  goblin_scout: { preferredRange: 1, targetPriority: "nearest" },
  goblin_archer: { preferredRange: 4, retreatRange: 2, targetPriority: "lowest_hp" },
  goblin_brute: { preferredRange: 1, targetPriority: "nearest" },
  goblin_wardbreaker: { preferredRange: 4, retreatRange: 2, targetPriority: "highest_damage" },
  skeleton: { preferredRange: 1, targetPriority: "nearest" },
  skeleton_archer: { preferredRange: 4, retreatRange: 2, targetPriority: "lowest_hp" },
  zombie: { preferredRange: 1, targetPriority: "nearest" },
  dire_wolf: { preferredRange: 1, targetPriority: "lowest_hp" },
  giant_spider: { preferredRange: 1, targetPriority: "lowest_hp" },
  spiderling_swarm: { preferredRange: 1, targetPriority: "lowest_hp" },
  webspinner: { preferredRange: 4, retreatRange: 2, targetPriority: "lowest_hp" },
  spider_broodguard: { preferredRange: 1, targetPriority: "nearest" },
  spider_queen: { preferredRange: 2, targetPriority: "highest_damage" },
  bandit: { preferredRange: 1, targetPriority: "nearest" },
  bandit_captain: { preferredRange: 1, targetPriority: "highest_damage" },
  orc_raider: { preferredRange: 1, targetPriority: "highest_damage" },
  troll: { preferredRange: 1, targetPriority: "nearest" },
  goblin_chieftain: { preferredRange: 1, targetPriority: "highest_damage" },
  ghorak_chainbreaker: { preferredRange: 1, targetPriority: "highest_damage" },
  ironbound_sentry: { preferredRange: 1, targetPriority: "nearest" },
  wardstone_wisp: { preferredRange: 4, retreatRange: 2, targetPriority: "highest_damage" },
  hollow_warden: { preferredRange: 1, targetPriority: "highest_damage" },
  great_forest_serpent: { preferredRange: 1, targetPriority: "lowest_hp" },
  sewer_crocodile: { preferredRange: 1, targetPriority: "lowest_hp" },
  frost_wisp: { preferredRange: 4, retreatRange: 2, targetPriority: "highest_damage" },
  frostmarch_yeti: { preferredRange: 1, targetPriority: "highest_damage" },
  gloam_knife_assassin: { preferredRange: 1, targetPriority: "lowest_hp" },
  nightglass_trapper: { preferredRange: 5, retreatRange: 2, targetPriority: "lowest_hp" },
  seressa_vane: { preferredRange: 1, targetPriority: "highest_damage" },
};

export function defaultTacticalBehavior(role: EnemyRole): TacticalBehavior {
  return role === "ranged" || role === "support"
    ? { preferredRange: 4, retreatRange: 2, targetPriority: "lowest_hp" }
    : { preferredRange: 1, targetPriority: "nearest" };
}
