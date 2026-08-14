import type { EnemyBehaviorDefinition } from "../../game/combat/enemyBehaviorTypes";

export const STONEGATE_ASSASSIN_BEHAVIORS: Record<string, EnemyBehaviorDefinition> = {
  gloam_knife_assassin_behavior: { id: "gloam_knife_assassin_behavior", basicAttackSkillId: "gloam_stiletto", rules: [{ skillId: "shadowstep_strike", priority: 25, conditions: { targetHpRatioMax: .65 } }] },
  nightglass_trapper_behavior: { id: "nightglass_trapper_behavior", basicAttackSkillId: "nightglass_bolt", rules: [{ skillId: "caltrop_burst", priority: 30, conditions: { minTargetsInRange: 2, targetRange: 3 } }] },
  seressa_vane_behavior: { id: "seressa_vane_behavior", basicAttackSkillId: "blackglass_blade", rules: [{ skillId: "vanishing_cut", priority: 35, conditions: { targetHpRatioMax: .75 } }] },
};
