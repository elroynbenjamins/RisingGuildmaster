import type { CombatSkillDefinition, SkillModifier } from "../../game/combat/skillTypes";

const permanent = (stat: string, operation: SkillModifier["operation"], value: number): SkillModifier => ({ stat, operation, value, durationTurns: -1 });
export const ASH_BENEATH_GREENVEIL_ENEMY_SKILLS: Record<string, CombatSkillDefinition> = {
  ember_bite: { id: "ember_bite", name: "Ember Bite", type: "basic_attack", damageType: "physical", damageMultiplier: .90, targetType: "single_enemy", cooldownTurns: 0, range: 1 },
  cinder_scuttle: { id: "cinder_scuttle", name: "Cinder Scuttle", type: "active", damageType: "magic", damageMultiplier: .55, attackRollModifier: 1, targetType: "single_enemy", cooldownTurns: 2, range: 2 },
  ember_fed: { id: "ember_fed", name: "Ember-Fed", type: "passive", conditionalModifiers: [{ conditions: { selfHpRatioMax: .50 }, modifiers: [permanent("damage", "percentage", .15), permanent("speed", "percentage", .10)] }] },
  cinder_blade: { id: "cinder_blade", name: "Cinder Blade", type: "basic_attack", damageType: "physical", damageMultiplier: 1, targetType: "single_enemy", cooldownTurns: 0, range: 1 },
  ash_bomb: { id: "ash_bomb", name: "Ash Bomb", type: "active", damageType: "magic", damageMultiplier: .55, targetType: "all_enemies", cooldownTurns: 3, range: 3, targetModifiers: [{ stat: "attackRollModifier", operation: "flat", value: -1, durationTurns: 2 }] },
  scale_hammer: { id: "scale_hammer", name: "Scale Hammer", type: "basic_attack", damageType: "physical", damageMultiplier: 1.20, attackRollModifier: -1, targetType: "single_enemy", cooldownTurns: 0, range: 1 },
  wardfire_pulse: { id: "wardfire_pulse", name: "Wardfire Pulse", type: "active", damageType: "magic", damageMultiplier: .75, targetType: "all_enemies", cooldownTurns: 3, range: 4, targetModifiers: [{ stat: "magicDefenseScore", operation: "flat", value: -1, durationTurns: 2 }] },
  ancient_scale_shell: { id: "ancient_scale_shell", name: "Ancient Scale Shell", type: "passive", selfModifiers: [permanent("armorClass", "flat", 2), permanent("magicDefenseScore", "flat", 1)] },
  sleeping_ember: { id: "sleeping_ember", name: "The Sleeping Ember", type: "passive", conditionalModifiers: [{ conditions: { selfHpRatioMax: .40 }, modifiers: [permanent("magicDamage", "percentage", .25), permanent("speed", "percentage", .15)] }] },
};
