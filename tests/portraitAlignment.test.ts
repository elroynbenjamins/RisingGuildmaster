import { describe, expect, it } from "vitest";
import { getHeroPortraitCrop, getHeroVariantRow, HERO_BASE_PORTRAIT_LAYOUT, HERO_PORTRAIT_KEYS, HERO_VARIANT_PORTRAIT_LAYOUTS } from "../src/data/heroes/heroPortraits";
import { getAtlasCropGeometry, getAtlasSourceRectGeometry } from "../src/ui/atlasGeometry";
import type { ClassId, RaceId } from "../src/game/heroes/types";

describe("portrait atlas alignment", () => {
  it("uses legacy grids for base classes and four-variant grids for premium classes", () => {
    expect(HERO_BASE_PORTRAIT_LAYOUT).toMatchObject({ columns: 4, rows: 3, cellHeightRatio: 1 });
    for (const classId of ["warrior", "ranger", "mage", "cleric", "paladin", "berserker"] as ClassId[]) expect(HERO_VARIANT_PORTRAIT_LAYOUTS[classId]).toMatchObject({ columns: 4, rows: 4 });
    for (const classId of ["monk", "bard", "spellbow", "bulwark"] as ClassId[]) expect(HERO_VARIANT_PORTRAIT_LAYOUTS[classId]).toMatchObject({ columns: 5, rows: 8 });
    expect(HERO_VARIANT_PORTRAIT_LAYOUTS.summoner).toMatchObject({ columns: 7, rows: 8 });
  });

  it("preserves the Mage variant atlas's native 4:3 cells instead of stretching faces", () => {
    expect(HERO_VARIANT_PORTRAIT_LAYOUTS.mage.cellHeightRatio).toBe(.75);
    for (const [classId, layout] of Object.entries(HERO_VARIANT_PORTRAIT_LAYOUTS)) if (classId !== "mage") expect(layout.cellHeightRatio).toBe(1);
  });

  it("maps every race, class and gender to the intended atlas cell", () => {
    const races: RaceId[] = ["human", "elf", "dwarf", "orc", "tiefling", "stoneborn", "veilborn"];
    const classes: ClassId[] = ["warrior", "ranger", "mage", "cleric", "paladin", "berserker", "monk", "bard", "spellbow", "bulwark", "summoner"];
    for (const [column, raceId] of races.entries()) for (const classId of classes) {
      expect(getHeroPortraitCrop(raceId, classId, "female")).toEqual({ atlasId: classId, column, row: 0 });
      expect(getHeroPortraitCrop(raceId, classId, "male")).toEqual({ atlasId: classId, column, row: 1 });
    }
    expect(HERO_PORTRAIT_KEYS).toHaveLength(races.length * classes.length * 2);
    expect(getHeroVariantRow("female", 1)).toBe(0);
    expect(getHeroVariantRow("male", 1)).toBe(1);
    expect(getHeroVariantRow("female", 2)).toBe(2);
    expect(getHeroVariantRow("male", 2)).toBe(3);
    expect(getHeroVariantRow("female", 3)).toBe(4);
    expect(getHeroVariantRow("male", 4)).toBe(7);
  });

  it("keeps bordered atlas crops centered inside their visible content box", () => {
    const square = getAtlasCropGeometry({ size: 72, borderWidth: 2, columns: 4, rows: 4, column: 2, row: 1 });
    expect(square).toEqual({ contentSize: 68, imageWidth: 272, imageHeight: 272, left: -136, top: -68 });
    const mage = getAtlasCropGeometry({ size: 72, borderWidth: 2, columns: 4, rows: 4, column: 1, row: 2, sourceCellAspectRatio: 4 / 3 });
    expect(mage.contentSize).toBe(68);
    expect(mage.imageHeight).toBe(272);
    expect(mage.left).toBeCloseTo(-102);
    expect(mage.top).toBe(-136);

    const portraitCell = getAtlasCropGeometry({ size: 72, borderWidth: 2, columns: 3, rows: 2, column: 1, row: 1, sourceCellAspectRatio: 2 / 3 });
    expect(portraitCell.contentSize).toBe(68);
    expect(portraitCell.imageWidth).toBe(204);
    expect(portraitCell.imageHeight).toBe(204);
    expect(portraitCell.left).toBe(-68);
    expect(portraitCell.top).toBe(-119);
  });

  it("centers irregular generated cells without exposing neighbouring artwork", () => {
    const crop = getAtlasSourceRectGeometry({ size: 72, borderWidth: 2, sourceWidth: 1024, sourceHeight: 1535, rect: { x: 14, y: 1228, width: 212, height: 242 } });
    expect(crop.contentSize).toBe(68);
    expect(crop.imageWidth).toBeCloseTo(328.45, 1);
    expect(crop.imageHeight).toBeCloseTo(492.36, 1);
    expect(crop.left).toBeLessThanOrEqual(-3.9);
    expect(crop.top).toBeLessThan(-345);
  });
});
