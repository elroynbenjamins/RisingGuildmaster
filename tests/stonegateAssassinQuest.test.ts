import { describe, expect, it } from "vitest";
import { CHAPTER_2 } from "../src/data/campaign/chapter2";
import { BATTLEFIELDS } from "../src/data/combat/battlefields";
import { ENEMIES } from "../src/data/enemies";
import { ENEMY_PORTRAITS } from "../src/data/enemies/enemyPortraits";
import { QUEST_ENCOUNTERS } from "../src/data/encounters/questEncounters";
import { ENEMY_BEHAVIORS } from "../src/data/enemyBehaviors/enemyBehaviors";
import { QUEST_EXPLORATION_STAGES } from "../src/data/quests/questExplorationStages";
import { QUESTS } from "../src/data/quests/quests";
import { ENEMY_SKILLS } from "../src/data/skills/enemySkills";
import { createCombatBoard } from "../src/game/combat/grid/boardFactory";
import { isQuestAvailable } from "../src/game/quests/questAvailability";
import { createWorldState } from "../src/game/world/worldState";

describe("The Knives of Stonegate", () => {
  it("is a lethal four-hero Chapter 2 side quest gated behind Voices Under Stone", () => {
    const quest = QUESTS.knives_of_stonegate!;
    expect(quest).toMatchObject({ campaignChapter: 2, difficulty: 9, recommendedLevelMin: 8, recommendedLevelMax: 9, minPartySize: 4, maxPartySize: 4 });
    expect(CHAPTER_2.sideQuestIds).toContain(quest.id);
    expect(isQuestAvailable(quest, createWorldState())).toBe(false);
    expect(isQuestAvailable(quest, { ...createWorldState(), completedCampaignNodeIds: ["voices_under_stone"] })).toBe(true);
  });

  it("turns failed investigation and chase rolls into assassin stealth advantages", () => {
    const murderRoom = QUEST_EXPLORATION_STAGES.knives_read_murder_room!;
    const rooftops = QUEST_EXPLORATION_STAGES.knives_cross_rain_roofs!;
    const killbox = QUEST_EXPLORATION_STAGES.knives_spot_tripwires!;
    expect([murderRoom.difficultyClass, rooftops.difficultyClass, killbox.difficultyClass]).toEqual([15, 16, 17]);
    expect(murderRoom.failureCombatEffect).toMatchObject({ enemyInitiativeModifier: 2, enemyOpeningAttackRollModifier: 1 });
    expect(rooftops.failureCombatEffect).toMatchObject({ enemyMovementRangeModifier: 1, enemyInitiativeModifier: 1 });
    expect(killbox.failureCombatEffect).toMatchObject({ enemyInitiativeModifier: 2, enemyOpeningAttackRollModifier: 2, enemyDamageModifier: .10 });
    expect(rooftops.failureConditionId).toBe("sprained_ankle");
  });

  it("uses a unique warfront chase board with gameplay-relevant trap tiles", () => {
    const field = BATTLEFIELDS.stonegate_midnight_chase!;
    expect(field.boardSizeId).toBe("warfront");
    expect(QUEST_ENCOUNTERS.gloam_knives_rooftop_pursuit?.battlefieldId).toBe(field.id);
    expect(QUEST_ENCOUNTERS.bell_of_measures_killbox?.battlefieldId).toBe(field.id);
    expect(field.terrainPlacements.filter((tile) => tile.terrainType === "trap").length).toBeGreaterThanOrEqual(6);
    const board = createCombatBoard([], field.boardSizeId, field.terrainPlacements, field.id);
    expect(board.tiles.find((tile) => tile.terrainType === "trap")).toMatchObject({ movementCost: 2, blocksMovement: false });
  });

  it("defines a complete assassin cell with portraits, skills and tactical behaviors", () => {
    for (const id of ["gloam_knife_assassin", "nightglass_trapper", "seressa_vane"]) {
      const enemy = ENEMIES[id]!;
      expect(enemy).toBeDefined();
      expect(ENEMY_PORTRAITS[id]).toBeDefined();
      expect(ENEMY_BEHAVIORS[enemy.behaviorId]).toBeDefined();
      expect(enemy.skillIds.every((skillId) => ENEMY_SKILLS[skillId])).toBe(true);
    }
    expect(ENEMY_SKILLS.silent_coordination?.aura).toMatchObject({ target: "same_faction_allies", factionId: "bandits", excludeSelf: true });
    expect(ENEMY_SKILLS.vanishing_cut).toMatchObject({ damageMultiplier: 1.55, attackRollModifier: 2, cooldownTurns: 3 });
  });
});
