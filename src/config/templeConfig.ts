import type { ConditionId } from "../game/heroes/types";

export const TEMPLE_CONFIG = {
  goldPerMissingHp: 1,
  revivalGemCost: 3,
  revivedHpRatio: .25,
  rewardedAdGems: 2,
  conditionTreatmentCosts: {
    injured: 120,
    exhausted: 50,
    poisoned: 90,
    infected: 130,
  } satisfies Partial<Record<ConditionId, number>>,
} as const;
