import type { ClassId, RaceId } from "../../game/heroes/types";

export type HeroGender = "female" | "male";

export interface HeroPortraitCrop {
  atlasId: ClassId;
  column: number;
  row: number;
}

export interface HeroPortraitAtlasLayout {
  columns: 4 | 5 | 6 | 7 | 11;
  rows: 3 | 4 | 8;
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
  monk: { columns: 5, rows: 8, cellHeightRatio: 1 },
  bard: { columns: 5, rows: 8, cellHeightRatio: 1 },
  spellbow: { columns: 5, rows: 8, cellHeightRatio: 1 },
  bulwark: { columns: 5, rows: 8, cellHeightRatio: 1 },
  summoner: { columns: 7, rows: 8, cellHeightRatio: 1 },
};

const RACE_COLUMNS: Record<RaceId, number> = { human: 0, elf: 1, dwarf: 2, orc: 3, tiefling: 4, stoneborn: 5, veilborn: 6 };
const GENDER_ROWS: Record<HeroGender, number> = { female: 0, male: 1 };

export function getHeroPortraitCrop(raceId: RaceId, classId: ClassId, gender: HeroGender): HeroPortraitCrop {
  return { atlasId: classId, column: RACE_COLUMNS[raceId], row: GENDER_ROWS[gender] };
}

export function getHeroVariantRow(gender: HeroGender, variant: 1 | 2 | 3 | 4): number {
  return (variant - 1) * 2 + GENDER_ROWS[gender];
}

export function heroPortraitKey(raceId: RaceId, classId: ClassId, gender: HeroGender): string {
  return `${raceId}-${classId}-${gender}`;
}

/** Every playable race/class/gender combination has a deterministic portrait crop. */
export const HERO_PORTRAIT_KEYS = (["human", "elf", "dwarf", "orc", "tiefling", "stoneborn", "veilborn"] as RaceId[]).flatMap((raceId) =>
  (["warrior", "ranger", "mage", "cleric", "paladin", "berserker", "monk", "bard", "spellbow", "bulwark", "summoner"] as ClassId[]).flatMap((classId) =>
    (["female", "male"] as HeroGender[]).map((gender) => heroPortraitKey(raceId, classId, gender)),
  ),
);

/** Four authored variants for every newly introduced class/race combination (128 crops). */
export const PREMIUM_HERO_PORTRAIT_VARIANT_KEYS = [
  ...(["monk", "bard", "spellbow", "bulwark"] as ClassId[]).flatMap((classId) => (["human", "elf", "dwarf", "orc", "tiefling"] as RaceId[]).flatMap((raceId) => (["female", "male"] as HeroGender[]).flatMap((gender) => [1, 2, 3, 4].map((variant) => `${raceId}-${classId}-${gender}-v${variant}`)))),
  ...(["warrior", "ranger", "mage", "cleric", "paladin", "berserker"] as ClassId[]).flatMap((classId) => (["female", "male"] as HeroGender[]).flatMap((gender) => [1, 2, 3, 4].map((variant) => `tiefling-${classId}-${gender}-v${variant}`))),
  ...(["human", "elf", "dwarf", "orc", "tiefling", "stoneborn", "veilborn"] as RaceId[]).flatMap((raceId) => (["female", "male"] as HeroGender[]).flatMap((gender) => [1, 2, 3, 4].map((variant) => `${raceId}-summoner-${gender}-v${variant}`))),
  ...(["stoneborn", "veilborn"] as RaceId[]).flatMap((raceId) => (["warrior", "ranger", "mage", "cleric", "paladin", "berserker", "monk", "bard", "spellbow", "bulwark"] as ClassId[]).flatMap((classId) => (["female", "male"] as HeroGender[]).flatMap((gender) => [1, 2, 3, 4].map((variant) => `${raceId}-${classId}-${gender}-v${variant}`)))),
];
