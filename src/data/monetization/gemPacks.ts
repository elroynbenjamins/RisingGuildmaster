export interface GemPackDefinition {
  productId: string;
  name: string;
  gems: number;
  bonusGems: number;
  description: string;
  recommended?: boolean;
}

/** Prices are intentionally supplied by the platform store, never hardcoded here. */
export const GEM_PACKS: readonly GemPackDefinition[] = [
  { productId: "guildmaster_gems_50", name: "Spark Pouch", gems: 50, bonusGems: 0, description: "Enough to unlock one premium class or race." },
  { productId: "guildmaster_gems_120", name: "Adventurer Satchel", gems: 120, bonusGems: 20, description: "A small reserve for two unlocks and conveniences." },
  { productId: "guildmaster_gems_260", name: "Guild Coffer", gems: 260, bonusGems: 60, description: "Strong value for expanding the guild roster.", recommended: true },
];

export const GEM_PACK_PRODUCT_IDS = GEM_PACKS.map((pack) => pack.productId);

export function getGemPack(productId: string): GemPackDefinition | null {
  return GEM_PACKS.find((pack) => pack.productId === productId) ?? null;
}
