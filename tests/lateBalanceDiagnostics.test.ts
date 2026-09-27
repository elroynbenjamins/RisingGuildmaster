import { describe, it } from "vitest";
import { createSimulationParty, simulateCombatScenario } from "../src/game/simulation/balanceSimulation";
import { calculateHero } from "../src/game/heroes/heroCalculator";

describe("late balance diagnostics", () => {
  it("prints prepared loadouts and stage pressure", () => {
    for (const level of [13, 15, 17]) {
      const party = createSimulationParty(["warrior","ranger","cleric","mage"], level, 9900 + level, "optional_progression", "subclass_ready");
      console.log("LOADOUT", level, party.map((hero) => ({
        classId: hero.classId,
        subclassId: hero.subclassId,
        equipment: hero.equipment,
        skills: hero.learnedSkillIds,
        stats: calculateHero(hero).stats,
      })));
    }
    const scenarios = [
      { id: "ch7-siege", questId: "siege_of_skyvault", heroLevel: 13, seed: 9910 },
      { id: "ch7-varkesh", questId: "varkesh_gilded_rupture_boss", heroLevel: 13, seed: 9920 },
      { id: "ch8-siege", questId: "siege_of_tidewatch", heroLevel: 15, seed: 9930 },
      { id: "ch8-nhal", questId: "admiral_nhal_veyr_boss", heroLevel: 15, seed: 9940 },
      { id: "ch9-chain", questId: "chain_beneath_fleet", heroLevel: 17, seed: 9950 },
      { id: "ch9-serekh", questId: "serekh_chartmaker_boss", heroLevel: 17, seed: 9960 },
    ] as const;
    for (const scenario of scenarios) {
      for (const encounterLimit of [1, 2, 3]) {
        const result = simulateCombatScenario({
          ...scenario,
          id: `${scenario.id}-limit${encounterLimit}`,
          partyClasses: ["warrior","ranger","cleric","mage"],
          difficultyId: "standard",
          runs: 3,
          gearProfile: "optional_progression",
          progressionProfile: "subclass_ready",
          encounterLimit,
        });
        console.log("STAGE", result);
      }
    }
  }, 180_000);
});
