import { describe, expect, it } from "vitest";
import { ENEMIES } from "../src/data/enemies";
import { createEnemyInstance } from "../src/game/enemies/enemyFactory";
import { getAuraModifiersForEnemy, getConditionalPassiveModifiers, resolvePassiveHealing } from "../src/game/combat/passiveService";
import { createSeededRandom } from "../src/utils/random";
import { combatUnit } from "./combatTestUtils";

const base = { hp: 100, physicalDamage: 10, physicalDefense: 10, magicDamage: 10, magicDefense: 10, speed: 10 };
describe("data-driven passives and auras", () => {
  it("activates Blood Fury at 50% but not 51% HP", () => {
    expect(getConditionalPassiveModifiers(ENEMIES.orc_raider!, combatUnit("orc", "enemies", { currentHP: 50 }))).toContainEqual(expect.objectContaining({ stat: "physicalDamage", value: 0.20 }));
    expect(getConditionalPassiveModifiers(ENEMIES.orc_raider!, combatUnit("orc", "enemies", { currentHP: 51 }))).toEqual([]);
  });
  it("activates Predator Instinct against 50% but not 51% HP", () => {
    const wolf = combatUnit("wolf", "enemies");
    expect(getConditionalPassiveModifiers(ENEMIES.dire_wolf!, wolf, combatUnit("hero", "heroes", { currentHP: 50 }))).toContainEqual(expect.objectContaining({ stat: "damage", value: 0.15 }));
    expect(getConditionalPassiveModifiers(ENEMIES.dire_wolf!, wolf, combatUnit("hero", "heroes", { currentHP: 51 }))).toEqual([]);
  });
  it("regenerates Troll HP by rounded five percent and caps at max", () => {
    const unit = combatUnit("troll", "enemies", { maxHP: 300, currentHP: 200 });
    expect(resolvePassiveHealing(ENEMIES.troll!, unit).currentHP).toBe(215);
    expect(resolvePassiveHealing(ENEMIES.troll!, { ...unit, currentHP: 295 }).currentHP).toBe(300);
  });
  it("removes Commanding Presence immediately when Captain dies without mutating Bandit data", () => {
    const random = createSeededRandom(10); const bandit = createEnemyInstance("bandit", base, random); const captain = createEnemyInstance("bandit_captain", base, random);
    const before = structuredClone(ENEMIES.bandit!);
    expect(getAuraModifiersForEnemy([bandit, captain], bandit)).toContainEqual(expect.objectContaining({ stat: "physicalDamage", value: 0.10 }));
    expect(getAuraModifiersForEnemy([bandit, { ...captain, isAlive: false }], bandit)).toEqual([]);
    expect(ENEMIES.bandit).toEqual(before);
  });
});
