import type { EnemyBehaviorDefinition } from "../../game/combat/enemyBehaviorTypes";

export const ENEMY_BEHAVIORS: Record<string, EnemyBehaviorDefinition> = {
  goblin_scout_behavior: { id: "goblin_scout_behavior", basicAttackSkillId: "goblin_stab", rules: [{ skillId: "quick_strike", priority: 10 }] },
  goblin_archer_behavior: { id: "goblin_archer_behavior", basicAttackSkillId: "arrow_shot", rules: [{ skillId: "aimed_shot", priority: 10 }] },
  goblin_brute_behavior: { id: "goblin_brute_behavior", basicAttackSkillId: "heavy_swing", rules: [{ skillId: "brute_slam", priority: 10 }] },
  skeleton_behavior: { id: "skeleton_behavior", basicAttackSkillId: "rusty_slash", rules: [] },
  skeleton_archer_behavior: { id: "skeleton_archer_behavior", basicAttackSkillId: "bone_arrow", rules: [{ skillId: "piercing_shot", priority: 10 }] },
  zombie_behavior: { id: "zombie_behavior", basicAttackSkillId: "zombie_claw", rules: [{ skillId: "infectious_bite", priority: 10 }] },
  dire_wolf_behavior: { id: "dire_wolf_behavior", basicAttackSkillId: "wolf_bite", rules: [{ skillId: "wolf_pounce", priority: 10, conditions: { targetHpRatioMin: 0.50 } }] },
  giant_spider_behavior: { id: "giant_spider_behavior", basicAttackSkillId: "spider_bite", rules: [{ skillId: "venom_bite", priority: 10 }] },
  bandit_behavior: { id: "bandit_behavior", basicAttackSkillId: "bandit_slash", rules: [{ skillId: "dirty_strike", priority: 10 }] },
  bandit_captain_behavior: { id: "bandit_captain_behavior", basicAttackSkillId: "captain_sword_strike", rules: [{ skillId: "bandit_rally", priority: 20, conditions: { minLivingEnemies: 2 } }] },
  orc_raider_behavior: { id: "orc_raider_behavior", basicAttackSkillId: "orc_cleave", rules: [{ skillId: "reckless_charge", priority: 10, conditions: { selfHpRatioMin: 0.50 } }] },
  troll_behavior: { id: "troll_behavior", basicAttackSkillId: "troll_smash", rules: [{ skillId: "ground_slam", priority: 20, conditions: { minTargetsInRange: 2, targetRange: 1 } }] },
  goblin_chieftain_behavior: { id: "goblin_chieftain_behavior", basicAttackSkillId: "chieftain_cleave", rules: [{ skillId: "chieftain_war_cry", priority: 20, conditions: { minLivingEnemies: 2 } }] },
};
