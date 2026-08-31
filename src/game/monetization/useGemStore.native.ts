import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ErrorCode, useIAP, type Purchase } from "expo-iap";
import { GEM_PACK_PRODUCT_IDS, getGemPack } from "../../data/monetization/gemPacks";
import type { GemStoreController, VerifiedPurchaseHandler } from "./gemStoreTypes";

function purchaseTransactionId(purchase: Purchase): string {
  const platformTransactionId = "transactionId" in purchase ? purchase.transactionId : null;
  return platformTransactionId?.trim() || purchase.id.trim();
}

export function useGemStore(onVerifiedPurchase: VerifiedPurchaseHandler): GemStoreController {
  const handlerRef = useRef(onVerifiedPurchase);
  const processingRef = useRef(new Set<string>());
  const [loading, setLoading] = useState(true);
  const [purchasingProductId, setPurchasingProductId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  handlerRef.current = onVerifiedPurchase;

  const processPurchase = useCallback(async (purchase: Purchase) => {
    const pack = getGemPack(purchase.productId);
    if (!pack || purchase.purchaseState !== "purchased") {
      if (purchase.purchaseState === "pending") setError("Payment is pending approval in Google Play. Gems will be delivered after it completes.");
      return;
    }
    const transactionId = purchaseTransactionId(purchase);
    if (!transactionId || processingRef.current.has(transactionId)) return;
    processingRef.current.add(transactionId);
    try {
      await handlerRef.current({
        transactionId: `google-play-${transactionId}`,
        source: "purchase",
        gems: pack.gems,
        verified: true,
        note: `${pack.name} purchased through Google Play`,
      });
      await finishTransaction({ purchase, isConsumable: true });
      setError(null);
    } catch (purchaseError) {
      setError(purchaseError instanceof Error ? purchaseError.message : "The purchase could not be completed.");
    } finally {
      processingRef.current.delete(transactionId);
      setPurchasingProductId(null);
    }
  }, []);

  const {
    connected,
    products: storeProducts,
    availablePurchases,
    fetchProducts,
    finishTransaction,
    getAvailablePurchases,
    reconnect,
    requestPurchase,
  } = useIAP({
    onPurchaseSuccess: (purchase) => { void processPurchase(purchase); },
    onPurchaseError: (purchaseError) => {
      setPurchasingProductId(null);
      if (purchaseError.code !== ErrorCode.UserCancelled) setError(purchaseError.message || "Google Play could not complete the purchase.");
    },
    onError: (storeError) => setError(storeError.message || "Google Play Billing is unavailable."),
  });

  const loadProducts = useCallback(async () => {
    if (!connected) return;
    setLoading(true);
    setError(null);
    try {
      await fetchProducts({ skus: [...GEM_PACK_PRODUCT_IDS], type: "in-app" });
      await getAvailablePurchases();
    } catch (storeError) {
      setError(storeError instanceof Error ? storeError.message : "Could not load Google Play products.");
    } finally {
      setLoading(false);
    }
  }, [connected, fetchProducts, getAvailablePurchases]);

  useEffect(() => { void loadProducts(); }, [loadProducts]);
  useEffect(() => { for (const purchase of availablePurchases) void processPurchase(purchase); }, [availablePurchases, processPurchase]);

  const products = useMemo(() => Object.fromEntries(storeProducts
    .filter((product) => getGemPack(product.id))
    .map((product) => [product.id, { productId: product.id, displayPrice: product.displayPrice, title: product.title, description: product.description }])), [storeProducts]);

  return {
    connected,
    loading,
    purchasingProductId,
    products,
    error,
    purchase: async (productId) => {
      if (!getGemPack(productId)) throw new Error("Unknown gem pack.");
      if (!connected) throw new Error("Google Play Billing is not connected.");
      if (!products[productId]) throw new Error("This product is not active in Google Play for your account or country.");
      setPurchasingProductId(productId);
      setError(null);
      try {
        await requestPurchase({ request: { google: { skus: [productId] }, apple: { sku: productId, quantity: 1 } }, type: "in-app" });
      } catch (purchaseError) {
        setPurchasingProductId(null);
        throw purchaseError;
      }
    },
    retry: async () => {
      if (!connected) await reconnect();
      await loadProducts();
    },
  };
}
