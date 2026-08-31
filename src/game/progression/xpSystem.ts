/** Level 1 -> 2 requires 1,000 XP; the gentler long-form curve tracks authored campaign XP through Chapter 7. */
export function xpRequiredForNextLevel(currentLevel: number): number { return Math.ceil(1_000 * Math.max(1, currentLevel) ** 1.2); }
