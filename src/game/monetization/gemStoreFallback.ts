import type { PermanentPurchaseHandler } from "./supportProducts";
import { useMemo } from "react";
import type { GemStoreController, VerifiedPurchaseHandler } from "./gemStoreTypes";

/** Non-native fallback used by tests and unsupported platforms. */
export function useGemStore(_onVerifiedPurchase: VerifiedPurchaseHandler, _onRemoveAds?: PermanentPurchaseHandler): GemStoreController {
  return useMemo(() => ({
    connected: false,
    loading: false,
    purchasingProductId: null,
    products: {},
    error: "Google Play purchases are available in the installed Android app.",
    purchase: async () => { throw new Error("Google Play purchases require an Android app installed through a Play testing or production track."); },
    retry: async () => undefined,
  }), []);
}
