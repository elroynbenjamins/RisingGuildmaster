import { describe, expect, it } from "vitest";
import { CLASSES } from "../src/data/classes/classes";
import { RACES } from "../src/data/races/races";
import { HERO_SKILLS } from "../src/data/skills/heroSkills";
import { getAreaPositions } from "../src/game/combat/grid/areaCalculator";
import { createCombatBoard } from "../src/game/combat/grid/boardFactory";
import { manhattanDistance } from "../src/game/combat/grid/distanceCalculator";
import { isPositionInBounds, positionKey } from "../src/game/combat/grid/gridTypes";
import { hasLineOfSight } from "../src/game/combat/grid/lineOfSight";
import { calculateMovementRange, moveOccupant } from "../src/game/combat/grid/movementService";
import { findShortestPath, getReachablePositions } from "../src/game/combat/grid/pathfinding";
import { spawnOccupants } from "../src/game/combat/grid/spawnService";
import { getSkillRange, isPositionInSkillRange } from "../src/game/combat/skillRangeService";

describe("tactical grid", () => {
  it("uses 7x5 boundaries and Manhattan distance", () => { const board = createCombatBoard(); expect(board.tiles).toHaveLength(35); expect(isPositionInBounds({ x: 6, y: 4 }, board)).toBe(true); expect(isPositionInBounds({ x: 7, y: 4 }, board)).toBe(false); expect(manhattanDistance({ x: 1, y: 2 }, { x: 4, y: 2 })).toBe(3); });
  it("allows range-three movement but rejects range four", () => { const board = spawnOccupants(createCombatBoard(), [{ occupantId: "hero", position: { x: 1, y: 2 } }]); expect(findShortestPath(board, { x: 1, y: 2 }, { x: 4, y: 2 }, 3)).not.toBeNull(); expect(findShortestPath(board, { x: 1, y: 2 }, { x: 5, y: 2 }, 3)).toBeNull(); expect(() => moveOccupant(board, "hero", { x: 1, y: 2 }, { x: 5, y: 2 }, 3)).toThrow(); });
  it("blocks movement through obstacles and occupied tiles", () => { const board = spawnOccupants(createCombatBoard([{ x: 2, y: 2 }]), [{ occupantId: "hero", position: { x: 1, y: 2 } }, { occupantId: "ally", position: { x: 1, y: 1 } }]); const reachable = new Set(getReachablePositions(board, { x: 1, y: 2 }, 1).map(positionKey)); expect(reachable.has("2,2")).toBe(false); expect(reachable.has("1,1")).toBe(false); expect(reachable.has("0,2")).toBe(true); });
  it("obstacles block line of sight", () => { expect(hasLineOfSight({ x: 1, y: 2 }, { x: 5, y: 2 }, createCombatBoard([{ x: 3, y: 2 }]))).toBe(false); expect(hasLineOfSight({ x: 1, y: 2 }, { x: 5, y: 2 }, createCombatBoard())).toBe(true); });
  it("Fireball radius one uses only orthogonal tiles", () => { expect(getAreaPositions({ x: 4, y: 2 }, 1, createCombatBoard()).map(positionKey).sort()).toEqual(["3,2", "4,1", "4,2", "4,3", "5,2"].sort()); });
  it("uses class movement without invented racial movement bonuses", () => { expect(calculateMovementRange(20, CLASSES.ranger, RACES.elf)).toBe(4); expect(calculateMovementRange(20, CLASSES.paladin, RACES.dwarf)).toBe(2); expect(calculateMovementRange(100, CLASSES.ranger, RACES.elf)).toBe(5); });
  it("gives Ranger its range bonus and respects line of sight", () => { const bow = HERO_SKILLS.ranger_bow_shot!; expect(getSkillRange(bow, CLASSES.ranger)).toBe(6); expect(isPositionInSkillRange({ x: 0, y: 2 }, { x: 6, y: 2 }, bow, createCombatBoard(), CLASSES.ranger)).toBe(true); expect(isPositionInSkillRange({ x: 0, y: 2 }, { x: 6, y: 2 }, bow, createCombatBoard([{ x: 3, y: 2 }]), CLASSES.ranger)).toBe(false); });
});
