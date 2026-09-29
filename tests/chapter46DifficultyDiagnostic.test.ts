import { describe, expect, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

const FINALES = [
  { id: "morrowveil", questId: "morrowveil_drowned_archivist_boss", preparedLevel: 7, seed: 34_100 },
  { id: "solkar", questId: "solkar_ash_herald_boss", preparedLevel: 9, seed: 34_500 },
  { id: "cassian", questId: "cassian_vane_boss", preparedLevel: 11, seed: 34_900 },
] as const;

const PARTIES = [
  { id: "classic", classes: ["warrior", "ranger", "cleric", "mage"] as const },
  { id: "defensive", classes: ["warrior", "paladin", "cleric", "mage"] as const },
  { id: "aggressive", classes: ["warrior", "berserker", "cleric", "ranger"] as const },
  { id: "flex-support", classes: ["paladin", "ranger", "cleric", "mage"] as const },
] as const;

describe("Chapter 4-6 cross-difficulty diagnostic", () => {
  it("samples prepared finale pressure across Standard, Hard and Iron", () => {
    const results = FINALES.flatMap((finale) =>
      (["standard", "veteran", "iron_guild"] as const).map((difficultyId) =>
        simulateCombatScenario({
          id: `midgame-${finale.id}-prepared-${difficultyId}`,
          questId: finale.questId,
          heroLevel: finale.preparedLevel,
          partyClasses: PARTIES[0].classes,
          difficultyId,
          runs: 6,
          seed: finale.seed,
          gearProfile: "optional_progression",
          progressionProfile: "subclass_ready",
        }),
      ),
    );
    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
  }, 300_000);

  it("samples one-level-behind lagged parties on Hard and Iron", () => {
    const results = FINALES.flatMap((finale) =>
      (["veteran", "iron_guild"] as const).map((difficultyId) =>
        simulateCombatScenario({
          id: `midgame-${finale.id}-underprepared-${difficultyId}`,
          questId: finale.questId,
          heroLevel: finale.preparedLevel - 1,
          partyClasses: PARTIES[0].classes,
          difficultyId,
          runs: 6,
          seed: finale.seed + 100,
          gearProfile: "lagged_basic",
          progressionProfile: "subclass_ready",
        }),
      ),
    );
    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
  }, 300_000);

  it("samples prepared Iron finale robustness across sensible party shapes", () => {
    const results = FINALES.flatMap((finale, finaleIndex) =>
      PARTIES.map((party, partyIndex) =>
        simulateCombatScenario({
          id: `midgame-${finale.id}-iron-${party.id}`,
          questId: finale.questId,
          heroLevel: finale.preparedLevel,
          partyClasses: party.classes,
          difficultyId: "iron_guild",
          runs: 6,
          seed: finale.seed + finaleIndex * 500 + partyIndex * 100,
          gearProfile: "optional_progression",
          progressionProfile: "subclass_ready",
        }),
      ),
    );
    console.table(results);
    expect(results.every((result) => result.stalled === 0)).toBe(true);
  }, 480_000);
});
