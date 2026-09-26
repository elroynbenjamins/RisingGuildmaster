import { describe, expect, it } from "vitest";
import { CHAPTER_3, CHAPTER_3_NODES } from "../src/data/campaign/chapter3";
import { BATTLEFIELDS } from "../src/data/combat/battlefields";
import { QUEST_ENCOUNTERS } from "../src/data/encounters/questEncounters";
import { ENEMIES } from "../src/data/enemies";
import { ENEMY_PORTRAITS } from "../src/data/enemies/enemyPortraits";
import { QUESTS } from "../src/data/quests/quests";
import { QUEST_LOOT_TABLES } from "../src/data/loot/questLootTables";
import { EQUIPMENT } from "../src/data/equipment/equipment";
import { getSkillIconArt } from "../src/data/skills/skillArt";
import { BOSS_PHASES } from "../src/data/bosses/bossPhases";

describe("Chapter 3 Frostmarch campaign", () => {
  it("provides an ordered eight-node campaign and three staged regional side quests", () => {
    expect(CHAPTER_3.nodeIds).toHaveLength(8);
    expect(CHAPTER_3.sideQuestIds).toEqual(["the_aurora_that_fell", "the_last_guestfire", "bells_beneath_glimmerlake"]);
    CHAPTER_3.nodeIds.forEach((id, index) => expect(CHAPTER_3_NODES[id]?.prerequisiteNodeIds).toEqual(index ? [CHAPTER_3.nodeIds[index - 1]] : ["hollow_warden_boss"]));
    CHAPTER_3.sideQuestIds!.forEach((id) => expect(QUESTS[id]).toMatchObject({ questType: "side", regionId: "frostmarch", minPartySize: 4 }));
    expect(QUESTS.the_aurora_that_fell).toMatchObject({ campaignChapter: 3, prerequisiteCampaignNodeIds: ["northwatch_two_skies"] });
  });
  it("builds Northwatch as a three-wave warfront defense with short healer breaks", () => {
    expect(QUESTS.night_of_blue_horns?.encounterIds).toEqual(["northwatch_wall_wave_one", "northwatch_wall_wave_two", "northwatch_wall_wave_three"]);
    expect(QUESTS.night_of_blue_horns?.betweenEncounterHpRecoveryRatio).toBe(.10);
    expect(QUESTS.night_of_blue_horns?.preparationNotes).toEqual(expect.arrayContaining([expect.stringContaining("10% maximum HP"), expect.stringContaining("Frost-resistant cloak")]));
    for (const id of QUESTS.night_of_blue_horns!.encounterIds) expect(BATTLEFIELDS[QUEST_ENCOUNTERS[id]!.battlefieldId]?.boardSizeId).toBe("warfront");
    expect(QUEST_ENCOUNTERS.northwatch_wall_wave_one?.enemies.reduce((sum, group) => sum + group.count, 0)).toBe(4);
    expect(QUEST_ENCOUNTERS.northwatch_wall_wave_two?.enemies.reduce((sum, group) => sum + group.count, 0)).toBe(4);
    expect(QUEST_ENCOUNTERS.northwatch_wall_wave_three?.enemies.reduce((sum, group) => sum + group.count, 0)).toBe(5);
  });
  it("starts Frostmarch with Level-5 equipment choices across multiple roles", () => {
    const ids = QUEST_LOOT_TABLES.frostmarch_campaign_loot!.itemIds;
    expect(ids).toEqual(expect.arrayContaining(["wardplate", "spellweaver-hood", "wardmarch-boots", "sapphire-ward-ring"]));
    expect(ids.every((id) => EQUIPMENT[id]?.levelRequirement === 5)).toBe(true);
  });

  it("gives Vaelith a real two-stage finale escalation", () => {
    expect(BOSS_PHASES.vaelith_pale_wind?.summonGroups).toEqual([{ enemyDefinitionId: "aurora_seer", count: 1 }]);
    expect(BOSS_PHASES.vaelith_crown_echo?.heroPulseDamageMaxHpRatio).toBe(.08);
  });

  it("defeats an echo rather than killing a true frost drake", () => {
    expect(ENEMIES.vaelith_pale_echo?.name).toContain("Echo");
    expect(CHAPTER_3_NODES.vaelith_boss?.setWorldFlags).toMatchObject({ vaelith_echo_broken: true, vaelith_freed: true });
  });
  it("covers new combatants with bitmap portraits and skill art", () => {
    for (const id of ["rimefang_wolf", "icebound_warden", "aurora_seer", "hroth_iceblood", "vaelith_pale_echo"]) {
      expect(ENEMY_PORTRAITS[id]).toBeDefined();
      ENEMIES[id]!.skillIds.forEach((skillId) => expect(getSkillIconArt(skillId).atlas).toBe("frostmarchChapter3"));
    }
  });
});
