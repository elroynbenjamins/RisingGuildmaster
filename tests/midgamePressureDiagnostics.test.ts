import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";
import { QUEST_ENCOUNTERS } from "../src/data/encounters/questEncounters";

const party = ["warrior", "ranger", "cleric", "mage"] as const;

describe("Road of Glass pressure diagnostics", () => {
  it("settles the 12-run prepared casualty band", () => {
    const final = QUEST_ENCOUNTERS.emberfall_gate_arrival!;
    const sentinels = final.enemies.find((group) => group.enemyDefinitionId === "ashbound_sentinel")!;
    const original = sentinels.difficultyMultiplier;

    for (const scale of [1.45, 1.50, 1.60] as const) {
      sentinels.difficultyMultiplier = scale;
      console.log("ROAD12", scale, simulateCombatScenario({
        id: `road-final-${scale}`,
        questId: "road_of_glass",
        heroLevel: 8,
        partyClasses: party,
        difficultyId: "standard",
        runs: 12,
        seed: 8800,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
      }));
    }

    sentinels.difficultyMultiplier = original;
  }, 180_000);
});
