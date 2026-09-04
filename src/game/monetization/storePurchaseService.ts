import { getGemPack } from "../../data/monetization/gemPacks";
import { REMOVE_ADS_PRODUCT_ID } from "./supportProducts";
import type { VerifiedPurchaseHandler } from "./gemStoreTypes";
import type { PermanentPurchaseHandler } from "./supportProducts";
export interface StorePurchase { productId: string; purchaseState: string; transactionId: string }
/** Called only with Google Play purchase callbacks / restored owned purchases. */
export async function fulfillStorePurchase(
  purchase: StorePurchase,
  handlers: { creditGems: VerifiedPurchaseHandler; removeAds?: PermanentPurchaseHandler; finish(isConsumable: boolean): Promise<void> }
): Promise<boolean> {
  const pack = getGemPack(purchase.productId);
  const removesAds = purchase.productId === REMOVE_ADS_PRODUCT_ID;
  if (purchase.purchaseState !== "purchased" || !purchase.transactionId.trim() || (!pack && !removesAds)) return false;
  if (removesAds) {
    if (!handlers.removeAds) return false;
    await handlers.removeAds();
  } else if (pack) {
    await handlers.creditGems({ transactionId: `google-play-${purchase.transactionId}`, source: "purchase", gems: pack.gems, verified: true, note: `${pack.name} purchased through Google Play` });
  }
  // Persist delivery before acknowledging. Never consume the permanent product.
  await handlers.finish(!removesAds);
  return true;
}
