import type { ClassId } from "../../game/heroes/types";

export interface ClassSkillNodeDefinition {
  skillId: string;
  requiredLevel: number;
  tier: number;
  prerequisiteSkillIds?: string[];
}

export interface ClassSkillTreeDefinition {
  classId: ClassId;
  basicSkillId: string;
  nodes: ClassSkillNodeDefinition[];
}

const tree = (classId: ClassId, basicSkillId: string, firstChoice: string, secondChoice: string, advancedPassive: string): ClassSkillTreeDefinition => ({
  classId,
  basicSkillId,
  nodes: [
    { skillId: firstChoice, requiredLevel: 2, tier: 1 },
    { skillId: secondChoice, requiredLevel: 2, tier: 1 },
    { skillId: advancedPassive, requiredLevel: 4, tier: 2 },
  ],
});

export const CLASS_SKILL_TREES: Record<ClassId, ClassSkillTreeDefinition> = {
  warrior: tree("warrior", "warrior_sword_strike", "warrior_shield_bash", "warrior_power_strike", "warrior_battle_hardened"),
  ranger: tree("ranger", "ranger_bow_shot", "ranger_precise_shot", "ranger_multi_shot", "ranger_hunters_focus"),
  mage: tree("mage", "mage_arcane_bolt", "mage_fireball", "mage_frost_bolt", "mage_arcane_knowledge"),
  cleric: tree("cleric", "cleric_holy_strike", "cleric_heal", "cleric_divine_light", "cleric_faith"),
  paladin: tree("paladin", "paladin_holy_slash", "paladin_smite", "paladin_guardians_oath", "paladin_holy_armor"),
  berserker: tree("berserker", "berserker_wild_swing", "berserker_frenzied_strike", "berserker_whirlwind", "berserker_rage"),
};
