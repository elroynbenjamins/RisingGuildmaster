import type { VerifiedGemCredit } from "./gemTypes";
/** TypeScript fallback. Metro selects the native or web implementation at bundle time. */
export async function showAdMobRewardedAd(): Promise<VerifiedGemCredit> {
  throw new Error("Rewarded ads are unavailable on this platform.");
}
export async function showDayMilestoneRewardedInterstitial(): Promise<VerifiedGemCredit> { throw new Error("Day milestone ads require an Android app build."); }
export async function initializeAdMobPrivacy(): Promise<void> {}
export async function showAdMobPrivacyOptions(): Promise<void> { throw new Error("Privacy options are available in the Android app build."); }
