import { describe, expect, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

const partyClasses = ["warrior", "ranger", "cleric", "mage"] as const;

describe("Chapter 6 subclass-aware diagnostic", () => {
  it("compares late Chapter 5 and Chapter 6 opening encounters", () => {
    const specs = [
      { id: "ch5-road-glass", questId: "road_of_glass", heroLevel: 8, seed: 21000 },
      { id: "ch5-burning-causeway", questId: "the_burning_causeway", heroLevel: 9, seed: 21100 },
      { id: "ch5-solkar", questId: "solkar_ash_herald_boss", heroLevel: 9, seed: 21200 },
      { id: "ch6-laurel-law", questId: "laurel_law", heroLevel: 10, seed: 22000 },
      { id: "ch6-five-roads", questId: "the_five_roads_run", heroLevel: 10, seed: 22100 },
      { id: "ch6-guildhall", questId: "guildhall_under_siege", heroLevel: 11, seed: 22200 },
      { id: "ch6-sixth-voice", questId: "the_sixth_voice", heroLevel: 11, seed: 22300 },
      { id: "ch6-cassian-guard", questId: "cassian_vane_boss", heroLevel: 11, seed: 22400 },
      { id: "ch6-empty-banner", questId: "the_empty_banner", heroLevel: 10, seed: 22500 },
      { id: "ch6-last-lantern", questId: "supper_at_the_last_lantern", heroLevel: 11, seed: 22600 },
    ] as const;
    const results = specs.map((spec) => simulateCombatScenario({
      ...spec,
      partyClasses,
      difficultyId: "standard",
      runs: 4,
      gearProfile: "lagged_basic",
      progressionProfile: "subclass_ready",
      encounterLimit: 1,
    }));
    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
  }, 150_000);

  it("measures full Chapter 6 quests with normal subclass progression", () => {
    const specs = [
      { id: "ch6-full-laurel-law", questId: "laurel_law", heroLevel: 10, seed: 23000 },
      { id: "ch6-full-five-roads", questId: "the_five_roads_run", heroLevel: 10, seed: 23100 },
      { id: "ch6-full-guildhall", questId: "guildhall_under_siege", heroLevel: 11, seed: 23200 },
      { id: "ch6-full-sixth-voice", questId: "the_sixth_voice", heroLevel: 11, seed: 23300 },
      { id: "ch6-full-cassian", questId: "cassian_vane_boss", heroLevel: 11, seed: 23400 },
      { id: "ch6-full-empty-banner", questId: "the_empty_banner", heroLevel: 10, seed: 23500 },
      { id: "ch6-full-last-lantern", questId: "supper_at_the_last_lantern", heroLevel: 11, seed: 23600 },
    ] as const;
    const results = specs.map((spec) => simulateCombatScenario({
      ...spec,
      partyClasses,
      difficultyId: "standard",
      runs: 4,
      gearProfile: "lagged_basic",
      progressionProfile: "subclass_ready",
    }));
    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
  }, 180_000);
});
