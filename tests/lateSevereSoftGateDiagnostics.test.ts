import { describe, it } from "vitest";
import { QUESTS } from "../src/data/quests/quests";
import { CRAFTING_RECIPES } from "../src/data/crafting/recipes";
import { createSimulationParty } from "../src/game/simulation/balanceSimulation";

const classes = ["warrior", "ranger", "cleric", "mage"] as const;

describe("late prepared gear-source diagnostics", () => {
  it("reports simulated gear that is unlocked by the fight being simulated", () => {
    for (const scenario of [
      { questId: "varkesh_gilded_rupture_boss", level: 13, seed: 8910 },
      { questId: "admiral_nhal_veyr_boss", level: 15, seed: 8930 },
      { questId: "serekh_chartmaker_boss", level: 17, seed: 8950 },
    ] as const) {
      const rewardEquipmentIds = new Set((QUESTS[scenario.questId]?.recipeUnlockIdsOnVictory ?? [])
        .map((recipeId) => CRAFTING_RECIPES[recipeId]?.outputEquipmentId)
        .filter((id): id is string => Boolean(id)));
      const party = createSimulationParty(classes, scenario.level, scenario.seed, "optional_progression", "subclass_ready");
      console.log("GEAR_SOURCE", scenario.questId, {
        rewardEquipmentIds: [...rewardEquipmentIds],
        heroes: party.map((hero) => ({
          classId: hero.classId,
          equipment: hero.equipment,
          usesCurrentQuestReward: Object.values(hero.equipment).some((id) => id ? rewardEquipmentIds.has(id) : false),
        })),
      });
    }
  });
});
