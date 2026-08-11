import { describe, expect, it } from "vitest";
import { BATTLEFIELDS } from "../src/data/combat/battlefields";
import { ENEMIES } from "../src/data/enemies";
import { QUEST_ENCOUNTERS } from "../src/data/encounters/questEncounters";
import { QUEST_LOOT_TABLES } from "../src/data/loot/questLootTables";
import { QUEST_EXPLORATION_STAGES } from "../src/data/quests/questExplorationStages";
import { QUEST_OUTCOME_NARRATIVES } from "../src/data/quests/questOutcomeNarratives";
import { QUESTS } from "../src/data/quests/quests";
import { REGIONS } from "../src/data/world/regions";

const questIds = ["bellkeeper_below", "night_of_thirteen_ladders", "last_lift_of_flintwatch"] as const;

describe("authored rescue and defense quests", () => {
  it("connects each quest to D20 stages, encounters, loot, narrative, and its region", () => {
    for (const questId of questIds) {
      const quest = QUESTS[questId]!;
      expect(quest.questType).toBe("side");
      expect(quest.explorationStageIds).toHaveLength(3);
      expect(quest.explorationStageIds!.every((id) => QUEST_EXPLORATION_STAGES[id]?.questId === questId)).toBe(true);
      expect(quest.encounterIds.every((id) => QUEST_ENCOUNTERS[id])).toBe(true);
      expect(QUEST_LOOT_TABLES[quest.lootTableId]).toBeDefined();
      expect(QUEST_OUTCOME_NARRATIVES[questId]).toBeDefined();
      expect(REGIONS[quest.regionId]!.questPoolIds).toContain(questId);
    }
  });

  it("models the Brambleford defense as three increasingly dangerous waves", () => {
    const waveIds = QUESTS.night_of_thirteen_ladders!.encounterIds;
    const waves = waveIds.map((id) => QUEST_ENCOUNTERS[id]!);
    expect(waves).toHaveLength(3);
    expect(waves.every((wave) => wave.battlefieldId === "brambleford_north_wall")).toBe(true);
    expect(waves.map((wave) => Math.max(...wave.enemies.map((group) => group.level)))).toEqual([3, 4, 5]);
  });

  it("marks rescue objectives on unique tactical maps and only reuses registered enemies", () => {
    for (const battlefieldId of ["drowned_abbey_rescue", "brambleford_north_wall", "flintwatch_liftworks"]) {
      expect(BATTLEFIELDS[battlefieldId]).toBeDefined();
    }
    expect(BATTLEFIELDS.drowned_abbey_rescue!.terrainPlacements.some((tile) => tile.terrainType === "escort_npc")).toBe(true);
    expect(BATTLEFIELDS.flintwatch_liftworks!.terrainPlacements.some((tile) => tile.terrainType === "escort_npc")).toBe(true);
    for (const questId of questIds) {
      for (const encounterId of QUESTS[questId]!.encounterIds) {
        for (const group of QUEST_ENCOUNTERS[encounterId]!.enemies) expect(ENEMIES[group.enemyDefinitionId]).toBeDefined();
      }
    }
  });
});
