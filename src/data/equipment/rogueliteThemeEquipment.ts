import type { Modifier } from "../../game/modifiers/types";
import type { EquipmentDefinition } from "./equipment";

const mod = (id: string, target: Modifier["target"], operation: Modifier["operation"], value: number): Modifier => ({ source: "equipment", sourceId: id, target, operation, value });
const item = (id: string, name: string, slot: EquipmentDefinition["slot"], rarity: EquipmentDefinition["rarity"], level: number, value: number, modifiers: Modifier[], effects: string[] = []): EquipmentDefinition => ({ id, name, slot, rarity, level, value, modifiers, specialEffectIds: effects, classRestrictions: [], levelRequirement: level });

/** Theme-bound recipes fill the three equipment slots that had the shallowest progression. */
export const ROGUELITE_THEME_EQUIPMENT: Record<string, EquipmentDefinition> = {
  "thornseed-charm": item("thornseed-charm", "Thornseed Charm", "accessory2", "uncommon", 4, 175, [mod("thornseed-charm", "maxHP", "percentage", .05), mod("thornseed-charm", "healingPower", "percentage", .05)]),
  "thornwarden-hood": item("thornwarden-hood", "Thornwarden Hood", "helmet", "rare", 6, 350, [mod("thornwarden-hood", "initiative", "flat", 2), mod("thornwarden-hood", "physicalDefense", "percentage", .07)], ["poison_resistance_20"]),
  "glacier-spike-sabatons": item("glacier-spike-sabatons", "Glacier-Spike Sabatons", "boots", "uncommon", 5, 195, [mod("glacier-spike-sabatons", "armorClass", "flat", 1), mod("glacier-spike-sabatons", "speed", "percentage", -.03)], ["sure_footed_snow"]),
  "rimeguard-greathelm": item("rimeguard-greathelm", "Rimeguard Greathelm", "helmet", "rare", 7, 390, [mod("rimeguard-greathelm", "armorClass", "flat", 1), mod("rimeguard-greathelm", "maxHP", "percentage", .08)], ["frost_resistance_15"]),
  "rootstrider-boots": item("rootstrider-boots", "Rootstrider Boots", "boots", "uncommon", 4, 180, [mod("rootstrider-boots", "movementRange", "flat", 1), mod("rootstrider-boots", "speed", "percentage", .04)]),
  "venomward-charm": item("venomward-charm", "Venomward Charm", "accessory2", "rare", 6, 355, [mod("venomward-charm", "magicDefenseScore", "flat", 1), mod("venomward-charm", "maxHP", "percentage", .06)], ["poison_resistance_25"]),
  "ashglass-visor": item("ashglass-visor", "Ashglass Visor", "helmet", "uncommon", 5, 205, [mod("ashglass-visor", "magicDefenseScore", "flat", 1), mod("ashglass-visor", "initiative", "flat", 1)], ["arcane_aftershock_guard_05"]),
  "cinderward-talisman": item("cinderward-talisman", "Cinderward Talisman", "accessory2", "rare", 7, 385, [mod("cinderward-talisman", "magicDamage", "percentage", .07), mod("cinderward-talisman", "magicDefense", "percentage", .07)], ["ember_focus_10"]),
  "dunewalker-boots": item("dunewalker-boots", "Dunewalker Boots", "boots", "uncommon", 5, 190, [mod("dunewalker-boots", "movementRange", "flat", 1), mod("dunewalker-boots", "initiative", "flat", 1)]),
  "sunscar-veil": item("sunscar-veil", "Sunscar Veil", "helmet", "rare", 7, 370, [mod("sunscar-veil", "magicDefenseScore", "flat", 1), mod("sunscar-veil", "criticalChance", "flat", .03)], ["vigilant_opening"]),
  "gravewater-waders": item("gravewater-waders", "Gravewater Waders", "boots", "uncommon", 5, 200, [mod("gravewater-waders", "movementRange", "flat", 1), mod("gravewater-waders", "magicDefense", "percentage", .06)], ["sewerborn_guard"]),
  "ossuary-reliquary": item("ossuary-reliquary", "Ossuary Reliquary", "accessory2", "rare", 7, 395, [mod("ossuary-reliquary", "maxHP", "percentage", .08), mod("ossuary-reliquary", "magicDefenseScore", "flat", 1)], ["arcane_aftershock_guard_10"]),
};
