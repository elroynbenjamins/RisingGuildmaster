import { describe, expect, it } from "vitest";
import { createEnemyInstance } from "../src/game/enemies/enemyFactory";
import { resolveEnemyTurn } from "../src/game/combat/turnResolver";
import { createSeededRandom } from "../src/utils/random";
import { combatUnit, sequenceRandom } from "./combatTestUtils";
const base = { hp: 100, physicalDamage: 10, physicalDefense: 10, magicDamage: 10, magicDefense: 10, speed: 10 };
describe("enemy turn pipeline", () => {
  it("selects a skill, resolves it, and stores its cooldown", () => {
    const instance = createEnemyInstance("goblin_scout", base, createSeededRandom(1)); const actor = combatUnit(instance.instanceId, "enemies");
    const result = resolveEnemyTurn({ instance, actor, heroes: [combatUnit("hero")], allies: [actor], enemyInstances: [instance] }, sequenceRandom([0, 0, 0]));
    expect(result.skipped).toBe(false); expect(result.skillResult?.resolution.skillId).toBe("quick_strike"); expect(result.instance.activeCooldowns.quick_strike).toBe(2);
  });
  it("applies start-of-turn poison, skips a stunned turn, and expires stun", () => {
    const instance = createEnemyInstance("skeleton", base, createSeededRandom(2)); const actor = combatUnit(instance.instanceId, "enemies", { maxHP: 200, currentHP: 100, activeConditions: [{ conditionId: "poisoned", remainingTurns: 3 }, { conditionId: "stunned", remainingTurns: 1 }] });
    const result = resolveEnemyTurn({ instance, actor, heroes: [combatUnit("hero")], allies: [actor], enemyInstances: [instance] }, sequenceRandom([]));
    expect(result.skipped).toBe(true); expect(result.actor.currentHP).toBe(94); expect(result.actor.activeConditions).toEqual([{ conditionId: "poisoned", remainingTurns: 2 }]);
  });
});
