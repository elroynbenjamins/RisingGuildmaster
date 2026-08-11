import { describe, expect, it } from "vitest";
import { CHAPTER_1 } from "../src/data/campaign/chapter1";
import { CHAPTER_2 } from "../src/data/campaign/chapter2";
import { BATTLEFIELDS } from "../src/data/combat/battlefields";
import { QUEST_ENCOUNTERS } from "../src/data/encounters/questEncounters";
import { ENEMIES } from "../src/data/enemies";
import { ENEMY_PORTRAITS } from "../src/data/enemies/enemyPortraits";
import { QUEST_EXPLORATION_STAGES } from "../src/data/quests/questExplorationStages";
import { QUESTS } from "../src/data/quests/quests";
import { isQuestAvailable } from "../src/game/quests/questAvailability";
import { createWorldState } from "../src/game/world/worldState";

describe("Blackbridge side story", () => {
  it("links optional quests to chapters one and two", () => {
    expect(CHAPTER_1.sideQuestIds).toEqual(["ashes_of_blackbridge"]);
    expect(CHAPTER_2.sideQuestIds).toEqual(["blackbridge_ledger", "oath_of_the_broken_bridge"]);
  });

  it("unlocks each sequel only after its explicit story evidence", () => {
    const starting = createWorldState();
    expect(isQuestAvailable(QUESTS.ashes_of_blackbridge!, starting)).toBe(false);
    const founded = { ...starting, completedCampaignNodeIds: ["founding_the_guild"] };
    expect(isQuestAvailable(QUESTS.ashes_of_blackbridge!, founded)).toBe(true);
    const chapterTwo = { ...founded, completedCampaignNodeIds: [...founded.completedCampaignNodeIds, "council_of_splinters"], completedQuestIds: ["ashes_of_blackbridge"], worldFlags: { blackbridge_half_ledger_found: true } };
    expect(isQuestAvailable(QUESTS.blackbridge_ledger!, chapterTwo)).toBe(true);
    expect(isQuestAvailable(QUESTS.oath_of_the_broken_bridge!, chapterTwo)).toBe(false);
  });

  it("keeps enemy, skill, portrait, encounter, map and D20 stage references complete", () => {
    const enemyIds = ["carrion_crow_swarm", "goblin_sapper", "blackbridge_wraith", "iron_laurel_enforcer", "heartstone_revenant"];
    enemyIds.forEach((id) => expect(ENEMIES[id]).toBeDefined());
    Object.keys(ENEMIES).forEach((id) => expect(ENEMY_PORTRAITS[id], `missing portrait for ${id}`).toBeDefined());
    ["ashes_of_blackbridge", "blackbridge_ledger", "oath_of_the_broken_bridge"].forEach((questId) => {
      const quest = QUESTS[questId]!;
      quest.explorationStageIds?.forEach((id) => expect(QUEST_EXPLORATION_STAGES[id]?.questId).toBe(questId));
      quest.encounterIds.forEach((id) => expect(BATTLEFIELDS[QUEST_ENCOUNTERS[id]!.battlefieldId]).toBeDefined());
    });
  });

  it("sets persistent evidence flags on victory", () => {
    expect(QUESTS.ashes_of_blackbridge?.setWorldFlagsOnVictory).toEqual({ blackbridge_half_ledger_found: true });
    expect(QUESTS.oath_of_the_broken_bridge?.setWorldFlagsOnVictory).toMatchObject({ blackbridge_truth_recovered: true, iron_laurel_blackbridge_exposed: true });
  });
});
