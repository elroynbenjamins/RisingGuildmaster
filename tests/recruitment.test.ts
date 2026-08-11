import { describe, expect, it } from "vitest";
import { RECRUITMENT_ARCHETYPES, RECRUITMENT_CLASS_WEIGHTS, RECRUITMENT_CONFIG, RECRUITMENT_RACE_WEIGHTS } from "../src/data/recruitment/recruitmentBalance";
import { createGuild } from "../src/game/guild/guildService";
import { generateRecruitmentCandidate, generateRecruitmentPool, getArchetypeWeights, reputationPotentialBonus } from "../src/game/recruitment/candidateGenerator";
import { calculateContractCosts, calculateRecruitmentFee, calculateWeeklySalary } from "../src/game/recruitment/recruitmentCostCalculator";
import { calculateRenewalSalary, createHeroContract, getContractStatus } from "../src/game/recruitment/contractService";
import { createRecruitmentState, freeRefreshRecruitment, initializeRecruitment, manualRefreshRecruitment, purgeExpiredCandidates, recruitCandidate, rejectCandidate, reserveCandidate, scoutRecruitmentCandidate } from "../src/game/recruitment/recruitmentService";
import { financialEstimate, potentialEstimate, scoutCandidate } from "../src/game/recruitment/scoutingService";
import { validateCandidateRecruitment } from "../src/game/recruitment/recruitmentValidator";
import { deserializeGuild, serializeGuild } from "../src/game/save/saveService";
import { createSeededRandom } from "../src/utils/random";
import { testHero } from "./testHero";
import { collectRegionalScoutReport, dispatchRegionalScout, focusRegionalScoutClass, regionalScoutDaysRemaining, speedUpRegionalScout } from "../src/game/recruitment/regionalScoutingService";
import { RACE_HOMELANDS } from "../src/data/recruitment/raceHomelands";
import type { GuildmasterSkillId } from "../src/game/guildmaster/guildmasterTypes";

describe("recruitment generation", () => {
  it("uses normalized race and class probabilities", () => { expect(Object.values(RECRUITMENT_RACE_WEIGHTS).reduce((a,b)=>a+b,0)).toBeCloseTo(1); expect(Object.values(RECRUITMENT_CLASS_WEIGHTS).reduce((a,b)=>a+b,0)).toBeCloseTo(1); });
  it.each(["prospect","standard","veteran","elite"] as const)("generates %s candidates inside archetype ranges", (archetype) => { const candidate = generateRecruitmentCandidate(createSeededRandom(42), 5, 0, archetype); const balance = RECRUITMENT_ARCHETYPES[archetype]; expect(candidate.archetype).toBe(archetype); expect(candidate.heroPreview.age).toBeGreaterThanOrEqual(balance.ageMin); expect(candidate.heroPreview.age).toBeLessThanOrEqual(balance.ageMax); expect(candidate.heroPreview.level).toBeGreaterThanOrEqual(balance.levelMin); expect(candidate.heroPreview.level).toBeLessThanOrEqual(balance.levelMax); expect(candidate.truePotential).toBeGreaterThanOrEqual(Math.max(50,balance.potentialMin)); expect(candidate.truePotential).toBeLessThanOrEqual(balance.potentialMax); expect(candidate.expiresAtDay).toBe(12); });
  it("generates three deterministic, diverse candidates", () => { const first = generateRecruitmentPool(createSeededRandom(77), 1); const second = generateRecruitmentPool(createSeededRandom(77), 1); expect(first).toEqual(second); expect(first).toHaveLength(3); expect(new Set(first.map((item)=>item.candidateId)).size).toBe(3); expect(first.every((item)=>item.truePotential>=50&&item.truePotential<=100)).toBe(true); });
  it("raises elite chance and potential with reputation", () => { expect(reputationPotentialBonus(0)).toBe(0); expect(reputationPotentialBonus(60)).toBe(6); expect(reputationPotentialBonus(999)).toBe(10); expect(getArchetypeWeights(60).elite).toBeCloseTo(.08); expect(getArchetypeWeights(999).elite).toBeCloseTo(.10); expect(Object.values(getArchetypeWeights(60)).reduce((a,b)=>a+b,0)).toBeCloseTo(1); });
});

describe("recruitment finances and scouting", () => {
  it("calculates the mandatory fee and contract examples", () => { expect(calculateRecruitmentFee(4,80,-.20)).toBe(720); expect(calculateContractCosts(700,100,24)).toEqual({contractSalary:2400,totalEstimatedCost:3100}); });
  it("creates explicit financial estimate ranges", () => { expect(financialEstimate(1000,.20)).toEqual({minimum:800,maximum:1200}); expect(financialEstimate(100,0)).toEqual({minimum:100,maximum:100}); });
  it("calculates salary from level, attributes, archetype, and real traits", () => { const hero={...testHero(),level:5}; expect(calculateWeeklySalary(hero,.30)).toBe(189); const greedy={...hero,traitIds:["greedy" as const]}; expect(calculateWeeklySalary(greedy,.30)).toBe(210); });
  it("narrows potential, fee, and salary demand through all scouting levels", () => { expect(potentialEstimate(80,15)).toEqual({minimum:65,maximum:95}); const generated=generateRecruitmentCandidate(createSeededRandom(1),1,0,"standard"); let candidate={...generated,truePotential:80,potentialEstimateMin:65,potentialEstimateMax:95,heroPreview:{...generated.heroPreview,potential:80,potentialEstimateMin:65,potentialEstimateMax:95}}; const initialFeeWidth=candidate.recruitmentFeeEstimateMax-candidate.recruitmentFeeEstimateMin; candidate=scoutCandidate(candidate); expect([candidate.potentialEstimateMin,candidate.potentialEstimateMax]).toEqual([70,90]); expect(candidate.recruitmentFeeEstimateMax-candidate.recruitmentFeeEstimateMin).toBeLessThan(initialFeeWidth); candidate=scoutCandidate(candidate); expect([candidate.potentialEstimateMin,candidate.potentialEstimateMax]).toEqual([75,85]); candidate=scoutCandidate(candidate); expect([candidate.potentialEstimateMin,candidate.potentialEstimateMax]).toEqual([80,80]); expect([candidate.recruitmentFeeEstimateMin,candidate.recruitmentFeeEstimateMax]).toEqual([candidate.recruitmentFee,candidate.recruitmentFee]); expect([candidate.weeklySalaryEstimateMin,candidate.weeklySalaryEstimateMax]).toEqual([candidate.weeklySalary,candidate.weeklySalary]); });
  it("creates and updates contract timing", () => { const contract=createHeroContract(testHero(),100,12,5); expect(contract.endDay).toBe(89); expect(getContractStatus(contract,75)).toBe("expiring"); expect(getContractStatus(contract,89)).toBe("expired"); expect(calculateRenewalSalary(contract,6)).toBe(115); });
});

describe("persistent recruitment state", () => {
  const readyGuild=()=>initializeRecruitment(createGuild(),createSeededRandom(10));
  it("persists the generated pool through save/load", () => { const guild=readyGuild(); const loaded=deserializeGuild(serializeGuild(guild)); expect(loaded.recruitment).toEqual(guild.recruitment); expect(loaded.recruitment.candidates).toHaveLength(3); });
  it("charges manual refresh and permits the scheduled free refresh", () => { const guild=readyGuild(); const paid=manualRefreshRecruitment(guild,createSeededRandom(11)); expect(paid.gold).toBe(guild.gold-150); const waiting={...guild,currentDay:guild.recruitment.nextFreeRefreshDay}; const free=freeRefreshRecruitment(waiting,createSeededRandom(12)); expect(free.gold).toBe(waiting.gold); expect(free.recruitment.nextFreeRefreshDay).toBe(waiting.currentDay+7); });
  it("reserves one candidate for three days and preserves it through refresh", () => { const guild=readyGuild(); const id=guild.recruitment.candidateIds[0]!; const reserved=reserveCandidate(guild,id); expect(reserved.gold).toBe(guild.gold-50); expect(reserved.recruitment.reservationExpiresAtDay).toBe(guild.currentDay+3); expect(()=>reserveCandidate(reserved,guild.recruitment.candidateIds[1]!)).toThrow(); const refreshed=manualRefreshRecruitment(reserved,createSeededRandom(13)); expect(refreshed.recruitment.candidateIds).toContain(id); });
  it("expires candidates and regenerates only when the last candidate is rejected", () => { const guild=readyGuild(); const expired=purgeExpiredCandidates({...guild,currentDay:8}); expect(expired.recruitment.candidates).toHaveLength(0); const one={...guild,recruitment:createRecruitmentState(1,[guild.recruitment.candidates[0]!])}; expect(rejectCandidate(one,one.recruitment.candidateIds[0]!,createSeededRandom(14)).recruitment.candidates).toHaveLength(3); });
  it("scouting spends gold and updates the persisted candidate", () => { const guild=readyGuild(); const id=guild.recruitment.candidateIds[0]!; const scouted=scoutRecruitmentCandidate(guild,id); expect(scouted.gold).toBe(guild.gold-100); expect(scouted.recruitment.candidates[0]?.scoutingLevel).toBe(1); });
  it("recruits successfully, deducts the upfront fee, creates a contract, and removes the candidate", () => { const guild=readyGuild(); const candidate=guild.recruitment.candidates[0]!; const recruited=recruitCandidate(guild,candidate.candidateId); expect(recruited.gold).toBe(guild.gold-candidate.recruitmentFee); expect(recruited.heroes.some((hero)=>hero.id===candidate.heroPreview.id)).toBe(true); expect(recruited.heroContracts[0]).toMatchObject({heroId:candidate.heroPreview.id,weeklySalary:candidate.weeklySalary}); expect(recruited.recruitment.candidateIds).not.toContain(candidate.candidateId); expect(recruited.heroes[0]?.history.importantEvents[0]).toContain("Joined the guild"); });
  it("rejects unaffordable and over-capacity recruitment", () => { const guild=readyGuild(); const candidate=guild.recruitment.candidates[0]!; expect(validateCandidateRecruitment({...guild,gold:0},candidate)).toContain("Insufficient Gold"); const heroes=Array.from({length:RECRUITMENT_CONFIG.heroCapacity},(_,index)=>({...testHero(),id:`h${index}`})); expect(validateCandidateRecruitment({...guild,heroes},candidate)).toContain("Guild hero capacity reached"); });
});

describe("regional scout expeditions", () => {
  const scoutGuild = (gems = 20) => ({ ...createGuild(), gems, guildmaster: { level: 4, xp: 0, skillPoints: 0, unlockedSkillIds: ["regional_network", "specialist_headhunting", "express_dispatches"] as GuildmasterSkillId[] } });
  it.each(["human", "elf", "dwarf", "orc"] as const)("takes three days before returning five narrowed %s candidates", (raceId) => {
    const guild = scoutGuild();
    const dispatched = dispatchRegionalScout(guild, raceId, createSeededRandom(700));
    const homeland = RACE_HOMELANDS[raceId];
    expect(dispatched.gems).toBe(10);
    expect(dispatched.recruitment.candidates).toHaveLength(0);
    expect(dispatched.recruitment.regionalScoutMission).toMatchObject({ raceId, regionId: homeland.regionId, startDay: 1, completionDay: 4 });
    expect(regionalScoutDaysRemaining(dispatched)).toBe(3);
    expect(() => collectRegionalScoutReport(dispatched)).toThrow("Scout returns in 3 day(s)");
    const result = collectRegionalScoutReport({ ...dispatched, currentDay: 4 });
    expect(result.recruitment.candidates).toHaveLength(5);
    expect(result.recruitment.candidates.every((candidate) => candidate.heroPreview.raceId === raceId)).toBe(true);
    expect(result.recruitment.candidates.every((candidate) => candidate.source === "regional_scout" && candidate.sourceRegionId === homeland.regionId && candidate.sourceLocationName === homeland.locationName)).toBe(true);
    expect(result.recruitment.candidates.every((candidate) => candidate.scoutingLevel === 1 && candidate.potentialEstimateMax - candidate.potentialEstimateMin <= 20)).toBe(true);
    expect(result.gemTransactions.at(-1)).toMatchObject({ type: "scouting", amount: -10 });
    expect(result.world.worldFlags[homeland.loreUnlockFlag]).toBe(true);
    expect(result.recruitment.regionalScoutMission).toBeNull();
  });

  it("rejects dispatch without ten gems", () => {
    expect(() => dispatchRegionalScout(scoutGuild(9), "human", createSeededRandom(1))).toThrow("Not enough gems");
  });

  it("allows only one regional scout at a time", () => {
    const dispatched = dispatchRegionalScout(scoutGuild(), "human", createSeededRandom(2));
    expect(() => dispatchRegionalScout(dispatched, "dwarf", createSeededRandom(3))).toThrow("A regional scout is already away");
  });

  it("requires the Guildmaster progression unlock", () => {
    expect(() => dispatchRegionalScout({ ...createGuild(), gems: 20 }, "human", createSeededRandom(4))).toThrow("Unlock Regional Network");
  });

  it("charges five extra gems for a class-focused report", () => {
    const dispatched = dispatchRegionalScout(scoutGuild(), "elf", createSeededRandom(21), "ranger");
    expect(dispatched.gems).toBe(5);
    expect(dispatched.gemTransactions.map((transaction) => transaction.amount)).toEqual([-10, -5]);
    const result = collectRegionalScoutReport({ ...dispatched, currentDay: dispatched.recruitment.regionalScoutMission!.completionDay });
    expect(result.recruitment.candidates).toHaveLength(5);
    expect(result.recruitment.candidates.every((candidate) => candidate.heroPreview.raceId === "elf" && candidate.heroPreview.classId === "ranger")).toBe(true);
  });

  it("can add a five-gem class focus after dispatch", () => {
    const dispatched = dispatchRegionalScout(scoutGuild(), "dwarf", createSeededRandom(25));
    const focused = focusRegionalScoutClass(dispatched, "cleric");
    expect(focused.gems).toBe(5);
    expect(focused.recruitment.regionalScoutMission?.classId).toBe("cleric");
    expect(focused.gemTransactions.at(-1)).toMatchObject({ type: "scouting", amount: -5 });
    const result = collectRegionalScoutReport({ ...focused, currentDay: focused.recruitment.regionalScoutMission!.completionDay });
    expect(result.recruitment.candidates.every((candidate) => candidate.heroPreview.classId === "cleric")).toBe(true);
  });

  it("speeds up an active mission for five gems", () => {
    const dispatched = dispatchRegionalScout(scoutGuild(), "human", createSeededRandom(31));
    const expedited = speedUpRegionalScout(dispatched);
    expect(expedited.gems).toBe(5);
    expect(expedited.recruitment.regionalScoutMission?.completionDay).toBe(expedited.currentDay);
    expect(expedited.gemTransactions.at(-1)).toMatchObject({ type: "scouting", amount: -5 });
    expect(collectRegionalScoutReport(expedited).recruitment.candidates).toHaveLength(5);
  });

  it("preserves an active reservation and persists the mission and report", () => {
    const initialized = initializeRecruitment(scoutGuild(), createSeededRandom(10));
    const reservedId = initialized.recruitment.candidateIds[0]!;
    const reserved = reserveCandidate(initialized, reservedId);
    const dispatched = dispatchRegionalScout(reserved, "dwarf", createSeededRandom(11));
    const loadedMission = deserializeGuild(serializeGuild(dispatched));
    expect(loadedMission.recruitment.regionalScoutMission).toEqual(dispatched.recruitment.regionalScoutMission);
    const result = collectRegionalScoutReport(speedUpRegionalScout(loadedMission));
    expect(result.recruitment.candidates).toHaveLength(6);
    expect(result.recruitment.candidateIds).toContain(reservedId);
    expect(result.recruitment.reservedCandidateId).toBe(reservedId);
    const loaded = deserializeGuild(serializeGuild(result));
    expect(loaded.recruitment.candidates.filter((candidate) => candidate.source === "regional_scout")).toHaveLength(5);
    expect(loaded.recruitment.candidates.find((candidate) => candidate.source === "regional_scout")?.sourceLocationName).toBe(RACE_HOMELANDS.dwarf.locationName);
  });
});
