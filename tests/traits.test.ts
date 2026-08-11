import { describe, expect, it } from "vitest";
import { TRAITS } from "../src/data/traits/traits";
import { createHeroCombatInstance, createHeroCombatUnit } from "../src/game/combat/heroCombatFactory";
import { calculateHero } from "../src/game/heroes/heroCalculator";
import { getTraitPercentage } from "../src/game/traits/traitService";
import { testHero } from "./testHero";
import type { Hero } from "../src/game/heroes/types";

describe("expanded hero traits", () => {
  it("provides eighteen categorized, weighted trait definitions", () => {
    expect(Object.keys(TRAITS)).toHaveLength(18);
    for (const [id, trait] of Object.entries(TRAITS)) {
      expect(trait.id).toBe(id);
      expect(trait.description.length).toBeGreaterThan(15);
      expect(trait.generationWeight).toBeGreaterThan(0);
      expect(trait.modifiers.length).toBeGreaterThan(0);
    }
  });

  it("applies mixed attribute and derived-stat traits dynamically", () => {
    const base = calculateHero(testHero());
    const tough = calculateHero({ ...testHero(), traitIds: ["tough"] });
    const nimble = calculateHero({ ...testHero(), traitIds: ["nimble"] });
    const arcane = calculateHero({ ...testHero(), traitIds: ["arcane_touched"] });
    expect(tough.stats.maxHP).toBeCloseTo(base.stats.maxHP * 1.10);
    expect(nimble.attributes.dexterity).toBe(base.attributes.dexterity + 2);
    expect(nimble.attributes.constitution).toBe(base.attributes.constitution - 1);
    expect(arcane.stats.magicPower).toBeCloseTo(base.stats.magicPower * 1.15);
    expect(arcane.stats.maxHP).toBeCloseTo(base.stats.maxHP * .92);
  });

  it("applies physical-damage traits to live combat stats and respects HP conditions", () => {
    const baseHero = testHero(); const baseInstance = createHeroCombatInstance(baseHero); const baseDamage = createHeroCombatUnit(baseHero, baseInstance).stats.physicalDamage;
    const reckless: Hero = { ...baseHero, traitIds: ["reckless"] }; const recklessInstance = createHeroCombatInstance(reckless);
    expect(createHeroCombatUnit(reckless, recklessInstance).stats.physicalDamage).toBeCloseTo(baseDamage * 1.15);
    const brave: Hero = { ...baseHero, traitIds: ["brave"], currentHP: baseInstance.maxHP * .5 }; const braveInstance = createHeroCombatInstance(brave);
    expect(createHeroCombatUnit(brave, braveInstance).stats.physicalDamage).toBeCloseTo(baseDamage * 1.10);
    const healthyBrave = { ...brave, currentHP: baseInstance.maxHP * .51 }; const healthyInstance = createHeroCombatInstance(healthyBrave);
    expect(createHeroCombatUnit(healthyBrave, healthyInstance).stats.physicalDamage).toBeCloseTo(baseDamage);
  });

  it("exposes economy and injury modifiers to their owning systems", () => {
    expect(getTraitPercentage({ ...testHero(), traitIds: ["greedy"] }, "questGold")).toBe(.10);
    expect(getTraitPercentage({ ...testHero(), traitIds: ["frugal"] }, "questGold")).toBe(-.05);
    expect(getTraitPercentage({ ...testHero(), traitIds: ["reckless"] }, "injuryChance")).toBe(.10);
  });
});
