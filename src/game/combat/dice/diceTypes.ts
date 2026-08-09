export type D20ResultType = "critical" | "hit" | "miss" | "critical_miss";
export interface AttackRollResult { diceRoll: number; attackBonus: number; skillModifier: number; total: number; targetValue: number; hit: boolean; critical: boolean; criticalMiss: boolean; result: D20ResultType }
export type SavingThrowType = "strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma";
export interface SavingThrowResult { diceRoll: number; bonus: number; total: number; difficultyClass: number; success: boolean; type: SavingThrowType }
