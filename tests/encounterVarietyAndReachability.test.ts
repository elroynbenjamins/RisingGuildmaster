import { describe, expect, it } from "vitest";
import { BATTLEFIELDS } from "../src/data/combat/battlefields";
import { QUEST_ENCOUNTERS } from "../src/data/encounters/questEncounters";
import {
  describeEncounterObjective,
  getEncounterObjectiveProgress,
  isEncounterObjectiveComplete,
} from "../src/game/combat/combatObjectiveService";
import { createCombatBoard } from "../src/game/combat/grid/boardFactory";
import { ensureConnectedBattlefield } from "../src/game/combat/grid/boardConnectivity";
import { validateEncounterReachability } from "../src/game/combat/grid/encounterReachability";

describe("varied encounter objectives", () => {
  const heroes = [
    { isAlive: true, position: { x: 1, y: 1 } },
    { isAlive: true, position: { x: 2, y: 1 } },
  ];

  it("allows priority-target victories without requiring every add to be defeated", () => {
    const enemies = [
      { isAlive: false, enemyDefinitionId: "boss" },
      { isAlive: true, enemyDefinitionId: "guard" },
    ];
    const objective = { type: "eliminate_targets", enemyDefinitionIds: ["boss"], label: "Defeat the boss." } as const;
    expect(isEncounterObjectiveComplete(objective, 2, heroes, enemies)).toBe(true);
    expect(describeEncounterObjective(objective)).toBe("Defeat the boss.");
  });

  it("supports holdout victories after the authored number of rounds", () => {
    const objective = { type: "survive_rounds", rounds: 4, allowEliminationVictory: false } as const;
    const enemies = [{ isAlive: true, enemyDefinitionId: "raider" }];
    expect(isEncounterObjectiveComplete(objective, 4, heroes, enemies)).toBe(false);
    expect(isEncounterObjectiveComplete(objective, 5, heroes, enemies)).toBe(true);
    expect(getEncounterObjectiveProgress(objective, 3, heroes, enemies)).toBe("Round 3 / 4");
  });

  it("supports extraction and rescue zones with multiple required heroes", () => {
    const objective = { type: "reach_zone", positions: [{ x: 4, y: 4 }, { x: 4, y: 5 }], requiredHeroes: 2 } as const;
    const enemies = [{ isAlive: true, enemyDefinitionId: "pursuer" }];
    expect(isEncounterObjectiveComplete(objective, 1, heroes, enemies)).toBe(false);
    const extracted = [
      { isAlive: true, position: { x: 4, y: 4 } },
      { isAlive: true, position: { x: 4, y: 5 } },
    ];
    expect(isEncounterObjectiveComplete(objective, 1, extracted, enemies)).toBe(true);
    expect(getEncounterObjectiveProgress(objective, 1, extracted, enemies)).toBe("2 / 2 heroes in the zone");
    const solo = [{ isAlive: true, position: { x: 4, y: 4 } }];
    expect(isEncounterObjectiveComplete(objective, 1, solo, enemies)).toBe(true);
    expect(getEncounterObjectiveProgress(objective, 1, solo, enemies)).toBe("1 / 1 heroes in the zone");
  });
});

describe("encounter battlefield reachability", () => {
  it("keeps every authored enemy reachable from every authored hero spawn", () => {
    for (const encounter of Object.values(QUEST_ENCOUNTERS)) {
      const battlefield = BATTLEFIELDS[encounter.battlefieldId];
      expect(battlefield, `Missing battlefield ${encounter.battlefieldId} for ${encounter.id}`).toBeDefined();
      const board = ensureConnectedBattlefield(createCombatBoard(
        encounter.obstaclePositions,
        battlefield!.boardSizeId,
        battlefield!.terrainPlacements,
        battlefield!.id,
      ));
      expect(() => validateEncounterReachability(board, encounter), encounter.id).not.toThrow();
    }
  });

  it("gives every authored reach-zone objective a route from every hero spawn", () => {
    const extractionEncounters = Object.values(QUEST_ENCOUNTERS).filter((encounter) => encounter.objective?.type === "reach_zone");
    expect(extractionEncounters.length).toBeGreaterThanOrEqual(2);
    for (const encounter of extractionEncounters) {
      const battlefield = BATTLEFIELDS[encounter.battlefieldId]!;
      const board = ensureConnectedBattlefield(createCombatBoard(
        encounter.obstaclePositions,
        battlefield.boardSizeId,
        battlefield.terrainPlacements,
        battlefield.id,
      ));
      expect(() => validateEncounterReachability(board, encounter), encounter.id).not.toThrow();
    }
  });
});
