import { describe, expect, it } from "vitest";
import { QUESTS } from "../src/data/quests/quests";
import { QUEST_ENCOUNTERS } from "../src/data/encounters/questEncounters";
import { getQuestMissionIntel } from "../src/game/quests/questMissionIntelService";

describe("quest mission intel", () => {
  it("keeps exact enemy identities hidden until the guild has field reports", () => {
    const quest = QUESTS.goblin_patrol!;
    const intel = getQuestMissionIntel(quest, []);
    expect(intel.totalEnemyUnits).toBeGreaterThan(0);
    expect(intel.knownEnemyUnits).toBe(0);
    expect(intel.knownEnemies).toHaveLength(0);
    expect(intel.factionNames.length).toBeGreaterThan(0);
    expect(intel.coverage).toBe("none");
  });

  it("reaches complete coverage once every enemy type in the quest is discovered", () => {
    const quest = QUESTS.goblin_patrol!;
    const enemyIds = [...new Set(quest.encounterIds.flatMap((id) => (QUEST_ENCOUNTERS[id]?.enemies ?? []).map((entry) => entry.enemyDefinitionId)))];
    const intel = getQuestMissionIntel(quest, enemyIds);
    expect(intel.coverage).toBe("complete");
    expect(intel.coverageRatio).toBe(1);
    expect(intel.unknownEnemyUnits).toBe(0);
    expect(intel.knownEnemies.map((entry) => entry.enemyDefinitionId).sort()).toEqual([...enemyIds].sort());
  });
});
