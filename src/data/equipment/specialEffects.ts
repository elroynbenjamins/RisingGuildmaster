import type { EquipmentSpecialEffectDefinition } from "../../game/equipment/specialEffectTypes";
import type { Modifier } from "../../game/modifiers/types";

const mod = (id: string, target: Modifier["target"], operation: Modifier["operation"], value: number, lowHp = false): Modifier => ({ source: "equipment", sourceId: `effect:${id}`, target, operation, value, ...(lowHp ? { condition: { type: "hpRatioAtMost" as const, value: .50 } } : {}) });
const effect = (id: string, name: string, description: string, modifiers: Modifier[], extra: Partial<EquipmentSpecialEffectDefinition> = {}): EquipmentSpecialEffectDefinition => ({ id, name, description, trigger: "always", modifiers, ...extra });

export const EQUIPMENT_SPECIAL_EFFECTS: Record<string, EquipmentSpecialEffectDefinition> = {
  spider_queen_trophy: effect("spider_queen_trophy", "Broodqueen's Ward", "Royal silk dampens venom and sharpens the wearer's instinct for rare spoils.", [mod("spider_queen_trophy", "magicDefense", "percentage", .05), mod("spider_queen_trophy", "rareLoot", "percentage", .05)], { conditionResistanceModifiers: { poisoned: .25 } }),
  wardstone_resonance: effect("wardstone_resonance", "Wardstone Resonance", "Unstable heartstone amplifies spellcraft while reinforcing magical defenses.", [mod("wardstone_resonance", "magicPower", "percentage", .08), mod("wardstone_resonance", "magicDefenseScore", "flat", 1)]),
  warrior_recipe_trophy: effect("warrior_recipe_trophy", "Hold the Line", "Below 50% HP, gain +1 Armor Class.", [mod("warrior_recipe_trophy", "armorClass", "flat", 1, true)], { trigger: "low_hp" }),
  ranger_recipe_trophy: effect("ranger_recipe_trophy", "Starfall Aim", "The bow's balanced limbs grant +3% critical chance.", [mod("ranger_recipe_trophy", "criticalChance", "flat", .03)]),
  mage_recipe_trophy: effect("mage_recipe_trophy", "Astral Conduit", "Arcane attacks deal 8% more damage.", [mod("mage_recipe_trophy", "magicDamage", "percentage", .08)]),
  cleric_recipe_trophy: effect("cleric_recipe_trophy", "Dawn's Answer", "Healing power is increased by 10%.", [mod("cleric_recipe_trophy", "healingPower", "percentage", .10)], { trigger: "on_heal" }),
  paladin_recipe_trophy: effect("paladin_recipe_trophy", "Sunforged Aegis", "Gain +1 Magic Defense Score.", [mod("paladin_recipe_trophy", "magicDefenseScore", "flat", 1)]),
  berserker_recipe_trophy: effect("berserker_recipe_trophy", "Bloodiron Hunger", "Below 50% HP, physical damage increases by 10%.", [mod("berserker_recipe_trophy", "physicalDamage", "percentage", .10, true)], { trigger: "low_hp" }),
  serpent_venom_reservoir: effect("serpent_venom_reservoir", "Venom Reservoir", "Physical hits have a 15% chance to poison the target for 2 turns.", [], { trigger: "on_physical_hit", conditionApplication: { conditionId: "poisoned", chance: .15, durationTurns: 2 } }),
  poison_resistance_25: effect("poison_resistance_25", "Serpentblood Setting", "Reduces incoming poison application chance by 25%.", [], { conditionResistanceModifiers: { poisoned: .25 } }),
  sewerborn_guard: effect("sewerborn_guard", "Sewerborn Guard", "Gain +1 Armor Class while the hide's overlapping scutes turn aside blows.", [mod("sewerborn_guard", "armorClass", "flat", 1)], { ignoredTerrainMovementCosts: ["shallow_water"] }),
  frost_resistance_25: effect("frost_resistance_25", "White Maw Fur", "Reduces the application chance of frost-related hindrances by 25%.", [mod("frost_resistance_25", "magicDefense", "percentage", .05)]),
  sure_footed_snow: effect("sure_footed_snow", "Sure-Footed", "Deep snow does not impose its additional movement cost.", [], { ignoredTerrainMovementCosts: ["snow"] }),
  frost_resistance_15: effect("frost_resistance_15", "Aurora Warmth", "A captured aurora current grants 15% frost resistance.", [mod("frost_resistance_15", "magicDefense", "percentage", .03)]),
};
