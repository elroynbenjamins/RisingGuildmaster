import { describe, expect, it } from "vitest";
import { addCondition, advanceConditions, hasInjury } from "../src/game/conditions/conditionService";
import { CONDITIONS } from "../src/data/conditions/conditions";
import { OUTCOME_INJURY_POOLS, selectOutcomeInjury } from "../src/game/conditions/injuryService";
import { calculateHero } from "../src/game/heroes/heroCalculator";
import { testHero } from "./testHero";
describe("conditions", () => { it("applies and expires", () => { const hero = testHero(); const active = { ...hero, conditions: addCondition([], "poisoned") }; expect(calculateHero(active).stats.maxHP).toBeLessThan(calculateHero(hero).stats.maxHP); const after = advanceConditions(active.conditions, 3); expect(after).toEqual([]); expect(calculateHero({ ...active, conditions: after }).stats.maxHP).toBe(calculateHero(hero).stats.maxHP); }); it("refreshes non-stackable conditions", () => expect(addCondition([{ conditionId: "injured", remainingDuration: 1 }], "injured")).toEqual([{ conditionId: "injured", remainingDuration: 5 }])); });

describe("injuries and ailments", () => {
  it("defines descriptions, categories, durations, and numerical effects for every persistent condition", () => { for (const definition of Object.values(CONDITIONS)) { expect(definition.description.length).toBeGreaterThan(20); expect(["injury", "ailment", "boon"]).toContain(definition.category); expect(definition.durationDays).toBeGreaterThan(0); expect(definition.modifiers.length).toBeGreaterThan(0); } });
  it("selects reproducible severity-appropriate injuries", () => { const minor = selectOutcomeInjury("hero-test", "minor"); const major = selectOutcomeInjury("hero-test", "major"); expect(OUTCOME_INJURY_POOLS.minor).toContain(minor); expect(OUTCOME_INJURY_POOLS.major).toContain(major); expect(selectOutcomeInjury("hero-test", "major")).toBe(major); });
  it("recognizes named wounds as injuries", () => expect(hasInjury([{ conditionId: "broken_arm", remainingDuration: 8 }])).toBe(true));
  it("applies specific wounds dynamically without changing base attributes", () => { const hero = testHero(); const wounded = { ...hero, conditions: addCondition([], "broken_arm") }; expect(calculateHero(wounded).attributes.strength).toBeLessThan(calculateHero(hero).attributes.strength); expect(wounded.baseAttributes).toEqual(hero.baseAttributes); });
});
