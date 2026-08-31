import type { VerifiedGemCredit } from "./gemTypes";

export interface LocalizedGemProduct {
  productId: string;
  displayPrice: string;
  title: string;
  description: string;
}

export interface GemStoreController {
  connected: boolean;
  loading: boolean;
  purchasingProductId: string | null;
  products: Readonly<Record<string, LocalizedGemProduct>>;
  error: string | null;
  purchase(productId: string): Promise<void>;
  retry(): Promise<void>;
}

export type VerifiedPurchaseHandler = (credit: VerifiedGemCredit) => void | Promise<void>;
