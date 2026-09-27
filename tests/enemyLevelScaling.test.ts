import { describe, expect, it } from "vitest";
import { enemyLevelStatMultiplier } from "../src/config/combatConfig";

describe("enemy level stat scaling", () => {
  it("keeps the established early curve through level 10", () => {
    expect(enemyLevelStatMultiplier(1)).toBeCloseTo(1);
    expect(enemyLevelStatMultiplier(5)).toBeCloseTo(1.72);
    expect(enemyLevelStatMultiplier(10)).toBeCloseTo(2.62);
  });

  it("tapers late growth so Chapters 7–9 do not outscale hero progression", () => {
    expect(enemyLevelStatMultiplier(11)).toBeCloseTo(2.65);
    expect(enemyLevelStatMultiplier(13)).toBeCloseTo(2.71);
    expect(enemyLevelStatMultiplier(15)).toBeCloseTo(2.77);
    expect(enemyLevelStatMultiplier(17)).toBeCloseTo(2.83);
  });
});
