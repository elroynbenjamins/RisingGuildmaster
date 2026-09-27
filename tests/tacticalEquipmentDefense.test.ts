import { describe, expect, it } from "vitest";
import { createHeroCombatInstance, createHeroCombatUnit } from "../src/game/combat/heroCombatFactory";
import { testHero } from "./testHero";

describe("equipment tactical defenses", () => {
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
});
