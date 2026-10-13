import { manhattanDistance } from "./grid/distanceCalculator";
import { positionKey, type CombatBoardState } from "./grid/gridTypes";
import { isPositionInSkillRange } from "./skillRangeService";
import type { CombatUnit } from "./combatTypes";
import type { CombatSkillDefinition } from "./skillTypes";
import type { ClassDefinition } from "../../data/classes/classes";

/** Only permit AoE target tiles whose actual impact area contains a living opponent. */
export function getAreaTargetableKeys(
  skill: CombatSkillDefinition,
  actor: CombatUnit,
  opponents: readonly CombatUnit[],
  board: CombatBoardState,
  classDefinition?: ClassDefinition,
): Set<string> {
  if (skill.areaRadius === undefined || skill.areaRadius < 0) return new Set();
  const living = opponents.filter((unit) => unit.isAlive);
  return new Set(board.tiles.filter((tile) =>
    !tile.blocksMovement
    && isPositionInSkillRange(actor.position, tile.position, skill, board, classDefinition)
    && living.some((unit) => manhattanDistance(tile.position, unit.position) <= skill.areaRadius!)
  ).map((tile) => positionKey(tile.position)));
}
