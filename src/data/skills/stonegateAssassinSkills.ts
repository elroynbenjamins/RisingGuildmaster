import type { CombatSkillDefinition, SkillModifier } from "../../game/combat/skillTypes";

const permanent = (stat: string, operation: SkillModifier["operation"], value: number): SkillModifier => ({ stat, operation, value, durationTurns: -1 });

export const STONEGATE_ASSASSIN_SKILLS: Record<string, CombatSkillDefinition> = {
  gloam_stiletto: { id: "gloam_stiletto", name: "Gloam Stiletto", type: "basic_attack", damageType: "physical", damageMultiplier: 1.10, attackRollModifier: 1, targetType: "single_enemy", cooldownTurns: 0, range: 1, conditionApplications: [{ conditionId: "bleeding", chance: .25, durationTurns: 3, resistanceKey: "bleed" }] },
  shadowstep_strike: { id: "shadowstep_strike", name: "Shadowstep Strike", type: "active", damageType: "physical", damageMultiplier: 1.40, attackRollModifier: 2, criticalChanceModifier: .10, targetType: "single_enemy", cooldownTurns: 3, range: 2, conditionApplications: [{ conditionId: "blinded", chance: .25, durationTurns: 1 }] },
  death_from_shadow: { id: "death_from_shadow", name: "Death from Shadow", type: "passive", selfModifiers: [permanent("initiative", "flat", 2), permanent("criticalChance", "flat", .05)] },
  nightglass_bolt: { id: "nightglass_bolt", name: "Nightglass Bolt", type: "basic_attack", damageType: "physical", damageMultiplier: 1, attackRollModifier: 1, targetType: "single_enemy", cooldownTurns: 0, range: 6, conditionApplications: [{ conditionId: "poisoned", chance: .20, durationTurns: 3, resistanceKey: "poison" }] },
  caltrop_burst: { id: "caltrop_burst", name: "Caltrop Burst", type: "active", damageType: "physical", damageMultiplier: .55, targetType: "all_enemies", cooldownTurns: 3, range: 3, conditionApplications: [{ conditionId: "slowed", chance: .45, durationTurns: 2 }] },
  prepared_killbox: { id: "prepared_killbox", name: "Prepared Killbox", type: "passive", selfModifiers: [permanent("armorClass", "flat", 1), permanent("initiative", "flat", 1)] },
  blackglass_blade: { id: "blackglass_blade", name: "Blackglass Blade", type: "basic_attack", damageType: "physical", damageMultiplier: 1.25, attackRollModifier: 1, criticalChanceModifier: .10, targetType: "single_enemy", cooldownTurns: 0, range: 1, conditionApplications: [{ conditionId: "bleeding", chance: .35, durationTurns: 3, resistanceKey: "bleed" }] },
  vanishing_cut: { id: "vanishing_cut", name: "Vanishing Cut", type: "active", damageType: "physical", damageMultiplier: 1.55, attackRollModifier: 2, criticalChanceModifier: .15, targetType: "single_enemy", cooldownTurns: 3, range: 2, conditionApplications: [{ conditionId: "blinded", chance: .40, durationTurns: 1 }] },
  silent_coordination: { id: "silent_coordination", name: "Silent Coordination", type: "aura", aura: { target: "same_faction_allies", factionId: "bandits", excludeSelf: true, modifiers: [permanent("attackRollModifier", "flat", 1), permanent("physicalDamage", "percentage", .10)] } },
  no_witnesses: { id: "no_witnesses", name: "No Witnesses", type: "passive", conditionalModifiers: [{ conditions: { selfHpRatioMax: .40 }, modifiers: [permanent("physicalDamage", "percentage", .20), permanent("speed", "percentage", .15)] }] },
};
