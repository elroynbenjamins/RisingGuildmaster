import { describe, expect, it } from "vitest";
import { GEM_PACKS, GEM_PACK_PRODUCT_IDS, getGemPack } from "../src/data/monetization/gemPacks";

describe("Google Play gem packs", () => {
  it("defines five unique, progressively larger consumable packs", () => {
    expect(GEM_PACKS).toHaveLength(5);
    expect(new Set(GEM_PACK_PRODUCT_IDS).size).toBe(5);
    expect(GEM_PACKS.map((pack) => pack.gems)).toEqual([50, 120, 260, 550, 1200]);
    expect(GEM_PACKS.every((pack) => Number.isInteger(pack.gems) && pack.gems > 0)).toBe(true);
  });

  it("keeps bonus disclosures explicit and increasing", () => {
    expect(GEM_PACKS.map((pack) => pack.bonusGems)).toEqual([0, 20, 60, 150, 400]);
    expect(GEM_PACKS.filter((pack) => pack.recommended).map((pack) => pack.productId)).toEqual(["guildmaster_gems_260"]);
  });

  it("resolves only allow-listed Google Play product IDs", () => {
    expect(getGemPack("guildmaster_gems_550")?.gems).toBe(550);
    expect(getGemPack("unknown_product")).toBeNull();
  });
});
