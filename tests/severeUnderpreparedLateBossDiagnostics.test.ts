import { describe, it } from "vitest";
import { createSimulationParty } from "../src/game/simulation/balanceSimulation";
import { calculateHero } from "../src/game/heroes/heroCalculator";

describe("Nhal loadout diagnostics", () => {
  it("compares Level 14 and 15 prepared simulation loadouts", () => {
    for (const level of [14, 15]) {
      const party = createSimulationParty(
        ["warrior", "ranger", "cleric", "mage"],
        level,
        11970,
        "optional_progression",
        "subclass_ready",
      );
      console.log("LOADOUT", level, party.map((hero) => ({
        classId: hero.classId,
        subclassId: hero.subclassId,
        equipment: hero.equipment,
        stats: calculateHero(hero).stats,
        learnedSkillIds: hero.learnedSkillIds,
      })));
    }
  });
});
