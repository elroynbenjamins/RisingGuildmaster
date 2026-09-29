import { describe, expect, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

const difficulties = ["standard", "veteran", "iron_guild"] as const;

describe("Chapter 1-2 cross-difficulty balance matrix", () => {
  it("reports realistic early-campaign pressure across all difficulties", () => {
    const scenarios = [
      {
        id: "ch1-chieftain",
        questId: "goblin_chieftain_boss",
        heroLevel: 2,
        partyClasses: ["warrior", "ranger", "cleric", "mage"] as const,
        gearProfile: "starter" as const,
        progressionProfile: "base" as const,
        runs: 6,
        seed: 24_100,
      },
      {
        id: "ch2-broken-carts-lagged",
        questId: "road_of_broken_carts",
        heroLevel: 3,
        partyClasses: ["warrior", "ranger", "cleric", "mage"] as const,
        gearProfile: "lagged_basic" as const,
        progressionProfile: "base" as const,
        runs: 6,
        seed: 24_200,
      },
      {
        id: "ch2-flintwatch-lagged",
        questId: "fires_of_flintwatch",
        heroLevel: 4,
        partyClasses: ["warrior", "ranger", "cleric", "mage"] as const,
        gearProfile: "lagged_basic" as const,
        progressionProfile: "base" as const,
        runs: 6,
        seed: 24_300,
      },
      {
        id: "ch2-chainbreaker-l4-lagged",
        questId: "ghorak_chainbreaker_boss",
        heroLevel: 4,
        partyClasses: ["warrior", "ranger", "cleric", "mage"] as const,
        gearProfile: "lagged_basic" as const,
        progressionProfile: "base" as const,
        runs: 6,
        seed: 24_400,
      },
      {
        id: "ch2-chainbreaker-l5-prepared",
        questId: "ghorak_chainbreaker_boss",
        heroLevel: 5,
        partyClasses: ["warrior", "ranger", "cleric", "mage"] as const,
        gearProfile: "optional_progression" as const,
        progressionProfile: "subclass_ready" as const,
        runs: 6,
        seed: 24_500,
      },
      {
        id: "ch2-warden-l5-lagged",
        questId: "hollow_warden_boss",
        heroLevel: 5,
        partyClasses: ["warrior", "ranger", "cleric", "mage"] as const,
        gearProfile: "lagged_basic" as const,
        progressionProfile: "base" as const,
        runs: 6,
        seed: 24_600,
      },
      {
        id: "ch2-warden-l5-prepared",
        questId: "hollow_warden_boss",
        heroLevel: 5,
        partyClasses: ["warrior", "ranger", "cleric", "mage"] as const,
        gearProfile: "optional_progression" as const,
        progressionProfile: "subclass_ready" as const,
        runs: 6,
        seed: 24_700,
      },
    ] as const;

    const results = scenarios.flatMap((scenario) => difficulties.map((difficultyId) =>
      simulateCombatScenario({
        ...scenario,
        difficultyId,
        id: `${scenario.id}-${difficultyId}`,
      }),
    ));

    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
  }, 360_000);

  it("reports prepared Chapter-2 boss viability across sensible party shapes", () => {
    const parties = [
      {
        id: "classic",
        classes: ["warrior", "ranger", "cleric", "mage"] as const,
      },
      {
        id: "defensive",
        classes: ["warrior", "paladin", "cleric", "ranger"] as const,
      },
      {
        id: "alternate-support",
        classes: ["paladin", "ranger", "bard", "mage"] as const,
      },
    ] as const;

    const bosses = [
      { id: "chainbreaker", questId: "ghorak_chainbreaker_boss", heroLevel: 5, seed: 25_100 },
      { id: "warden", questId: "hollow_warden_boss", heroLevel: 5, seed: 25_200 },
    ] as const;

    const results = parties.flatMap((party, partyIndex) => bosses.flatMap((boss, bossIndex) =>
      difficulties.map((difficultyId) => simulateCombatScenario({
        id: `ch2-${boss.id}-${party.id}-${difficultyId}`,
        questId: boss.questId,
        heroLevel: boss.heroLevel,
        partyClasses: party.classes,
        difficultyId,
        runs: 4,
        seed: boss.seed + partyIndex * 300 + bossIndex * 50,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
      })),
    ));

    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
  }, 360_000);
});
