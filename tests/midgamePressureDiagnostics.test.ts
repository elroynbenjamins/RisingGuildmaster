import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";
import { QUEST_ENCOUNTERS } from "../src/data/encounters/questEncounters";

const party = ["warrior", "ranger", "cleric", "mage"] as const;

describe("Road of Glass pressure diagnostics", () => {
  it("tests modest Ashbound pressure on the final approach", () => {
    const first = QUEST_ENCOUNTERS.glass_road_ambush!;
    const final = QUEST_ENCOUNTERS.emberfall_gate_arrival!;
    const firstSentinel = first.enemies.find((group) => group.enemyDefinitionId === "ashbound_sentinel")!;
    const finalSentinels = final.enemies.find((group) => group.enemyDefinitionId === "ashbound_sentinel")!;
    const originalFirst = firstSentinel.difficultyMultiplier;
    const originalFinal = finalSentinels.difficultyMultiplier;

    const variants = [
      { id: "baseline", first: 1, final: 1 },
      { id: "final110", first: 1, final: 1.10 },
      { id: "final115", first: 1, final: 1.15 },
      { id: "all110", first: 1.10, final: 1.10 },
    ] as const;

    for (const variant of variants) {
      firstSentinel.difficultyMultiplier = variant.first;
      finalSentinels.difficultyMultiplier = variant.final;
      console.log("ROAD2", variant.id, simulateCombatScenario({
        id: `road-${variant.id}`,
        questId: "road_of_glass",
        heroLevel: 8,
        partyClasses: party,
        difficultyId: "standard",
        runs: 6,
        seed: 8800,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
      }));
    }

    firstSentinel.difficultyMultiplier = originalFirst;
    finalSentinels.difficultyMultiplier = originalFinal;
  }, 120_000);
});
