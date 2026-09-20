import type { Modifier } from "../../game/modifiers/types";
import type { RaceId } from "../../game/heroes/types";

export interface RaceDefinition { id: RaceId; name: string; modifiers: Modifier[]; tactical: { attackRollModifier: number; rangedAttackRollModifier: number; movementRangeModifier: number; armorClassModifier: number; meleeDamageModifier: number } }
const tactical = (values: Partial<RaceDefinition["tactical"]> = {}): RaceDefinition["tactical"] => ({ attackRollModifier: 0, rangedAttackRollModifier: 0, movementRangeModifier: 0, armorClassModifier: 0, meleeDamageModifier: 0, ...values });
const flat = (sourceId: RaceId, target: Modifier["target"], value: number): Modifier => ({ source: "race", sourceId, target, operation: "flat", value });

export const RACES: Record<RaceId, RaceDefinition> = {
  human: { id: "human", name: "Human", modifiers: ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"].map((target) => flat("human", target as Modifier["target"], 1)), tactical: tactical() },
  elf: { id: "elf", name: "Elf", modifiers: [flat("elf", "dexterity", 2)], tactical: tactical() },
  dwarf: { id: "dwarf", name: "Dwarf", modifiers: [flat("dwarf", "constitution", 2)], tactical: tactical() },
  // The playable Orc uses the classic 5e half-orc ability increase while
  // retaining the project's Orc name and visual identity.
  orc: { id: "orc", name: "Orc", modifiers: [flat("orc", "strength", 2), flat("orc", "constitution", 1)], tactical: tactical() },
  // Classic 5e Tiefling: Charisma +2 and Intelligence +1.
  tiefling: { id: "tiefling", name: "Tiefling", modifiers: [flat("tiefling", "charisma", 2), flat("tiefling", "intelligence", 1)], tactical: tactical() },
  stoneborn: { id: "stoneborn", name: "Stoneborn", modifiers: [{ source:"race",sourceId:"stoneborn",target:"physicalDefense",operation:"percentage",value:.08 }, { source:"race",sourceId:"stoneborn",target:"speed",operation:"percentage",value:-.05 }], tactical: tactical({ armorClassModifier: 1 }) },
  veilborn: { id: "veilborn", name: "Veilborn", modifiers: [{ source:"race",sourceId:"veilborn",target:"magicDamage",operation:"percentage",value:.05 }, { source:"race",sourceId:"veilborn",target:"physicalDefense",operation:"percentage",value:-.05 }, { source:"race",sourceId:"veilborn",target:"magicDefenseScore",operation:"flat",value:1 }], tactical: tactical() },
};
