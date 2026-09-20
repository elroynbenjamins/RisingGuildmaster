import { describe, expect, it } from "vitest";
import { ENEMY_SKILLS } from "../src/data/skills/enemySkills";
import { selectEnemySkillTargets } from "../src/game/combat/enemyAiUtilityService";
import type { CombatSkillDefinition } from "../src/game/combat/skillTypes";
import { combatUnit, sequenceRandom } from "./combatTestUtils";

const aggressive = { preferredRange: 1, targetPriority: "nearest" } as const;

describe("enemy AI utility decisions", () => {
  it("prioritizes a reachable finishing blow over a merely nearer target", () => {
    const actor = combatUnit("enemy", "enemies", { position: { x: 3, y: 2 } });
    const near = combatUnit("near", "heroes", { position: { x: 2, y: 2 }, currentHP: 100 });
    const wounded = combatUnit("wounded", "heroes", { position: { x: 4, y: 2 }, currentHP: 20 });
    expect(selectEnemySkillTargets(ENEMY_SKILLS.goblin_stab!, actor, [near, wounded], [actor], aggressive, sequenceRandom([0]))[0]?.combatantId).toBe("wounded");
  });

  it("uses a future healing skill on the ally missing the most health", () => {
    const heal: CombatSkillDefinition = { id: "enemy_heal", name: "Enemy Heal", type: "active", targetType: "single_ally", healMaxHpModifier: .30, range: 4 };
    const actor = combatUnit("support", "enemies", { position: { x: 3, y: 2 } });
    const stable = combatUnit("stable", "enemies", { position: { x: 4, y: 2 }, currentHP: 80 });
    const critical = combatUnit("critical", "enemies", { position: { x: 3, y: 3 }, currentHP: 20 });
    expect(selectEnemySkillTargets(heal, actor, [], [actor, stable, critical], aggressive, sequenceRandom([0]))[0]?.combatantId).toBe("critical");
  });

  it("does not waste a condition when an unaffected target is available", () => {
    const actor = combatUnit("spider", "enemies", { position: { x: 3, y: 2 } });
    const poisoned = combatUnit("poisoned", "heroes", { position: { x: 2, y: 2 }, activeConditions: [{ conditionId: "poisoned", remainingTurns: 2 }] });
    const clean = combatUnit("clean", "heroes", { position: { x: 4, y: 2 } });
    expect(selectEnemySkillTargets(ENEMY_SKILLS.venom_bite!, actor, [poisoned, clean], [actor], aggressive, sequenceRandom([0]))[0]?.combatantId).toBe("clean");
  });
});
