import { describe, expect, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

const PARTIES = [
  { id: "classic", classes: ["warrior", "ranger", "cleric", "mage"] as const },
  { id: "defensive", classes: ["warrior", "paladin", "cleric", "mage"] as const },
  { id: "aggressive", classes: ["warrior", "berserker", "cleric", "ranger"] as const },
  { id: "flex-support", classes: ["paladin", "ranger", "cleric", "mage"] as const },
] as const;

describe("Cassian stage-isolation diagnostic", () => {
  it("separates the honor guard from the full Cassian quest across difficulty", () => {
    const results = (["standard", "veteran", "iron_guild"] as const).flatMap((difficultyId, difficultyIndex) => [
      simulateCombatScenario({
        id: `cassian-honor-guard-${difficultyId}`,
        questId: "cassian_vane_boss",
        heroLevel: 11,
        partyClasses: PARTIES[0].classes,
        difficultyId,
        runs: 2,
        seed: 35_100 + difficultyIndex * 100,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
        encounterLimit: 1,
      }),
      simulateCombatScenario({
        id: `cassian-full-${difficultyId}`,
        questId: "cassian_vane_boss",
        heroLevel: 11,
        partyClasses: PARTIES[0].classes,
        difficultyId,
        runs: 2,
        seed: 35_100 + difficultyIndex * 100,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
      }),
    ]);

    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
  }, 240_000);

  it("checks whether the Iron honor guard itself excludes sensible party shapes", () => {
    const results = PARTIES.map((party, partyIndex) =>
      simulateCombatScenario({
        id: `cassian-iron-honor-${party.id}`,
        questId: "cassian_vane_boss",
        heroLevel: 11,
        partyClasses: party.classes,
        difficultyId: "iron_guild",
        runs: 2,
        seed: 36_100 + partyIndex * 100,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
        encounterLimit: 1,
      }),
    );

    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
  }, 240_000);
});
