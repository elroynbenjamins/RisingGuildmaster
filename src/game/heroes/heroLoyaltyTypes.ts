export type HeroLoyaltyBand = "resentful" | "unhappy" | "steady" | "loyal" | "devoted";

export interface HeroLoyaltyChange {
  day: number;
  amount: number;
  reason: string;
}

export interface HeroLoyaltyState {
  /** 0 = ready to walk, 100 = deeply committed to the guild. */
  score: number;
  /** Small readable history used by the hero sheet and future contract events. */
  recentChanges: HeroLoyaltyChange[];
}
