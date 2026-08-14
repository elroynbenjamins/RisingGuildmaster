/** A deliberate long-form curve: Level 1 -> 2 requires 1,000 XP and later levels rise superlinearly. */
export function xpRequiredForNextLevel(currentLevel: number): number { return Math.ceil(1_000 * Math.max(1, currentLevel) ** 1.5); }
