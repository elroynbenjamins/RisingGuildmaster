import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";
import { QUEST_ENCOUNTERS } from "../src/data/encounters/questEncounters";

describe("Road of Glass pressure diagnostics", () => {
  it("checks whether higher Ashbound scaling changes prepared casualties", () => {
    const final = QUEST_ENCOUNTERS.emberfall_gate_arrival!;
    const sentinels = final.enemies.find((group) => group.enemyDefinitionId === "ashbound_sentinel")!;
    const original = sentinels.difficultyMultiplier;

    for (const scale of [1.35, 1.40] as const) {
      sentinels.difficultyMultiplier = scale;
      console.log("ROAD5", scale, simulateCombatScenario({
        id: `road-${scale}-prepared`,
        questId: "road_of_glass",
        heroLevel: 8,
        partyClasses: ["warrior", "ranger", "cleric", "mage"],
        difficultyId: "standard",
        runs: 6,
        seed: 8800,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
      }));
    }

    sentinels.difficultyMultiplier = original;
  }, 90_000);
});
