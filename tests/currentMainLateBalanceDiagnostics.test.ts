import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("current main late balance diagnostics", () => {
  it("checks Serekh Iron viability across sensible prepared compositions", () => {
    const parties = [
      { id: "classic", classes: ["warrior","ranger","cleric","mage"] as const },
      { id: "alternate-support", classes: ["paladin","ranger","bard","mage"] as const },
      { id: "heavy-frontline", classes: ["warrior","berserker","cleric","spellbow"] as const },
    ];
    for (const party of parties) {
      console.log("IRON", simulateCombatScenario({
        id: `serekh-iron-${party.id}`,
        questId: "serekh_chartmaker_boss",
        heroLevel: 17,
        partyClasses: party.classes,
        difficultyId: "iron_guild",
        runs: 4,
        seed: 8975,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
      }));
    }
  }, 180_000);
});
