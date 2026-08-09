import { describe, expect, it } from "vitest";
import { clampPotential, potentialMultiplier } from "../src/game/progression/potential";
describe("potential", () => { it.each([[1,.51],[20,.7],[50,1],[90,1.4],[100,1.5],[-5,.51],[120,1.5]])("maps %s", (input, expected) => expect(potentialMultiplier(input)).toBeCloseTo(expected)); it("clamps bounds", () => { expect(clampPotential(-2)).toBe(1); expect(clampPotential(101)).toBe(100); }); });
