import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";
import { QUEST_ENCOUNTERS } from "../src/data/encounters/questEncounters";

const party = ["warrior", "ranger", "cleric", "mage"] as const;

describe("Road of Glass pressure diagnostics", () => {
  it("settles final Ashbound pressure", () => {
    const final = QUEST_ENCOUNTERS.emberfall_gate_arrival!;
    const sentinels = final.enemies.find((group) => group.enemyDefinitionId === "ashbound_sentinel")!;
    const original = sentinels.difficultyMultiplier;

    for (const scale of [1.20, 1.25] as const) {
      sentinels.difficultyMultiplier = scale;
      for (const profile of [
        { id: "prepared", level: 8, gear: "optional_progression" as const, seed: 8800 },
        { id: "behind", level: 7, gear: "lagged_basic" as const, seed: 8600 },
      ]) {
        console.log("ROAD3", scale, profile.id, simulateCombatScenario({
          id: `road-${scale}-${profile.id}`,
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
    }

    sentinels.difficultyMultiplier = original;
  }, 120_000);
});
