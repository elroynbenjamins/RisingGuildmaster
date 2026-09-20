import { describe, expect, it } from "vitest";
import { EQUIPMENT } from "../src/data/equipment/equipment";
import { EQUIPMENT_SPECIAL_EFFECTS } from "../src/data/equipment/specialEffects";
import { createHeroCombatInstance, createHeroCombatUnit } from "../src/game/combat/heroCombatFactory";
import { describeEquipmentSpecialEffect, getHeroEquipmentConditionResistance } from "../src/game/equipment/equipmentSpecialEffectService";
import { calculateHero } from "../src/game/heroes/heroCalculator";
import { testHero } from "./testHero";

describe("equipment special effects", () => {
  it("defines every non-enchantment special effect referenced by equipment", () => {
    const ids = Object.values(EQUIPMENT).flatMap((item) => item.specialEffectIds).filter((id) => !id.startsWith("enchantment:"));
    expect(ids.length).toBeGreaterThan(0);
    ids.forEach((id) => { expect(EQUIPMENT_SPECIAL_EFFECTS[id], id).toBeDefined(); expect(describeEquipmentSpecialEffect(id)?.description.length).toBeGreaterThan(10); });
  });

  it("applies passive effect modifiers without mutating base attributes", () => {
    const base = testHero(); const hero = { ...base, classId: "mage" as const, equipment: { ...base.equipment, weapon: "wardstone-scepter" } };
    expect(calculateHero(hero).stats.magicPower).toBeGreaterThan(calculateHero(base).stats.magicPower);
    expect(hero.baseAttributes).toEqual(base.baseAttributes);
  });

  it("activates low-HP equipment effects through the combat pipeline", () => {
    const base = { ...testHero(), level: 6, equipment: { ...testHero().equipment, weapon: "wardens-oathblade" } };
    const full = createHeroCombatInstance(base); const fullUnit = createHeroCombatUnit(base, full);
    const wounded = { ...full, currentHP: Math.floor(full.maxHP * .49) }; const woundedUnit = createHeroCombatUnit(base, wounded);
    expect(woundedUnit.stats.armorClass).toBe(fullUnit.stats.armorClass + 1);
  });

  it("clamps and exposes condition resistance for combat resolution", () => {
    const hero = { ...testHero(), level: 5, equipment: { ...testHero().equipment, accessory1: "serpent-eye-ring", accessory2: "queen-silk-talisman" } };
    expect(getHeroEquipmentConditionResistance(hero, "poisoned")).toBe(.50);
  });

  it("carries terrain affinity into the combat movement profile", () => {
    const hero = { ...testHero(), level: 11, classId: "warrior" as const, equipment: { ...testHero().equipment, armor: "white-maw-mantle" } };
    expect(createHeroCombatInstance(hero).ignoredTerrainMovementCosts).toContain("snow");
  });
});
