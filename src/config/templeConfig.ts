import type { ConditionId } from "../game/heroes/types";

export const TEMPLE_CONFIG = {
  goldPerMissingHp: 1,
  revivalGemCost: 3,
  revivedHpRatio: .25,
  rewardedAdGems: 5,
  conditionTreatmentCosts: {
    injured: 120,
    sprained_ankle: 90,
    broken_arm: 240,
    cracked_ribs: 190,
    concussion: 150,
    deep_wound: 210,
    exhausted: 50,
    poisoned: 90,
    infected: 130,
    diseased: 180,
    cursed: 220,
  } satisfies Partial<Record<ConditionId, number>>,
} as const;
