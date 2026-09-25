import { describe, expect, it } from "vitest";
import { CAMPAIGN_CHAPTERS, CAMPAIGN_NODES } from "../src/data/campaign/chapter1";
import { QUESTS } from "../src/data/quests/quests";
import { RAIDS } from "../src/data/raids/raids";
import { createDungeonDraft } from "../src/game/dungeons/dungeonDraftService";
import { createGuild } from "../src/game/guild/guildService";
import { getGuildCommandOrders } from "../src/game/guild/guildCommandCenterService";
import { getGuildPriority } from "../src/game/guild/guildPriorityService";
import { getEligibleOperationHeroIds, isGuildOperationsUnlocked } from "../src/game/operations/guildOperationService";
import { createGuildmasterProfile, grantGuildmasterXp, unlockGuildmasterSkill } from "../src/game/guildmaster/guildmasterProgression";
import { getCurrentUnlockNotices } from "../src/game/progression/unlockSummaryService";
import { completeTutorial } from "../src/game/onboarding/tutorialService";
import { completeCampaignNode, getAvailableCampaignNodes } from "../src/game/campaign/campaignService";
import { resolveCampaignChoice } from "../src/game/campaign/campaignChoiceResolver";
import { getQuestStartBlocker } from "../src/game/quests/questAvailability";
import { isRaidUnlocked } from "../src/game/raids/raidService";
import { canUnlockRegionalThreats } from "../src/game/world/regionalThreatService";
import { fullyTreatHero, getFullTreatmentCost, hasLocalHealingService, reviveHero } from "../src/game/temple/templeService";
import { createSeededRandom } from "../src/utils/random";
import { testHero } from "./testHero";

const roster = (count: number, level: number) => Array.from({ length: count }, (_, index) => ({
  ...testHero(),
  id: `journey-${index}`,
  name: `Journey Hero ${index + 1}`,
  level,
}));

function chapterOneGuild(heroCount: number, level = 2) {
  const guild = createGuild();
  guild.heroes = roster(heroCount, level);
  guild.world = {
    ...guild.world,
    campaignChapter: 2,
    completedCampaignNodeIds: [...CAMPAIGN_CHAPTERS[1]!.nodeIds],
  };
  return guild;
}

describe("end-to-end player journey guarantees", () => {
  it("hands completed guided recruitment into the founding choice and then a startable opening Campaign quest", () => {
    let guild = createGuild();
    guild.heroes = roster(2, 1);
    guild = completeTutorial(guild);

    const priority = getGuildPriority(guild);
    expect(priority.destination).toBe("campaign");

    const foundingNode = getAvailableCampaignNodes(guild.world)[0]!;
    expect(foundingNode.id).toBe("founding_the_guild");
    expect(foundingNode.questId).toBeUndefined();
    expect(foundingNode.choiceIds?.length).toBeGreaterThan(0);

    const choiceId = foundingNode.choiceIds![0]!;
    const chosenWorld = resolveCampaignChoice(guild.world, choiceId);
    const foundingResult = completeCampaignNode(chosenWorld, foundingNode.id);
    guild = { ...guild, world: foundingResult.worldState };

    const firstQuestNode = getAvailableCampaignNodes(guild.world)[0]!;
    expect(firstQuestNode.id).toBe("guildhaven_cellar_slimes");
    expect(firstQuestNode.questId).toBeTruthy();
    const quest = QUESTS[firstQuestNode.questId!]!;
    expect(quest.minPartySize).toBeLessThanOrEqual(guild.heroes.length);
    expect(getQuestStartBlocker(quest, guild.world, guild.heroes)).toBeNull();
  });

  it("earns enough Chapter 1 Guildmaster progression to open one workshop path", () => {
    const questIds = CAMPAIGN_CHAPTERS[1]!.nodeIds
      .map((nodeId) => CAMPAIGN_NODES[nodeId]?.questId)
      .filter((questId): questId is string => Boolean(questId));
    const guildmasterXp = questIds.reduce((sum, questId) => sum + QUESTS[questId]!.difficulty * 35, 0);

    let profile = grantGuildmasterXp(createGuildmasterProfile(), guildmasterXp);
    expect(profile.level).toBeGreaterThanOrEqual(3);
    expect(profile.skillPoints).toBeGreaterThanOrEqual(2);

    profile = unlockGuildmasterSkill(profile, "workshop_planning");
    profile = unlockGuildmasterSkill(profile, "forge_charter");
    expect(profile.unlockedSkillIds).toEqual(expect.arrayContaining(["workshop_planning", "forge_charter"]));
  });


  it("hands a workshop charter into construction and the first craft", () => {
    const guild = chapterOneGuild(6, 3);
    guild.guildmaster = { level: 3, xp: 0, skillPoints: 0, unlockedSkillIds: ["workshop_planning", "forge_charter"] };
    expect(getGuildCommandOrders(guild).map((order) => order.id)).toContain("workshop_construction_ready");

    guild.artisans.blacksmith = { level: 1, recruited: true, construction: null };
    guild.materials.iron_ore = 5;
    guild.materials.coal = 2;
    guild.materials.oak_timber = 1;
    const orders = getGuildCommandOrders(guild);
    expect(orders.map((order) => order.id)).toContain("first_craft_ready");
    expect(orders.find((order) => order.id === "first_craft_ready")?.destination).toBe("crafting");
  });

  it("keeps a first early-game death recoverable with the starting Temple economy", () => {
    const guild = createGuild();
    expect(hasLocalHealingService(guild.world)).toBe(true);
    guild.heroes = [{ ...testHero(), id: "fallen-journey", currentHP: 0, isAvailable: false }];

    const revived = reviveHero(guild, "fallen-journey", new Date("2026-09-24T12:00:00Z"));
    expect(revived.gems).toBe(0);
    expect(revived.heroes[0]!.currentHP).toBeGreaterThan(0);

    const treatmentCost = getFullTreatmentCost(revived.heroes[0]!);
    expect(treatmentCost).toBeGreaterThan(0);
    expect(treatmentCost).toBeLessThan(revived.gold);

    const recovered = fullyTreatHero(revived, "fallen-journey");
    expect(recovered.gold).toBe(revived.gold - treatmentCost);
    expect(recovered.heroes[0]).toMatchObject({ isAvailable: true, conditions: [] });
  });


  it("keeps post-Chapter-1 strategic modes informative but not falsely announced with four heroes", () => {
    const guild = chapterOneGuild(4);

    expect(isGuildOperationsUnlocked(guild)).toBe(true);
    expect(getEligibleOperationHeroIds(guild)).toHaveLength(4);
    expect(canUnlockRegionalThreats(guild.heroes)).toBe(false);
    expect(() => createDungeonDraft(guild, createSeededRandom(11))).toThrow(/6 owned heroes/);

    const noticeIds = getCurrentUnlockNotices(guild).map((notice) => notice.id);
    expect(noticeIds).not.toContain("system:gathering");
    expect(noticeIds).not.toContain("system:operations");
    expect(noticeIds).not.toContain("system:roguelite");
    expect(getGuildCommandOrders(guild).map((order) => order.id)).toContain("strategic_roster_expansion");
  });

  it("guides six owned but under-levelled heroes toward the strategic threshold", () => {
    const guild = chapterOneGuild(6, 1);
    expect(getGuildCommandOrders(guild).map((order) => order.id)).toContain("strategic_roster_training");
    expect(canUnlockRegionalThreats(guild.heroes)).toBe(false);
  });

  it("brings Operations, Roguelite Expeditions, and Regional Threat readiness together at six Level-2 heroes", () => {
    const guild = chapterOneGuild(6);

    expect(getGuildCommandOrders(guild).map((order) => order.id)).toContain("strategic_modes_ready");
    expect(getEligibleOperationHeroIds(guild)).toHaveLength(6);
    expect(canUnlockRegionalThreats(guild.heroes)).toBe(true);

    const draft = createDungeonDraft(guild, createSeededRandom(12));
    expect(draft.eligibleHeroIds).toHaveLength(6);
    expect(draft.offeredHeroIds).toHaveLength(3);

    const noticeIds = getCurrentUnlockNotices(guild).map((notice) => notice.id);
    expect(noticeIds).toContain("system:gathering");
    expect(noticeIds).toContain("system:operations");
    expect(noticeIds).toContain("system:roguelite");
  });

  it("does not unlock the first Raid until both its campaign chapter and eight-hero roster are ready", () => {
    const raid = RAIDS.broodheart_awakening!;
    const sevenHeroGuild = chapterOneGuild(7, 10);
    sevenHeroGuild.world.campaignChapter = raid.unlockChapter;
    expect(isRaidUnlocked(raid, sevenHeroGuild.world.campaignChapter, sevenHeroGuild.heroes.length)).toBe(false);

    const eightHeroGuild = chapterOneGuild(8, 10);
    eightHeroGuild.world.campaignChapter = raid.unlockChapter;
    expect(isRaidUnlocked(raid, eightHeroGuild.world.campaignChapter, eightHeroGuild.heroes.length)).toBe(true);
    expect(getCurrentUnlockNotices(eightHeroGuild).map((notice) => notice.id)).toContain(`raid:${raid.id}`);
  });
});
