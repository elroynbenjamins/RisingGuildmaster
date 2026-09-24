import { describe, expect, it } from "vitest";
import { ATTRIBUTE_KEYS } from "../src/game/attributes/types";
import { applyLevelAttributeGrowth } from "../src/game/progression/attributeGrowth";
import { grantHeroXp } from "../src/game/progression/levelSystem";
import { xpRequiredForNextLevel } from "../src/game/progression/xpSystem";
import { testHero } from "./testHero";
describe("XP and fractional growth", () => {
  it("calculates level requirements", () => { expect(xpRequiredForNextLevel(1)).toBe(900); expect(xpRequiredForNextLevel(2)).toBe(2068); });
  it("levels up and subtracts the requirement", () => expect(grantHeroXp(testHero(), 920)).toMatchObject({ level: 2, xp: 20 }));
  it("preserves fractional attribute growth without hidden hero multipliers", () => { const hero = testHero(); const grown = applyLevelAttributeGrowth(hero); const integerGains = ATTRIBUTE_KEYS.reduce((sum, key) => sum + grown.baseAttributes[key] - hero.baseAttributes[key], 0); const fractional = ATTRIBUTE_KEYS.reduce((sum, key) => sum + grown.attributeGrowthProgress[key], 0); expect(integerGains + fractional).toBeCloseTo(3); expect(fractional).toBeGreaterThan(0); });
});
