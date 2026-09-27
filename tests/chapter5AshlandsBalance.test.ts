import { describe, expect, it } from "vitest";
import { QUESTS } from "../src/data/quests/quests";
import { QUEST_ENCOUNTERS } from "../src/data/encounters/questEncounters";

describe("Chapter 5 Ashlands balance safeguards", () => {
  it("keeps Road of Glass in the prepared-Standard survivor envelope", () => {
    expect(QUESTS.road_of_glass?.betweenEncounterHpRecoveryRatio).toBe(.10);
    expect(QUESTS.road_of_glass?.xpRewardPerHero).toBe(1230);
    expect(QUEST_ENCOUNTERS.emberfall_gate_arrival?.enemies.reduce((sum, group) => sum + group.count, 0)).toBe(4);
  });
});
