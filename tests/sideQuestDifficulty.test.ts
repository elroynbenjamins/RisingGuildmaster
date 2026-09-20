import { describe, expect, it } from "vitest";
import { QUESTS } from "../src/data/quests/quests";
import { createCombatState } from "../src/game/combat/combatEngine";
import { createQuestEncounter } from "../src/game/quests/encounterFactory";
import { SIDE_QUEST_ENEMY_ATTACK_ROLL_BONUS, SIDE_QUEST_ENEMY_DEFENSE_SCORE_BONUS } from "../src/game/quests/sideQuestDifficultyService";
import { createSeededRandom } from "../src/utils/random";
import { testHero } from "./testHero";

describe("side quest combat difficulty", () => {
  it("adds one enemy attack roll and one defense score without raising enemy level", () => {
    const quest = QUESTS.brambleway_caravan!;
    const encounterId = quest.encounterIds[0]!;
    const baseline = createQuestEncounter(encounterId, createSeededRandom(91));
    const state = createCombatState(quest.id, 0, [testHero()], createSeededRandom(91));

    expect(state.setupLabel).toContain("Enemies +1 attack rolls and +1 AC/MDS");
    expect(state.enemies).toHaveLength(baseline.length);
    state.enemies.forEach((enemy, index) => {
      const base = baseline[index]!;
      expect(enemy.instance.level).toBe(base.instance.level);
      expect(enemy.unit.stats.physicalAttackBonus).toBe(base.unit.stats.physicalAttackBonus + SIDE_QUEST_ENEMY_ATTACK_ROLL_BONUS);
      expect(enemy.unit.stats.magicAttackBonus).toBe(base.unit.stats.magicAttackBonus + SIDE_QUEST_ENEMY_ATTACK_ROLL_BONUS);
      expect(enemy.unit.stats.armorClass).toBe(base.unit.stats.armorClass + SIDE_QUEST_ENEMY_DEFENSE_SCORE_BONUS);
      expect(enemy.unit.stats.magicDefenseScore).toBe(base.unit.stats.magicDefenseScore + SIDE_QUEST_ENEMY_DEFENSE_SCORE_BONUS);
    });
  });
});
