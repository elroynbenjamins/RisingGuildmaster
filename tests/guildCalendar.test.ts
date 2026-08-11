import { describe, expect, it } from "vitest";
import { generateRecruitmentCandidate } from "../src/game/recruitment/candidateGenerator";
import { createGuild } from "../src/game/guild/guildService";
import { advanceGuildTime, paySalaryArrears, payrollDueOnDay, previewNextGuildDay, totalSalaryArrears } from "../src/game/economy/guildCalendarService";
import { createHeroContract } from "../src/game/recruitment/contractService";
import { deserializeGuild, serializeGuild } from "../src/game/save/saveService";
import { createSeededRandom } from "../src/utils/random";
import { testHero } from "./testHero";

describe("central guild calendar and economy", () => {
  it("charges weekly salary on each contract anniversary", () => {
    const hero = { ...testHero(), id: "payroll-hero", name: "Mira" };
    let guild = createGuild(); guild.heroes = [hero]; guild.heroContracts = [createHeroContract(hero, 100, 12, guild.currentDay)];
    expect(payrollDueOnDay(guild, 7)).toBe(0); expect(payrollDueOnDay(guild, 8)).toBe(100);
    const result = advanceGuildTime(guild, 7);
    expect(result.guild.currentDay).toBe(8); expect(result.guild.gold).toBe(4900); expect(result.guild.finance.totalSalaryPaid).toBe(100);
    expect(result.days[6]).toMatchObject({ day: 8, payrollDue: 100, payrollPaid: 100, arrearsAdded: 0 });
  });

  it("never makes gold negative and records unpaid salary per hero", () => {
    const hero = { ...testHero(), id: "arrears-hero", name: "Brakka" };
    let guild = createGuild(); guild.gold = 40; guild.heroes = [hero]; guild.heroContracts = [createHeroContract(hero, 100, 12, 1)];
    const result = advanceGuildTime(guild, 7);
    expect(result.guild.gold).toBe(0); expect(result.guild.finance.salaryArrearsByHeroId[hero.id]).toBe(60); expect(totalSalaryArrears(result.guild)).toBe(60);
    expect(result.days[6]).toMatchObject({ payrollDue: 100, payrollPaid: 40, arrearsAdded: 60 });
  });

  it("allows arrears to be paid later from available treasury gold", () => {
    const hero = { ...testHero(), id: "owed-hero", name: "Thane" };
    let guild = createGuild(); guild.heroes = [hero]; guild.gold = 25; guild.finance.salaryArrearsByHeroId[hero.id] = 60;
    guild = paySalaryArrears(guild, hero.id);
    expect(guild.gold).toBe(0); expect(guild.finance.salaryArrearsByHeroId[hero.id]).toBe(35);
    guild = paySalaryArrears({ ...guild, gold: 50 });
    expect(guild.gold).toBe(15); expect(totalSalaryArrears(guild)).toBe(0); expect(guild.finance.totalSalaryPaid).toBe(60);
  });

  it("previews and resolves all existing day-based systems together", () => {
    const hero = { ...testHero(), id: "calendar-hero", name: "Ysra", conditions: [{ conditionId: "injured" as const, remainingDuration: 1 }] };
    const candidate = { ...generateRecruitmentCandidate(createSeededRandom(4), 1), expiresAtDay: 2 };
    const guild = createGuild(); guild.heroes = [hero]; guild.world.regionCrisisDays = { shadowfen: 19 }; guild.world.regionThreat = { shadowfen: 0 };
    guild.artisans.blacksmith = { level: 0, recruited: false, construction: { targetLevel: 1, startDay: 1, completionDay: 2, goldCost: 800 } };
    guild.gatheringMissions = [{ id: "gather-ready", definitionId: "greenveil_foraging", heroIds: [hero.id, "second"], startDay: 1, completionDay: 2, resolutionSeed: 1, status: "active" }];
    guild.recruitment = { ...guild.recruitment, candidates: [candidate], candidateIds: [candidate.candidateId], regionalScoutMission: { id: "scout-ready", raceId: "human", classId: null, regionId: "greenveil", locationName: "Guildhaven", startDay: 1, completionDay: 2, resolutionSeed: 4 } };
    const preview = previewNextGuildDay(guild);
    expect(preview).toMatchObject({ targetDay: 2, workshopNames: ["Blacksmith"], gatheringMissionIds: ["gather-ready"], scoutReturns: true, recoveringHeroNames: ["Ysra"], expiringCandidateCount: 1, threatIncreaseRegionIds: ["shadowfen"] });
    const result = advanceGuildTime(guild);
    expect(result.guild.artisans.blacksmith).toMatchObject({ recruited: true, level: 1, construction: null }); expect(result.guild.heroes[0]?.conditions).toHaveLength(0); expect(result.guild.recruitment.candidates).toHaveLength(0); expect(result.guild.world.regionThreat?.shadowfen).toBe(1);
    expect(new Set(result.days[0]?.events.map((event) => event.type))).toEqual(new Set(["workshop_complete", "gathering_ready", "scout_ready", "condition_recovered", "candidate_expired", "regional_threat"]));
  });

  it("migrates legacy saves without finance state", () => {
    const legacy = JSON.parse(serializeGuild(createGuild())) as Record<string, unknown>; delete legacy.finance;
    const loaded = deserializeGuild(JSON.stringify(legacy));
    expect(loaded.finance).toEqual({ salaryArrearsByHeroId: {}, totalSalaryPaid: 0, transactions: [] });
  });
});
