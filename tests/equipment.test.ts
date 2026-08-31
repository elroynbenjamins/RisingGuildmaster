import { describe, expect, it } from "vitest";
import { EQUIPMENT } from "../src/data/equipment/equipment";
import { equipItem, unequipSlot } from "../src/game/equipment/equipmentService";
import { calculateHero } from "../src/game/heroes/heroCalculator";
import { testHero } from "./testHero";

describe("equipment", () => {
  it("never changes ability scores or base attributes", () => {
    const original = testHero(); const equipped = equipItem(original, "worn-sword");
    expect(equipped.baseAttributes).toEqual(original.baseAttributes);
    expect(calculateHero(equipped).attributes).toEqual(calculateHero(original).attributes);
    const removed = unequipSlot(equipped, "weapon");
    expect(calculateHero(removed).attributes).toEqual(calculateHero(original).attributes);
    expect(removed.baseAttributes).toEqual(original.baseAttributes);
  });
  it("contains no attribute modifiers", () => {
    const attributes = new Set(["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"]);
    expect(Object.values(EQUIPMENT).flatMap((item) => item.modifiers).some((modifier) => attributes.has(modifier.target))).toBe(false);
  });
  it("enforces weapon and armor class restrictions", () => {
    const mage = { ...testHero(), classId: "mage" as const };
    expect(() => equipItem(mage, "worn-sword")).toThrow();
    expect(() => equipItem(mage, "padded-armor")).toThrow("Hero class cannot equip this item");
  });
});
