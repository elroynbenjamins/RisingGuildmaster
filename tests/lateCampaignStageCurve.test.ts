import { describe, expect, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("late campaign stage curve", () => {
  it("keeps prepared Standard parties in the win-with-casualties band", () => {
    const scenarios = [
      { id: "prepared-ch7-siege", questId: "siege_of_skyvault", heroLevel: 13, seed: 8900 },
      { id: "prepared-ch7-varkesh", questId: "varkesh_gilded_rupture_boss", heroLevel: 13, seed: 8910 },
      { id: "prepared-ch8-siege", questId: "siege_of_tidewatch", heroLevel: 15, seed: 8920 },
      { id: "prepared-ch8-nhal", questId: "admiral_nhal_veyr_boss", heroLevel: 15, seed: 8930 },
      { id: "prepared-ch9-chain", questId: "chain_beneath_fleet", heroLevel: 17, seed: 8940 },
      { id: "prepared-ch9-serekh", questId: "serekh_chartmaker_boss", heroLevel: 17, seed: 8950 },
    ] as const;
    const results = scenarios.map((scenario) => simulateCombatScenario({
      ...scenario,
      partyClasses: ["warrior", "ranger", "cleric", "mage"],
      difficultyId: "standard",
      runs: 6,
      gearProfile: "optional_progression",
      progressionProfile: "subclass_ready",
    }));
    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
    for (const result of results) {
      const boss = /varkesh|nhal|serekh/.test(result.scenarioId);
      expect(result.winRate, `${result.scenarioId} prepared win rate`).toBeGreaterThanOrEqual(.67);
      expect(result.averageSurvivingHeroes, `${result.scenarioId} prepared survivors`).toBeGreaterThanOrEqual(boss ? 2.2 : 2.5);
      expect(result.averageSurvivingHeroes, `${result.scenarioId} prepared survivors`).toBeLessThanOrEqual(boss ? 3.3 : 3.5);
      expect(result.averageFallenHeroesOnWins, `${result.scenarioId} prepared casualties`).toBeGreaterThanOrEqual(.5);
      expect(result.averageFallenHeroesOnWins, `${result.scenarioId} prepared casualties`).toBeLessThanOrEqual(boss ? 1.8 : 1.5);
    }
  }, 180_000);

  it("keeps underprepared boss parties in a regular-loss and wipe band", () => {
    const scenarios = [
      { id: "underprepared-ch7-varkesh", questId: "varkesh_gilded_rupture_boss", heroLevel: 12, seed: 8960 },
      { id: "underprepared-ch8-nhal", questId: "admiral_nhal_veyr_boss", heroLevel: 14, seed: 8970 },
      { id: "underprepared-ch9-serekh", questId: "serekh_chartmaker_boss", heroLevel: 16, seed: 8980 },
    ] as const;
    const results = scenarios.map((scenario) => simulateCombatScenario({
      ...scenario,
      partyClasses: ["warrior", "ranger", "cleric", "mage"],
      difficultyId: "standard",
      runs: 6,
      gearProfile: "lagged_basic",
      progressionProfile: "subclass_ready",
    }));
    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
    for (const result of results) {
      expect(result.winRate, `${result.scenarioId} underprepared win rate`).toBeLessThanOrEqual(.5);
      expect(result.wipeRate, `${result.scenarioId} underprepared wipe pressure`).toBeGreaterThan(0);
    }
  }, 180_000);
});
