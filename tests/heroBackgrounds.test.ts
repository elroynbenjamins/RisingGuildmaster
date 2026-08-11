import { describe, expect, it } from "vitest";
import { BACKGROUNDS, getBackgroundModifier } from "../src/data/backgrounds/backgrounds";
import { createHeroCombatInstance, createHeroCombatUnit } from "../src/game/combat/heroCombatFactory";
import { calculateHero } from "../src/game/heroes/heroCalculator";
import { calculateWeeklySalary } from "../src/game/recruitment/recruitmentCostCalculator";
import { testHero } from "./testHero";

describe("hero backgrounds", () => {
  it("defines the five requested backgrounds with numerical modifiers", () => {
    expect(Object.keys(BACKGROUNDS)).toEqual(["farmhand", "scholar", "street_urchin", "noble", "mercenary"]);
    expect(BACKGROUNDS.scholar.modifiers).toContainEqual(expect.objectContaining({ target: "trainingXp", value: .05 }));
    expect(getBackgroundModifier("street_urchin", "recruitmentFee")).toBe(-.05);
  });

  it("applies background attributes without mutating base attributes", () => {
    const hero = { ...testHero(), backgroundId: "farmhand" as const }; const before = structuredClone(hero.baseAttributes); const calculated = calculateHero(hero);
    expect(calculated.attributes.strength).toBe(12); // Human +1, Farmhand +1.
    expect(calculated.attributes.constitution).toBe(12);
    expect(hero.baseAttributes).toEqual(before);
  });

  it("applies Mercenary damage and Noble salary expectations", () => {
    const mercenary = { ...testHero(), backgroundId: "mercenary" as const }; const farmhand = { ...testHero(), backgroundId: "farmhand" as const }; const noble = { ...testHero(), backgroundId: "noble" as const };
    expect(createHeroCombatUnit(mercenary, createHeroCombatInstance(mercenary)).stats.physicalDamage).toBeGreaterThan(createHeroCombatUnit(noble, createHeroCombatInstance(noble)).stats.physicalDamage);
    expect(calculateWeeklySalary(noble)).toBeGreaterThan(calculateWeeklySalary(farmhand));
  });
});
