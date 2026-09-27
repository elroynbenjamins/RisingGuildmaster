import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";
import { QUEST_ENCOUNTERS } from "../src/data/encounters/questEncounters";

const party = ["warrior", "ranger", "cleric", "mage"] as const;

describe("Road of Glass pressure diagnostics", () => {
  it("checks the 1.30 Ashbound final candidate", () => {
    const final = QUEST_ENCOUNTERS.emberfall_gate_arrival!;
    const sentinels = final.enemies.find((group) => group.enemyDefinitionId === "ashbound_sentinel")!;
    const original = sentinels.difficultyMultiplier;
    sentinels.difficultyMultiplier = 1.30;

    for (const profile of [
      { id: "prepared", level: 8, gear: "optional_progression" as const, seed: 8800 },
      { id: "behind", level: 7, gear: "lagged_basic" as const, seed: 8600 },
    ]) {
      console.log("ROAD4", profile.id, simulateCombatScenario({
        id: `road-130-${profile.id}`,
        questId: "road_of_glass",
        heroLevel: profile.level,
        partyClasses: party,
        difficultyId: "standard",
        runs: 6,
        seed: profile.seed,
        gearProfile: profile.gear,
        progressionProfile: "subclass_ready",
      }));
    }

    sentinels.difficultyMultiplier = original;
  }, 90_000);
});
