import type { EnemyRole } from "../../game/enemies/enemyTypes";
import type { TacticalBehavior } from "../../game/combat/tacticalAiTypes";

export const TACTICAL_BEHAVIORS: Record<string, TacticalBehavior> = {
  goblin_scout: { preferredRange: 1, targetPriority: "nearest" },
  goblin_archer: { preferredRange: 4, retreatRange: 2, targetPriority: "lowest_hp" },
  goblin_brute: { preferredRange: 1, targetPriority: "nearest" },
  skeleton: { preferredRange: 1, targetPriority: "nearest" },
  skeleton_archer: { preferredRange: 4, retreatRange: 2, targetPriority: "lowest_hp" },
  zombie: { preferredRange: 1, targetPriority: "nearest" },
  dire_wolf: { preferredRange: 1, targetPriority: "lowest_hp" },
  giant_spider: { preferredRange: 1, targetPriority: "lowest_hp" },
  bandit: { preferredRange: 1, targetPriority: "nearest" },
  bandit_captain: { preferredRange: 1, targetPriority: "highest_damage" },
  orc_raider: { preferredRange: 1, targetPriority: "highest_damage" },
  troll: { preferredRange: 1, targetPriority: "nearest" },
  goblin_chieftain: { preferredRange: 1, targetPriority: "highest_damage" },
};

export function defaultTacticalBehavior(role: EnemyRole): TacticalBehavior {
  return role === "ranged" || role === "support"
    ? { preferredRange: 4, retreatRange: 2, targetPriority: "lowest_hp" }
    : { preferredRange: 1, targetPriority: "nearest" };
}
