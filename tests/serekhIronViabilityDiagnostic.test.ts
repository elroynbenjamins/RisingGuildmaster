import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("Serekh Iron viability diagnostic", () => {
  it("compares prepared late-game party compositions on Iron", () => {
    const parties = [
      { id: "classic", classes: ["warrior", "ranger", "cleric", "mage"] as const },
      { id: "defensive-flex", classes: ["bulwark", "spellbow", "bard", "mage"] as const },
      { id: "holy-frontline", classes: ["paladin", "ranger", "cleric", "mage"] as const },
      { id: "pressure-frontline", classes: ["warrior", "berserker", "cleric", "spellbow"] as const },
    ];
    for (const party of parties) {
      console.log("SEREKH_IRON_PARTY", simulateCombatScenario({
        id: `prepared-serekh-iron-${party.id}`,
        questId: "serekh_chartmaker_boss",
        heroLevel: 17,
        partyClasses: party.classes,
        difficultyId: "iron_guild",
        runs: 8,
        seed: 9300,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
      }));
    }
  }, 420_000);
});
