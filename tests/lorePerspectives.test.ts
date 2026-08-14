import { describe, expect, it } from "vitest";
import { LORE_ENTRIES } from "../src/data/world/lore";
import { createWorldState } from "../src/game/world/worldState";
import { getDiscoveredLoreEntries, getLoreProgress } from "../src/game/world/loreService";

describe("lore perspectives and journal discovery", () => {
  it("presents important history through multiple attributed viewpoints", () => {
    for (const id of ["draconic_wardmakers", "fivefold_accord", "wardstones", "goblin_tribes", "iron_laurel"] as const) {
      const perspectives = LORE_ENTRIES[id]?.perspectives ?? [];
      expect(perspectives.length, id).toBeGreaterThanOrEqual(2);
      expect(perspectives.every((item) => item.speaker.length > 0 && item.text.length > 20), id).toBe(true);
    }
  });

  it("allows official history and eyewitness testimony to disagree", () => {
    const laurel = LORE_ENTRIES.iron_laurel?.perspectives ?? [];
    expect(laurel.map((item) => item.kind)).toEqual(expect.arrayContaining(["official_claim", "eyewitness"]));
    expect(new Set(laurel.map((item) => item.speaker)).size).toBe(laurel.length);
  });

  it("shows only entries whose lore flags have been discovered", () => {
    const start = createWorldState();
    const startingIds = getDiscoveredLoreEntries(start).map((entry) => entry.id);
    expect(startingIds).toEqual(expect.arrayContaining(["greenveil", "guildhaven", "crownroad_compact"]));
    expect(startingIds).not.toContain("fivefold_accord");
    const discovered = { ...start, worldFlags: { ...start.worldFlags, lore_fivefold_accord: true } };
    expect(getDiscoveredLoreEntries(discovered).map((entry) => entry.id)).toContain("fivefold_accord");
    expect(getLoreProgress(discovered).discovered).toBe(getLoreProgress(start).discovered + 1);
  });
});
