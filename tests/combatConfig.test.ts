import { describe, expect, it } from "vitest";
import { getEnemyLevelStatMultiplier } from "../src/config/combatConfig";

describe("enemy level stat growth", () => {
  it("preserves the established curve through Level 11", () => {
    expect(getEnemyLevelStatMultiplier(1)).toBeCloseTo(1);
    expect(getEnemyLevelStatMultiplier(10)).toBeCloseTo(2.62);
    expect(getEnemyLevelStatMultiplier(11)).toBeCloseTo(2.8);
  });

  it("tapers complete-stat growth in late chapters instead of continuing 18% per level", () => {
    expect(getEnemyLevelStatMultiplier(12)).toBeCloseTo(2.82);
    expect(getEnemyLevelStatMultiplier(13)).toBeCloseTo(2.84);
    expect(getEnemyLevelStatMultiplier(15)).toBeCloseTo(2.88);
    expect(getEnemyLevelStatMultiplier(17)).toBeCloseTo(2.92);
  });
});
