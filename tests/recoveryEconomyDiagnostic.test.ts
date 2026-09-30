import { describe, expect, it } from "vitest";
import { QUESTS } from "../src/data/quests/quests";
import { getDifficulty } from "../src/data/difficulty/difficulties";
import { calculateHero } from "../src/game/heroes/heroCalculator";
import type { ClassId } from "../src/game/heroes/types";
import { grantHeroXp } from "../src/game/progression/levelSystem";
import { xpRequiredForNextLevel } from "../src/game/progression/xpSystem";
import { getHealingCost, getConditionTreatmentCost } from "../src/game/temple/templeService";
import { testHero } from "./testHero";

function heroAtLevel(id: string, classId: ClassId, level: number, hpRatio: number) {
  let xp = 0;
  for (let current = 1; current < level; current += 1) xp += xpRequiredForNextLevel(current);
  const base = { ...testHero(), id, classId, level: 1, xp: 0 };
  const leveled = grantHeroXp(base, xp, level);
  const maxHP = calculateHero(leveled).stats.maxHP;
  return {
    ...leveled,
    currentHP: Math.max(1, Math.round(maxHP * hpRatio)),
    conditions: [{ conditionId: "injured" as const, remainingDuration: 4 }],
  };
}

describe("current-main recovery economy diagnostic", () => {
  it("reports rough-party recovery burden across campaign milestones", () => {
    const milestones = [
      { id: "chieftain", questId: "goblin_chieftain_boss", level: 2 },
      { id: "morrowveil", questId: "morrowveil_drowned_archivist_boss", level: 7 },
      { id: "cassian", questId: "cassian_vane_boss", level: 11 },
      { id: "serekh", questId: "serekh_chartmaker_boss", level: 17 },
    ] as const;
    const classes = ["warrior", "ranger", "cleric", "mage"] as const;

    const rows = milestones.flatMap((milestone) =>
      (["standard", "veteran", "iron_guild"] as const).flatMap((difficultyId) => {
        const quest = QUESTS[milestone.questId]!;
        const averageGold = Math.round((quest.goldRewardMin + quest.goldRewardMax) / 2 * getDifficulty(difficultyId).questGoldMultiplier);
        return ([.5, .25] as const).map((hpRatio) => {
          const heroes = classes.map((classId, index) => heroAtLevel(`${milestone.id}-${index}`, classId, milestone.level, hpRatio));
          const healingGold = heroes.reduce((sum, hero) => sum + getHealingCost(hero), 0);
          const injuryGold = heroes.reduce((sum, hero) => sum + getConditionTreatmentCost(hero), 0);
          return {
            milestone: milestone.id,
            difficultyId,
            hpRatio,
            averageGold,
            healingGold,
            injuryGold,
            fullRecoveryGold: healingGold + injuryGold,
            rewardShare: (healingGold + injuryGold) / Math.max(1, averageGold),
          };
        });
      }),
    );

    console.table(rows);
    expect(rows.every((row) => Number.isFinite(row.rewardShare) && row.fullRecoveryGold > 0)).toBe(true);
  });
});
