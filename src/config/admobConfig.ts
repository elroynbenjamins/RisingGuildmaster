export const ADMOB_CONFIG = {
  androidAppId: "ca-app-pub-2222059903000796~6020835595",
  androidRewardedAdUnitId: "ca-app-pub-2222059903000796/2583268983",
  androidTestRewardedAdUnitId: "ca-app-pub-3940256099942544/5224354917",
  androidRewardedInterstitialAdUnitId: "ca-app-pub-2222059903000796/4776413984",
  androidTestRewardedInterstitialAdUnitId: "ca-app-pub-3940256099942544/5354046379",
  iosPlaceholderAppId: "ca-app-pub-3940256099942544~1458002511",
} as const;

export function getAndroidRewardedAdUnitId(development: boolean): string {
  return development ? ADMOB_CONFIG.androidTestRewardedAdUnitId : ADMOB_CONFIG.androidRewardedAdUnitId;
}

export function getAndroidRewardedInterstitialAdUnitId(development: boolean): string {
  return development ? ADMOB_CONFIG.androidTestRewardedInterstitialAdUnitId : ADMOB_CONFIG.androidRewardedInterstitialAdUnitId;
}
