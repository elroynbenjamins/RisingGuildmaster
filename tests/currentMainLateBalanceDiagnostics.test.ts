import { describe, it } from "vitest";
import { simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

describe("current main late balance diagnostics", () => {
  it("compares prepared, one-level-behind, and severely underprepared late bosses", () => {
    const bosses = [
      { id: "ch7-varkesh", questId: "varkesh_gilded_rupture_boss", level: 13, seed: 9300 },
      { id: "ch8-nhal", questId: "admiral_nhal_veyr_boss", level: 15, seed: 9400 },
      { id: "ch9-serekh", questId: "serekh_chartmaker_boss", level: 17, seed: 9500 },
    ] as const;
    for (const boss of bosses) {
      for (const profile of [
        { suffix: "prepared", heroLevel: boss.level, gearProfile: "optional_progression" as const },
        { suffix: "underprepared", heroLevel: boss.level - 1, gearProfile: "optional_progression" as const },
        { suffix: "severely-underprepared", heroLevel: boss.level - 1, gearProfile: "lagged_basic" as const },
      ]) {
        console.log("PROFILE", simulateCombatScenario({
          id: `${boss.id}-${profile.suffix}`,
          questId: boss.questId,
          heroLevel: profile.heroLevel,
          partyClasses: ["warrior","ranger","cleric","mage"],
          difficultyId: "standard",
          runs: 8,
          seed: boss.seed,
          gearProfile: profile.gearProfile,
          progressionProfile: "subclass_ready",
        }));
      }
    }
  }, 300_000);

  it("checks prepared late campaign missions and Serekh higher difficulties", () => {
    for (const scenario of [
      { id: "ch7-siege", questId: "siege_of_skyvault", heroLevel: 13, seed: 8900 },
      { id: "ch8-siege", questId: "siege_of_tidewatch", heroLevel: 15, seed: 8920 },
      { id: "ch9-chain", questId: "chain_beneath_fleet", heroLevel: 17, seed: 8940 },
    ] as const) {
      console.log("MISSION", simulateCombatScenario({
        ...scenario,
        partyClasses: ["warrior","ranger","cleric","mage"],
        difficultyId: "standard",
        runs: 8,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
      }));
    }
    for (const difficultyId of ["veteran","iron_guild"] as const) {
      console.log("SEREKH-HARD", simulateCombatScenario({
        id: `serekh-${difficultyId}`,
        questId: "serekh_chartmaker_boss",
        heroLevel: 17,
        partyClasses: ["warrior","ranger","cleric","mage"],
        difficultyId,
        runs: 4,
        seed: 8975,
        gearProfile: "optional_progression",
        progressionProfile: "subclass_ready",
      }));
    }
  }, 240_000);
});
