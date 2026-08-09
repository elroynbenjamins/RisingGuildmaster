import type { AttributeKey } from "../../game/attributes/types";
import type { ClassId, EquipmentSlot } from "../../game/heroes/types";
import type { Modifier } from "../../game/modifiers/types";

export interface ClassDefinition {
  id: ClassId; name: string; attributeGrowthWeights: Record<AttributeKey, number>;
  skillIds: string[]; equipmentRestrictions: string[]; modifiers: Modifier[];
  abilityIds: string[]; allowedEquipmentSlots: EquipmentSlot[];
  tactical: { movementRangeModifier: number; armorClassModifier: number; magicDefenseScoreModifier: number; rangedSkillRangeModifier: number; physicalDamageModifier: number; magicDamageModifier: number; healingPowerModifier: number };
}
const slots: EquipmentSlot[] = ["weapon", "armor", "helmet", "boots", "accessory1", "accessory2"];
const weights = (strength: number, dexterity: number, constitution: number, intelligence: number, wisdom: number, charisma: number): Record<AttributeKey, number> => ({ strength, dexterity, constitution, intelligence, wisdom, charisma });
const define = (id: ClassId, name: string, growth: Record<AttributeKey, number>, skillIds: string[], tactical: Partial<ClassDefinition["tactical"]> = {}): ClassDefinition => ({ id, name, attributeGrowthWeights: growth, skillIds, equipmentRestrictions: [], modifiers: [], abilityIds: skillIds, allowedEquipmentSlots: slots, tactical: { movementRangeModifier: 0, armorClassModifier: 0, magicDefenseScoreModifier: 0, rangedSkillRangeModifier: 0, physicalDamageModifier: 0, magicDamageModifier: 0, healingPowerModifier: 0, ...tactical } });

export const CLASSES: Record<ClassId, ClassDefinition> = {
  warrior: define("warrior", "Warrior", weights(1.2, .8, 1.2, .5, .6, .7), ["warrior_sword_strike", "warrior_shield_bash", "warrior_power_strike", "warrior_battle_hardened"], { armorClassModifier: 1 }),
  ranger: define("ranger", "Ranger", weights(.8, 1.4, .8, .7, 1.0, .6), ["ranger_bow_shot", "ranger_precise_shot", "ranger_multi_shot", "ranger_hunters_focus"], { movementRangeModifier: 1, rangedSkillRangeModifier: 1 }),
  mage: define("mage", "Mage", weights(.4, .7, .5, 1.5, 1.1, .6), ["mage_arcane_bolt", "mage_fireball", "mage_frost_bolt", "mage_arcane_knowledge"], { magicDamageModifier: .1 }),
  cleric: define("cleric", "Cleric", weights(.6, .5, .9, 1.0, 1.5, .8), ["cleric_holy_strike", "cleric_heal", "cleric_divine_light", "cleric_faith"], { healingPowerModifier: .15 }),
  paladin: define("paladin", "Paladin", weights(1.1, .5, 1.2, .6, 1.0, .9), ["paladin_holy_slash", "paladin_smite", "paladin_guardians_oath", "paladin_holy_armor"], { movementRangeModifier: -1, armorClassModifier: 2, magicDefenseScoreModifier: 1 }),
  berserker: define("berserker", "Berserker", weights(1.5, .8, 1.2, .3, .4, .5), ["berserker_wild_swing", "berserker_frenzied_strike", "berserker_whirlwind", "berserker_rage"], { movementRangeModifier: 1, armorClassModifier: -1, physicalDamageModifier: .15 }),
};
