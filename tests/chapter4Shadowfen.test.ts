import { describe, expect, it } from "vitest";
import { CHAPTER_2 } from "../src/data/campaign/chapter2";
import { CHAPTER_3, CHAPTER_3_NODES } from "../src/data/campaign/chapter3";
import { CHAPTER_4, CHAPTER_4_NODES } from "../src/data/campaign/chapter4";
import { BATTLEFIELDS } from "../src/data/combat/battlefields";
import { CRAFTING_RECIPES } from "../src/data/crafting/recipes";
import { QUEST_ENCOUNTERS } from "../src/data/encounters/questEncounters";
import { ENEMIES } from "../src/data/enemies";
import { ENEMY_PORTRAITS } from "../src/data/enemies/enemyPortraits";
import { EQUIPMENT } from "../src/data/equipment/equipment";
import { QUESTS } from "../src/data/quests/quests";
import { GENERATED_SKILL_ICON_ART } from "../src/data/skills/generatedSkillIconArt";
import { getQuestXpForHero } from "../src/game/quests/questResolver";
import { testHero } from "./testHero";

describe("Chapter 4 Shadowfen campaign", () => {
  it("keeps Chapters 2-4 on the intended low-level campaign curve", () => {
    expect(CHAPTER_2).toMatchObject({ recommendedLevelMin: 3, recommendedLevelMax: 5 });
    expect(CHAPTER_3).toMatchObject({ recommendedLevelMin: 5, recommendedLevelMax: 6 });
    expect(CHAPTER_4).toMatchObject({ recommendedLevelMin: 6, recommendedLevelMax: 7 });
    for (const quest of Object.values(QUESTS).filter((entry) => entry.campaignChapter === 3)) expect(quest.recommendedLevelMax).toBeLessThanOrEqual(6);
    for (const quest of Object.values(QUESTS).filter((entry) => entry.campaignChapter === 4)) expect(quest.recommendedLevelMax).toBeLessThanOrEqual(7);
    const chapterFourEncounterIds = Object.values(QUESTS).filter((entry) => entry.campaignChapter === 4).flatMap((entry) => entry.encounterIds);
    for (const encounter of chapterFourEncounterIds.map((id) => QUEST_ENCOUNTERS[id]!)) {
      encounter.enemies.forEach((enemy) => expect(enemy.level).toBeLessThanOrEqual(7));
    }
  });

  it("follows Chapter 3 with an ordered eight-node story and unlocks Ashlands", () => {
    expect(CHAPTER_4.nodeIds).toHaveLength(8);
    CHAPTER_4.nodeIds.forEach((id, index) => expect(CHAPTER_4_NODES[id]?.prerequisiteNodeIds).toEqual(index ? [CHAPTER_4.nodeIds[index - 1]] : [CHAPTER_3.nodeIds.at(-1)]));
    expect(CHAPTER_4_NODES.drowned_archivist_boss).toMatchObject({ unlockRegionIds: ["ashlands"], setWorldFlags: { chapter_4_complete: true, ashlands_unlocked: true } });
    expect(CHAPTER_3_NODES.vaelith_boss?.setWorldFlags).toMatchObject({ vaelith_freed: true });
  });

  it("smooths the two long attrition missions without reducing hero XP", () => {
    expect(QUESTS.procession_at_low_water).toMatchObject({ betweenEncounterHpRecoveryRatio: .10, xpRewardPerHero: 1185 });
    expect(QUESTS.archive_below).toMatchObject({ betweenEncounterHpRecoveryRatio: .10, xpRewardPerHero: 1217 });
    expect(QUEST_ENCOUNTERS.low_water_procession_one?.enemies.reduce((sum, group) => sum + group.count, 0)).toBe(4);
    expect(QUEST_ENCOUNTERS.low_water_procession_two?.enemies.reduce((sum, group) => sum + group.count, 0)).toBe(4);
    expect(QUEST_ENCOUNTERS.low_water_procession_final?.enemies.reduce((sum, group) => sum + group.count, 0)).toBe(5);
    expect(QUEST_ENCOUNTERS.archive_drowned_stacks?.enemies.reduce((sum, group) => sum + group.count, 0)).toBe(4);
    expect(QUEST_ENCOUNTERS.archive_memory_vault?.enemies.reduce((sum, group) => sum + group.count, 0)).toBe(4);
    expect(getQuestXpForHero({ ...testHero(), level: 6 }, QUESTS.procession_at_low_water!, 4)).toBe(2753);
    expect(getQuestXpForHero({ ...testHero(), level: 7 }, QUESTS.archive_below!, 4)).toBe(2359);
  });

  it("keeps the Chapter 4 opening loot one tier behind rather than falling back to obsolete gear", () => {
    const itemIds = QUEST_LOOT_TABLES.deep_shadowfen_loot!.itemIds;
    expect(itemIds).toEqual(expect.arrayContaining(["shadowweave-mantle", "ironheart-amulet", "sapphire-ward-ring"]));
    expect(itemIds.every((id) => EQUIPMENT[id]?.levelRequirement === 5)).toBe(true);
  });

  it("gives both side quests and both bosses persistent recipe rewards", () => {
    for (const questId of ["lanterns_for_the_lost", "the_house_that_remembers", "bell_widow_boss", "morrowveil_drowned_archivist_boss"]) {
      const quest = QUESTS[questId]!;
      expect(quest.recipeUnlockIdsOnVictory).toHaveLength(1);
      const recipe = CRAFTING_RECIPES[quest.recipeUnlockIdsOnVictory![0]!]!;
      expect(recipe).toBeDefined();
      expect(EQUIPMENT[recipe.outputEquipmentId]).toBeDefined();
    }
  });

  it("uses authored warfront maps, portraits and standalone skill icons", () => {
    for (const questId of [...CHAPTER_4.sideQuestIds!, "bell_widow_boss", "morrowveil_drowned_archivist_boss"]) {
      for (const encounterId of QUESTS[questId]!.encounterIds) expect(BATTLEFIELDS[QUEST_ENCOUNTERS[encounterId]!.battlefieldId]?.boardSizeId).toBe("warfront");
    }
    for (const id of ["mire_lurker", "drowned_legionnaire", "gravewater_hexer", "bell_widow", "morrowveil_archivist"]) {
      expect(ENEMY_PORTRAITS[id]).toBeDefined();
      ENEMIES[id]!.skillIds.forEach((skillId) => expect(GENERATED_SKILL_ICON_ART[skillId]).toBeDefined());
    }
  });
});
