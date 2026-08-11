import { describe, expect, it } from "vitest";
import { clearDefeatedOccupants } from "../src/game/combat/combatEngine";
import { createCombatBoard } from "../src/game/combat/grid/boardFactory";
import { getTile } from "../src/game/combat/grid/gridTypes";
import { moveOccupant } from "../src/game/combat/grid/movementService";
import { spawnOccupants } from "../src/game/combat/grid/spawnService";
import { combatUnit } from "./combatTestUtils";

describe("defeated unit board cleanup", () => {
  it("does not erase a living unit that moved onto a defeated unit's former tile", () => {
    const formerTile = { x: 2, y: 2 };
    const start = { x: 1, y: 2 };
    const defeated = combatUnit("defeated", "enemies", { position: formerTile, currentHP: 0, isAlive: false });
    const living = combatUnit("living", "heroes", { position: start });
    let board = spawnOccupants(createCombatBoard(), [
      { occupantId: defeated.combatantId, position: formerTile },
      { occupantId: living.combatantId, position: start },
    ]);

    board = clearDefeatedOccupants(board, [defeated, living]);
    board = moveOccupant(board, living.combatantId, start, formerTile, 1).board;
    board = clearDefeatedOccupants(board, [defeated, { ...living, position: formerTile }]);

    expect(getTile(board, formerTile)?.occupantId).toBe(living.combatantId);
  });
});
