import { describe, expect, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

const prepared = [
  { id: "prepared-ch7-siege", questId: "siege_of_skyvault", heroLevel: 13, seed: 8900 },
  { id: "prepared-ch7-varkesh", questId: "varkesh_gilded_rupture_boss", heroLevel: 13, seed: 8910 },
  { id: "prepared-ch8-siege", questId: "siege_of_tidewatch", heroLevel: 15, seed: 8920 },
  { id: "prepared-ch8-nhal", questId: "admiral_nhal_veyr_boss", heroLevel: 15, seed: 8930 },
  { id: "prepared-ch9-chain", questId: "chain_beneath_fleet", heroLevel: 17, seed: 8940 },
  { id: "prepared-ch9-serekh", questId: "serekh_chartmaker_boss", heroLevel: 17, seed: 8950 },
] as const;

const runPrepared = (encounterLimit?: number) => prepared.map((scenario) => simulateCombatScenario({
  ...scenario,
  partyClasses: ["warrior", "ranger", "cleric", "mage"],
  difficultyId: "standard",
  runs: 6,
  gearProfile: "optional_progression",
  progressionProfile: "subclass_ready",
  ...(encounterLimit ? { encounterLimit } : {}),
}));

describe("post-equipment late campaign baseline", () => {
  it("reports prepared first-stage pressure", () => {
    const results = runPrepared(1);
    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
  }, 180_000);

  it("reports prepared full-mission pressure", () => {
    const results = runPrepared();
    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
  }, 180_000);

  it("reports isolated later-stage pressure", () => {
    const stages = [
      { id: "ch7-siege-stage2", questId: "siege_of_skyvault", heroLevel: 13, encounterStartIndex: 1, seed: 9100 },
      { id: "ch7-siege-stage3", questId: "siege_of_skyvault", heroLevel: 13, encounterStartIndex: 2, seed: 9110 },
      { id: "ch7-varkesh-stage2", questId: "varkesh_gilded_rupture_boss", heroLevel: 13, encounterStartIndex: 1, seed: 9120 },
      { id: "ch7-varkesh-stage3", questId: "varkesh_gilded_rupture_boss", heroLevel: 13, encounterStartIndex: 2, seed: 9130 },
      { id: "ch8-siege-stage2", questId: "siege_of_tidewatch", heroLevel: 15, encounterStartIndex: 1, seed: 9140 },
      { id: "ch8-siege-stage3", questId: "siege_of_tidewatch", heroLevel: 15, encounterStartIndex: 2, seed: 9150 },
      { id: "ch8-nhal-stage2", questId: "admiral_nhal_veyr_boss", heroLevel: 15, encounterStartIndex: 1, seed: 9160 },
      { id: "ch8-nhal-stage3", questId: "admiral_nhal_veyr_boss", heroLevel: 15, encounterStartIndex: 2, seed: 9170 },
      { id: "ch9-chain-stage2", questId: "chain_beneath_fleet", heroLevel: 17, encounterStartIndex: 1, seed: 9180 },
      { id: "ch9-serekh-stage2", questId: "serekh_chartmaker_boss", heroLevel: 17, encounterStartIndex: 1, seed: 9190 },
      { id: "ch9-serekh-stage3", questId: "serekh_chartmaker_boss", heroLevel: 17, encounterStartIndex: 2, seed: 9200 },
    ] as const;
    const results = stages.map((stage) => simulateCombatScenario({
      ...stage,
      partyClasses: ["warrior", "ranger", "cleric", "mage"],
      difficultyId: "standard",
      runs: 3,
      gearProfile: "optional_progression",
      progressionProfile: "subclass_ready",
      encounterLimit: 1,
    }));
    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
  }, 180_000);

  it("reports underprepared boss pressure", () => {
    const scenarios = [
      { id: "underprepared-ch7-varkesh", questId: "varkesh_gilded_rupture_boss", heroLevel: 12, seed: 8960 },
      { id: "underprepared-ch8-nhal", questId: "admiral_nhal_veyr_boss", heroLevel: 14, seed: 8970 },
      { id: "underprepared-ch9-serekh", questId: "serekh_chartmaker_boss", heroLevel: 16, seed: 8980 },
    ] as const;
    const results = scenarios.map((scenario) => simulateCombatScenario({
      ...scenario,
      partyClasses: ["warrior", "ranger", "cleric", "mage"],
      difficultyId: "standard",
      runs: 4,
      gearProfile: "lagged_basic",
      progressionProfile: "subclass_ready",
    }));
    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
  }, 180_000);
});
