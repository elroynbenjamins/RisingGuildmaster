import type { ClassDefinition } from "../../data/classes/classes";
import type { CombatSkillDefinition } from "./skillTypes";
import { manhattanDistance } from "./grid/distanceCalculator";
import { hasLineOfSight } from "./grid/lineOfSight";
import type { CombatBoardState, GridPosition } from "./grid/gridTypes";
export function getSkillRange(skill: CombatSkillDefinition, classDefinition?: ClassDefinition): number { const base = skill.range ?? 1; return base + (base > 1 ? classDefinition?.tactical.rangedSkillRangeModifier ?? 0 : 0); }
export function isPositionInSkillRange(attacker: GridPosition, target: GridPosition, skill: CombatSkillDefinition, board: CombatBoardState, classDefinition?: ClassDefinition): boolean { const range = getSkillRange(skill, classDefinition); return manhattanDistance(attacker, target) <= range && (range <= 1 || hasLineOfSight(attacker, target, board)); }
