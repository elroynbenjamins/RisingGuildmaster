import { defaultTacticalBehavior, TACTICAL_BEHAVIORS } from "../../data/enemyBehaviors/tacticalBehaviors";
import { getEnemyDefinition } from "../../data/enemies";
import type { RandomSource } from "../../utils/random";
import type { EnemyInstance } from "../enemies/enemyTypes";
import type { CombatUnit } from "./combatTypes";
import { manhattanDistance } from "./grid/distanceCalculator";
import { getReachablePositions } from "./grid/pathfinding";
import { findShortestPath } from "./grid/pathfinding";
import type { CombatBoardState, GridPosition } from "./grid/gridTypes";
import type { TacticalBehavior } from "./tacticalAiTypes";
import { getEffectiveMovementRange } from "./conditionResolver";
import { hasLineOfSight } from "./grid/lineOfSight";
import { leavesMeleeReach } from "./opportunityAttackService";
import type { EnemyAiLevel } from "../difficulty/difficultyTypes";

export function getEnemyTacticalBehavior(instance: EnemyInstance): TacticalBehavior {
  const definition = getEnemyDefinition(instance.enemyDefinitionId);
  return TACTICAL_BEHAVIORS[definition.id] ?? defaultTacticalBehavior(definition.role);
}

export function selectTacticalTarget(actor: CombatUnit, heroes: readonly CombatUnit[], behavior: TacticalBehavior, random: RandomSource, aiLevel: EnemyAiLevel = "trained"): CombatUnit | undefined {
  const living = heroes.filter((hero) => hero.isAlive);
  if (!living.length) return undefined;
  const critical = living.filter((hero) => hero.currentHP / Math.max(1, hero.maxHP) <= (aiLevel === "ruthless" ? .65 : .35));
  if (aiLevel !== "trained" && critical.length) return [...critical].sort((a, b) => a.currentHP / a.maxHP - b.currentHP / b.maxHP)[0];
  if (behavior.targetPriority === "random") return random.pick(living);
  return [...living].sort((a, b) => {
    if (behavior.targetPriority === "lowest_hp") return a.currentHP / a.maxHP - b.currentHP / b.maxHP;
    if (behavior.targetPriority === "highest_damage") return Math.max(b.stats.physicalDamage, b.stats.magicDamage) - Math.max(a.stats.physicalDamage, a.stats.magicDamage);
    return manhattanDistance(actor.position, a.position) - manhattanDistance(actor.position, b.position);
  })[0];
}

export function countPathReactionRisks(path: readonly GridPosition[], reactionThreats: readonly CombatUnit[]): number {
  const triggered = new Set<string>();
  for (let index = 1; index < path.length; index += 1) {
    const from = path[index - 1]!; const to = path[index]!;
    for (const threat of reactionThreats) if (!triggered.has(threat.combatantId) && leavesMeleeReach(threat.position, from, to)) triggered.add(threat.combatantId);
  }
  return triggered.size;
}

export function chooseEnemyDestination(board: CombatBoardState, actor: CombatUnit, target: CombatUnit, behavior: TacticalBehavior, reactionThreats: readonly CombatUnit[] = [], aiLevel: EnemyAiLevel = "tactical"): GridPosition {
  const currentDistance = manhattanDistance(actor.position, target.position);
  const candidates = [actor.position, ...getReachablePositions(board, actor.position, getEffectiveMovementRange(actor))];
  const retreating = behavior.retreatRange !== undefined && currentDistance < behavior.retreatRange;
  const lowHealthCaution = (1 - actor.currentHP / Math.max(1, actor.maxHP)) * 20;
  const score = (position: GridPosition): number => {
    const distance = manhattanDistance(position, target.position);
    const path = position.x === actor.position.x && position.y === actor.position.y ? [actor.position] : findShortestPath(board, actor.position, position, getEffectiveMovementRange(actor)) ?? [actor.position];
    const reactions = countPathReactionRisks(path, reactionThreats);
    const awareness = aiLevel === "trained" ? .45 : aiLevel === "ruthless" ? 1.35 : 1;
    const reactionPenalty = reactions * ((behavior.reactionRiskWeight ?? 35) + lowHealthCaution) * awareness;
    const rangePenalty = retreating && distance < (behavior.retreatRange ?? 0)
      ? ((behavior.retreatRange ?? 0) - distance) * 24
      : Math.abs(distance - behavior.preferredRange) * 12;
    const lineOfSightPenalty = behavior.preferredRange > 1 && !hasLineOfSight(position, target.position, board) ? 24 : 0;
    const adjacentHeroPenalty = behavior.retreatRange !== undefined ? reactionThreats.filter((hero) => manhattanDistance(position, hero.position) <= 1).length * 8 : 0;
    return rangePenalty + reactionPenalty + lineOfSightPenalty + adjacentHeroPenalty;
  };
  return candidates.sort((a, b) => score(a) - score(b) || manhattanDistance(a, target.position) - manhattanDistance(b, target.position))[0]!;
}
