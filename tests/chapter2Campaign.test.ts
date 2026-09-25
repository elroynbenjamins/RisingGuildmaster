import { describe, expect, it } from "vitest";
import { BOSS_PHASES } from "../src/data/bosses/bossPhases";
import { CAMPAIGN_NODES, CHAPTER_1 } from "../src/data/campaign/chapter1";
import { CHAPTER_2 } from "../src/data/campaign/chapter2";
import { QUEST_ENCOUNTERS } from "../src/data/encounters/questEncounters";
import { ENEMIES } from "../src/data/enemies";
import { QUESTS } from "../src/data/quests/quests";
import { resolveNewBossPhases } from "../src/game/bosses/bossPhaseService";
import { completeCampaignNode, getAvailableCampaignNodes } from "../src/game/campaign/campaignService";
import { resolveCampaignChoice } from "../src/game/campaign/campaignChoiceResolver";
import { createEnemyInstance } from "../src/game/enemies/enemyFactory";
import { ENEMY_SKILLS } from "../src/data/skills/enemySkills";
import { createWorldState } from "../src/game/world/worldState";
import { createSeededRandom } from "../src/utils/random";
import { grantHeroXp } from "../src/game/progression/levelSystem";
import { getQuestXpForHero } from "../src/game/quests/questResolver";
import { testHero } from "./testHero";

const base = { hp: 100, physicalDamage: 20, physicalDefense: 15, magicDamage: 18, magicDefense: 15, speed: 18 };

describe("Chapter 2: The Hollow Forge", () => {
  it("provides a midpoint and final boss", () => {
    expect(CHAPTER_2.nodeIds).toHaveLength(8);
    expect(CAMPAIGN_NODES.chainbreaker_boss).toMatchObject({ type: "boss", questId: "ghorak_chainbreaker_boss" });
    expect(CAMPAIGN_NODES.hollow_warden_boss).toMatchObject({ type: "boss", questId: "hollow_warden_boss" });
    expect(ENEMIES.ghorak_chainbreaker?.role).toBe("mini_boss");
    expect(ENEMIES.hollow_warden?.hpModifier).toBe(1.6);
  });
  it("resolves every Chapter 2 quest and encounter reference", () => {
    for (const nodeId of CHAPTER_2.nodeIds) { const questId = CAMPAIGN_NODES[nodeId]?.questId; if (!questId) continue; const quest = QUESTS[questId]; expect(quest).toBeDefined(); expect(quest?.encounterIds.every((id) => QUEST_ENCOUNTERS[id])).toBe(true); }
  });
  it("progresses through Chapter 2, rewards completion, and unlocks Frostmarch", () => {
    let world = createWorldState();
    // This chapter-level fixture has already completed the starter journey.
    world.worldFlags.starter_brambleford_side_quest_complete = true;
    world.worldFlags.starter_fourth_hero_ready = true;
    for (const id of CHAPTER_1.nodeIds) world = completeCampaignNode(world, id).worldState;
    expect(getAvailableCampaignNodes(world).map((node) => node.id)).toEqual(["council_of_splinters"]);
    for (const id of CHAPTER_2.nodeIds.slice(0, -1)) { if (id === "voices_under_stone") world = resolveCampaignChoice(world, "share_stonegate_evidence"); if (id === "chainbreaker_boss") world = resolveCampaignChoice(world, "free_ghoraks_clan"); world = completeCampaignNode(world, id).worldState; }
    world = resolveCampaignChoice(world, "restore_iron_wardstone");
    const finale = completeCampaignNode(world, "hollow_warden_boss");
    expect(finale).toMatchObject({ goldReward: 900, guildReputationReward: 20 });
    expect(finale.worldState).toMatchObject({ campaignChapter: 3, worldFlags: { chapter_2_complete: true, heartstone_restored: true } });
    expect(finale.worldState.unlockedRegionIds).toContain("frostmarch");
  });
  it("presents the Hollow Warden as a true Level-5 chapter finale", () => {
    expect(QUESTS.hollow_warden_boss).toMatchObject({
      recommendedLevelMin: 5,
      recommendedLevelMax: 5,
      minimumPartyAverageLevel: 5,
      minPartySize: 4,
      maxPartySize: 4,
    });
    expect(QUESTS.hollow_warden_boss?.preparationNotes).toEqual(expect.arrayContaining([
      expect.stringContaining("Level 5"),
      expect.stringContaining("healing or support"),
    ]));
  });

  it("reaches Chapter-2 boss levels with two authored catch-up quests instead of repeat grinding", () => {
    let hero = { ...testHero(), level: 3, xp: 0 };
    const award = (questId: keyof typeof QUESTS) => {
      const quest = QUESTS[questId]!;
      hero = grantHeroXp(hero, getQuestXpForHero(hero, quest, 4));
    };

    award("road_of_broken_carts");
    award("night_of_thirteen_ladders");
    award("fires_of_flintwatch");
    expect(hero.level).toBeGreaterThanOrEqual(4);

    award("ghorak_chainbreaker_boss");
    award("last_lift_of_flintwatch");
    award("descent_to_hollow_forge");
    expect(hero.level).toBeGreaterThanOrEqual(5);
  });

  it("gives the final boss three escalating data-driven phases", () => {
    const warden = createEnemyInstance("hollow_warden", base, createSeededRandom(12));
    const phases = resolveNewBossPhases({ ...warden, currentHP: warden.maxHP * .24 });
    expect(phases.triggeredPhaseIds).toEqual(["warden_calls_sentries", "warden_releases_wisps", "warden_final_judgment"]);
    expect(BOSS_PHASES.warden_calls_sentries?.summonGroups).toEqual([{ enemyDefinitionId: "ironbound_sentry", count: 2 }]);
    expect(ENEMY_SKILLS.warden_judgment_protocol?.conditionalModifiers).toHaveLength(3);
  });
});
