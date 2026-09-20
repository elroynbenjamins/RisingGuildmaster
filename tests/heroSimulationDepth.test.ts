import { describe, expect, it } from "vitest";
import { generateRecruitmentCandidate } from "../src/game/recruitment/candidateGenerator";
import { getRecruitmentRecommendation } from "../src/game/recruitment/recruitmentRecommendationService";
import { recruitCandidate, rehireFormerMember } from "../src/game/recruitment/recruitmentService";
import { createGuild } from "../src/game/guild/guildService";
import { getHeroMentorships, getHeroReputationTitles } from "../src/game/heroes/heroIdentityService";
import { canRetireHero, retireHero } from "../src/game/heroes/heroCareerService";
import { applyQuestRelationshipConsequences, setRelationship } from "../src/game/relationships/relationshipService";
import { createHeroContract } from "../src/game/recruitment/contractService";
import { createSeededRandom } from "../src/utils/random";
import { testHero } from "./testHero";
import { deserializeGuild, serializeGuild } from "../src/game/save/saveService";
import { advanceGuildTime } from "../src/game/economy/guildCalendarService";

const questOutcome = (hero: ReturnType<typeof testHero>) => ({
  heroId: hero.id,
  name: hero.name,
  raceId: hero.raceId,
  classId: hero.classId,
  gender: hero.gender,
  portraitVariant: hero.portraitVariant ?? 0,
  levelBefore: hero.level,
  levelAfter: hero.level,
  currentHP: hero.currentHP,
  maxHP: 212,
  conditionIds: [],
  availableSkillPoints: 0,
  fellInBattle: false,
  newlyInjured: false,
});

describe("guild hero simulation depth", () => {
  it("creates mentorship only from an experienced hero and a real positive bond", () => {
    const mentor = { ...testHero(), id: "mentor", name: "Tavia", level: 7, history: { ...testHero().history, questsCompleted: 8 } };
    const mentee = { ...testHero(), id: "mentee", name: "Pell", level: 3 };
    const guild = createGuild();
    guild.heroes = [mentor, mentee];
    guild.relationships = setRelationship([], mentor.id, mentee.id, 34);
    expect(getHeroMentorships(guild, mentor.id)[0]).toMatchObject({ mentorId: mentor.id, menteeId: mentee.id });
    expect(getHeroReputationTitles(guild, mentor).map((title) => title.id)).toContain("company_mentor");

    const hostile = { ...guild, relationships: setRelationship([], mentor.id, mentee.id, -30) };
    expect(getHeroMentorships(hostile, mentor.id)).toEqual([]);
  });

  it("mentorship deepens a victorious shared quest bond by one extra point", () => {
    const mentor = { ...testHero(), id: "mentor", name: "Tavia", level: 7, history: { ...testHero().history, questsCompleted: 8 } };
    const mentee = { ...testHero(), id: "mentee", name: "Pell", level: 3 };
    const guild = createGuild();
    guild.heroes = [mentor, mentee];
    guild.relationships = setRelationship([], mentor.id, mentee.id, 30);
    const result = applyQuestRelationshipConsequences(guild, "victory", [questOutcome(mentor), questOutcome(mentee)], "goblin_patrol", "Goblin Patrol");
    expect(result.changes[0]?.delta).toBe(5);
    expect(result.changes[0]?.reason).toContain("guidance");
  });

  it("uses real roster similarities for deterministic recruit recommendations and records the recommendation", () => {
    const candidate = generateRecruitmentCandidate(createSeededRandom(99), 4);
    const veteran = {
      ...testHero(),
      id: "veteran",
      name: "Mara",
      level: Math.max(5, candidate.heroPreview.level + 2),
      raceId: candidate.heroPreview.raceId,
      classId: candidate.heroPreview.classId,
      backgroundId: candidate.heroPreview.backgroundId,
      roleplayProfile: candidate.heroPreview.roleplayProfile,
    };
    let guild = createGuild();
    guild.heroes = [veteran];
    guild.gold = 99999;
    guild.recruitment = { ...guild.recruitment, candidates: [candidate], candidateIds: [candidate.candidateId] };
    const recommendation = getRecruitmentRecommendation(guild, candidate);
    expect(recommendation).toMatchObject({ heroId: veteran.id, heroName: veteran.name });
    guild = recruitCandidate(guild, candidate.candidateId);
    expect(guild.heroes.find((hero) => hero.id === veteran.id)?.history.events.some((event) => event.tags?.includes("recommendation"))).toBe(true);
    expect(guild.heroes.find((hero) => hero.id === candidate.heroPreview.id)?.history.events.some((event) => event.tags?.includes("hero_recommendation"))).toBe(true);
  });

  it("retires an established hero into permanent alumni and returns all equipment", () => {
    const veteran = {
      ...testHero(),
      id: "retiree",
      name: "Bruni",
      level: 7,
      equipment: { ...testHero().equipment, weapon: "veteran-sword", armor: "veteran-mail" },
      history: { ...testHero().history, questsCompleted: 12 },
    };
    const allies = ["a", "b"].map((id) => ({ ...testHero(), id }));
    let guild = createGuild();
    guild.heroes = [veteran, ...allies];
    guild.heroContracts = [createHeroContract(veteran, 160, 12, guild.currentDay)];
    guild.relationships = [{ heroIdA: veteran.id, heroIdB: "a", score: 55 }];
    expect(canRetireHero(guild, veteran.id).eligible).toBe(true);
    guild = retireHero(guild, veteran.id);
    expect(guild.heroes.some((hero) => hero.id === veteran.id)).toBe(false);
    expect(guild.inventory).toEqual(expect.arrayContaining(["veteran-sword", "veteran-mail"]));
    const alumnus = guild.recruitment.formerMembers.find((member) => member.hero.id === veteran.id)!;
    expect(alumnus).toMatchObject({ departureKind: "retired", departedDay: 1 });
    expect(alumnus.relationships).toContainEqual({ heroIdA: veteran.id, heroIdB: "a", score: 55 });
    expect(alumnus.hero.history.events.at(-1)?.title).toBe("Retired with guild honors");
    expect(() => rehireFormerMember({ ...guild, gold: 99999 }, veteran.id)).toThrow("Retired veterans");
  });

  it("announces when a contract alumnus becomes eligible to return", () => {
    const guild = createGuild();
    guild.recruitment.formerMembers = [{
      hero: { ...testHero(), id: "away", name: "Mira" },
      departedDay: 1,
      eligibleReturnDay: 2,
      lastWeeklySalary: 100,
      rehireCount: 0,
      relationships: [],
      departureKind: "contract_end",
    }];
    const result = advanceGuildTime(guild);
    expect(result.days[0]?.events).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: "former_member_return", text: expect.stringContaining("Mira") }),
    ]));
  });

  it("migrates v5 former members into contract alumni", () => {
    const guild = createGuild();
    guild.recruitment.formerMembers = [{
      hero: { ...testHero(), id: "legacy-former" },
      departedDay: 4,
      eligibleReturnDay: 11,
      lastWeeklySalary: 90,
      rehireCount: 0,
      relationships: [],
      departureKind: "contract_end",
    }];
    const raw = JSON.parse(serializeGuild(guild));
    raw.saveVersion = 5;
    delete raw.recruitment.formerMembers[0].departureKind;
    const loaded = deserializeGuild(JSON.stringify(raw));
    expect(loaded.saveVersion).toBe(6);
    expect(loaded.recruitment.formerMembers[0]?.departureKind).toBe("contract_end");
  });
});
