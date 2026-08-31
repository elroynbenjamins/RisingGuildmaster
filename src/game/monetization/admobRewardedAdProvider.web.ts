import type { VerifiedGemCredit } from "./gemTypes";
export async function showAdMobRewardedAd(): Promise<VerifiedGemCredit> { throw new Error("Rewarded ads are available in the Android app build, not the web demo."); }
export async function showDayMilestoneRewardedInterstitial(): Promise<VerifiedGemCredit> { throw new Error("Day milestone ads are available in the Android app build, not the web demo."); }
export async function initializeAdMobPrivacy(): Promise<void> {}
export async function showAdMobPrivacyOptions(): Promise<void> { throw new Error("Ad privacy options are available in the Android app build, not the web demo."); }
