import { defaultTacticalBehavior, TACTICAL_BEHAVIORS } from "../../data/enemyBehaviors/tacticalBehaviors";
import { getEnemyDefinition } from "../../data/enemies";
import type { RandomSource } from "../../utils/random";
import type { EnemyInstance } from "../enemies/enemyTypes";
import type { CombatUnit } from "./combatTypes";
import { manhattanDistance } from "./grid/distanceCalculator";
import { getReachablePositions } from "./grid/pathfinding";
import type { CombatBoardState, GridPosition } from "./grid/gridTypes";
import type { TacticalBehavior } from "./tacticalAiTypes";
import { getEffectiveMovementRange } from "./conditionResolver";

export function getEnemyTacticalBehavior(instance: EnemyInstance): TacticalBehavior {
  const definition = getEnemyDefinition(instance.enemyDefinitionId);
  return TACTICAL_BEHAVIORS[definition.id] ?? defaultTacticalBehavior(definition.role);
}

export function selectTacticalTarget(actor: CombatUnit, heroes: readonly CombatUnit[], behavior: TacticalBehavior, random: RandomSource): CombatUnit | undefined {
  const living = heroes.filter((hero) => hero.isAlive);
  if (!living.length) return undefined;
  if (behavior.targetPriority === "random") return random.pick(living);
  return [...living].sort((a, b) => {
    if (behavior.targetPriority === "lowest_hp") return a.currentHP / a.maxHP - b.currentHP / b.maxHP;
    if (behavior.targetPriority === "highest_damage") return Math.max(b.stats.physicalDamage, b.stats.magicDamage) - Math.max(a.stats.physicalDamage, a.stats.magicDamage);
    return manhattanDistance(actor.position, a.position) - manhattanDistance(actor.position, b.position);
  })[0];
}

export function chooseEnemyDestination(board: CombatBoardState, actor: CombatUnit, target: CombatUnit, behavior: TacticalBehavior): GridPosition {
  const currentDistance = manhattanDistance(actor.position, target.position);
  const candidates = [actor.position, ...getReachablePositions(board, actor.position, getEffectiveMovementRange(actor))];
  const retreating = behavior.retreatRange !== undefined && currentDistance < behavior.retreatRange;
  return candidates.sort((a, b) => {
    const distanceA = manhattanDistance(a, target.position);
    const distanceB = manhattanDistance(b, target.position);
    if (retreating) return distanceB - distanceA;
    const scoreA = Math.abs(distanceA - behavior.preferredRange);
    const scoreB = Math.abs(distanceB - behavior.preferredRange);
    return scoreA - scoreB || distanceA - distanceB;
  })[0]!;
}
