import { describe, expect, it } from "vitest";
import { createGuild } from "../src/game/guild/guildService";
import { generateHero } from "../src/game/heroes/heroGenerator";
import { recruitCandidate } from "../src/game/recruitment/recruitmentService";
import { generateRecruitmentCandidate } from "../src/game/recruitment/candidateGenerator";
import { deserializeGuild, serializeGuild } from "../src/game/save/saveService";
import { createSeededRandom } from "../src/utils/random";

describe("persistent randomized hero portraits", () => {
  it("selects one of four deterministic bitmap portrait variants", () => {
    const first = generateHero(createSeededRandom(84));
    const repeated = generateHero(createSeededRandom(84));
    expect(first.portraitVariant).toBeGreaterThanOrEqual(1);
    expect(first.portraitVariant).toBeLessThanOrEqual(4);
    expect(repeated.portraitVariant).toBe(first.portraitVariant);
    expect(first.portraitKey).toContain(`-v${first.portraitVariant}`);
  });

  it("generates the correct persistent key for every race, class and gender", () => {
    const races = ["human", "elf", "dwarf", "orc", "tiefling"] as const;
    const classes = ["warrior", "ranger", "mage", "cleric", "paladin", "berserker", "monk", "bard", "spellbow", "bulwark"] as const;
    const genders = ["female", "male"] as const;
    let seed = 500;
    for (const raceId of races) for (const classId of classes) for (const gender of genders) {
      const hero = generateHero(createSeededRandom(seed++), { raceId, classId, gender });
      expect(hero.raceId).toBe(raceId);
      expect(hero.classId).toBe(classId);
      expect(hero.gender).toBe(gender);
      expect(hero.portraitKey).toBe(`${raceId}-${classId}-${gender}-v${hero.portraitVariant}`);
    }
  });

  it("keeps the candidate portrait after recruitment and save/load", () => {
    const candidate = generateRecruitmentCandidate(createSeededRandom(125), 1, 0, "prospect");
    const initial = createGuild();
    const guild = {
      ...initial,
      gold: 100_000,
      recruitment: {
        ...initial.recruitment,
        candidates: [candidate],
        candidateIds: [candidate.candidateId],
      },
    };
    const recruited = recruitCandidate(guild, candidate.candidateId);
    const hero = recruited.heroes.find((item) => item.id === candidate.heroPreview.id);
    expect(hero?.portraitVariant).toBe(candidate.heroPreview.portraitVariant);
    expect(hero?.portraitKey).toBe(candidate.heroPreview.portraitKey);

    const loaded = deserializeGuild(serializeGuild(recruited));
    const loadedHero = loaded.heroes.find((item) => item.id === candidate.heroPreview.id);
    expect(loadedHero?.portraitVariant).toBe(candidate.heroPreview.portraitVariant);
    expect(loadedHero?.portraitKey).toBe(candidate.heroPreview.portraitKey);
  });
});
