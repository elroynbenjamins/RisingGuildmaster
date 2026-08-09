import type { ClassId, EquipmentSlot } from "../../game/heroes/types";
import type { Modifier } from "../../game/modifiers/types";
export type EquipmentRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";
export interface EquipmentDefinition { id: string; name: string; slot: EquipmentSlot; rarity: EquipmentRarity; level: number; value: number; modifiers: Modifier[]; specialEffectIds: string[]; classRestrictions: ClassId[]; levelRequirement: number }
const mod = (sourceId: string, target: Modifier["target"], operation: Modifier["operation"], value: number): Modifier => ({ source: "equipment", sourceId, target, operation, value });
export const EQUIPMENT: Record<string, EquipmentDefinition> = {
  "worn-sword": { id: "worn-sword", name: "Worn Sword", slot: "weapon", rarity: "common", level: 1, value: 30, modifiers: [mod("worn-sword", "strength", "flat", 2)], specialEffectIds: [], classRestrictions: ["warrior", "paladin", "berserker"], levelRequirement: 1 },
  "hunting-bow": { id: "hunting-bow", name: "Hunting Bow", slot: "weapon", rarity: "common", level: 1, value: 30, modifiers: [mod("hunting-bow", "dexterity", "flat", 2)], specialEffectIds: [], classRestrictions: ["ranger"], levelRequirement: 1 },
  "apprentice-staff": { id: "apprentice-staff", name: "Apprentice Staff", slot: "weapon", rarity: "common", level: 1, value: 30, modifiers: [mod("apprentice-staff", "intelligence", "flat", 2)], specialEffectIds: [], classRestrictions: ["mage", "cleric"], levelRequirement: 1 },
  "padded-armor": { id: "padded-armor", name: "Padded Armor", slot: "armor", rarity: "common", level: 1, value: 25, modifiers: [mod("padded-armor", "constitution", "flat", 1)], specialEffectIds: [], classRestrictions: [], levelRequirement: 1 },
};
