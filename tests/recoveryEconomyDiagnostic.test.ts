import { describe, expect, it } from "vitest";
import { QUESTS } from "../src/data/quests/quests";
import { getDifficulty } from "../src/data/difficulty/difficulties";
import { calculateHero } from "../src/game/heroes/heroCalculator";
import type { ClassId } from "../src/game/heroes/types";
import { grantHeroXp } from "../src/game/progression/levelSystem";
import { xpRequiredForNextLevel } from "../src/game/progression/xpSystem";
import { getHealingCost, getConditionTreatmentCost } from "../src/game/temple/templeService";
import { testHero } from "./testHero";

function heroAtLevel(id: string, classId: ClassId, level: number, hpRatio: number, injured = false) {
  let xp = 0;
  for (let current = 1; current < level; current += 1) xp += xpRequiredForNextLevel(current);
  const base = { ...testHero(), id, classId, level: 1, xp: 0 };
  const leveled = grantHeroXp(base, xp, level);
  const maxHP = calculateHero(leveled).stats.maxHP;
  return {
    ...leveled,
    currentHP: Math.max(1, Math.round(maxHP * hpRatio)),
    conditions: injured ? [{ conditionId: "injured" as const, remainingDuration: 4 }] : [],
  };
}

describe("recovery economy robustness", () => {
  it("keeps realistic immediate recovery affordable relative to campaign income", () => {
    const milestones = [
      { id: "chieftain", questId: "goblin_chieftain_boss", level: 2, maxShare: 1.75 },
      { id: "morrowveil", questId: "morrowveil_drowned_archivist_boss", level: 7, maxShare: .50 },
      { id: "cassian", questId: "cassian_vane_boss", level: 11, maxShare: .35 },
      { id: "serekh", questId: "serekh_chartmaker_boss", level: 17, maxShare: .25 },
    ] as const;
    const classes = ["warrior", "ranger", "cleric", "mage"] as const;

    const rows = milestones.flatMap((milestone) =>
      (["standard", "veteran", "iron_guild"] as const).map((difficultyId) => {
        const quest = QUESTS[milestone.questId]!;
        const averageGold = Math.round((quest.goldRewardMin + quest.goldRewardMax) / 2 * getDifficulty(difficultyId).questGoldMultiplier);
        // Model a genuinely rough victory: all four heroes at about half HP, but
        // only one survivor carrying a treatable injury. Multiple concurrent
        // injuries are possible, but immediate Temple treatment is optional and
        // offline recovery provides the slower free alternative.
        const heroes = classes.map((classId, index) =>
          heroAtLevel(`${milestone.id}-${index}`, classId, milestone.level, .5, index === 0),
        );
        const healingGold = heroes.reduce((sum, hero) => sum + getHealingCost(hero), 0);
        const injuryGold = heroes.reduce((sum, hero) => sum + getConditionTreatmentCost(hero), 0);
        const fullRecoveryGold = healingGold + injuryGold;
        return {
          milestone: milestone.id,
          difficultyId,
          averageGold,
          healingGold,
          injuryGold,
          fullRecoveryGold,
          rewardShare: fullRecoveryGold / Math.max(1, averageGold),
          maxShare: milestone.maxShare,
        };
      }),
    );

    console.table(rows);
    expect(rows.every((row) => Number.isFinite(row.rewardShare) && row.fullRecoveryGold > 0)).toBe(true);
    for (const row of rows) {
      expect(
        row.rewardShare,
        `${row.milestone} ${row.difficultyId} rough-victory recovery share`,
      ).toBeLessThanOrEqual(row.maxShare);
    }
  });

  it("keeps a lighter wounded-party recovery below one early boss reward", () => {
    const quest = QUESTS.goblin_chieftain_boss!;
    const heroes = (["warrior", "ranger", "cleric", "mage"] as const).map((classId, index) =>
      heroAtLevel(`chieftain-light-${index}`, classId, 2, .75, index === 0),
    );
    const recoveryGold = heroes.reduce((sum, hero) => sum + getHealingCost(hero) + getConditionTreatmentCost(hero), 0);
    const standardAverageGold = Math.round((quest.goldRewardMin + quest.goldRewardMax) / 2);

    expect(recoveryGold).toBeLessThanOrEqual(standardAverageGold);
  });
});
