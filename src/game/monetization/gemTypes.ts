export type GemTransactionType = "rewarded_ad" | "purchase" | "revival" | "scouting" | "gold_exchange" | "grant";

export interface GemTransaction {
  id: string;
  type: GemTransactionType;
  /** Positive for credits and negative for spending. */
  amount: number;
  day: number;
  note: string;
}

export interface VerifiedGemCredit {
  transactionId: string;
  source: "rewarded_ad" | "purchase" | "grant";
  gems: number;
  verified: boolean;
  note?: string;
}

/** Adapter boundary for a rewarded-ad SDK or app-store billing SDK. */
export interface GemAcquisitionProvider {
  showRewardedAd(): Promise<VerifiedGemCredit>;
  purchaseGemPack(productId: string): Promise<VerifiedGemCredit>;
}
