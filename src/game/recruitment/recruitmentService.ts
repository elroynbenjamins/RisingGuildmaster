import { RECRUITMENT_CONFIG } from "../../data/recruitment/recruitmentBalance";
import type { GuildState } from "../guild/types";
import type { RandomSource } from "../../utils/random";
import { generateRecruitmentPool } from "./candidateGenerator";
import { createHeroContract } from "./contractService";
import { calculateWeeklySalary } from "./recruitmentCostCalculator";
import { calculateHero } from "../heroes/heroCalculator";
import { GAME_CONFIG } from "../../config/gameConfig";
import { scoutCandidate, scoutingCost } from "./scoutingService";
import type { RecruitmentCandidate, RecruitmentState, ScoutingLevel } from "./recruitmentTypes";
import { validateCandidateRecruitment } from "./recruitmentValidator";
import { appendHeroHistoryEvent } from "../heroes/heroHistoryService";
import { getDifficulty } from "../../data/difficulty/difficulties";
import { getTavernRecruitmentBonuses } from "../economy/tavernService";
import { getRecruitmentLevelRange } from "./recruitmentLevelService";
import type { RecruitmentArchetype } from "./recruitmentTypes";

function withCandidates(state: RecruitmentState, candidates: RecruitmentCandidate[]): RecruitmentState { return { ...state, candidates, candidateIds: candidates.map((candidate) => candidate.candidateId) }; }
const unlockedPool = (guild: GuildState, random: RandomSource) => {
  const tavern=getTavernRecruitmentBonuses(guild);
  const archetypes:RecruitmentArchetype[]=["prospect","standard","veteran","elite"]; const levelRanges=Object.fromEntries(archetypes.map((archetype)=>[archetype,getRecruitmentLevelRange(guild,archetype)]));
  return generateRecruitmentPool(random, guild.currentDay, guild.reputation+tavern.reputationBonus, RECRUITMENT_CONFIG.candidateCount+tavern.extraCandidates, guild.entitlements.unlockedRaceIds, guild.entitlements.unlockedClassIds, levelRanges);
};
export function createRecruitmentState(currentDay: number, candidates: RecruitmentCandidate[] = []): RecruitmentState { return { candidateIds: candidates.map((candidate) => candidate.candidateId), candidates, reservedCandidateId: null, reservationExpiresAtDay: null, lastFreeRefreshDay: currentDay, nextFreeRefreshDay: currentDay + RECRUITMENT_CONFIG.freeRefreshDays, manualRefreshCost: RECRUITMENT_CONFIG.manualRefreshCost, regionalScoutMission: null, formerMembers: [] }; }
export function initializeRecruitment(guild: GuildState, random: RandomSource): GuildState { const purged = purgeExpiredCandidates(guild); if (purged.recruitment.candidates.length) return purged; const candidates = unlockedPool(guild, random); return { ...purged, recruitment: createRecruitmentState(guild.currentDay, candidates) }; }
export function purgeExpiredCandidates(guild: GuildState): GuildState { const reservationActive = guild.recruitment.reservedCandidateId && (guild.recruitment.reservationExpiresAtDay ?? 0) > guild.currentDay; const candidates = guild.recruitment.candidates.filter((candidate) => candidate.expiresAtDay > guild.currentDay); const reservedStillExists = reservationActive && candidates.some((candidate) => candidate.candidateId === guild.recruitment.reservedCandidateId); return { ...guild, recruitment: { ...withCandidates(guild.recruitment, candidates), reservedCandidateId: reservedStillExists ? guild.recruitment.reservedCandidateId : null, reservationExpiresAtDay: reservedStillExists ? guild.recruitment.reservationExpiresAtDay : null } }; }
export function manualRefreshRecruitment(guild: GuildState, random: RandomSource): GuildState { if (!getDifficulty(guild.difficultyId).allowsPaidRecruitmentRefresh) throw new Error("Iron Guild forbids gold-paid tavern recruitment refreshes"); if (guild.gold < guild.recruitment.manualRefreshCost) throw new Error("Insufficient Gold"); const reserved = guild.recruitment.candidates.filter((candidate) => candidate.candidateId === guild.recruitment.reservedCandidateId && (guild.recruitment.reservationExpiresAtDay ?? 0) > guild.currentDay); const generated = unlockedPool(guild, random); return { ...guild, gold: guild.gold - guild.recruitment.manualRefreshCost, recruitment: withCandidates(guild.recruitment, [...reserved, ...generated]) }; }
export function freeRefreshRecruitment(guild: GuildState, random: RandomSource): GuildState { if (guild.currentDay < guild.recruitment.nextFreeRefreshDay) throw new Error("Free refresh is not ready"); const reserved = guild.recruitment.candidates.filter((candidate) => candidate.candidateId === guild.recruitment.reservedCandidateId && (guild.recruitment.reservationExpiresAtDay ?? 0) > guild.currentDay); const generated = unlockedPool(guild, random); return { ...guild, recruitment: { ...withCandidates(guild.recruitment, [...reserved, ...generated]), lastFreeRefreshDay: guild.currentDay, nextFreeRefreshDay: guild.currentDay + RECRUITMENT_CONFIG.freeRefreshDays } }; }
export function tutorialRefreshRecruitment(guild: GuildState, random: RandomSource): GuildState { const reserved = guild.recruitment.candidates.filter((candidate) => candidate.candidateId === guild.recruitment.reservedCandidateId); const generated = unlockedPool(guild, random); return { ...guild, recruitment: withCandidates(guild.recruitment, [...reserved, ...generated]) }; }
export function reserveCandidate(guild: GuildState, candidateId: string): GuildState { if (guild.recruitment.reservedCandidateId && (guild.recruitment.reservationExpiresAtDay ?? 0) > guild.currentDay) throw new Error("Only one candidate may be reserved"); if (!guild.recruitment.candidateIds.includes(candidateId)) throw new Error("Candidate is no longer available"); if (guild.gold < RECRUITMENT_CONFIG.reservationCost) throw new Error("Insufficient Gold"); return { ...guild, gold: guild.gold - RECRUITMENT_CONFIG.reservationCost, recruitment: { ...guild.recruitment, reservedCandidateId: candidateId, reservationExpiresAtDay: guild.currentDay + RECRUITMENT_CONFIG.reservationDays } }; }
export function scoutRecruitmentCandidate(guild: GuildState, candidateId: string): GuildState { if (!guild.guildmaster.unlockedSkillIds.includes("scouting_basics")) throw new Error("Unlock Scouting Desk in the Guildmaster skill tree"); const candidate = guild.recruitment.candidates.find((item) => item.candidateId === candidateId); if (!candidate) throw new Error("Candidate is no longer available"); const nextLevel = (candidate.scoutingLevel + 1) as ScoutingLevel; const cost = scoutingCost(nextLevel); if (guild.gold < cost) throw new Error("Insufficient Gold"); const updated = scoutCandidate(candidate); return { ...guild, gold: guild.gold - cost, recruitment: withCandidates(guild.recruitment, guild.recruitment.candidates.map((item) => item.candidateId === candidateId ? updated : item)) }; }
export function recruitCandidate(guild: GuildState, candidateId: string): GuildState { const candidate = guild.recruitment.candidates.find((item) => item.candidateId === candidateId); if (!candidate) throw new Error("Candidate is no longer available"); const errors = validateCandidateRecruitment(guild, candidate); if (errors.length) throw new Error(errors.join(". ")); const baseHero = { ...candidate.heroPreview, potential: candidate.truePotential, recruitmentCost: candidate.recruitmentFee, salary: candidate.weeklySalary, isAvailable: true, history: { ...candidate.heroPreview.history, importantEvents: [...candidate.heroPreview.history.importantEvents, `Joined the guild on Day ${guild.currentDay}.`] } }; const hero = appendHeroHistoryEvent(baseHero, { day: guild.currentDay, type: "recruitment", outcome: "positive", title: "Joined the guild", description: `${baseHero.name} signed a ${candidate.contractLengthWeeks}-week contract for ${candidate.recruitmentFee} gold.`, tags: [candidate.source, candidate.archetype] }); const candidates = guild.recruitment.candidates.filter((item) => item.candidateId !== candidateId); return { ...guild, gold: guild.gold - candidate.recruitmentFee, heroes: [...guild.heroes, hero], heroContracts: [...guild.heroContracts, createHeroContract(hero, candidate.weeklySalary, candidate.contractLengthWeeks, guild.currentDay)], recruitment: { ...withCandidates(guild.recruitment, candidates), reservedCandidateId: guild.recruitment.reservedCandidateId === candidateId ? null : guild.recruitment.reservedCandidateId, reservationExpiresAtDay: guild.recruitment.reservedCandidateId === candidateId ? null : guild.recruitment.reservationExpiresAtDay } }; }
export function rejectCandidate(guild: GuildState, candidateId: string, random: RandomSource): GuildState { let candidates = guild.recruitment.candidates.filter((item) => item.candidateId !== candidateId); if (!candidates.length) candidates = unlockedPool(guild, random); return { ...guild, recruitment: withCandidates(guild.recruitment, candidates) }; }


export const FORMER_MEMBER_RETURN_COOLDOWN_DAYS = 7;
export const FORMER_MEMBER_ARCHIVE_LIMIT = 24;
export function formerMemberRehireSalary(member: RecruitmentState["formerMembers"][number]): number {
  return Math.max(Math.round(member.lastWeeklySalary * 1.10), calculateWeeklySalary(member.hero));
}
export function formerMemberRehireFee(member: RecruitmentState["formerMembers"][number]): number {
  const salary = formerMemberRehireSalary(member);
  return Math.max(100, Math.round(salary * (2 + Math.min(1, member.rehireCount * .15))));
}
export function rehireFormerMember(guild: GuildState, heroId: string): GuildState {
  const member = guild.recruitment.formerMembers.find((entry) => entry.hero.id === heroId);
  if (!member) throw new Error("Former guild member is unavailable");
  if (guild.currentDay < member.eligibleReturnDay) throw new Error("This hero is not ready to return yet");
  if (guild.heroes.length >= RECRUITMENT_CONFIG.heroCapacity) throw new Error("Hero roster is full");
  const fee = formerMemberRehireFee(member);
  if (guild.gold < fee) throw new Error("Insufficient Gold");
  const salary = formerMemberRehireSalary(member);
  const recoveredBase = {
    ...member.hero,
    equipment: { weapon:null, armor:null, helmet:null, boots:null, accessory1:null, accessory2:null },
    salary,
    recruitmentCost: fee,
    conditions: [],
    isAvailable: true,
    adventureStamina: GAME_CONFIG.maxAdventureStamina,
  };
  const recovered = appendHeroHistoryEvent({
    ...recoveredBase,
    currentHP: calculateHero(recoveredBase).stats.maxHP,
  }, {
    day:guild.currentDay,
    type:"recruitment",
    outcome:"positive",
    title:"Returned to the guild",
    description:member.hero.name+" rejoined "+guild.guildName+" after time away.",
    tags:["former_member","returning_hero"],
  });
  const activeIds = new Set([...guild.heroes.map((hero) => hero.id), recovered.id]);
  const restoredRelationships = member.relationships.filter((relationship) => activeIds.has(relationship.heroIdA) && activeIds.has(relationship.heroIdB));
  return {
    ...guild,
    gold:guild.gold-fee,
    heroes:[...guild.heroes,recovered],
    heroContracts:[...guild.heroContracts,createHeroContract(recovered,salary,12,guild.currentDay)],
    relationships:[...guild.relationships,...restoredRelationships.filter((relationship)=>!guild.relationships.some((existing)=>(existing.heroIdA===relationship.heroIdA&&existing.heroIdB===relationship.heroIdB)||(existing.heroIdA===relationship.heroIdB&&existing.heroIdB===relationship.heroIdA)))],
    recruitment:{...guild.recruitment,formerMembers:guild.recruitment.formerMembers.filter((entry)=>entry.hero.id!==heroId)},
  };
}
