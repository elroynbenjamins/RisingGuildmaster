import { describe, expect, it } from "vitest";
import { CLASSES } from "../src/data/classes/classes";
import { calculateAbilityModifier, formatAbilityModifier, generateDndAttributes, rollDndAbilityScore } from "../src/game/attributes/dndAttributes";
import { ATTRIBUTE_KEYS } from "../src/game/attributes/types";
import { generateHero } from "../src/game/heroes/heroGenerator";
import { createSeededRandom } from "../src/utils/random";
import { sequenceRandom } from "./combatTestUtils";

describe("D&D-style hero attributes", () => {
  it("uses the standard ability modifier table", () => {
    expect([1, 8, 9, 10, 11, 12, 18, 20].map(calculateAbilityModifier)).toEqual([-5, -1, -1, 0, 0, 1, 4, 5]);
    expect(formatAbilityModifier(16)).toBe("+3");
  });

  it("rolls 4d6 and drops the lowest die", () => {
    expect(rollDndAbilityScore(sequenceRandom([0, .2, .4, .999]))).toBe(11);
  });

  it("keeps all newly rolled base scores in the natural 3–18 range", () => {
    for (let seed = 1; seed <= 100; seed += 1) {
      const attributes = generateDndAttributes(createSeededRandom(seed), CLASSES.ranger.attributePriorities);
      for (const key of ATTRIBUTE_KEYS) expect(attributes[key]).toBeGreaterThanOrEqual(3);
      for (const key of ATTRIBUTE_KEYS) expect(attributes[key]).toBeLessThanOrEqual(18);
    }
  });

  it("assigns the best rolls to each class's priority attributes", () => {
    for (const classId of Object.keys(CLASSES) as (keyof typeof CLASSES)[]) {
      const hero = generateHero(createSeededRandom(800 + classId.length), { classId, raceId: "human", traitCount: 1 });
      const order = CLASSES[classId].attributePriorities;
      for (let index = 1; index < order.length; index += 1) expect(hero.baseAttributes[order[index - 1]!]).toBeGreaterThanOrEqual(hero.baseAttributes[order[index]!]);
    }
  });
});
