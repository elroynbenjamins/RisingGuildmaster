import type { RandomSource } from "../../utils/random";
import { ATTRIBUTE_KEYS, type AttributeKey, type Attributes } from "./types";

/** Standard D&D ability modifier: 10–11 = +0, with one step per two points. */
export function calculateAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatAbilityModifier(score: number): string {
  const modifier = calculateAbilityModifier(score);
  return `${modifier >= 0 ? "+" : ""}${modifier}`;
}

/** Rolls four six-sided dice and drops the lowest die. Result range: 3–18. */
export function rollDndAbilityScore(random: RandomSource): number {
  const rolls = [random.int(1, 6), random.int(1, 6), random.int(1, 6), random.int(1, 6)].sort((a, b) => a - b);
  return rolls[1]! + rolls[2]! + rolls[3]!;
}

/**
 * Rolls a complete D&D-style array and assigns the strongest scores according
 * to the class definition. This keeps recruits varied while making them viable
 * representatives of their chosen class.
 */
export function generateDndAttributes(random: RandomSource, priority: readonly AttributeKey[]): Attributes {
  const uniquePriority = [...new Set(priority)];
  const assignmentOrder = [...uniquePriority, ...ATTRIBUTE_KEYS.filter((key) => !uniquePriority.includes(key))];
  const standardArray = [15, 14, 13, 12, 10, 8];
  const rolled = ATTRIBUTE_KEYS.map(() => rollDndAbilityScore(random)).sort((a, b) => b - a);
  // Blend the dependable standard array with 4d6-drop-lowest. Recruits retain
  // D&D's variance without producing too many unusable or extreme arrays.
  const scores = rolled.map((score, index) => Math.max(3, Math.min(18, Math.round((score + standardArray[index]!) / 2))));
  return Object.fromEntries(assignmentOrder.map((key, index) => [key, scores[index]!])) as Attributes;
}
