import type { RandomSource } from "../../../utils/random";
import { rollDie } from "./diceService";
import type { AttackRollResult } from "./diceTypes";
import { chooseD20Roll, type D20RollMode } from "./d20RollMode";
export function resolveAttackRoll(diceRoll: number, attackBonus: number, skillModifier: number, targetValue: number, rollMode: D20RollMode = "normal", diceRolls: number[] = [diceRoll]): AttackRollResult {
  const criticalMiss = diceRoll === 1; const critical = diceRoll === 20; const total = diceRoll + attackBonus + skillModifier; const hit = critical || (!criticalMiss && total >= targetValue);
  return { diceRoll, diceRolls, rollMode, attackBonus, skillModifier, total, targetValue, hit, critical, criticalMiss, result: critical ? "critical" : criticalMiss ? "critical_miss" : hit ? "hit" : "miss" };
}
export function rollAttack(random: RandomSource, attackBonus: number, skillModifier: number, targetValue: number, rollMode: D20RollMode = "normal"): AttackRollResult {
  const diceRolls = rollMode === "normal" ? [rollDie(20, random)] : [rollDie(20, random), rollDie(20, random)];
  return resolveAttackRoll(chooseD20Roll(diceRolls, rollMode), attackBonus, skillModifier, targetValue, rollMode, diceRolls);
}
