import { describe, expect, it } from "vitest";
import { ENEMIES } from "../src/data/enemies";
import { calculateEffectiveConditionChance, calculateEnemyStats, clampResistance, getConditionApplicationChance } from "../src/game/enemies/enemyCalculator";

const base = { hp: 100, physicalDamage: 100, physicalDefense: 100, magicDamage: 100, magicDefense: 100, speed: 100 };

describe("enemy calculations", () => {
  it("applies each percentage modifier to common base stats", () => {
    expect(calculateEnemyStats(base, ENEMIES.goblin_scout!)).toEqual({ hp: 80, physicalDamage: 90, physicalDefense: 85, magicDamage: 100, magicDefense: 90, speed: 125 });
  });
  it("calculates Troll HP and speed", () => {
    const stats = calculateEnemyStats(base, ENEMIES.troll!);
    expect(stats.hp).toBe(180);
    expect(stats.speed).toBe(70);
  });
  it("accepts explicit future level and difficulty scaling", () => expect(calculateEnemyStats(base, ENEMIES.skeleton!, { levelMultiplier: 2, difficultyMultiplier: 1.5 }).hp).toBe(300));
  it("clamps resistance and calculates effective chance", () => {
    expect(calculateEffectiveConditionChance(0.40, 0.50)).toBeCloseTo(0.20);
    expect(clampResistance(-1)).toBe(0);
    expect(clampResistance(2)).toBe(1);
  });
  it("supports full condition immunity", () => {
    const immune = { ...ENEMIES.skeleton!, conditionImmunities: ["poisoned"] };
    expect(getConditionApplicationChance(immune, "poisoned", "poison", 0.8)).toBe(0);
  });
});
