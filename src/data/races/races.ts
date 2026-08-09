import type { Modifier } from "../../game/modifiers/types";
import type { RaceId } from "../../game/heroes/types";

export interface RaceDefinition { id: RaceId; name: string; modifiers: Modifier[]; tactical: { attackRollModifier: number; rangedAttackRollModifier: number; movementRangeModifier: number; armorClassModifier: number; meleeDamageModifier: number } }
const tactical = (values: Partial<RaceDefinition["tactical"]> = {}): RaceDefinition["tactical"] => ({ attackRollModifier: 0, rangedAttackRollModifier: 0, movementRangeModifier: 0, armorClassModifier: 0, meleeDamageModifier: 0, ...values });
const flat = (sourceId: RaceId, target: Modifier["target"], value: number): Modifier => ({ source: "race", sourceId, target, operation: "flat", value });
const pct = (sourceId: RaceId, target: Modifier["target"], value: number, condition?: Modifier["condition"]): Modifier => ({ source: "race", sourceId, target, operation: "percentage", value, condition });

export const RACES: Record<RaceId, RaceDefinition> = {
  human: { id: "human", name: "Human", modifiers: ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"].map((target) => flat("human", target as Modifier["target"], 1)).concat([pct("human", "xp", 0.05), pct("human", "trainingCost", -0.05)]), tactical: tactical({ attackRollModifier: 1 }) },
  elf: { id: "elf", name: "Elf", modifiers: [flat("elf", "strength", -1), flat("elf", "dexterity", 3), flat("elf", "constitution", -2), flat("elf", "intelligence", 3), flat("elf", "wisdom", 2), flat("elf", "charisma", 1), pct("elf", "magicPower", 0.1), pct("elf", "rangedDamage", 0.1), pct("elf", "rareLoot", 0.05)], tactical: tactical({ rangedAttackRollModifier: 1, movementRangeModifier: 1 }) },
  dwarf: { id: "dwarf", name: "Dwarf", modifiers: [flat("dwarf", "strength", 2), flat("dwarf", "dexterity", -2), flat("dwarf", "constitution", 4), flat("dwarf", "wisdom", 1), pct("dwarf", "physicalDefense", 0.15), pct("dwarf", "equipmentDurability", 0.2), pct("dwarf", "movementSpeed", -0.1), pct("dwarf", "craftingCost", -0.1)], tactical: tactical({ armorClassModifier: 1, movementRangeModifier: -1 }) },
  orc: { id: "orc", name: "Orc", modifiers: [flat("orc", "strength", 4), flat("orc", "constitution", 3), flat("orc", "intelligence", -3), flat("orc", "wisdom", -1), flat("orc", "charisma", -1), pct("orc", "physicalDamage", 0.1), pct("orc", "physicalDefense", 0.05), pct("orc", "physicalDamage", 0.2, { type: "hpRatioAtMost", value: 0.5 })], tactical: tactical({ meleeDamageModifier: .1, armorClassModifier: -1 }) },
};
