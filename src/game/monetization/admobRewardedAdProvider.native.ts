import { Platform } from "react-native";
import { loadAccountContentEntitlements } from "./accountEntitlementService";
import { getAndroidRewardedAdUnitId, getAndroidRewardedInterstitialAdUnitId } from "../../config/admobConfig";
import { TEMPLE_CONFIG } from "../../config/templeConfig";
import type { VerifiedGemCredit } from "./gemTypes";

const DEVELOPMENT_BUILD = (globalThis as { __DEV__?: boolean }).__DEV__ ?? false;
const AD_LOAD_TIMEOUT_MS = 45_000;
type AdsModule = typeof import("react-native-google-mobile-ads");

let initialized = false;
let consentPromise: Promise<void> | undefined;
let adInProgress = false;

function loadNativeAdsModule(): AdsModule {
  if (Platform.OS !== "android") throw new Error("An iOS AdMob app and rewarded unit have not been configured yet.");
  try { return require("react-native-google-mobile-ads") as AdsModule; }
  catch { throw new Error("Rewarded ads require a Guildmaster development build; they are not supported by standard Expo Go."); }
}

async function gatherConsent(module: AdsModule): Promise<void> {
  try {
    const info = await module.AdsConsent.gatherConsent({ tagForUnderAgeOfConsent: false });
    if (!info.canRequestAds) throw new Error("Ads are unavailable until the required privacy choices are completed.");
  } catch (error) {
    const previous = await module.AdsConsent.getConsentInfo();
    if (!previous.canRequestAds) throw error;
  }
}

async function ensureConsent(module: AdsModule): Promise<void> {
  consentPromise ??= gatherConsent(module).catch((error) => { consentPromise = undefined; throw error; });
  await consentPromise;
}

async function initialize(module: AdsModule): Promise<void> {
  if (initialized) return;
  await ensureConsent(module);
  await module.default().initialize();
  initialized = true;
}

async function runExclusiveAd<T>(show: () => Promise<T>): Promise<T> {
  if (adInProgress) throw new Error("Another advertisement is already being prepared.");
  adInProgress = true;
  try { return await show(); }
  finally { adInProgress = false; }
}

export async function initializeAdMobPrivacy(): Promise<void> {
  if (Platform.OS !== "android") return;
  await initialize(loadNativeAdsModule());
}

export async function showAdMobPrivacyOptions(): Promise<void> {
  const module = loadNativeAdsModule();
  await module.AdsConsent.requestInfoUpdate({ tagForUnderAgeOfConsent: false });
  await module.AdsConsent.showPrivacyOptionsForm();
}

export async function showAdMobRewardedAd(): Promise<VerifiedGemCredit> {
  return runExclusiveAd(async () => {
    const module = loadNativeAdsModule();
    await initialize(module);
    const rewarded = module.RewardedAd.createForAdRequest(getAndroidRewardedAdUnitId(DEVELOPMENT_BUILD), {
      requestNonPersonalizedAdsOnly: true,
      keywords: ["fantasy", "role playing game", "strategy"],
    });
    return awaitReward(rewarded, module, "rewarded");
  });
}

export async function showDayMilestoneRewardedInterstitial(): Promise<VerifiedGemCredit> {
  return runExclusiveAd(async () => {
    if ((await loadAccountContentEntitlements()).adsRemoved) throw new Error("Ads are permanently removed for this account.");
    const module = loadNativeAdsModule();
    await initialize(module);
    const rewarded = module.RewardedInterstitialAd.createForAdRequest(getAndroidRewardedInterstitialAdUnitId(DEVELOPMENT_BUILD), {
      requestNonPersonalizedAdsOnly: true,
      keywords: ["fantasy", "role playing game", "strategy"],
    });
    return awaitReward(rewarded, module, "day_milestone");
  });
}

type RewardedInstance = ReturnType<AdsModule["RewardedAd"]["createForAdRequest"]> | ReturnType<AdsModule["RewardedInterstitialAd"]["createForAdRequest"]>;

function awaitReward(rewarded: RewardedInstance, module: AdsModule, placement: "rewarded" | "day_milestone"): Promise<VerifiedGemCredit> {
  return new Promise((resolve, reject) => {
    let earned = false;
    let settled = false;
    const cleanups: Array<() => void> = [];
    const finish = (result?: VerifiedGemCredit, error?: Error) => {
      if (settled) return;
      settled = true;
      cleanups.forEach((cleanup) => cleanup());
      if (error) reject(error); else resolve(result!);
    };
    const timeout = setTimeout(() => finish(undefined, new Error("The advertisement took too long to load. Please try again.")), AD_LOAD_TIMEOUT_MS);
    cleanups.push(() => clearTimeout(timeout));
    cleanups.push(rewarded.addAdEventListener(module.RewardedAdEventType.EARNED_REWARD, () => { earned = true; }));
    cleanups.push(rewarded.addAdEventListener(module.AdEventType.CLOSED, () => earned ? finish({
      transactionId: `${placement}-admob-${Date.now()}`,
      source: "rewarded_ad",
      gems: TEMPLE_CONFIG.rewardedAdGems,
      verified: true,
      note: DEVELOPMENT_BUILD ? "AdMob test rewarded ad" : placement === "day_milestone" ? "Day milestone rewarded interstitial" : "AdMob rewarded ad",
    }) : finish(undefined, new Error("The advertisement ended before its reward was earned."))));
    cleanups.push(rewarded.addAdEventListener(module.AdEventType.ERROR, (error) => finish(undefined, new Error(error.message || "The advertisement could not be loaded."))));
    cleanups.push(rewarded.addAdEventListener(module.RewardedAdEventType.LOADED, () => {
      void rewarded.show().catch((error: unknown) => finish(undefined, error instanceof Error ? error : new Error("The advertisement could not be shown.")));
    }));
    rewarded.load();
  });
}
