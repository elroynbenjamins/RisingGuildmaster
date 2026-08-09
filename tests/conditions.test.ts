import { describe, expect, it } from "vitest";
import { addCondition, advanceConditions } from "../src/game/conditions/conditionService";
import { calculateHero } from "../src/game/heroes/heroCalculator";
import { testHero } from "./testHero";
describe("conditions", () => { it("applies and expires", () => { const hero = testHero(); const active = { ...hero, conditions: addCondition([], "poisoned") }; expect(calculateHero(active).stats.maxHP).toBeLessThan(calculateHero(hero).stats.maxHP); const after = advanceConditions(active.conditions, 3); expect(after).toEqual([]); expect(calculateHero({ ...active, conditions: after }).stats.maxHP).toBe(calculateHero(hero).stats.maxHP); }); it("refreshes non-stackable conditions", () => expect(addCondition([{ conditionId: "injured", remainingDuration: 1 }], "injured")).toEqual([{ conditionId: "injured", remainingDuration: 5 }])); });
