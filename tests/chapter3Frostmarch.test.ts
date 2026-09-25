import { describe, expect, it } from "vitest";
import { CHAPTER_3, CHAPTER_3_NODES } from "../src/data/campaign/chapter3";
import { BATTLEFIELDS } from "../src/data/combat/battlefields";
import { QUEST_ENCOUNTERS } from "../src/data/encounters/questEncounters";
import { ENEMIES } from "../src/data/enemies";
import { ENEMY_PORTRAITS } from "../src/data/enemies/enemyPortraits";
import { QUESTS } from "../src/data/quests/quests";
import { getSkillIconArt } from "../src/data/skills/skillArt";
import { createGuild } from "../src/game/guild/guildService";
import { recoverAdventureStamina, spendPartyAdventureStamina } from "../src/game/heroes/adventureStaminaService";
import { testHero } from "./testHero";

describe("Chapter 3 Frostmarch campaign", () => {
  it("provides an ordered eight-node campaign and three staged regional side quests", () => {
    expect(CHAPTER_3.nodeIds).toHaveLength(8);
    expect(CHAPTER_3.sideQuestIds).toEqual(["the_aurora_that_fell", "the_last_guestfire", "bells_beneath_glimmerlake"]);
    CHAPTER_3.nodeIds.forEach((id, index) => expect(CHAPTER_3_NODES[id]?.prerequisiteNodeIds).toEqual(index ? [CHAPTER_3.nodeIds[index - 1]] : ["hollow_warden_boss"]));
    CHAPTER_3.sideQuestIds!.forEach((id) => expect(QUESTS[id]).toMatchObject({ questType: "side", regionId: "frostmarch", minPartySize: 4 }));
    expect(QUESTS.the_aurora_that_fell).toMatchObject({ campaignChapter: 3, prerequisiteCampaignNodeIds: ["northwatch_two_skies"] });
  });
  it("builds Northwatch as a three-wave warfront defense with controlled recovery", () => {
    const quest = QUESTS.night_of_blue_horns!;
    expect(quest.encounterIds).toEqual(["northwatch_wall_wave_one", "northwatch_wall_wave_two", "northwatch_wall_wave_three"]);
    expect(quest.betweenEncounterHealthRecoveryRatio).toBe(.15);
    for (const id of quest.encounterIds) expect(BATTLEFIELDS[QUEST_ENCOUNTERS[id]!.battlefieldId]?.boardSizeId).toBe("warfront");
    expect(QUEST_ENCOUNTERS.northwatch_wall_wave_one?.enemies.reduce((sum, group) => sum + group.count, 0)).toBe(5);
    expect(QUEST_ENCOUNTERS.northwatch_wall_wave_two?.enemies.reduce((sum, group) => sum + group.count, 0)).toBe(4);
    expect(QUEST_ENCOUNTERS.northwatch_wall_wave_three?.enemies.reduce((sum, group) => sum + group.count, 0)).toBe(5);
  });
  it("lets one four-hero core run Frozen Names, Blue Horns, then Hroth without a forced readiness rest day", () => {
    let guild = createGuild();
    guild.heroes = Array.from({ length: 4 }, (_, index) => ({ ...testHero(), id: `frostmarch-core-${index}`, level: 5 }));
    const heroIds = guild.heroes.map((hero) => hero.id);
    for (const questId of ["road_of_frozen_names", "night_of_blue_horns"] as const) {
      guild = spendPartyAdventureStamina(guild, heroIds, QUESTS[questId]!);
      guild = recoverAdventureStamina(guild);
    }
    expect(guild.heroes.every((hero) => hero.adventureStamina >= 60)).toBe(true);
    guild = spendPartyAdventureStamina(guild, heroIds, QUESTS.hroth_iceblood_boss!);
    expect(guild.heroes.every((hero) => hero.adventureStamina >= 0)).toBe(true);
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
