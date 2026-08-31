import { describe, expect, it } from "vitest";
import { CLASSES } from "../src/data/classes/classes";
import { RACES } from "../src/data/races/races";
import { HERO_SKILLS } from "../src/data/skills/heroSkills";
import { SUBCLASSES } from "../src/data/subclasses/subclasses";
import { MASTERIES } from "../src/data/masteries/masteries";
import { createGuild } from "../src/game/guild/guildService";
import { generateRecruitmentPool } from "../src/game/recruitment/candidateGenerator";
import { applyContentEntitlements, applyStoryRaceUnlocks, claimDailyLogin, mergeContentEntitlements, unlockPremiumContent } from "../src/game/monetization/contentUnlockService";
import { createSeededRandom } from "../src/utils/random";
import { PREMIUM_HERO_PORTRAIT_VARIANT_KEYS } from "../src/data/heroes/heroPortraits";
import { recruitCandidate } from "../src/game/recruitment/recruitmentService";
import { generateRecruitmentCandidate } from "../src/game/recruitment/candidateGenerator";

describe("premium race and class unlocks", () => {
  it("starts with premium classes and Tiefling locked", () => {
    const guild = createGuild();
    expect(guild.entitlements.unlockedClassIds).not.toContain("monk");
    expect(guild.entitlements.unlockedClassIds).not.toContain("bard");
    expect(guild.entitlements.unlockedClassIds).not.toContain("spellbow");
    expect(guild.entitlements.unlockedClassIds).not.toContain("bulwark");
    expect(guild.entitlements.unlockedRaceIds).not.toContain("tiefling");
  });

  it("charges exactly 50 gems and permanently records each unlock", () => {
    let guild = { ...createGuild(), gems: 250 };
    guild = unlockPremiumContent(guild, "monk");
    guild = unlockPremiumContent(guild, "bard");
    guild = unlockPremiumContent(guild, "tiefling");
    guild = unlockPremiumContent(guild, "spellbow");
    guild = unlockPremiumContent(guild, "bulwark");
    expect(guild.gems).toBe(0);
    expect(guild.entitlements.unlockedClassIds).toEqual(expect.arrayContaining(["monk", "bard", "spellbow", "bulwark"]));
    expect(guild.entitlements.unlockedRaceIds).toContain("tiefling");
    expect(() => unlockPremiumContent(guild, "monk")).toThrow("already unlocked");
  });

  it("merges purchased and story entitlements into every fresh save without revoking either", () => {
    const account = mergeContentEntitlements(
      { unlockedClassIds: ["monk", "summoner"], unlockedRaceIds: ["tiefling"] },
      { unlockedClassIds: ["bard"], unlockedRaceIds: ["stoneborn"] },
    );
    const freshSave = applyContentEntitlements(createGuild("Fresh Charter"), account);
    expect(freshSave.entitlements.unlockedClassIds).toEqual(expect.arrayContaining(["warrior", "monk", "summoner", "bard"]));
    expect(freshSave.entitlements.unlockedRaceIds).toEqual(expect.arrayContaining(["human", "tiefling", "stoneborn"]));
    expect(new Set(freshSave.entitlements.unlockedClassIds).size).toBe(freshSave.entitlements.unlockedClassIds.length);
  });

  it("awards 10 gems once per local calendar day", () => {
    const firstDate = new Date(2026, 7, 25, 9);
    const nextDate = new Date(2026, 7, 26, 9);
    const initial = { ...createGuild(), gems: 0 };
    const first = claimDailyLogin(initial, firstDate);
    expect(first.gems).toBe(10);
    expect(() => claimDailyLogin(first, firstDate)).toThrow("already claimed");
    expect(claimDailyLogin(first, nextDate).gems).toBe(20);
  });

  it("keeps locked content out of recruitment and allows the unlocked pool", () => {
    const base = createGuild();
    const locked = Array.from({ length: 20 }, (_, seed) => generateRecruitmentPool(createSeededRandom(seed), 1, 0, undefined, base.entitlements.unlockedRaceIds, base.entitlements.unlockedClassIds)).flat();
    expect(locked.some((candidate) => candidate.heroPreview.raceId === "tiefling" || candidate.heroPreview.classId === "monk" || candidate.heroPreview.classId === "bard")).toBe(false);
    const unlocked = Array.from({ length: 40 }, (_, seed) => generateRecruitmentPool(createSeededRandom(seed), 1, 0, undefined, [...base.entitlements.unlockedRaceIds, "tiefling"], [...base.entitlements.unlockedClassIds, "monk", "bard"])).flat();
    expect(unlocked.some((candidate) => candidate.heroPreview.raceId === "tiefling")).toBe(true);
    expect(unlocked.some((candidate) => candidate.heroPreview.classId === "monk")).toBe(true);
    expect(unlocked.some((candidate) => candidate.heroPreview.classId === "bard")).toBe(true);
  });

  it("provides complete class progression data", () => {
    for (const classId of ["monk", "bard", "spellbow", "bulwark"] as const) {
      expect(CLASSES[classId]).toBeDefined();
      expect(CLASSES[classId].skillIds.every((id) => HERO_SKILLS[id])).toBe(true);
      expect(Object.values(SUBCLASSES).filter((entry) => entry.baseClassId === classId)).toHaveLength(2);
      expect(Object.values(MASTERIES).filter((entry) => entry.baseClassId === classId)).toHaveLength(2);
    }
    expect(RACES.tiefling).toBeDefined();
    expect(PREMIUM_HERO_PORTRAIT_VARIANT_KEYS).toHaveLength(424);
    expect(new Set(PREMIUM_HERO_PORTRAIT_VARIANT_KEYS).size).toBe(424);
  });

  it("keeps a new-content portrait when a level-one recruit joins the guild", () => {
    const candidate = generateRecruitmentCandidate(createSeededRandom(915), 1, 0, "prospect", "tiefling", "bard");
    const initial = createGuild();
    const guild = { ...initial, gold: 100_000, entitlements: { unlockedRaceIds: [...initial.entitlements.unlockedRaceIds, "tiefling" as const], unlockedClassIds: [...initial.entitlements.unlockedClassIds, "bard" as const] }, recruitment: { ...initial.recruitment, candidates: [candidate], candidateIds: [candidate.candidateId] } };
    const recruited = recruitCandidate(guild, candidate.candidateId);
    const hero = recruited.heroes[0]!;
    expect(hero.level).toBe(1);
    expect(hero.portraitKey).toBe(candidate.heroPreview.portraitKey);
    expect(hero.portraitVariant).toBe(candidate.heroPreview.portraitVariant);
  });

  it("unlocks Summoner for gems and the two Eldorian races through their stories", () => {
    const premium = unlockPremiumContent({ ...createGuild(), gems: 50 }, "summoner");
    expect(premium.gems).toBe(0);
    expect(premium.entitlements.unlockedClassIds).toContain("summoner");
    const progressed = { ...premium, world: { ...premium.world, completedQuestIds: ["kharum_seventh_bell", "archive_below"] } };
    const unlocked = applyStoryRaceUnlocks(progressed);
    expect(unlocked.entitlements.unlockedRaceIds).toEqual(expect.arrayContaining(["stoneborn", "veilborn"]));
  });
});
