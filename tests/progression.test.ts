import { describe, expect, it } from "vitest";
import { ATTRIBUTE_KEYS } from "../src/game/attributes/types";
import { applyLevelAttributeGrowth } from "../src/game/progression/attributeGrowth";
import { grantHeroXp } from "../src/game/progression/levelSystem";
import { potentialMultiplier } from "../src/game/progression/potential";
import { xpRequiredForNextLevel } from "../src/game/progression/xpSystem";
import { testHero } from "./testHero";
describe("XP and fractional growth", () => {
  it("calculates level requirements", () => { expect(xpRequiredForNextLevel(1)).toBe(100); expect(xpRequiredForNextLevel(2)).toBe(283); });
  it("levels up and subtracts the requirement", () => expect(grantHeroXp(testHero(), 120)).toMatchObject({ level: 2, xp: 20 }));
  it("uses potential multiplier and preserves fractional growth", () => { expect(potentialMultiplier(90)).toBe(1.4); const hero = { ...testHero(), potential: 90 }; const grown = applyLevelAttributeGrowth(hero); const integerGains = ATTRIBUTE_KEYS.reduce((sum, key) => sum + grown.baseAttributes[key] - hero.baseAttributes[key], 0); const fractional = ATTRIBUTE_KEYS.reduce((sum, key) => sum + grown.attributeGrowthProgress[key], 0); expect(integerGains + fractional).toBeCloseTo(4.2); expect(fractional).toBeGreaterThan(0); });
});
