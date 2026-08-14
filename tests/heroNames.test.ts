import { describe, expect, it } from "vitest";
import { HERO_NAME_POOLS } from "../src/data/heroes/heroNames";
import type { ClassId, RaceId } from "../src/game/heroes/types";
import { generateHero } from "../src/game/heroes/heroGenerator";
import { createSeededRandom } from "../src/utils/random";

const races: RaceId[] = ["human", "elf", "dwarf", "orc"];
const genders = ["female", "male"] as const;
const classes: ClassId[] = ["warrior", "ranger", "mage", "cleric", "paladin", "berserker"];

describe("race- and gender-appropriate hero names", () => {
  it("provides doubled pools for every race and gender", () => {
    for (const raceId of races) {
      expect(HERO_NAME_POOLS[raceId].givenNames.female).toHaveLength(24);
      expect(HERO_NAME_POOLS[raceId].givenNames.male).toHaveLength(24);
      expect(HERO_NAME_POOLS[raceId].familyNames).toHaveLength(20);
    }
  });

  it.each(races.flatMap((raceId) => genders.map((gender) => [raceId, gender] as const)))("uses the %s %s name culture", (raceId, gender) => {
    const hero = generateHero(createSeededRandom(200 + races.indexOf(raceId) * 10 + genders.indexOf(gender)), { raceId, gender });
    const [givenName, ...familyParts] = hero.name.split(" ");
    expect(HERO_NAME_POOLS[raceId].givenNames[gender]).toContain(givenName);
    expect(HERO_NAME_POOLS[raceId].familyNames).toContain(familyParts.join(" "));
    expect(hero.gender).toBe(gender);
  });

  it("covers every race, class, and binary gender combination", () => {
    for (const raceId of races) for (const classId of classes) for (const gender of genders) {
      const hero = generateHero(createSeededRandom(races.indexOf(raceId) * 100 + classes.indexOf(classId) * 10 + genders.indexOf(gender)), { raceId, classId, gender });
      expect(hero).toMatchObject({ raceId, classId, gender });
      expect(HERO_NAME_POOLS[raceId].givenNames[gender]).toContain(hero.name.split(" ")[0]);
    }
  });

  it("does not reuse given names between race or gender pools", () => {
    const allPools = races.flatMap((raceId) => genders.map((gender) => HERO_NAME_POOLS[raceId].givenNames[gender]));
    const names = allPools.flat();
    expect(new Set(names).size).toBe(names.length);
  });
});
