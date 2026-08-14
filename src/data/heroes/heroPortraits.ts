import type { ClassId, RaceId } from "../../game/heroes/types";

export type HeroGender = "female" | "male";

export interface HeroPortraitCrop {
  atlasId: ClassId;
  column: number;
  row: number;
}

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
