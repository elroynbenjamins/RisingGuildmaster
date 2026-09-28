import { describe, expect, it } from "vitest";
import { QUESTS } from "../src/data/quests/quests";
import { CRAFTING_RECIPES } from "../src/data/crafting/recipes";
import { createSimulationParty, simulateCombatScenario } from "../src/game/simulation/balanceSimulation";

const classes = ["warrior", "ranger", "cleric", "mage"] as const;

function currentRewardEquipment(questId: string): Set<string> {
  return new Set((QUESTS[questId]?.recipeUnlockIdsOnVictory ?? [])
    .map((recipeId) => CRAFTING_RECIPES[recipeId]?.outputEquipmentId)
    .filter((id): id is string => Boolean(id)));
}

describe("late progression-aware balance diagnostics", () => {
  it("excludes current boss rewards from prepared simulation gear", () => {
    for (const scenario of [
      { questId: "varkesh_gilded_rupture_boss", level: 13, seed: 8910 },
      { questId: "admiral_nhal_veyr_boss", level: 15, seed: 8930 },
      { questId: "serekh_chartmaker_boss", level: 17, seed: 8950 },
    ] as const) {
      const rewards = currentRewardEquipment(scenario.questId);
      const party = createSimulationParty(classes, scenario.level, scenario.seed, "optional_progression", "subclass_ready", scenario.questId);
      expect(party.some((hero) => Object.values(hero.equipment).some((id) => id ? rewards.has(id) : false)), scenario.questId).toBe(false);
      console.log("REALISTIC_LOADOUT", scenario.questId, party.map((hero) => ({ classId: hero.classId, equipment: hero.equipment })));
    }
  });

  it("Varkesh realistic preparation gradient", () => {
    for (const profile of [
      { suffix: "prepared", level: 13, gearProfile: "optional_progression" as const },
      { suffix: "severe", level: 12, gearProfile: "lagged_basic" as const },
    ]) console.log("REALISTIC_VARKESH", simulateCombatScenario({
      id: `varkesh-${profile.suffix}`, questId: "varkesh_gilded_rupture_boss", heroLevel: profile.level,
      partyClasses: classes, difficultyId: "standard", runs: 12, seed: 9600,
      gearProfile: profile.gearProfile, progressionProfile: "subclass_ready",
    }));
  }, 240_000);

  it("Nhal realistic preparation gradient", () => {
    for (const profile of [
      { suffix: "prepared", level: 15, gearProfile: "optional_progression" as const },
      { suffix: "severe", level: 14, gearProfile: "lagged_basic" as const },
    ]) console.log("REALISTIC_NHAL", simulateCombatScenario({
      id: `nhal-${profile.suffix}`, questId: "admiral_nhal_veyr_boss", heroLevel: profile.level,
      partyClasses: classes, difficultyId: "standard", runs: 12, seed: 9700,
      gearProfile: profile.gearProfile, progressionProfile: "subclass_ready",
    }));
  }, 240_000);

  it("Serekh realistic preparation gradient", () => {
    for (const profile of [
      { suffix: "prepared", level: 17, gearProfile: "optional_progression" as const },
      { suffix: "severe", level: 16, gearProfile: "lagged_basic" as const },
    ]) console.log("REALISTIC_SEREKH", simulateCombatScenario({
      id: `serekh-${profile.suffix}`, questId: "serekh_chartmaker_boss", heroLevel: profile.level,
      partyClasses: classes, difficultyId: "standard", runs: 12, seed: 9850,
      gearProfile: profile.gearProfile, progressionProfile: "subclass_ready",
    }));
  }, 240_000);
});
