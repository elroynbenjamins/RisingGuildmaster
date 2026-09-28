import { describe, expect, it } from "vitest";
import { createSimulationParty, simulateCombatScenario } from "../src/game/simulation/balanceSimulation";
import { QUEST_ENCOUNTERS } from "../src/data/encounters/questEncounters";

const classes = ["warrior", "ranger", "cleric", "mage"] as const;

describe("late progression-aware balance diagnostics", () => {
  it("keeps Varkesh post-boss-only gear out of pre-boss prepared profiles", () => {
    for (const questId of ["siege_of_skyvault", "varkesh_gilded_rupture_boss"] as const) {
      const party = createSimulationParty(classes, 13, 8910, "optional_progression", "subclass_ready", questId);
      expect(party.some((hero) => Object.values(hero.equipment).includes("concordance-glaive")), questId).toBe(false);
    }
  });

  const runSerekhCandidate = (bossScale: number) => {
    const final = QUEST_ENCOUNTERS.serekh_abyss_platform!;
    const boss = final.enemies.find((group) => group.enemyDefinitionId === "serekh_chartmaker")!;
    const original = boss.difficultyMultiplier;
    boss.difficultyMultiplier = bossScale;
    const prepared = simulateCombatScenario({
      id: `serekh-prepared-${bossScale}`, questId: "serekh_chartmaker_boss", heroLevel: 17,
      partyClasses: classes, difficultyId: "standard", runs: 12, seed: 9850,
      gearProfile: "optional_progression", progressionProfile: "subclass_ready",
    });
    const severe = simulateCombatScenario({
      id: `serekh-severe-${bossScale}`, questId: "serekh_chartmaker_boss", heroLevel: 16,
      partyClasses: classes, difficultyId: "standard", runs: 12, seed: 9850,
      gearProfile: "lagged_basic", progressionProfile: "subclass_ready",
    });
    boss.difficultyMultiplier = original;
    console.log("SEREKH_FINAL_SCALE", bossScale, { prepared, severe });
  };

  it("Serekh final scale 1.35", () => runSerekhCandidate(1.35), 180_000);
  it("Serekh final scale 1.40", () => runSerekhCandidate(1.40), 180_000);
  it("Serekh final scale 1.45", () => runSerekhCandidate(1.45), 180_000);
});
