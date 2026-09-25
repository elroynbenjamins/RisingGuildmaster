import { describe, expect, it } from "vitest";
import { CHAPTER_2, CHAPTER_2_NODES } from "../src/data/campaign/chapter2";
import { BATTLEFIELDS } from "../src/data/combat/battlefields";
import { QUEST_ENCOUNTERS } from "../src/data/encounters/questEncounters";
import { ENEMIES } from "../src/data/enemies";
import { QUEST_LOOT_TABLES } from "../src/data/loot/questLootTables";
import { getQuestDialogue } from "../src/data/quests/questDialogue";
import { QUEST_EXPLORATION_STAGES } from "../src/data/quests/questExplorationStages";
import { QUEST_OUTCOME_NARRATIVES } from "../src/data/quests/questOutcomeNarratives";
import { QUESTS } from "../src/data/quests/quests";
import { LORE_ENTRIES } from "../src/data/world/lore";
import { REGIONS } from "../src/data/world/regions";
import { isQuestAvailable } from "../src/game/quests/questAvailability";
import { createQuestEncounter } from "../src/game/quests/encounterFactory";
import { advanceRegionalThreats, getRegionThreatEffects, resolveRegionalThreatForQuest, unlockRegionalThreats } from "../src/game/world/regionalThreatService";
import { createWorldState } from "../src/game/world/worldState";
import type { WorldState } from "../src/game/world/worldTypes";
import { createSeededRandom } from "../src/utils/random";

describe("The Aurora That Fell regional crisis", () => {
  it("foreshadows Frostmarch in Chapter 2, then stages the crisis after the Chapter 3 introduction", () => {
    const voices = CHAPTER_2_NODES.voices_under_stone!;
    expect(voices.unlockRegionIds ?? []).not.toContain("frostmarch");
    expect(voices.setWorldFlags).toMatchObject({ frostmarch_aurora_crisis: true });
    expect(CHAPTER_2.sideQuestIds).not.toContain("the_aurora_that_fell");
    expect(CHAPTER_2_NODES.hollow_warden_boss?.unlockRegionIds).toContain("frostmarch");

    const chapterThreeOpening = {
      ...createWorldState(),
      campaignChapter: 3,
      unlockedRegionIds: ["greenveil", "iron_hills", "shadowfen", "frostmarch"],
      completedCampaignNodeIds: ["hollow_warden_boss"],
      worldFlags: { frostmarch_aurora_crisis: true },
    };
    expect(isQuestAvailable(QUESTS.the_aurora_that_fell!, chapterThreeOpening)).toBe(false);
    expect(isQuestAvailable(QUESTS.the_aurora_that_fell!, {
      ...chapterThreeOpening,
      completedCampaignNodeIds: [...chapterThreeOpening.completedCampaignNodeIds, "northwatch_two_skies"],
    })).toBe(true);
  });

  it("connects three D20 stages, two unique warfront maps, encounters, loot, lore, and dialogue", () => {
    const quest = QUESTS.the_aurora_that_fell!;
    expect(quest).toMatchObject({ regionId: "frostmarch", campaignChapter: 3, minPartySize: 4, maxPartySize: 4 });
    expect(quest.explorationStageIds).toHaveLength(3);
    expect(quest.explorationStageIds!.map((id) => QUEST_EXPLORATION_STAGES[id]!.attribute)).toEqual(["intelligence", "charisma", "constitution"]);
    expect(quest.explorationStageIds!.map((id) => QUEST_EXPLORATION_STAGES[id]!.difficultyClass)).toEqual([14, 15, 16]);
    expect(quest.encounterIds).toHaveLength(2);
    for (const encounterId of quest.encounterIds) {
      const encounter = QUEST_ENCOUNTERS[encounterId]!;
      expect(encounter).toBeDefined();
      expect(BATTLEFIELDS[encounter.battlefieldId]?.boardSizeId).toBe("warfront");
      expect(encounter.enemies.every((group) => ENEMIES[group.enemyDefinitionId])).toBe(true);
    }
    expect(QUEST_LOOT_TABLES[quest.lootTableId]).toBeDefined();
    expect(REGIONS.frostmarch?.questPoolIds).toContain(quest.id);
    expect(QUEST_OUTCOME_NARRATIVES[quest.id]?.journalUpdate).toContain("Ashlands");
    expect(LORE_ENTRIES.fallen_aurora?.perspectives).toHaveLength(3);
    expect(getQuestDialogue(quest.id).briefing).toHaveLength(3);
    expect(getQuestDialogue(quest.id).victory).toHaveLength(3);
  });

  it("escalates every five days, closes Northwatch at Threat 4, and clears on victory", () => {
    let world: WorldState = unlockRegionalThreats({ ...createWorldState(), worldFlags: { frostmarch_aurora_crisis: true } });
    world = advanceRegionalThreats(world, 10);
    expect(world.regionThreat?.frostmarch).toBe(2);
    expect(getRegionThreatEffects(world, "frostmarch").enemyLevelModifier).toBe(1);
    expect(createQuestEncounter("fallen_aurora_road", createSeededRandom(4), "standard", 1)[0]?.instance.level).toBe(6);
    world = advanceRegionalThreats(world, 10);
    expect(getRegionThreatEffects(world, "frostmarch").unavailableSettlementIds).toEqual(["northwatch"]);

    world = { ...world, completedQuestIds: [...world.completedQuestIds, "the_aurora_that_fell"] };
    world = resolveRegionalThreatForQuest(world, "the_aurora_that_fell");
    expect(world.regionThreat?.frostmarch).toBe(0);
    expect(world.worldFlags.frostmarch_threat_resolved).toBe(true);
    expect(getRegionThreatEffects(world, "frostmarch").unavailableSettlementIds).toEqual([]);
  });
});
