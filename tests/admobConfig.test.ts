import { describe, expect, it } from "vitest";
import { ADMOB_CONFIG, getAndroidRewardedAdUnitId, getAndroidRewardedInterstitialAdUnitId } from "../src/config/admobConfig";

describe("AdMob rewarded-ad configuration", () => {
  it("uses Google's rewarded test unit during development", () => { expect(getAndroidRewardedAdUnitId(true)).toBe("ca-app-pub-3940256099942544/5224354917"); });
  it("uses the Guildmaster unit only in release builds", () => { expect(getAndroidRewardedAdUnitId(false)).toBe(ADMOB_CONFIG.androidRewardedAdUnitId); expect(ADMOB_CONFIG.androidAppId).toContain("~"); });
  it("uses the dedicated rewarded-interstitial units for day milestones", () => { expect(getAndroidRewardedInterstitialAdUnitId(true)).toBe("ca-app-pub-3940256099942544/5354046379"); expect(getAndroidRewardedInterstitialAdUnitId(false)).toBe("ca-app-pub-2222059903000796/4776413984"); });
});
