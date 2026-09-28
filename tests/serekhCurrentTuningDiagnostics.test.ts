import { describe, it } from "vitest";
import { QUEST_ENCOUNTERS } from "../src/data/encounters/questEncounters";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("current Serekh tuning diagnostics", () => {
  it("sweeps Chart Hall pressure across paired preparation profiles", () => {
    const entries = QUEST_ENCOUNTERS.chart_hall_guard!.enemies;
    const originals = entries.map((entry) => entry.difficultyMultiplier);
    for (const scalar of [.70, .80, .90, 1.00] as const) {
      entries.forEach((entry) => { entry.difficultyMultiplier = scalar; });
      for (const profile of [
        { suffix: "prepared", heroLevel: 17, gearProfile: "optional_progression" as const },
        { suffix: "underprepared", heroLevel: 16, gearProfile: "optional_progression" as const },
        { suffix: "severely-underprepared", heroLevel: 16, gearProfile: "lagged_basic" as const },
      ]) {
        console.log("HALL", scalar, simulateCombatScenario({
          id: `serekh-hall-${scalar}-${profile.suffix}`,
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
    entries.forEach((entry, index) => { entry.difficultyMultiplier = originals[index]; });
  }, 300_000);
});
