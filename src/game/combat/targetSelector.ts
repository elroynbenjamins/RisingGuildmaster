import type { RandomSource } from "../../utils/random";
import type { CombatUnit } from "./combatTypes";
import type { SkillTargetType } from "./skillTypes";
import type { CombatSkillDefinition } from "./skillTypes";
import { manhattanDistance } from "./grid/distanceCalculator";
import { hasLineOfSight } from "./grid/lineOfSight";
import type { CombatBoardState } from "./grid/gridTypes";

export function getValidTargets(targetType: SkillTargetType, actor: CombatUnit, heroes: readonly CombatUnit[], enemies: readonly CombatUnit[]): CombatUnit[] {
  const opponents = (actor.side === "enemies" ? heroes : enemies).filter((unit) => unit.isAlive);
  const allies = (actor.side === "enemies" ? enemies : heroes).filter((unit) => unit.isAlive && unit.combatantId !== actor.combatantId);
  if (targetType === "self") return actor.isAlive ? [actor] : [];
  if (targetType === "all_enemies") return opponents;
  if (targetType === "all_allies") return allies;
  if (targetType === "single_ally") return allies;
  return opponents;
}

export function getTargetsInSkillRange(skill: CombatSkillDefinition, actor: CombatUnit, targets: readonly CombatUnit[], board: CombatBoardState, rangeOverride?: number): CombatUnit[] {
  const range = rangeOverride ?? skill.range ?? 1;
  return targets.filter((target) => manhattanDistance(actor.position, target.position) <= range && (range <= 1 || hasLineOfSight(actor.position, target.position, board)));
}

export function selectSkillTargets(targetType: SkillTargetType, actor: CombatUnit, heroes: readonly CombatUnit[], enemies: readonly CombatUnit[], random: RandomSource, preferWithoutConditions: readonly string[] = []): CombatUnit[] {
  const valid = getValidTargets(targetType, actor, heroes, enemies);
  if (targetType === "all_enemies" || targetType === "all_allies" || targetType === "self") return valid;
  const preferred = preferWithoutConditions.length ? valid.filter((unit) => preferWithoutConditions.every((id) => !unit.activeConditions.some((condition) => condition.conditionId === id))) : [];
  const pool = preferred.length ? preferred : valid;
  return pool.length ? [random.pick(pool)] : [];
}
