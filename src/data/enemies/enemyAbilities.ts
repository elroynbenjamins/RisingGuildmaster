import type { EnemyAbilityDefinition } from "../../game/enemies/enemyAbilityTypes";

export const ENEMY_ABILITIES: Record<string, EnemyAbilityDefinition> = {
  goblin_dodge: { id: "goblin_dodge", name: "Goblin Dodge", type: "passive", evasionModifier: 0.10 },
  goblin_ranged_training: { id: "goblin_ranged_training", name: "Ranged Training", type: "passive", rangedDamageModifier: 0.15 },
  brute_slam: { id: "brute_slam", name: "Brute Slam", type: "active", damageMultiplier: 1.00, conditionId: "stunned", conditionChance: 0.10, conditionDurationTurns: 1 },
  bone_precision: { id: "bone_precision", name: "Bone Precision", type: "passive", criticalChanceModifier: 0.10 },
  predator_instinct: { id: "predator_instinct", name: "Predator Instinct", type: "passive", trigger: { targetHpRatioMax: 0.50 }, damageModifier: 0.15 },
  venom_bite: { id: "venom_bite", name: "Venom Bite", type: "active", damageMultiplier: 0.90, conditionId: "poisoned", conditionResistanceKey: "poison", conditionChance: 0.25, conditionDurationTurns: 3 },
  steal_gold: { id: "steal_gold", name: "Steal Gold", type: "active", damageMultiplier: 0.80, goldStealModifier: 0.10 },
  commanding_presence: { id: "commanding_presence", name: "Commanding Presence", type: "aura", targetFactionId: "bandits", damageModifier: 0.10 },
  orc_blood_fury: { id: "orc_blood_fury", name: "Blood Fury", type: "passive", trigger: { selfHpRatioMax: 0.50 }, physicalDamageModifier: 0.20 },
  troll_regeneration: { id: "troll_regeneration", name: "Troll Regeneration", type: "passive", healMaxHpModifierPerTurn: 0.05 },
  chieftain_war_cry: { id: "chieftain_war_cry", name: "War Cry", type: "active", damageModifier: .15 },
  chieftain_presence: { id: "chieftain_presence", name: "Chieftain's Presence", type: "aura", targetFactionId: "goblins" },
  desperate_command: { id: "desperate_command", name: "Desperate Command", type: "aura", targetFactionId: "goblins", physicalDamageModifier: .2, trigger: { selfHpRatioMax: .4 } },
};
