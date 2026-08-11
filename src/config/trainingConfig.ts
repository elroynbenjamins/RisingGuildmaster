export const TRAINING_GROUND_CONFIG = {
  maxLevel: 3,
  maxDevelopmentSessionsPerHeroLevel: 3,
  capacityByLevel: { 1: 1, 2: 2, 3: 3 } as Record<number, number>,
  upgrades: {
    2: { goldCost: 750, durationDays: 3 },
    3: { goldCost: 1_800, durationDays: 5 },
  } as Record<number, { goldCost: number; durationDays: number }>,
} as const;
