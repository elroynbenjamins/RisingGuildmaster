import { describe, it } from "vitest";
import { QUEST_ENCOUNTERS } from "../src/data/encounters/questEncounters";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("current Serekh tuning diagnostics", () => {
  it("sweeps the final boss scalar across paired preparation profiles", () => {
    const bossEntry = QUEST_ENCOUNTERS.serekh_abyss_platform!.enemies.find((entry) => entry.enemyDefinitionId === "serekh_chartmaker")!;
    const original = bossEntry.difficultyMultiplier;
    for (const scalar of [1.05, 1.10, 1.15, 1.20] as const) {
      bossEntry.difficultyMultiplier = scalar;
      for (const profile of [
        { suffix: "prepared", heroLevel: 17, gearProfile: "optional_progression" as const },
        { suffix: "underprepared", heroLevel: 16, gearProfile: "optional_progression" as const },
        { suffix: "severely-underprepared", heroLevel: 16, gearProfile: "lagged_basic" as const },
      ]) {
        console.log("SWEEP", scalar, simulateCombatScenario({
          id: `serekh-${scalar}-${profile.suffix}`,
          questId: "serekh_chartmaker_boss",
          heroLevel: profile.heroLevel,
          partyClasses: ["warrior", "ranger", "cleric", "mage"],
          difficultyId: "standard",
          runs: 8,
          seed: 9500,
          gearProfile: profile.gearProfile,
          progressionProfile: "subclass_ready",
        }));
      }
    }
    bossEntry.difficultyMultiplier = original;
  }, 300_000);
});
