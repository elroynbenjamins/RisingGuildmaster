import { describe, expect, it } from "vitest";
import { clampPotential, potentialMultiplier } from "../src/game/progression/potential";
import { generateWeightedPotential } from "../src/game/progression/potentialGenerator";
import { createSeededRandom } from "../src/utils/random";
describe("potential", () => {
  it.each([[1,1],[20,1],[50,1],[90,1.4],[100,1.5],[-5,1],[120,1.5]])("maps %s after the 50–100 clamp", (input, expected) => expect(potentialMultiplier(input)).toBeCloseTo(expected));
  it("clamps bounds", () => { expect(clampPotential(-2)).toBe(50); expect(clampPotential(49)).toBe(50); expect(clampPotential(101)).toBe(100); });
  it("generates only 50–100 and makes higher potential progressively rarer", () => { const random = createSeededRandom(12345); const values = Array.from({ length: 10_000 }, () => generateWeightedPotential(random)); expect(Math.min(...values)).toBeGreaterThanOrEqual(50); expect(Math.max(...values)).toBeLessThanOrEqual(100); const exceptional = values.filter((value) => value >= 90).length; const excellent = values.filter((value) => value >= 75 && value < 90).length; const lower = values.filter((value) => value < 75).length; expect(lower).toBeGreaterThan(excellent); expect(excellent).toBeGreaterThan(exceptional); });
});
