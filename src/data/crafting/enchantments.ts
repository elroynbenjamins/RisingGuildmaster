import type { EnchantmentDefinition } from "../../game/crafting/craftingTypes";
import type { Modifier } from "../../game/modifiers/types";
const mod = (id: string, target: Modifier["target"], operation: Modifier["operation"], value: number): Modifier => ({ source: "equipment", sourceId: id, target, operation, value });

export const ENCHANTMENTS: Record<string, EnchantmentDefinition> = {
  ember_edge: { id: "ember_edge", name: "Ember Edge", artisanLevel: 1, applicableSlots: ["weapon"], goldCost: 120, materials: { rough_ruby: 1, arcane_dust: 2 }, modifiers: [mod("ember_edge", "physicalAttack", "percentage", .10), mod("ember_edge", "magicPower", "percentage", .05)], description: "Ruby channels heat through a weapon, increasing its physical and magical offensive output." },
  sapphire_ward: { id: "sapphire_ward", name: "Sapphire Ward", artisanLevel: 1, applicableSlots: ["armor", "helmet", "accessory1", "accessory2"], goldCost: 110, materials: { rough_sapphire: 1, arcane_dust: 2 }, modifiers: [mod("sapphire_ward", "magicDefense", "percentage", .12)], description: "A defensive D&D-style ward that improves resistance against hostile magic." },
  topaz_precision: { id: "topaz_precision", name: "Topaz Precision", artisanLevel: 2, applicableSlots: ["weapon", "accessory1", "accessory2"], goldCost: 140, materials: { rough_topaz: 1, arcane_dust: 2 }, modifiers: [mod("topaz_precision", "criticalChance", "flat", .03)], description: "A precision enchantment comparable to critical-rating gear in MMORPGs." },
};
