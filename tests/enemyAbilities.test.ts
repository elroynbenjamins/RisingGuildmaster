import { describe, expect, it } from "vitest";
import { ENEMY_ABILITIES } from "../src/data/enemies/enemyAbilities";
import { ENEMIES } from "../src/data/enemies";
import { createEnemyInstance } from "../src/game/enemies/enemyFactory";
import { applyAbilityCondition, applyStartOfTurnRegeneration, getActiveAbilityModifier, getEncounterAuraModifier, isAbilityTriggerActive } from "../src/game/enemies/enemyService";
import { createSeededRandom } from "../src/utils/random";

const base = { hp: 100, physicalDamage: 10, physicalDefense: 10, magicDamage: 10, magicDefense: 10, speed: 10 };

describe("enemy abilities", () => {
  it("activates Dire Wolf predator instinct only at or below half target HP", () => {
    const trigger = ENEMY_ABILITIES.predator_instinct!.trigger;
    expect(isAbilityTriggerActive(trigger, { targetCurrentHP: 49, targetMaxHP: 100 })).toBe(true);
    expect(isAbilityTriggerActive(trigger, { targetCurrentHP: 51, targetMaxHP: 100 })).toBe(false);
    expect(getActiveAbilityModifier(ENEMIES.dire_wolf!, "damageModifier", { targetCurrentHP: 49, targetMaxHP: 100 })).toBe(0.15);
  });
  it("applies and removes the Captain aura based on living state without changing Bandit data", () => {
    const random = createSeededRandom(3);
    const bandit = createEnemyInstance("bandit", base, random);
    const captain = createEnemyInstance("bandit_captain", base, random);
    const original = structuredClone(ENEMIES.bandit!);
    expect(getEncounterAuraModifier([bandit, captain], bandit.instanceId, "damageModifier")).toBe(0.10);
    expect(getEncounterAuraModifier([bandit, { ...captain, isAlive: false }], bandit.instanceId, "damageModifier")).toBe(0);
    expect(ENEMIES.bandit).toEqual(original);
  });
  it("does not apply an aura to its source", () => {
    const captain = createEnemyInstance("bandit_captain", base, createSeededRandom(4));
    expect(getEncounterAuraModifier([captain], captain.instanceId, "damageModifier")).toBe(0);
  });
  it("regenerates five percent max HP without exceeding max", () => {
    const troll = { ...createEnemyInstance("troll", base, createSeededRandom(5)), maxHP: 200, currentHP: 100 };
    expect(applyStartOfTurnRegeneration(troll).currentHP).toBe(110);
    expect(applyStartOfTurnRegeneration({ ...troll, currentHP: 198 }).currentHP).toBe(200);
  });
  it("applies an ability condition after resistance and records its duration", () => {
    const target = createEnemyInstance("skeleton", base, createSeededRandom(6));
    const venom = ENEMY_ABILITIES.venom_bite!; // 25% base × 50% poison resistance = 12.5%
    const applied = applyAbilityCondition(target, venom, 0.12);
    expect(applied.activeConditionIds).toEqual(["poisoned"]);
    expect(applied.activeConditions).toEqual([{ conditionId: "poisoned", remainingTurns: 3 }]);
    expect(applyAbilityCondition(target, venom, 0.13)).toEqual(target);
  });
});
