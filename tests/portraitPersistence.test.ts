import { describe, expect, it } from "vitest";
import { createGuild } from "../src/game/guild/guildService";
import { generateHero } from "../src/game/heroes/heroGenerator";
import { recruitCandidate } from "../src/game/recruitment/recruitmentService";
import { generateRecruitmentCandidate } from "../src/game/recruitment/candidateGenerator";
import { deserializeGuild, serializeGuild } from "../src/game/save/saveService";
import { createSeededRandom } from "../src/utils/random";

describe("persistent randomized hero portraits", () => {
  it("selects one of three deterministic portrait variants", () => {
    const first = generateHero(createSeededRandom(84));
    const repeated = generateHero(createSeededRandom(84));
    expect(first.portraitVariant).toBeGreaterThanOrEqual(0);
    expect(first.portraitVariant).toBeLessThanOrEqual(2);
    expect(repeated.portraitVariant).toBe(first.portraitVariant);
    expect(first.portraitKey).toContain(`-v${first.portraitVariant}`);
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
