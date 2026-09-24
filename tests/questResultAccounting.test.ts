import { describe, expect, it } from "vitest";
import { QUESTS } from "../src/data/quests/quests";
import { createGuild } from "../src/game/guild/guildService";
import { buildQuestHeroOutcomes, buildQuestRewardAccounting, reconcileQuestHeroOutcomeAfterProgression } from "../src/game/quests/questResultAccountingService";
import { xpRequiredForNextLevel } from "../src/game/progression/xpSystem";
import { testHero } from "./testHero";

describe("quest result accounting handoff", () => {
  it("records exact XP, level and specific injury changes for result presentation", () => {
    const before = { ...testHero(), id: "hero-a", name: "Aster", level: 3, xp: xpRequiredForNextLevel(3) - 40, conditions: [] };
    const after = {
      ...before,
      level: 4,
      xp: 75,
      currentHP: 0,
      conditions: [{ conditionId: "broken_arm" as const, remainingDuration: 8 }],
    };

    const [outcome] = buildQuestHeroOutcomes([before], [after], [before.id]);
    expect(outcome).toMatchObject({
      heroId: "hero-a",
      levelBefore: 3,
      levelAfter: 4,
      xpBefore: xpRequiredForNextLevel(3) - 40,
      xpAfter: 75,
      xpEarned: 115,
      fellInBattle: true,
      newlyInjured: true,
    });
    expect(outcome?.conditionIds).toContain("broken_arm");
  });

  it("recalculates explicit XP totals when a campaign choice releases banked levels", () => {
    const before = { ...testHero(), id: "banked", level: 4, xp: xpRequiredForNextLevel(4) - 20 };
    const baseOutcome = buildQuestHeroOutcomes([before], [{ ...before, xp: before.xp + 10 }], [before.id])[0]!;
    const afterChoice = { ...before, level: 5, xp: 35 };
    const reconciled = reconcileQuestHeroOutcomeAfterProgression(baseOutcome, afterChoice);

    expect(reconciled.levelAfter).toBe(5);
    expect(reconciled.xpAfter).toBe(35);
    expect(reconciled.xpEarned).toBe(55);
  });

  it("reports all banked quest and chapter rewards before End Day processing", () => {
    const before = createGuild();
    const rewarded = {
      ...before,
      gold: before.gold + 375,
      reputation: before.reputation + 9,
      guildmaster: { ...before.guildmaster, level: 2, xp: 15, skillPoints: before.guildmaster.skillPoints + 1 },
      world: { ...before.world, campaignChapter: before.world.campaignChapter + 1 },
    };

    const accounting = buildQuestRewardAccounting(before, rewarded, QUESTS.goblin_chieftain_boss!, "victory");
    expect(accounting).toMatchObject({
      goldEarned: 375,
      reputationEarned: 9,
      guildmasterXpEarned: QUESTS.goblin_chieftain_boss!.difficulty * 35,
      guildmasterLevelBefore: 1,
      guildmasterLevelAfter: 2,
      guildmasterSkillPointsBefore: 0,
      guildmasterSkillPointsAfter: 1,
      campaignChapterCompleted: 1,
    });
  });

  it("does not invent victory rewards on defeat", () => {
    const before = createGuild();
    const accounting = buildQuestRewardAccounting(before, before, QUESTS.guildhaven_cellar_slimes!, "defeat");
    expect(accounting.goldEarned).toBe(0);
    expect(accounting.reputationEarned).toBe(0);
    expect(accounting.guildmasterXpEarned).toBe(0);
    expect(accounting.campaignChapterCompleted).toBeUndefined();
  });
});
