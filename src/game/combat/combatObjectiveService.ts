import type { EncounterDefinition, EncounterObjectiveDefinition } from "../quests/questTypes";
import { positionKey, type GridPosition } from "./grid/gridTypes";

export interface ObjectiveHeroState { isAlive: boolean; position: GridPosition }
export interface ObjectiveEnemyState { isAlive: boolean; enemyDefinitionId: string }

export function getEncounterObjective(encounter: EncounterDefinition): EncounterObjectiveDefinition {
  return encounter.objective ?? { type: "eliminate_all" };
}

export function isEncounterObjectiveComplete(
  objective: EncounterObjectiveDefinition,
  round: number,
  heroes: readonly ObjectiveHeroState[],
  enemies: readonly ObjectiveEnemyState[],
): boolean {
  if (!heroes.some((hero) => hero.isAlive)) return false;
  const allEnemiesDefeated = enemies.every((enemy) => !enemy.isAlive);
  if (objective.type === "eliminate_all") return allEnemiesDefeated;
  if (objective.type === "eliminate_targets") {
    return objective.enemyDefinitionIds.every((enemyDefinitionId) =>
      !enemies.some((enemy) => enemy.enemyDefinitionId === enemyDefinitionId && enemy.isAlive));
  }
  if (objective.type === "survive_rounds") {
    return round > objective.rounds || (objective.allowEliminationVictory !== false && allEnemiesDefeated);
  }
  const zone = new Set(objective.positions.map(positionKey));
  const requiredHeroes = Math.min(Math.max(1, objective.requiredHeroes ?? 1), Math.max(1, heroes.length));
  return heroes.filter((hero) => hero.isAlive && zone.has(positionKey(hero.position))).length >= requiredHeroes;
}

export function describeEncounterObjective(objective: EncounterObjectiveDefinition): string {
  if (objective.label) return objective.label;
  if (objective.type === "eliminate_all") return "Defeat all enemies.";
  if (objective.type === "eliminate_targets") return objective.enemyDefinitionIds.length === 1
    ? "Defeat the priority target."
    : "Defeat all priority targets.";
  if (objective.type === "survive_rounds") return `Hold the position through Round ${objective.rounds}.`;
  const requiredHeroes = Math.max(1, objective.requiredHeroes ?? 1);
  return requiredHeroes === 1 ? "Reach the marked extraction zone." : `Get ${requiredHeroes} heroes into the marked extraction zone.`;
}

export function getEncounterObjectiveProgress(
  objective: EncounterObjectiveDefinition,
  round: number,
  heroes: readonly ObjectiveHeroState[],
  enemies: readonly ObjectiveEnemyState[],
): string {
  if (objective.type === "eliminate_all") return `${enemies.filter((enemy) => enemy.isAlive).length} enemies remain`;
  if (objective.type === "eliminate_targets") {
    const aliveTargets = objective.enemyDefinitionIds.filter((enemyDefinitionId) =>
      enemies.some((enemy) => enemy.enemyDefinitionId === enemyDefinitionId && enemy.isAlive)).length;
    return `${aliveTargets} priority target${aliveTargets === 1 ? "" : "s"} remain`;
  }
  if (objective.type === "survive_rounds") return `Round ${Math.min(round, objective.rounds)} / ${objective.rounds}`;
  const zone = new Set(objective.positions.map(positionKey));
  const inside = heroes.filter((hero) => hero.isAlive && zone.has(positionKey(hero.position))).length;
  const required = Math.min(Math.max(1, objective.requiredHeroes ?? 1), Math.max(1, heroes.length));
  return `${inside} / ${required} heroes in the zone`;
}
