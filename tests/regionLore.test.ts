import { describe, expect, it } from "vitest";
import { LORE_ENTRIES } from "../src/data/world/lore";
import { REGION_LORE } from "../src/data/world/regionLore";
import { REGIONS } from "../src/data/world/regions";
import { discoverRegionSettlements } from "../src/game/world/worldService";
import { createWorldState } from "../src/game/world/worldState";

describe("regional lore", () => {
  it("provides a complete chronicle for each of Eldoria's five regions", () => {
    expect(Object.keys(REGION_LORE).sort()).toEqual(Object.keys(REGIONS).sort());
    for (const [regionId, entry] of Object.entries(REGION_LORE)) {
      expect(entry.regionId).toBe(regionId);
      expect(entry.overview.length).toBeGreaterThan(150);
      expect(entry.history.length).toBeGreaterThan(150);
      expect(entry.peopleAndCulture.length).toBeGreaterThan(150);
      expect(entry.tradeAndCraft.length).toBeGreaterThan(150);
      expect(entry.wardstoneLegacy.length).toBeGreaterThan(150);
      expect(entry.travelNotes.length).toBeGreaterThan(150);
      expect(entry.customs).toHaveLength(3);
      expect(entry.sayings).toHaveLength(2);
    }
  });

  it("contains journal entries tied to every regional discovery flag", () => {
    for (const regionId of Object.keys(REGIONS)) {
      expect(Object.values(LORE_ENTRIES).some((entry) => entry.unlockFlag === `lore_${regionId}`)).toBe(true);
    }
  });

  it("unlocks regional lore when settlements are discovered", () => {
    const discovered = discoverRegionSettlements(createWorldState(), "iron_hills");
    expect(discovered.worldFlags.lore_iron_hills).toBe(true);
    expect(discovered.worldFlags.lore_greenveil).toBe(true);
  });
});
