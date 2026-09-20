import type { RandomSource } from "../../../utils/random";
export function rollDie(sides: number, random: RandomSource): number { if (!Number.isInteger(sides) || sides < 2) throw new Error("Die must have at least two sides"); return random.int(1, sides); }
