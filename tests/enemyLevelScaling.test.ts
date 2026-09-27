import { describe, expect, it } from "vitest";
import { getEnemyLevelStatMultipliers } from "../src/config/combatConfig";

describe("enemy level stat scaling", () => {
  it("preserves the established early curve through Level 6", () => {
    expect(getEnemyLevelStatMultipliers(1)).toEqual({
      hpLevelMultiplier: 1,
      damageLevelMultiplier: 1,
      defenseLevelMultiplier: 1,
      speedLevelMultiplier: 1,
    });
    expect(getEnemyLevelStatMultipliers(6)).toEqual({
      hpLevelMultiplier: 1.9,
      damageLevelMultiplier: 1.9,
      defenseLevelMultiplier: 1.9,
      speedLevelMultiplier: 1.9,
    });
  });

  it("tapers late HP, damage, defense and speed instead of multiplying the whole stat line equally", () => {
    const late = getEnemyLevelStatMultipliers(17);
    expect(late.hpLevelMultiplier).toBeCloseTo(2.78);
    expect(late.damageLevelMultiplier).toBeCloseTo(2.56);
    expect(late.defenseLevelMultiplier).toBeCloseTo(2.34);
    expect(late.speedLevelMultiplier).toBeCloseTo(2.12);
    expect(late.hpLevelMultiplier).toBeGreaterThan(late.damageLevelMultiplier);
    expect(late.damageLevelMultiplier).toBeGreaterThan(late.defenseLevelMultiplier);
    expect(late.defenseLevelMultiplier).toBeGreaterThan(late.speedLevelMultiplier);
  });
});
