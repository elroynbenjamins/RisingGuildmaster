import { describe, expect, it } from "vitest";
import { SPIDER_QUEEN_EXPLORATION } from "../src/data/quests/spiderQueenExploration";
import { QUESTS } from "../src/data/quests/quests";
import { ENEMIES } from "../src/data/enemies";
import { ENEMY_SKILLS } from "../src/data/skills/enemySkills";
import { resolveQuestExplorationStage } from "../src/game/quests/questExplorationService";
import { getAuraModifiersForEnemy, getConditionalPassiveModifiers } from "../src/game/combat/passiveService";
import { createEnemyInstance } from "../src/game/enemies/enemyFactory";
import { createSeededRandom } from "../src/utils/random";
import { combatUnit, sequenceRandom } from "./combatTestUtils";
import { testHero } from "./testHero";

const base = { hp: 100, physicalDamage: 20, physicalDefense: 10, magicDamage: 10, magicDefense: 10, speed: 10 };

describe("The Queen Beneath the Roots", () => {
  it("is a non-repeatable side quest with three D20 search stages and two encounters", () => {
    expect(QUESTS.hunt_spider_queen).toMatchObject({ questType: "side", repeatable: false, explorationStageIds: ["queen_tracks", "queen_ravine", "queen_echoes"], encounterIds: ["spider_queen_outer_brood", "spider_queen_boss"] });
  });

  it("resolves search checks with the best hero and applies an explicit failure consequence", () => {
    const tracker = { ...testHero(), baseAttributes: { ...testHero().baseAttributes, wisdom: 11 } };
    const success = resolveQuestExplorationStage(SPIDER_QUEEN_EXPLORATION.queen_tracks!, [tracker], sequenceRandom([.45]));
    expect(success.check).toMatchObject({ diceRoll: 10, modifier: 3, total: 13, success: true });

    const failure = resolveQuestExplorationStage(SPIDER_QUEEN_EXPLORATION.queen_ravine!, [testHero()], sequenceRandom([0]));
    expect(failure).toMatchObject({ appliedConditionId: "injured", check: { diceRoll: 1, modifier: 2, total: 3, success: false } });
  });

  it("defines a durable poison-immune Queen and a distinct brood roster", () => {
    expect(ENEMIES.spider_queen).toMatchObject({ hpModifier: 1.20, conditionImmunities: ["poisoned"], resistanceModifiers: { poison: 1 }, goldRewardMin: 80, goldRewardMax: 140 });
    expect(["spiderling_swarm", "webspinner", "spider_broodguard"].every((id) => ENEMIES[id] !== undefined)).toBe(true);
    expect(ENEMY_SKILLS.spiderling_bites).toBeDefined();
    expect(ENEMY_SKILLS.binding_web).toMatchObject({ conditionApplications: [{ conditionId: "stunned", chance: .30, durationTurns: 1 }] });
  });

  it("activates the Queen's phase at half HP and buffs living brood without mutating data", () => {
    const queenDefinition = ENEMIES.spider_queen!;
    const queenUnit = combatUnit("queen", "enemies", { currentHP: 50, maxHP: 100 });
    expect(getConditionalPassiveModifiers(queenDefinition, queenUnit)).toEqual(expect.arrayContaining([expect.objectContaining({ stat: "physicalDamage", value: .20 }), expect.objectContaining({ stat: "speed", value: .10 })]));

    const random = createSeededRandom(18);
    const queen = createEnemyInstance("spider_queen", base, random);
    const brood = createEnemyInstance("webspinner", base, random);
    expect(getAuraModifiersForEnemy([queen, brood], brood)).toContainEqual(expect.objectContaining({ stat: "physicalDamage", value: .15 }));
    expect(getAuraModifiersForEnemy([{ ...queen, isAlive: false }, brood], brood)).toEqual([]);
    expect(ENEMIES.spider_queen).toBe(queenDefinition);
  });
});
