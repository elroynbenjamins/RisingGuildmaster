import { describe, expect, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

const preparedParty = {
  partyClasses: ["warrior", "ranger", "cleric", "mage"] as const,
  skillPathIndices: [1, 0, 0, 0] as const,
  gearProfile: "prepared_minus_two" as const,
  progressionProfile: "subclass_ready" as const,
  tacticsProfile: "skilled" as const,
};

const chapters = [
  { chapter: 1, id: "chieftain", questId: "goblin_chieftain_boss", heroLevel: 2, seed: 101_100 },
  { chapter: 2, id: "warden", questId: "hollow_warden_boss", heroLevel: 5, seed: 102_100 },
  { chapter: 3, id: "vaelith", questId: "vaelith_pale_echo_boss", heroLevel: 6, seed: 103_100 },
  { chapter: 4, id: "morrowveil", questId: "morrowveil_drowned_archivist_boss", heroLevel: 7, seed: 104_100 },
  { chapter: 5, id: "solkar", questId: "solkar_ash_herald_boss", heroLevel: 9, seed: 105_100 },
] as const;

describe("Chapter 1-5 prepared harder-difficulty reliability", () => {
  for (const entry of chapters) {
    it(`measures Chapter ${entry.chapter} prepared Veteran and Iron reliability`, () => {
      const results = (["veteran", "iron_guild"] as const).map((difficultyId) =>
        simulateCombatScenario({
          id: `prepared-reliability-ch${entry.chapter}-${entry.id}-${difficultyId}`,
          questId: entry.questId,
          heroLevel: entry.heroLevel,
          ...preparedParty,
          difficultyId,
          runs: 10,
          seed: entry.seed,
        }),
      );

      console.table(results);
      expect(results.every((result) => result.stalled === 0)).toBe(true);
      const [veteran, iron] = results;
      expect(veteran!.winRate, `Chapter ${entry.chapter} Veteran should not be easier than Iron`).toBeGreaterThanOrEqual(iron!.winRate);
    }, 600_000);
  }
});
