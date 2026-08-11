import type { CombatSkillDefinition, SkillModifier } from "../../game/combat/skillTypes";

const permanent = (stat: string, operation: SkillModifier["operation"], value: number): SkillModifier => ({ stat, operation, value, durationTurns: -1 });

export const BLACKBRIDGE_ENEMY_SKILLS: Record<string, CombatSkillDefinition> = {
  raking_beaks: { id: "raking_beaks", name: "Raking Beaks", type: "basic_attack", damageType: "physical", damageMultiplier: .80, attackRollModifier: 1, targetType: "single_enemy", cooldownTurns: 0, range: 1 },
  blinding_wings: { id: "blinding_wings", name: "Blinding Wings", type: "active", damageType: "physical", damageMultiplier: .45, targetType: "all_enemies", cooldownTurns: 3, range: 2, targetModifiers: [{ stat: "attackRollModifier", operation: "flat", value: -1, durationTurns: 1 }] },
  feast_on_the_fallen: { id: "feast_on_the_fallen", name: "Feast on the Fallen", type: "passive", conditionalModifiers: [{ conditions: { targetHpRatioMax: .50 }, modifiers: [permanent("damage", "percentage", .15)] }] },
  sapper_knife: { id: "sapper_knife", name: "Sapper Knife", type: "basic_attack", damageType: "physical", damageMultiplier: .85, targetType: "single_enemy", cooldownTurns: 0, range: 1 },
  blasting_charge: { id: "blasting_charge", name: "Blasting Charge", type: "active", damageType: "physical", damageMultiplier: .70, attackRollModifier: -1, targetType: "all_enemies", cooldownTurns: 4, range: 3, targetModifiers: [{ stat: "physicalDefense", operation: "percentage", value: -.15, durationTurns: 2 }] },
  smoke_pot: { id: "smoke_pot", name: "Smoke Pot", type: "active", targetType: "all_enemies", cooldownTurns: 4, range: 3, targetModifiers: [{ stat: "attackRollModifier", operation: "flat", value: -1, durationTurns: 2 }] },
  spectral_brand: { id: "spectral_brand", name: "Spectral Brand", type: "basic_attack", damageType: "magic", damageMultiplier: 1, targetType: "single_enemy", cooldownTurns: 0, range: 4 },
  accusing_whisper: { id: "accusing_whisper", name: "Accusing Whisper", type: "active", damageType: "magic", damageMultiplier: .65, targetType: "all_enemies", cooldownTurns: 3, range: 3, targetModifiers: [{ stat: "attackRollModifier", operation: "flat", value: -2, durationTurns: 1 }] },
  unfinished_oath: { id: "unfinished_oath", name: "Unfinished Oath", type: "passive", conditionalModifiers: [{ conditions: { selfHpRatioMax: .50 }, modifiers: [permanent("magicDamage", "percentage", .25), permanent("speed", "percentage", .10)] }] },
  laurel_blade: { id: "laurel_blade", name: "Laurel Blade", type: "basic_attack", damageType: "physical", damageMultiplier: 1.10, targetType: "single_enemy", cooldownTurns: 0, range: 1 },
  shield_rebuke: { id: "shield_rebuke", name: "Shield Rebuke", type: "active", damageType: "physical", damageMultiplier: .90, targetType: "single_enemy", cooldownTurns: 3, range: 1, targetModifiers: [{ stat: "attackRollModifier", operation: "flat", value: -2, durationTurns: 2 }] },
  laurel_discipline: { id: "laurel_discipline", name: "Laurel Discipline", type: "aura", aura: { target: "same_faction_allies", factionId: "bandits", excludeSelf: false, modifiers: [permanent("armorClass", "flat", 1)] } },
  revenant_glaive: { id: "revenant_glaive", name: "Oathbreaker Glaive", type: "basic_attack", damageType: "physical", damageMultiplier: 1.20, targetType: "single_enemy", cooldownTurns: 0, range: 2 },
  heartstone_pulse: { id: "heartstone_pulse", name: "Heartstone Pulse", type: "active", damageType: "magic", damageMultiplier: .80, targetType: "all_enemies", cooldownTurns: 3, range: 4, targetModifiers: [{ stat: "magicDefenseScore", operation: "flat", value: -2, durationTurns: 2 }] },
  oathbound_shell: { id: "oathbound_shell", name: "Oathbound Shell", type: "passive", selfModifiers: [permanent("armorClass", "flat", 2), permanent("magicDefenseScore", "flat", 2)] },
  final_testimony: { id: "final_testimony", name: "Final Testimony", type: "passive", conditionalModifiers: [{ conditions: { selfHpRatioMax: .50 }, modifiers: [permanent("magicDamage", "percentage", .20), permanent("physicalDamage", "percentage", .15), permanent("speed", "percentage", .10)] }] },
};
