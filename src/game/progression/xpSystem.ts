export function xpRequiredForNextLevel(currentLevel: number): number { return Math.ceil(100 * Math.max(1, currentLevel) ** 1.5); }
