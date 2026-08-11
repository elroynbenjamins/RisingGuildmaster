import { describe, expect, it } from "vitest";
import { CRAFTING_RECIPES } from "../src/data/crafting/recipes";
import { EQUIPMENT } from "../src/data/equipment/equipment";
import { GATHERING_MISSIONS } from "../src/data/gathering/gatheringMissions";
import { ENEMY_LOOT_TABLES } from "../src/data/loot/enemyLootTables";
import { QUEST_LOOT_TABLES } from "../src/data/loot/questLootTables";
import type { ClassId, EquipmentSlot } from "../src/game/heroes/types";

describe("expanded equipment data", () => {
  it("provides 60 items across every slot and progression tier", () => {
    const items = Object.values(EQUIPMENT);
    expect(items).toHaveLength(60);
    for (const slot of ["weapon", "armor", "helmet", "boots", "accessory1", "accessory2"] satisfies EquipmentSlot[]) {
      expect(items.some((item) => item.slot === slot)).toBe(true);
    }
    for (const rarity of ["common", "uncommon", "rare"] as const) {
      expect(items.some((item) => item.rarity === rarity)).toBe(true);
    }
  });

  it("offers an equippable weapon progression for every base class", () => {
    const classes: ClassId[] = ["warrior", "ranger", "mage", "cleric", "paladin", "berserker"];
    const weapons = Object.values(EQUIPMENT).filter((item) => item.slot === "weapon");
    for (const classId of classes) {
      expect(weapons.some((item) => !item.classRestrictions.length || item.classRestrictions.includes(classId))).toBe(true);
      expect(weapons.some((item) => item.levelRequirement >= 5 && item.classRestrictions.includes(classId))).toBe(true);
    }
  });

  it("keeps percentage modifiers as decimal values", () => {
    const percentages = Object.values(EQUIPMENT).flatMap((item) => item.modifiers).filter((modifier) => modifier.operation === "percentage");
    expect(percentages.length).toBeGreaterThan(0);
    expect(percentages.every((modifier) => Math.abs(modifier.value) <= 1)).toBe(true);
  });

  it("only references valid equipment from recipes, loot, and gathering", () => {
    const referencedIds = [
      ...Object.values(CRAFTING_RECIPES).map((recipe) => recipe.outputEquipmentId),
      ...Object.values(QUEST_LOOT_TABLES).flatMap((table) => table.itemIds),
      ...Object.values(ENEMY_LOOT_TABLES).flatMap((table) => table.itemIds),
      ...Object.values(GATHERING_MISSIONS).flatMap((mission) => mission.equipmentPoolIds),
    ];
    expect(referencedIds.length).toBeGreaterThan(0);
    for (const equipmentId of referencedIds) expect(EQUIPMENT[equipmentId], equipmentId).toBeDefined();
  });
});
