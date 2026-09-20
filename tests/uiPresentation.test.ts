import { describe, expect, it } from "vitest";
import { isClassAttribute } from "../src/ui/classAttributes";
import { EQUIPMENT_RARITY_COLORS, getEquipmentRarityColor } from "../src/ui/equipmentRarity";
import { getModifierTargetLabel } from "../src/ui/modifierLabels";

describe("shared game UI presentation", () => {
  it("uses a distinct color for every equipment tier and light blue for rare gear", () => {
    expect(new Set(Object.values(EQUIPMENT_RARITY_COLORS)).size).toBe(5);
    expect(getEquipmentRarityColor("rare")).toBe("#72b7f2");
  });

  it("formats modifier targets as player-facing labels", () => {
    expect(getModifierTargetLabel("trainingXp")).toBe("Training XP");
    expect(getModifierTargetLabel("maxHP")).toBe("Max HP");
    expect(getModifierTargetLabel("criticalChance")).toBe("Critical Chance");
  });

  it("identifies the attributes favored by each class", () => {
    expect(isClassAttribute("mage", "intelligence")).toBe(true);
    expect(isClassAttribute("mage", "constitution")).toBe(true);
    expect(isClassAttribute("mage", "wisdom")).toBe(false);
    expect(isClassAttribute("mage", "strength")).toBe(false);
    expect(isClassAttribute("warrior", "strength")).toBe(true);
    expect(isClassAttribute("warrior", "constitution")).toBe(true);
  });
});
