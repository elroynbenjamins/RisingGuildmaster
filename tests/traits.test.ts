import { describe, expect, it } from "vitest";
import { TRAITS } from "../src/data/traits/traits";
import { createHeroCombatInstance, createHeroCombatUnit } from "../src/game/combat/heroCombatFactory";
import { calculateHero } from "../src/game/heroes/heroCalculator";
import { getTraitPercentage } from "../src/game/traits/traitService";
import { testHero } from "./testHero";
import type { Hero } from "../src/game/heroes/types";
import { generateWeightedTraits } from "../src/game/traits/traitGenerationService";
import { createSeededRandom } from "../src/utils/random";

describe("expanded hero traits", () => {
  it("provides thirty-six categorized, weighted trait definitions", () => {
    expect(Object.keys(TRAITS)).toHaveLength(36);
    for (const [id, trait] of Object.entries(TRAITS)) {
      expect(trait.id).toBe(id);
      expect(trait.description.length).toBeGreaterThan(15);
      expect(trait.generationWeight).toBeGreaterThan(0);
      expect(trait.modifiers.length).toBeGreaterThan(0);
    }
  });

  it("generates weighted distinct traits without contradictory pairs", () => {
    for (let seed = 1; seed <= 100; seed++) {
      const generated = generateWeightedTraits(createSeededRandom(seed), 4);
      expect(new Set(generated).size).toBe(generated.length);
      for (const id of generated) for (const other of generated) {
        expect(TRAITS[id].incompatibleTraitIds?.includes(other) ?? false).toBe(false);
      }
    }
  });

  it("applies D&D-style combat traits without changing ability scores", () => {
    const base = calculateHero(testHero());
    const tough = calculateHero({ ...testHero(), traitIds: ["tough"] });
    const nimbleHero: Hero = { ...testHero(), traitIds: ["nimble"] };
    const nimble = calculateHero(nimbleHero);
    const baseUnit = createHeroCombatUnit(testHero(), createHeroCombatInstance(testHero()));
    const nimbleUnit = createHeroCombatUnit(nimbleHero, createHeroCombatInstance(nimbleHero));
    const arcane = calculateHero({ ...testHero(), traitIds: ["arcane_touched"] });
    expect(tough.stats.maxHP).toBeCloseTo(base.stats.maxHP * 1.10);
    expect(nimble.attributes).toEqual(base.attributes);
    expect(nimbleUnit.stats.initiativeBonus).toBe(baseUnit.stats.initiativeBonus + 1);
    expect(nimbleUnit.stats.armorClass).toBe(baseUnit.stats.armorClass - 1);
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

  it("applies alert initiative, spell-savant damage, and gifted healing in combat", () => {
    const baseHero = testHero();
    const baseInstance = createHeroCombatInstance(baseHero);
    const base = createHeroCombatUnit(baseHero, baseInstance);
    const alertHero: Hero = { ...baseHero, traitIds: ["alert"] };
    const spellHero: Hero = { ...baseHero, traitIds: ["spell_savant"] };
    const healerHero: Hero = { ...baseHero, traitIds: ["gifted_healer"] };
    expect(createHeroCombatUnit(alertHero, createHeroCombatInstance(alertHero)).stats.initiativeBonus).toBe(base.stats.initiativeBonus + 2);
    expect(createHeroCombatUnit(spellHero, createHeroCombatInstance(spellHero)).stats.magicDamage).toBeCloseTo(base.stats.magicDamage * 1.10);
    expect(createHeroCombatUnit(healerHero, createHeroCombatInstance(healerHero)).stats.healingPower).toBeCloseTo(base.stats.healingPower + .15);
  });

  it("exposes economy and injury modifiers to their owning systems", () => {
    expect(getTraitPercentage({ ...testHero(), traitIds: ["greedy"] }, "questGold")).toBe(.10);
    expect(getTraitPercentage({ ...testHero(), traitIds: ["frugal"] }, "questGold")).toBe(-.05);
    expect(getTraitPercentage({ ...testHero(), traitIds: ["reckless"] }, "injuryChance")).toBe(.10);
  });
});
