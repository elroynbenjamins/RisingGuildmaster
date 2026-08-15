import { describe, expect, it } from "vitest";
import { HERO_BASE_PORTRAIT_LAYOUT, HERO_VARIANT_PORTRAIT_LAYOUTS } from "../src/data/heroes/heroPortraits";

describe("portrait atlas alignment", () => {
  it("uses the shared four-column grid for every hero atlas", () => {
    expect(HERO_BASE_PORTRAIT_LAYOUT).toMatchObject({ columns: 4, rows: 3, cellHeightRatio: 1 });
    for (const layout of Object.values(HERO_VARIANT_PORTRAIT_LAYOUTS)) expect(layout).toMatchObject({ columns: 4, rows: 4 });
  });

  it("preserves the Mage variant atlas's native 4:3 cells instead of stretching faces", () => {
    expect(HERO_VARIANT_PORTRAIT_LAYOUTS.mage.cellHeightRatio).toBe(.75);
    for (const [classId, layout] of Object.entries(HERO_VARIANT_PORTRAIT_LAYOUTS)) if (classId !== "mage") expect(layout.cellHeightRatio).toBe(1);
  });
});
