import type { RandomSource } from "../../utils/random";
import type { CombatUnit, SkillHitResult } from "./combatTypes";
import type { GridPosition } from "./grid/gridTypes";
import { manhattanDistance } from "./grid/distanceCalculator";
import { resolveSkill } from "./skillResolver";
import type { CombatSkillDefinition } from "./skillTypes";

const REACTION_BLOCKING_CONDITIONS = new Set(["stunned", "frozen", "incapacitated", "paralyzed", "unconscious"]);

export interface OpportunityAttackSource {
  unit: CombatUnit;
  skill: CombatSkillDefinition;
}

export interface OpportunityAttackEvent {
  attackerId: string;
  skillId: string;
  hit: SkillHitResult;
}

export interface OpportunityMovementResolution {
  mover: CombatUnit;
  reactors: CombatUnit[];
  finalPosition: GridPosition;
  spentReactionIds: string[];
  events: OpportunityAttackEvent[];
  travelledTiles: number;
}

export function leavesMeleeReach(attackerPosition: GridPosition, from: GridPosition, to: GridPosition): boolean {
  return manhattanDistance(attackerPosition, from) <= 1 && manhattanDistance(attackerPosition, to) > 1;
}

export function canMakeOpportunityAttack(source: OpportunityAttackSource, spentReactionIds: ReadonlySet<string>): boolean {
  return source.unit.isAlive
    && !spentReactionIds.has(source.unit.combatantId)
    && !source.unit.activeConditions.some((condition) => REACTION_BLOCKING_CONDITIONS.has(condition.conditionId))
    && source.skill.type === "basic_attack"
    && (source.skill.range ?? 1) <= 1
    && source.skill.damageType !== undefined
    && source.skill.damageMultiplier !== undefined;
}

/** Resolves reactions immediately before each path step that leaves an enemy's melee reach. */
export function resolveOpportunityMovement(
  originalMover: CombatUnit,
  originalReactors: readonly OpportunityAttackSource[],
  path: readonly GridPosition[],
  alreadySpentReactionIds: readonly string[],
  random: RandomSource,
): OpportunityMovementResolution {
  let mover = { ...originalMover };
  let reactors = originalReactors.map((source) => ({ ...source, unit: { ...source.unit } }));
  const spent = new Set(alreadySpentReactionIds);
  const events: OpportunityAttackEvent[] = [];
  let current = path[0] ?? originalMover.position;
  let travelledTiles = 0;

  for (const next of path.slice(1)) {
    const eligible = reactors.filter((source) => canMakeOpportunityAttack(source, spent) && leavesMeleeReach(source.unit.position, current, next));
    for (const source of eligible) {
      if (!mover.isAlive) break;
      const result = resolveSkill(source.unit, [{ ...mover, position: current }], source.skill, random);
      const hit = result.resolution.hits[0]!;
      mover = result.targets[0]!;
      reactors = reactors.map((entry) => entry.unit.combatantId === source.unit.combatantId ? { ...entry, unit: result.actor } : entry);
      spent.add(source.unit.combatantId);
      events.push({ attackerId: source.unit.combatantId, skillId: source.skill.id, hit });
    }
    if (!mover.isAlive) break;
    current = next;
    travelledTiles += 1;
    mover = { ...mover, position: current };
  }

  return { mover: { ...mover, position: current }, reactors: reactors.map((source) => source.unit), finalPosition: current, spentReactionIds: [...spent], events, travelledTiles };
}
