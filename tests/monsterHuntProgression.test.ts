import { describe, expect, it } from "vitest";
import { BATTLEFIELDS } from "../src/data/combat/battlefields";
import { CRAFTING_RECIPES } from "../src/data/crafting/recipes";
import { EQUIPMENT } from "../src/data/equipment/equipment";
import { QUEST_EXPLORATION_STAGES } from "../src/data/quests/questExplorationStages";
import { createCombatState } from "../src/game/combat/combatEngine";
import { createHeroCombatInstance, createHeroCombatUnit } from "../src/game/combat/heroCombatFactory";
import { createCombatBoard } from "../src/game/combat/grid/boardFactory";
import { getTile } from "../src/game/combat/grid/gridTypes";
import { resolveQuestExplorationStage } from "../src/game/quests/questExplorationService";
import { rollHuntFragment } from "../src/game/quests/questResolver";
import { sequenceRandom } from "./combatTestUtils";
import { testHero } from "./testHero";

describe("monster hunt progression", () => {
  it("uses all six hero attributes across explicit D20 hunt checks", () => {
    const stages = Object.values(QUEST_EXPLORATION_STAGES).filter((stage) => ["coils_of_the_sunken_grove", "teeth_below_guildhaven", "white_maw_of_frostmarch"].includes(stage.questId));
    expect(new Set(stages.map((stage) => stage.attribute))).toEqual(new Set(["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"]));
    expect(stages.every((stage) => stage.difficultyClass >= 13 && stage.difficultyClass <= 17)).toBe(true);
  });

  it("turns success and failure into different combat setup effects", () => {
    const stage = QUEST_EXPLORATION_STAGES.sewer_predict_attack!;
    const hero = testHero();
    const success = resolveQuestExplorationStage(stage, [hero], sequenceRandom([.99]));
    const failure = resolveQuestExplorationStage(stage, [hero], sequenceRandom([0]));
    expect(success.combatEffect?.enemyInitiativeModifier).toBe(-2);
    expect(failure.combatEffect?.enemyOpeningAttackRollModifier).toBe(2);
  });

  it("guarantees the first fragment, caps repeat drops at one, and applies pity after three misses", () => {
    const first = rollHuntFragment({ victories: 0, failuresSinceFragment: 0 }, 1, .40, 3, sequenceRandom([.99]));
    expect(first).toEqual({ amount: 1, progress: { victories: 1, failuresSinceFragment: 0 } });
    let progress = first.progress;
    for (let misses = 1; misses <= 3; misses++) {
      const result = rollHuntFragment(progress, 1, .40, 3, sequenceRandom([.99]));
      expect(result.amount).toBe(0);
      progress = result.progress;
    }
    const pity = rollHuntFragment(progress, 1, .40, 3, sequenceRandom([.99]));
    expect(pity.amount).toBe(1);
    expect(pity.progress.failuresSinceFragment).toBe(0);
  });

  it("provides two three-fragment trophy recipes and valid equipment for each hunt", () => {
    const groups = [
      ["hunt_coilfang_longbow", "hunt_serpent_eye_ring", "serpent_recipe_fragment"],
      ["hunt_drowned_hide_bulwark", "hunt_sluicefang_ring", "crocodile_recipe_fragment"],
      ["hunt_white_maw_mantle", "hunt_aurora_fang_ring", "yeti_recipe_fragment"],
    ] as const;
    for (const [firstId, secondId, fragmentId] of groups) for (const recipeId of [firstId, secondId]) {
      const recipe = CRAFTING_RECIPES[recipeId]!;
      expect(recipe.materials[fragmentId]).toBe(3);
      expect(EQUIPMENT[recipe.outputEquipmentId]).toBeDefined();
    }
  });

  it("makes deep snow and cracked ice cost two movement points", () => {
    const board = createCombatBoard([], "skirmish", [{ position: { x: 1, y: 1 }, terrainType: "snow" }, { position: { x: 2, y: 1 }, terrainType: "cracked_ice" }]);
    expect(getTile(board, { x: 1, y: 1 })?.movementCost).toBe(2);
    expect(getTile(board, { x: 2, y: 1 })?.movementCost).toBe(2);
  });

  it("applies whiteout initiative and movement penalties to heroes before combat", () => {
    const heroes = [0, 1, 2, 3].map((index) => ({ ...testHero(), id: `hero-${index}` }));
    const baseHero = testHero();
    const baseInstance = createHeroCombatInstance(baseHero);
    const expectedUnpenalized = baseInstance.movementRange;
    const expectedInitiative = createHeroCombatUnit(baseHero, baseInstance).stats.initiativeBonus;
    const state = createCombatState("white_maw_of_frostmarch", 0, heroes, sequenceRandom(Array(50).fill(.5)));
    expect(BATTLEFIELDS.frostmarch_whiteout?.combatModifiers).toEqual({ heroInitiativeModifier: -1, heroMovementRangeModifier: -1 });
    expect(state.heroes[0]!.unit.movementRange).toBe(expectedUnpenalized - 1);
    expect(state.heroes[0]!.unit.stats.initiativeBonus).toBe(expectedInitiative - 1);
  });
});
