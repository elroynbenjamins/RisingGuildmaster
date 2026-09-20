import { describe, expect, it } from "vitest";
import { calculateHeroXpGain, getEquipmentRewardPresentation, getHeroQuestProgressPresentation } from "../src/game/quests/questRewardPresentationService";
import type { QuestHeroOutcomeRecord } from "../src/game/quests/questChronicleTypes";
import { xpRequiredForNextLevel } from "../src/game/progression/xpSystem";

function outcome(overrides: Partial<QuestHeroOutcomeRecord> = {}): QuestHeroOutcomeRecord {
  return {
    heroId: "hero-1",
    name: "Aster",
    raceId: "human",
    classId: "warrior",
    gender: "female",
    portraitVariant: 0,
    levelBefore: 3,
    levelAfter: 3,
    xpBefore: 100,
    xpAfter: 350,
    xpEarned: 250,
    currentHP: 50,
    maxHP: 80,
    conditionIds: [],
    availableSkillPoints: 0,
    availableSkillPointsBefore: 0,
    availableSkillPointsAfter: 0,
    fellInBattle: false,
    newlyInjured: false,
    ...overrides,
  };
}

describe("quest reward presentation", () => {
  it("calculates XP across a level wrap", () => {
    const needed = xpRequiredForNextLevel(3);
    expect(calculateHeroXpGain(3, needed - 100, 4, 75)).toBe(175);
  });

  it("surfaces level, subclass and class-skill milestones", () => {
    const result = getHeroQuestProgressPresentation(outcome({
      levelBefore: 4,
      levelAfter: 5,
      xpBefore: xpRequiredForNextLevel(4) - 25,
      xpAfter: 40,
      xpEarned: 65,
      availableSkillPointsBefore: 1,
      availableSkillPointsAfter: 2,
      availableSkillPoints: 2,
    }));
    expect(result.levelled).toBe(true);
    expect(result.newSkillPoints).toBe(1);
    expect(result.milestoneLabels).toContain("SUBCLASS CHOICE UNLOCKED");
    expect(result.milestoneLabels).toContain("1 CLASS SKILL POINT EARNED");
  });

  it("uses equipment rarity for loot reveal hierarchy", () => {
    const rare = getEquipmentRewardPresentation("wardens-oathblade");
    expect(rare?.rarity).toBe("rare");
    expect(rare?.name).toBe("Warden's Oathblade");
  });
});
