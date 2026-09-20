import type { EncounterDefinition } from "../../quests/questTypes";
import { findShortestPath } from "./pathfinding";
import { getTile, isPositionInBounds, positionKey, type CombatBoardState, type GridPosition } from "./gridTypes";

function assertWalkable(board: CombatBoardState, position: GridPosition, label: string): void {
  if (!isPositionInBounds(position, board)) throw new Error(`${label} is outside ${board.environmentId}: ${positionKey(position)}`);
  const tile = getTile(board, position);
  if (!tile || tile.blocksMovement) throw new Error(`${label} is not walkable on ${board.environmentId}: ${positionKey(position)}`);
}

export function validateEncounterReachability(board: CombatBoardState, encounter: EncounterDefinition): void {
  const enemySpawns = encounter.enemies.flatMap((group) => group.spawnPositions);
  const allSpawns = [...encounter.heroSpawnPositions, ...enemySpawns];
  const seen = new Set<string>();
  for (const [index, position] of allSpawns.entries()) {
    assertWalkable(board, position, index < encounter.heroSpawnPositions.length ? "Hero spawn" : "Enemy spawn");
    const key = positionKey(position);
    if (seen.has(key)) throw new Error(`Duplicate combat spawn on ${encounter.id}: ${key}`);
    seen.add(key);
  }

  for (const heroSpawn of encounter.heroSpawnPositions) {
    for (const enemySpawn of enemySpawns) {
      if (!findShortestPath(board, heroSpawn, enemySpawn)) {
        throw new Error(`Enemy at ${positionKey(enemySpawn)} cannot be reached from hero spawn ${positionKey(heroSpawn)} on ${encounter.id}`);
      }
    }
  }

  if (encounter.objective?.type === "reach_zone") {
    if (!encounter.objective.positions.length) throw new Error(`Reach-zone objective has no tiles on ${encounter.id}`);
    for (const position of encounter.objective.positions) assertWalkable(board, position, "Objective tile");
    for (const heroSpawn of encounter.heroSpawnPositions) {
      if (!encounter.objective.positions.some((position) => Boolean(findShortestPath(board, heroSpawn, position)))) {
        throw new Error(`Objective zone cannot be reached from hero spawn ${positionKey(heroSpawn)} on ${encounter.id}`);
      }
    }
  }

  if (encounter.objective?.type === "eliminate_targets") {
    const available = new Set(encounter.enemies.map((group) => group.enemyDefinitionId));
    for (const enemyDefinitionId of encounter.objective.enemyDefinitionIds) {
      if (!available.has(enemyDefinitionId)) throw new Error(`Priority target ${enemyDefinitionId} is missing from ${encounter.id}`);
    }
  }
}
