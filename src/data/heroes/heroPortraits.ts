import type { ClassId, RaceId } from "../../game/heroes/types";

export type HeroGender = "female" | "male";

export interface HeroPortraitCrop {
  atlasId: ClassId;
  column: number;
  row: number;
}

export interface HeroPortraitAtlasLayout {
  columns: 4;
  rows: 3 | 4;
  /** Display height of one source cell relative to its width. */
  cellHeightRatio: number;
}

export const HERO_BASE_PORTRAIT_LAYOUT: HeroPortraitAtlasLayout = { columns: 4, rows: 3, cellHeightRatio: 1 };
export const HERO_VARIANT_PORTRAIT_LAYOUTS: Record<ClassId, HeroPortraitAtlasLayout> = {
  warrior: { columns: 4, rows: 4, cellHeightRatio: 1 },
  ranger: { columns: 4, rows: 4, cellHeightRatio: 1 },
  mage: { columns: 4, rows: 4, cellHeightRatio: .75 },
  cleric: { columns: 4, rows: 4, cellHeightRatio: 1 },
  paladin: { columns: 4, rows: 4, cellHeightRatio: 1 },
  berserker: { columns: 4, rows: 4, cellHeightRatio: 1 },
};

const RACE_COLUMNS: Record<RaceId, number> = { human: 0, elf: 1, dwarf: 2, orc: 3 };
const GENDER_ROWS: Record<HeroGender, number> = { female: 0, male: 1 };

export function getHeroPortraitCrop(raceId: RaceId, classId: ClassId, gender: HeroGender): HeroPortraitCrop {
  return { atlasId: classId, column: RACE_COLUMNS[raceId], row: GENDER_ROWS[gender] };
}

export function heroPortraitKey(raceId: RaceId, classId: ClassId, gender: HeroGender): string {
  return `${raceId}-${classId}-${gender}`;
}

/** All 48 playable race/class/gender portraits are backed by one of the six class atlases. */
export const HERO_PORTRAIT_KEYS = (["human", "elf", "dwarf", "orc"] as RaceId[]).flatMap((raceId) =>
  (["warrior", "ranger", "mage", "cleric", "paladin", "berserker"] as ClassId[]).flatMap((classId) =>
    (["female", "male"] as HeroGender[]).map((gender) => heroPortraitKey(raceId, classId, gender)),
  ),
);
