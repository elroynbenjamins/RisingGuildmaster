import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";
import { QUESTS } from "../src/data/quests/quests";
import { QUEST_ENCOUNTERS } from "../src/data/encounters/questEncounters";

const party = ["warrior", "ranger", "cleric", "mage"] as const;

describe("midgame pressure diagnostics", () => {
  it("measures Road of Glass recovery pressure", () => {
    const quest = QUESTS.road_of_glass!;
    const originalRecovery = quest.betweenEncounterHpRecoveryRatio;
    for (const recovery of [.10, .05, 0] as const) {
      quest.betweenEncounterHpRecoveryRatio = recovery;
      console.log("ROAD", recovery, simulateCombatScenario({
        id: `road-r${recovery}`,
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
    quest.betweenEncounterHpRecoveryRatio = originalRecovery;
  }, 180_000);

  it("measures Laurel Law with a full occupation squad", () => {
    const quest = QUESTS.laurel_law!;
    const market = QUEST_ENCOUNTERS.laurel_market_curfew!;
    const square = QUEST_ENCOUNTERS.laurel_charter_square!;
    const marketVanguard = market.enemies.find((group) => group.enemyDefinitionId === "laurel_vanguard")!;
    const squareVanguard = square.enemies.find((group) => group.enemyDefinitionId === "laurel_vanguard")!;
    const originalRecovery = quest.betweenEncounterHpRecoveryRatio;
    const originalMarketCount = marketVanguard.count;
    const originalSquareCount = squareVanguard.count;

    const variants = [
      { id: "baseline", recovery: .10, count: 2 },
      { id: "full-squad", recovery: .10, count: 3 },
      { id: "full-squad-r5", recovery: .05, count: 3 },
    ] as const;

    for (const variant of variants) {
      quest.betweenEncounterHpRecoveryRatio = variant.recovery;
      marketVanguard.count = variant.count;
      squareVanguard.count = variant.count;
      for (const profile of [
        { id: "prepared", level: 10, gearProfile: "optional_progression" as const, runs: 6 },
        { id: "basic", level: 10, gearProfile: "lagged_basic" as const, runs: 4 },
        { id: "behind", level: 9, gearProfile: "lagged_basic" as const, runs: 4 },
      ]) {
        console.log("LAUREL", variant.id, profile.id, simulateCombatScenario({
          id: `laurel-${variant.id}-${profile.id}`,
          questId: "laurel_law",
          heroLevel: profile.level,
          partyClasses: party,
          difficultyId: "standard",
          runs: profile.runs,
          seed: profile.id === "prepared" ? 8810 : 8710,
          gearProfile: profile.gearProfile,
          progressionProfile: "subclass_ready",
        }));
      }
    }

    quest.betweenEncounterHpRecoveryRatio = originalRecovery;
    marketVanguard.count = originalMarketCount;
    squareVanguard.count = originalSquareCount;
  }, 240_000);
});
