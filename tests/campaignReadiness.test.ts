import { describe, expect, it } from "vitest";
import { QUESTS } from "../src/data/quests/quests";
import { getCampaignLevelGuidance, getTopHeroAverageLevel } from "../src/game/campaign/campaignReadinessService";
import { createGuild } from "../src/game/guild/guildService";
import { testHero } from "./testHero";

const chapterOneToAttack = [
  "founding_the_guild",
  "guildhaven_cellar_slimes",
  "rats_beneath_guildhaven",
  "campaign_goblin_patrol",
  "missing_merchant",
  "strange_tracks",
  "attack_on_guildhaven",
];

function roster(levels: number[]) {
  return levels.map((level, index) => ({ ...testHero(), id: `readiness-${index}`, name: `Hero ${index + 1}`, level }));
}

describe("campaign level guidance", () => {
  it("uses the average of the four highest-level heroes", () => {
    expect(getTopHeroAverageLevel(roster([9, 1, 7, 5, 3, 8]))).toBe(7.25);
  });

  it("does not push side quests before the player reaches the Chieftain stage", () => {
    const guild = createGuild();
    guild.heroes = roster([1, 1, 1, 1]);
    guild.world.completedCampaignNodeIds = chapterOneToAttack.slice(0, -1);
    expect(getCampaignLevelGuidance(guild)).toBeNull();
  });

  it("recommends one-time local side quests when the top four fall below the next campaign minimum", () => {
    const guild = createGuild();
    guild.heroes = roster([1, 1, 1, 1]);
    guild.world.completedCampaignNodeIds = [...chapterOneToAttack];

    const guidance = getCampaignLevelGuidance(guild);
    expect(guidance).toMatchObject({ averageLevel: 1, targetLevel: 2, nextQuestId: "goblin_chieftain_boss" });
    expect(guidance?.sideQuestIds.length).toBeGreaterThan(0);
    for (const questId of guidance?.sideQuestIds ?? []) {
      const quest = QUESTS[questId]!;
      expect(quest).toMatchObject({ questType: "side", repeatable: false });
      expect(quest.hiddenFromQuestBoard).not.toBe(true);
      expect(quest.settlementIds?.length).toBeGreaterThan(0);
    }
  });

  it("stops recommending catch-up work once the top four match the campaign target", () => {
    const guild = createGuild();
    guild.heroes = roster([2, 2, 2, 2]);
    guild.world.completedCampaignNodeIds = [...chapterOneToAttack];
    expect(getCampaignLevelGuidance(guild)).toBeNull();
  });
});
