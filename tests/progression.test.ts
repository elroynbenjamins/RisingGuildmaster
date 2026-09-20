import { describe, expect, it } from "vitest";
import { ATTRIBUTE_KEYS } from "../src/game/attributes/types";
import { applyLevelAttributeGrowth } from "../src/game/progression/attributeGrowth";
import { grantHeroXp } from "../src/game/progression/levelSystem";
import { potentialMultiplier } from "../src/game/progression/potential";
import { xpRequiredForNextLevel } from "../src/game/progression/xpSystem";
import { testHero } from "./testHero";
describe("XP and fractional growth", () => {
  it("calculates level requirements", () => { expect(xpRequiredForNextLevel(1)).toBe(900); expect(xpRequiredForNextLevel(2)).toBe(2068); });
  it("levels up and subtracts the requirement", () => expect(grantHeroXp(testHero(), 920)).toMatchObject({ level: 2, xp: 20 }));
  it("uses potential only for XP and preserves potential-neutral growth", () => { expect(potentialMultiplier(90)).toBe(1.4); const hero = { ...testHero(), potential: 90 }; const grown = applyLevelAttributeGrowth(hero); const integerGains = ATTRIBUTE_KEYS.reduce((sum, key) => sum + grown.baseAttributes[key] - hero.baseAttributes[key], 0); const fractional = ATTRIBUTE_KEYS.reduce((sum, key) => sum + grown.attributeGrowthProgress[key], 0); expect(integerGains + fractional).toBeCloseTo(3); expect(fractional).toBeGreaterThan(0); });
});
