/** Level 1 -> 2 requires 900 XP after the 10% progression-speed adjustment. */
export function xpRequiredForNextLevel(currentLevel: number): number { return Math.ceil(900 * Math.max(1, currentLevel) ** 1.2); }
