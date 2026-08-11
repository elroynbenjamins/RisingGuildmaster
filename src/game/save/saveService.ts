import AsyncStorage from "@react-native-async-storage/async-storage";
import { RECRUITMENT_ARCHETYPES } from "../../data/recruitment/recruitmentBalance";
import { emptyAttributes } from "../attributes/types";
import type { GuildState } from "../guild/types";
import { getContractStatus } from "../recruitment/contractService";
import { createRecruitmentState } from "../recruitment/recruitmentService";
import { financialEstimate } from "../recruitment/scoutingService";
import { clampPotential } from "../progression/potential";
import { createWorldState } from "../world/worldState";
import { GAME_CONFIG } from "../../config/gameConfig";
import { createGuildArtisanState, emptyMaterialInventory } from "../crafting/craftingTypes";
import { createGuildmasterProfile } from "../guildmaster/guildmasterProgression";
import { createGuildFinanceState } from "../economy/economyTypes";
import { createTrainingGroundState } from "../training/trainingTypes";
const SAVE_KEY = "guildmaster.guild.v1";
export function serializeGuild(guild: GuildState): string { return JSON.stringify(guild); }
export function deserializeGuild(value: string): GuildState {
  const saved = JSON.parse(value) as GuildState; const recruitment = saved.recruitment ?? createRecruitmentState(saved.currentDay ?? 1); const currentDay = saved.currentDay ?? 1;
  const candidates = (recruitment.candidates ?? []).map((candidate) => { const truePotential = clampPotential(candidate.truePotential); const radius = RECRUITMENT_ARCHETYPES[candidate.archetype].estimateRadius / 100; const fee = financialEstimate(candidate.recruitmentFee, radius); const salary = financialEstimate(candidate.weeklySalary, radius); return { ...candidate, truePotential, source: candidate.source ?? "guild_board", sourceRaceId: candidate.sourceRaceId ?? null, sourceRegionId: candidate.sourceRegionId ?? null, sourceLocationName: candidate.sourceLocationName ?? null, potentialEstimateMin: clampPotential(candidate.potentialEstimateMin), potentialEstimateMax: clampPotential(candidate.potentialEstimateMax), recruitmentFeeEstimateMin: candidate.recruitmentFeeEstimateMin ?? fee.minimum, recruitmentFeeEstimateMax: candidate.recruitmentFeeEstimateMax ?? fee.maximum, weeklySalaryEstimateMin: candidate.weeklySalaryEstimateMin ?? salary.minimum, weeklySalaryEstimateMax: candidate.weeklySalaryEstimateMax ?? salary.maximum, heroPreview: { ...candidate.heroPreview, learnedSkillIds: candidate.heroPreview.learnedSkillIds ?? [], potential: truePotential, potentialEstimateMin: clampPotential(candidate.heroPreview.potentialEstimateMin), potentialEstimateMax: clampPotential(candidate.heroPreview.potentialEstimateMax) } }; });
  const artisanDefaults = createGuildArtisanState();
  const artisans = Object.fromEntries((Object.keys(artisanDefaults) as (keyof typeof artisanDefaults)[]).map((id) => {
    const savedState = saved.artisans?.[id];
    return [id, savedState ? { ...savedState, construction: savedState.construction ?? null } : artisanDefaults[id]];
  })) as GuildState["artisans"];
  const financeDefaults = createGuildFinanceState();
  return { ...saved, guildmaster: saved.guildmaster ?? createGuildmasterProfile(), gems: saved.gems ?? GAME_CONFIG.startingGems, gemTransactions: saved.gemTransactions ?? [], finance: { ...financeDefaults, ...(saved.finance ?? {}), salaryArrearsByHeroId: { ...financeDefaults.salaryArrearsByHeroId, ...(saved.finance?.salaryArrearsByHeroId ?? {}) }, transactions: saved.finance?.transactions ?? [] }, materials: { ...emptyMaterialInventory(), ...(saved.materials ?? {}) }, artisans, trainingGround: { ...createTrainingGroundState(), ...(saved.trainingGround ?? {}), sessions: saved.trainingGround?.sessions ?? [], upgrade: saved.trainingGround?.upgrade ?? null }, gatheringMissions: saved.gatheringMissions ?? [], world: saved.world ?? createWorldState(), recentPartyHeroIds: saved.recentPartyHeroIds ?? [], discoveredEnemyIds: saved.discoveredEnemyIds ?? [], heroContracts: (saved.heroContracts ?? []).map((contract) => ({ ...contract, status: getContractStatus(contract, currentDay) })), huntRewardProgress: saved.huntRewardProgress ?? {}, activeDungeonRun: saved.activeDungeonRun ?? null, activeRogueliteRun: saved.activeRogueliteRun ?? null, recruitment: { ...recruitment, candidates, candidateIds: candidates.map((candidate) => candidate.candidateId), reservedCandidateId: recruitment.reservedCandidateId ?? null, reservationExpiresAtDay: recruitment.reservationExpiresAtDay ?? null, regionalScoutMission: recruitment.regionalScoutMission ?? null }, heroes: saved.heroes.map((hero) => ({ ...hero, learnedSkillIds: hero.learnedSkillIds ?? [], potential: clampPotential(hero.potential), potentialEstimateMin: clampPotential(hero.potentialEstimateMin), potentialEstimateMax: clampPotential(hero.potentialEstimateMax), subclassId: hero.subclassId ?? null, isAvailable: hero.isAvailable ?? true, attributeGrowthProgress: hero.attributeGrowthProgress ?? emptyAttributes(), focusedTrainingLevel: hero.focusedTrainingLevel ?? hero.level, focusedTrainingSessions: hero.focusedTrainingLevel === hero.level ? hero.focusedTrainingSessions ?? 0 : 0 })) };
}
export async function saveGuild(guild: GuildState): Promise<void> { await AsyncStorage.setItem(SAVE_KEY, serializeGuild(guild)); }
export async function loadGuild(): Promise<GuildState | null> { const value = await AsyncStorage.getItem(SAVE_KEY); return value ? deserializeGuild(value) : null; }
