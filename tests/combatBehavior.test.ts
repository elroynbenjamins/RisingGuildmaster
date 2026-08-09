import { describe, expect, it } from "vitest";
import { ENEMIES } from "../src/data/enemies";
import { createEnemyInstance } from "../src/game/enemies/enemyFactory";
import { advanceCooldowns, isSkillReady, setSkillCooldown } from "../src/game/combat/cooldownService";
import { selectEnemySkill } from "../src/game/combat/enemyBehaviorService";
import { createSeededRandom } from "../src/utils/random";
import { combatUnit } from "./combatTestUtils";

const base = { hp: 100, physicalDamage: 10, physicalDefense: 10, magicDamage: 10, magicDefense: 10, speed: 10 };
describe("enemy behaviors and cooldowns", () => {
  it("uses a ready prioritized skill and falls back during cooldown", () => {
    const instance = createEnemyInstance("goblin_scout", base, createSeededRandom(1)); const actor = combatUnit(instance.instanceId, "enemies"); const hero = combatUnit("hero");
    expect(selectEnemySkill(ENEMIES.goblin_scout!, instance, actor, [hero], [actor]).id).toBe("quick_strike");
    expect(selectEnemySkill(ENEMIES.goblin_scout!, { ...instance, activeCooldowns: { quick_strike: 2 } }, actor, [hero], [actor]).id).toBe("goblin_stab");
  });
  it("does not ready a three-turn cooldown until three full advances", () => {
    let cooldowns = setSkillCooldown({}, "aimed_shot", 3); expect(isSkillReady(cooldowns, "aimed_shot")).toBe(false);
    cooldowns = advanceCooldowns(cooldowns); expect(cooldowns.aimed_shot).toBe(2);
    cooldowns = advanceCooldowns(cooldowns); expect(cooldowns.aimed_shot).toBe(1);
    cooldowns = advanceCooldowns(cooldowns); expect(isSkillReady(cooldowns, "aimed_shot")).toBe(true);
  });
  it("uses Rally only with at least two living enemies", () => {
    const instance = createEnemyInstance("bandit_captain", base, createSeededRandom(2)); const actor = combatUnit(instance.instanceId, "enemies"); const ally = combatUnit("bandit", "enemies"); const hero = combatUnit("hero");
    expect(selectEnemySkill(ENEMIES.bandit_captain!, instance, actor, [hero], [actor, ally]).id).toBe("bandit_rally");
    expect(selectEnemySkill(ENEMIES.bandit_captain!, instance, actor, [hero], [actor]).id).toBe("captain_sword_strike");
  });
  it("uses Ground Slam with at least two living heroes", () => {
    const instance = createEnemyInstance("troll", base, createSeededRandom(3)); const actor = combatUnit(instance.instanceId, "enemies");
    const adjacent = [combatUnit("h1", "heroes", { position: { x: 4, y: 2 } }), combatUnit("h2", "heroes", { position: { x: 5, y: 1 } })];
    expect(selectEnemySkill(ENEMIES.troll!, instance, actor, adjacent, [actor]).id).toBe("ground_slam");
    expect(selectEnemySkill(ENEMIES.troll!, instance, actor, [adjacent[0]!], [actor]).id).toBe("troll_smash");
  });
});
