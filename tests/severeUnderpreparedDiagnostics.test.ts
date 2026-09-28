import { describe, it } from "vitest";
import { calculateHero } from "../src/game/heroes/heroCalculator";
import { createSimulationParty, simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("Serekh preparation gradient diagnostics", () => {
  it("compares stable prepared and underprepared profiles and their loadouts", () => {
    const profiles = [
      { suffix: "prepared", level: 17, gearProfile: "optional_progression" as const },
      { suffix: "mild", level: 16, gearProfile: "optional_progression" as const },
      { suffix: "severe", level: 16, gearProfile: "lagged_basic" as const },
    ] as const;

    for (const profile of profiles) {
      const party = createSimulationParty(["warrior", "ranger", "cleric", "mage"], profile.level, 9850, profile.gearProfile, "subclass_ready");
      console.log("LOADOUT", profile.suffix, party.map((hero) => ({
        classId: hero.classId,
        level: hero.level,
        equipment: hero.equipment,
        stats: calculateHero(hero).stats,
      })));
      console.log("SEREKH", simulateCombatScenario({
        id: `serekh-${profile.suffix}`,
        questId: "serekh_chartmaker_boss",
        heroLevel: profile.level,
        partyClasses: ["warrior", "ranger", "cleric", "mage"],
        difficultyId: "standard",
        runs: 24,
        seed: 9850,
        gearProfile: profile.gearProfile,
        progressionProfile: "subclass_ready",
      }));
    }
  }, 300_000);
});
