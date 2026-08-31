import { describe, expect, it } from "vitest";
import { createCombatBoard } from "../src/game/combat/grid/boardFactory";
import { getElevationAttackRollModifier } from "../src/game/combat/grid/elevationService";

describe("combat elevation", () => {
  const board = createCombatBoard([], "skirmish", [
    { position: { x: 1, y: 1 }, terrainType: "normal", elevation: 2 },
    { position: { x: 4, y: 1 }, terrainType: "normal", elevation: 0 },
  ]);

  it("rewards ranged attacks from high ground and penalizes shots uphill", () => {
    expect(getElevationAttackRollModifier(board, { x: 1, y: 1 }, { x: 4, y: 1 }, 5)).toBe(2);
    expect(getElevationAttackRollModifier(board, { x: 4, y: 1 }, { x: 1, y: 1 }, 5)).toBe(-2);
  });

  it("does not affect adjacent melee attacks", () => {
    expect(getElevationAttackRollModifier(board, { x: 1, y: 1 }, { x: 2, y: 1 }, 1)).toBe(0);
  });
});
