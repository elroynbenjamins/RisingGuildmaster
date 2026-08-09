import type { RandomSource } from "../../../utils/random";
import { rollDie } from "./diceService";
import type { SavingThrowResult, SavingThrowType } from "./diceTypes";
export function resolveSavingThrow(type: SavingThrowType, bonus: number, difficultyClass: number, random: RandomSource): SavingThrowResult { const diceRoll = rollDie(20, random); const total = diceRoll + bonus; return { type, diceRoll, bonus, total, difficultyClass, success: diceRoll === 20 || (diceRoll !== 1 && total >= difficultyClass) }; }
