import type { RandomSource } from "../../../utils/random";
import { rollDie } from "./diceService";
import type { AttackRollResult } from "./diceTypes";
export function resolveAttackRoll(diceRoll: number, attackBonus: number, skillModifier: number, targetValue: number): AttackRollResult {
  const criticalMiss = diceRoll === 1; const critical = diceRoll === 20; const total = diceRoll + attackBonus + skillModifier; const hit = critical || (!criticalMiss && total >= targetValue);
  return { diceRoll, attackBonus, skillModifier, total, targetValue, hit, critical, criticalMiss, result: critical ? "critical" : criticalMiss ? "critical_miss" : hit ? "hit" : "miss" };
}
export function rollAttack(random: RandomSource, attackBonus: number, skillModifier: number, targetValue: number): AttackRollResult { return resolveAttackRoll(rollDie(20, random), attackBonus, skillModifier, targetValue); }
