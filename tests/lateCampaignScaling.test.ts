import { describe, expect, it } from "vitest";
import { LATE_CAMPAIGN_ENCOUNTER_SCALE } from "../src/config/campaignBalance";
import { QUEST_ENCOUNTERS } from "../src/data/encounters/questEncounters";

describe("late campaign encounter scaling", () => {
  it("keeps Chapters 7-9 below raid-level raw stat pressure", () => {
    expect(LATE_CAMPAIGN_ENCOUNTER_SCALE).toBe(.88);
    expect(QUEST_ENCOUNTERS.varkesh_final_concord?.enemies.find((entry) => entry.enemyDefinitionId === "varkesh_gilded_rupture")?.difficultyMultiplier).toBeCloseTo(1.10, 2);
    expect(QUEST_ENCOUNTERS.admirals_quarterdeck?.enemies.find((entry) => entry.enemyDefinitionId === "admiral_nhal_veyr")?.difficultyMultiplier).toBeCloseTo(1.10, 2);
    expect(QUEST_ENCOUNTERS.serekh_abyss_platform?.enemies.find((entry) => entry.enemyDefinitionId === "serekh_chartmaker")?.difficultyMultiplier).toBeCloseTo(1.06, 2);
  });
});
