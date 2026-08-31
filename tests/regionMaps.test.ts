import { describe, expect, it } from "vitest";
import { QUESTS } from "../src/data/quests/quests";
import { getRegionLocations, REGION_LOCATIONS } from "../src/data/world/regionLocations";
import { REGIONS } from "../src/data/world/regions";
import { SETTLEMENTS } from "../src/data/world/settlements";
import { createWorldState } from "../src/game/world/worldState";
import { discoverRegionSettlements } from "../src/game/world/worldService";

describe("interactive regional maps", () => {
  it("gives every Eldoria region at least six mapped locations", () => {
    expect(Object.keys(REGION_LOCATIONS)).toHaveLength(33);
    for (const regionId of Object.keys(REGIONS)) expect(getRegionLocations(regionId).length).toBeGreaterThanOrEqual(6);
  });

  it("keeps every marker normalized and attached to a valid region", () => {
    for (const entry of Object.values(REGION_LOCATIONS)) {
      expect(REGIONS[entry.regionId]).toBeDefined();
      expect(entry.mapPosition.x).toBeGreaterThanOrEqual(0);
      expect(entry.mapPosition.x).toBeLessThanOrEqual(1);
      expect(entry.mapPosition.y).toBeGreaterThanOrEqual(0);
      expect(entry.mapPosition.y).toBeLessThanOrEqual(1);
    }
  });

  it("resolves all settlement and quest references", () => {
    for (const entry of Object.values(REGION_LOCATIONS)) {
      if (entry.settlementId) expect(SETTLEMENTS[entry.settlementId]).toMatchObject({ regionId: entry.regionId });
      if (entry.questId) expect(QUESTS[entry.questId]).toBeDefined();
    }
    for (const region of Object.values(REGIONS)) for (const settlementId of region.settlementIds) expect(SETTLEMENTS[settlementId]).toMatchObject({ regionId: region.id });
  });

  it("keeps settlement data and illustrated regional markers on the same calibrated coordinates", () => {
    for (const entry of Object.values(REGION_LOCATIONS)) {
      if (entry.settlementId) expect(entry.mapPosition, entry.name).toEqual(SETTLEMENTS[entry.settlementId]?.mapPosition);
    }
  });

  it("discovers all public settlements when a region is visited", () => {
    const discovered = discoverRegionSettlements(createWorldState(), "iron_hills");
    expect(discovered.discoveredSettlementIds).toEqual(expect.arrayContaining(["stonegate", "kharum_deep", "flintwatch"]));
  });
});
