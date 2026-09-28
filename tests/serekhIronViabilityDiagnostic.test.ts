import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("Serekh Iron viability diagnostic", () => {
  it("compares all-base prepared late-game party compositions on Iron", () => {
    const parties = [
      { id: "warrior-paladin", classes: ["warrior", "paladin", "cleric", "mage"] as const },
      { id: "paladin-berserker", classes: ["paladin", "berserker", "cleric", "mage"] as const },
      { id: "warrior-berserker", classes: ["warrior", "berserker", "cleric", "mage"] as const },
      { id: "double-front-ranged", classes: ["paladin", "berserker", "cleric", "ranger"] as const },
    ];
    for (const party of parties) {
      console.log("SEREKH_IRON_BASE_PARTY", simulateCombatScenario({
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
