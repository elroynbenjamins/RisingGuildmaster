import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("late casualty profile diagnostics", () => {
  it("pinpoints current Nhal and Serekh prepared-versus-underprepared stage pressure", () => {
    for (const boss of [
      { id: "ch8-nhal", questId: "admiral_nhal_veyr_boss", preparedLevel: 15, seed: 9400 },
      { id: "ch9-serekh", questId: "serekh_chartmaker_boss", preparedLevel: 17, seed: 9500 },
    ] as const) {
      for (const profile of [
        { suffix: "prepared", heroLevel: boss.preparedLevel, gearProfile: "optional_progression" as const },
        { suffix: "slightly-under", heroLevel: boss.preparedLevel - 1, gearProfile: "optional_progression" as const },
      ]) {
        for (const encounterLimit of [1, 2, 3] as const) {
          console.log("STAGE", simulateCombatScenario({
            id: `${boss.id}-${profile.suffix}-limit${encounterLimit}`,
            questId: boss.questId,
            heroLevel: profile.heroLevel,
            partyClasses: ["warrior", "ranger", "cleric", "mage"],
            difficultyId: "standard",
            runs: 8,
            seed: boss.seed,
            gearProfile: profile.gearProfile,
            progressionProfile: "subclass_ready",
            encounterLimit,
          }));
        }
      }
    }
  }, 300_000);
});
