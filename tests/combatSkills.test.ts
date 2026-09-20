import { describe, expect, it } from "vitest";
import { ENEMY_SKILLS } from "../src/data/skills/enemySkills";
import { resolveSkill } from "../src/game/combat/skillResolver";
import { selectSkillTargets } from "../src/game/combat/targetSelector";
import { combatUnit, sequenceRandom } from "./combatTestUtils";

describe("enemy combat skills", () => {
  it("defines Aimed Shot exactly", () => expect(ENEMY_SKILLS.aimed_shot).toMatchObject({ damageMultiplier: 1.35, accuracyModifier: -0.10, criticalChanceModifier: 0.10, cooldownTurns: 3 }));
  it("can both apply and fail Brute Slam stun", () => {
    const actor = combatUnit("brute", "enemies"); const target = combatUnit("hero");
    const success = resolveSkill(actor, [target], ENEMY_SKILLS.brute_slam!, sequenceRandom([0.5, 0.09]));
    const failure = resolveSkill(actor, [target], ENEMY_SKILLS.brute_slam!, sequenceRandom([0.5, 0.11]));
    expect(success.targets[0]!.activeConditions).toEqual([{ conditionId: "stunned", remainingTurns: 1 }]);
    expect(failure.targets[0]!.activeConditions).toEqual([]);
  });
  it("resolves a separate Ground Slam hit and critical roll for every living hero", () => {
    const heroes = [combatUnit("h1"), combatUnit("h2"), combatUnit("h3")];
    const result = resolveSkill(combatUnit("troll", "enemies"), heroes, ENEMY_SKILLS.ground_slam!, sequenceRandom([0.5, 0, 0.999]));
    expect(result.resolution.hits).toHaveLength(3);
    expect(result.resolution.hits.map((hit) => hit.hit)).toEqual([true, false, true]);
    expect(result.resolution.hits.map((hit) => hit.critical)).toEqual([false, false, true]);
  });
  it("applies Rally to every supplied living ally for two turns", () => {
    const allies = [combatUnit("b1", "enemies"), combatUnit("b2", "enemies")];
    const result = resolveSkill(combatUnit("captain", "enemies"), allies, ENEMY_SKILLS.bandit_rally!, sequenceRandom([]));
    expect(result.targets).toHaveLength(2);
    for (const ally of result.targets) expect(ally.activeModifiers).toContainEqual({ stat: "physicalDamage", operation: "percentage", value: 0.15, durationTurns: 2, sourceSkillId: "bandit_rally" });
  });
  it("prefers a target missing the skill's condition", () => {
    const poisoned = combatUnit("poisoned", "heroes", { activeConditions: [{ conditionId: "poisoned", remainingTurns: 2 }] });
    const healthy = combatUnit("healthy");
    expect(selectSkillTargets("single_enemy", combatUnit("spider", "enemies"), [poisoned, healthy], [], sequenceRandom([0]), ["poisoned"])[0]?.combatantId).toBe("healthy");
  });
});
