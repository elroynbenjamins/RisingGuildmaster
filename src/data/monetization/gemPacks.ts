export interface GemPackDefinition { productId: string; name: string; gems: number }

/** Prices are intentionally supplied by the platform store, never hardcoded here. */
export const GEM_PACKS: readonly GemPackDefinition[] = [
  { productId: "guildmaster_gems_small", name: "Gem Pouch", gems: 25 },
  { productId: "guildmaster_gems_medium", name: "Gem Satchel", gems: 70 },
  { productId: "guildmaster_gems_large", name: "Gem Coffer", gems: 160 },
];
