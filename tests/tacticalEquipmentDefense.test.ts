import { describe, expect, it } from "vitest";
import { createHeroCombatInstance, createHeroCombatUnit } from "../src/game/combat/heroCombatFactory";
import { testHero } from "./testHero";

describe("equipment tactical combat bonuses", () => {
  it("applies ordinary equipment Armor Class and Magic Defense Score bonuses to D20 targets", () => {
    const baseHero = { ...testHero(), classId: "mage" as const };
    const baseUnit = createHeroCombatUnit(baseHero, createHeroCombatInstance(baseHero));

    const gearedHero = {
      ...baseHero,
      equipment: {
        ...baseHero.equipment,
        armor: "deadletter-coat",
        accessory1: "echopearl-ring",
      },
    };
    const gearedUnit = createHeroCombatUnit(gearedHero, createHeroCombatInstance(gearedHero));

    expect(gearedUnit.stats.armorClass - baseUnit.stats.armorClass).toBe(1);
    expect(gearedUnit.stats.magicDefenseScore - baseUnit.stats.magicDefenseScore).toBe(2);
  });

  it("applies normal weapon damage, healing, initiative, and movement bonuses in tactical combat", () => {
    const baseHero = { ...testHero(), classId: "mage" as const };
    const baseInstance = createHeroCombatInstance(baseHero);
    const baseUnit = createHeroCombatUnit(baseHero, baseInstance);

    const gearedHero = {
      ...baseHero,
      equipment: {
        ...baseHero.equipment,
        weapon: "lighthouse-prism-crozier",
        armor: "last-call-mantle",
        accessory1: "beaconheart-ring",
      },
    };
    const gearedInstance = createHeroCombatInstance(gearedHero);
    const gearedUnit = createHeroCombatUnit(gearedHero, gearedInstance);

    expect(gearedUnit.stats.magicDamage).toBeGreaterThan(baseUnit.stats.magicDamage);
    expect(gearedUnit.stats.healingPower - baseUnit.stats.healingPower).toBeCloseTo(.12);
    expect(gearedUnit.stats.initiativeBonus - baseUnit.stats.initiativeBonus).toBe(2);
    expect(gearedInstance.movementRange - baseInstance.movementRange).toBe(1);
  });
});
