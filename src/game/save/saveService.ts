import AsyncStorage from "@react-native-async-storage/async-storage";
import { RECRUITMENT_ARCHETYPES } from "../../data/recruitment/recruitmentBalance";
import { emptyAttributes } from "../attributes/types";
import type { GuildState,UiPreferences } from "../guild/types";
import { getContractStatus } from "../recruitment/contractService";
import { createRecruitmentState } from "../recruitment/recruitmentService";
import { attributeEstimates, financialEstimate } from "../recruitment/scoutingService";
import { clampPotential } from "../progression/potential";
import { createWorldState } from "../world/worldState";
import { GAME_CONFIG } from "../../config/gameConfig";
import { createGuildArtisanState, emptyMaterialInventory } from "../crafting/craftingTypes";
import { createGuildmasterProfile } from "../guildmaster/guildmasterProgression";
import { createGuildFinanceState } from "../economy/economyTypes";
import { createTrainingGroundState } from "../training/trainingTypes";
import { createTutorialState } from "../onboarding/onboardingTypes";
import { migrateRogueliteRotationState } from "../dungeons/rogueliteRotationTypes";
import { emptyPotionInventory } from "../alchemy/potionTypes";
import { migrateHeroHistory } from "../heroes/heroHistoryService";
import { migrateGuildOperationState } from "../operations/guildOperationService";
import { applyContentEntitlements, applyStoryRaceUnlocks, createContentEntitlements, createDailyLoginState } from "../monetization/contentUnlockService";
import { loadAccountContentEntitlements, saveAccountContentEntitlements } from "../monetization/accountEntitlementService";
import { createRaidProgressState } from "../raids/raidService";
import type { TutorialState } from "../onboarding/onboardingTypes";
import { CURRENT_SAVE_VERSION } from "./saveVersion";
const SAVE_KEY = "guildmaster.guild.v1";
const BACKUP_SAVE_KEY = "guildmaster.guild.v1.backup";
const SETTLEMENT_FALLBACK: Record<string, string> = { greenveil: "guildhaven", iron_hills: "stonegate", frostmarch: "northwatch", ashlands: "emberfall", shadowfen: "blackwater" };
type PersistedGuild = Omit<GuildState, "saveVersion" | "uiPreferences" | "tutorial"> & {
  saveVersion?: number;
  uiPreferences?: Partial<UiPreferences>;
  tutorial?: Partial<TutorialState>;
};
function migrateV1ToV2(saved: PersistedGuild): PersistedGuild {
  return {
    ...saved,
    saveVersion: 2,
    tutorial: { ...(saved.tutorial ?? {}), contextualSeen: saved.tutorial?.contextualSeen ?? {} },
  };
}
function migrateSaveVersions(saved: PersistedGuild): PersistedGuild {
  let current = saved;
  let version = saved.saveVersion ?? 1;
  if (version > CURRENT_SAVE_VERSION) throw new Error(`Save version ${version} is newer than this build supports (${CURRENT_SAVE_VERSION}).`);
  while (version < CURRENT_SAVE_VERSION) {
    if (version === 1) { current = migrateV1ToV2(current); version = 2; continue; }
    throw new Error(`No migration path from save version ${version}.`);
  }
  return { ...current, saveVersion: CURRENT_SAVE_VERSION };
}
function migrateGender(gender: string | undefined): "female" | "male" {
  return gender === "female" ? "female" : "male";
}
export function serializeGuild(guild: GuildState): string { return JSON.stringify({ ...guild, saveVersion: CURRENT_SAVE_VERSION }); }
function deserializeGuildData(value: string): GuildState {
  const saved = migrateSaveVersions(JSON.parse(value) as PersistedGuild); const recruitment = saved.recruitment ?? createRecruitmentState(saved.currentDay ?? 1); const currentDay = saved.currentDay ?? 1;
  const candidates = (recruitment.candidates ?? []).map((candidate) => { const truePotential = clampPotential(candidate.truePotential); const radius = RECRUITMENT_ARCHETYPES[candidate.archetype].estimateRadius / 100; const fee = financialEstimate(candidate.recruitmentFee, radius); const salary = financialEstimate(candidate.weeklySalary, radius); const gender = migrateGender(candidate.heroPreview.gender); const portraitVariant = candidate.heroPreview.portraitVariant ?? 0; return { ...candidate, truePotential, source: candidate.source ?? "guild_board", sourceRaceId: candidate.sourceRaceId ?? null, sourceRegionId: candidate.sourceRegionId ?? null, sourceLocationName: candidate.sourceLocationName ?? null, potentialEstimateMin: clampPotential(candidate.potentialEstimateMin), potentialEstimateMax: clampPotential(candidate.potentialEstimateMax), attributeEstimates: candidate.attributeEstimates ?? attributeEstimates(candidate.heroPreview.baseAttributes, candidate.scoutingLevel ?? 0), recruitmentFeeEstimateMin: candidate.recruitmentFeeEstimateMin ?? fee.minimum, recruitmentFeeEstimateMax: candidate.recruitmentFeeEstimateMax ?? fee.maximum, weeklySalaryEstimateMin: candidate.weeklySalaryEstimateMin ?? salary.minimum, weeklySalaryEstimateMax: candidate.weeklySalaryEstimateMax ?? salary.maximum, heroPreview: { ...candidate.heroPreview, gender, portraitVariant, portraitKey: `${candidate.heroPreview.raceId}-${candidate.heroPreview.classId}-${gender}-v${portraitVariant}`, learnedSkillIds: candidate.heroPreview.learnedSkillIds ?? [], potential: truePotential, potentialEstimateMin: clampPotential(candidate.heroPreview.potentialEstimateMin), potentialEstimateMax: clampPotential(candidate.heroPreview.potentialEstimateMax), history: migrateHeroHistory(candidate.heroPreview.history, candidate.heroPreview.id, currentDay) } }; });
  const artisanDefaults = createGuildArtisanState();
  const artisans = Object.fromEntries((Object.keys(artisanDefaults) as (keyof typeof artisanDefaults)[]).map((id) => {
    const savedState = saved.artisans?.[id];
    return [id, savedState ? { ...savedState, construction: savedState.construction ?? null } : artisanDefaults[id]];
  })) as GuildState["artisans"];
  const financeDefaults = createGuildFinanceState();
  const tutorialDefaults = createTutorialState();
  saved.questChronicle = (saved.questChronicle ?? []).map((entry) => ({ ...entry, relationshipChanges: entry.relationshipChanges ?? [] }));
  saved.relationships = saved.relationships ?? [];
  saved.difficultyId = saved.difficultyId ?? "standard";
  saved.rations = saved.rations ?? GAME_CONFIG.startingRations;
  saved.entitlements = saved.entitlements ?? createContentEntitlements();
  saved.dailyLogin = saved.dailyLogin ?? createDailyLoginState();
  saved.viewedAdMilestoneDays = saved.viewedAdMilestoneDays ?? [];
  saved.raidProgress = saved.raidProgress ?? createRaidProgressState();
  saved.world = { ...(saved.world ?? createWorldState()), currentSettlementId: saved.world?.currentSettlementId ?? SETTLEMENT_FALLBACK[saved.world?.currentRegionId ?? "greenveil"] ?? null };
  return { ...saved, saveVersion: CURRENT_SAVE_VERSION, guildmaster: saved.guildmaster ?? createGuildmasterProfile(), gems: saved.gems ?? GAME_CONFIG.startingGems, gemTransactions: saved.gemTransactions ?? [], finance: { ...financeDefaults, ...(saved.finance ?? {}), salaryArrearsByHeroId: { ...financeDefaults.salaryArrearsByHeroId, ...(saved.finance?.salaryArrearsByHeroId ?? {}) }, transactions: saved.finance?.transactions ?? [] }, materials: { ...emptyMaterialInventory(), ...(saved.materials ?? {}) }, potions: { ...emptyPotionInventory(), ...(saved.potions ?? {}) }, artisans, trainingGround: { ...createTrainingGroundState(), ...(saved.trainingGround ?? {}), sessions: saved.trainingGround?.sessions ?? [], upgrade: saved.trainingGround?.upgrade ?? null }, gatheringMissions: saved.gatheringMissions ?? [], world: saved.world ?? createWorldState(), recentPartyHeroIds: saved.recentPartyHeroIds ?? [], partyPresets: (saved.partyPresets ?? []).slice(0,3).map((preset,index)=>({id:preset.id??`squad-${index+1}`,name:preset.name??`Squad ${index+1}`,heroIds:(preset.heroIds??[]).filter((id)=>saved.heroes.some((hero)=>hero.id===id))})), equipmentLoadoutsByHeroId:saved.equipmentLoadoutsByHeroId??{},uiPreferences:{reduceCombatEffects:false,reduceMotion:false,strongerCombatContrast:false,largeText:false,tactileFeedback:true,confirmEndTurn:false,defaultCombatZoom:"fit",compactQuestCards:true,enemyTurnSpeed:"normal",...saved.uiPreferences}, discoveredEnemyIds: saved.discoveredEnemyIds ?? [], heroContracts: (saved.heroContracts ?? []).map((contract) => ({ ...contract, status: getContractStatus(contract, currentDay) })), huntRewardProgress: saved.huntRewardProgress ?? {}, tutorial: saved.tutorial ? { ...tutorialDefaults, ...saved.tutorial, contextualSeen: saved.tutorial.contextualSeen ?? {} } : { ...tutorialDefaults, active: false, completed: true, step: "complete" }, rogueliteRotation: migrateRogueliteRotationState(saved.rogueliteRotation), guildOperations: migrateGuildOperationState(saved.guildOperations), activeDungeonRun: saved.activeDungeonRun ?? null, activeRogueliteRun: saved.activeRogueliteRun ?? null, recruitment: { ...recruitment, candidates, candidateIds: candidates.map((candidate) => candidate.candidateId), reservedCandidateId: recruitment.reservedCandidateId ?? null, reservationExpiresAtDay: recruitment.reservationExpiresAtDay ?? null, regionalScoutMission: recruitment.regionalScoutMission ?? null }, heroes: saved.heroes.map((hero) => { const gender = migrateGender(hero.gender); const portraitVariant = hero.portraitVariant ?? 0; return { ...hero, gender, portraitVariant, portraitKey: `${hero.raceId}-${hero.classId}-${gender}-v${portraitVariant}`, learnedSkillIds: hero.learnedSkillIds ?? [], potential: clampPotential(hero.potential), potentialEstimateMin: clampPotential(hero.potentialEstimateMin), potentialEstimateMax: clampPotential(hero.potentialEstimateMax), subclassId: hero.subclassId ?? null, isAvailable: hero.isAvailable ?? true, adventureStamina: hero.adventureStamina ?? GAME_CONFIG.maxAdventureStamina, attributeGrowthProgress: hero.attributeGrowthProgress ?? emptyAttributes(), focusedTrainingLevel: hero.focusedTrainingLevel ?? hero.level, focusedTrainingSessions: hero.focusedTrainingLevel === hero.level ? hero.focusedTrainingSessions ?? 0 : 0, history: migrateHeroHistory(hero.history, hero.id, currentDay) }; }) };
}
export function deserializeGuild(value: string): GuildState { return applyStoryRaceUnlocks(deserializeGuildData(value)); }
/** Keeps the last valid snapshot before replacing the active autosave. */
export async function saveGuild(guild: GuildState): Promise<void> {
  const entitlementAwareGuild=applyStoryRaceUnlocks(guild);
  await saveAccountContentEntitlements(entitlementAwareGuild.entitlements);
  const next=serializeGuild(entitlementAwareGuild); deserializeGuild(next);
  const current=await AsyncStorage.getItem(SAVE_KEY);
  if(current){try{deserializeGuild(current);await AsyncStorage.setItem(BACKUP_SAVE_KEY,current);}catch{/* Never preserve a corrupt primary over a known backup. */}}
  await AsyncStorage.setItem(SAVE_KEY,next);
}
/** Recovers transparently from an interrupted or corrupt primary write. */
export async function loadGuild(): Promise<GuildState | null> {
  const accountEntitlements=await loadAccountContentEntitlements();
  const primary=await AsyncStorage.getItem(SAVE_KEY);
  if(primary){try{const loaded=applyContentEntitlements(deserializeGuild(primary),accountEntitlements);await saveAccountContentEntitlements(loaded.entitlements);return loaded;}catch{/* Attempt the recovery snapshot below. */}}
  const backup=await AsyncStorage.getItem(BACKUP_SAVE_KEY);
  if(!backup)return null;
  const recovered=applyContentEntitlements(deserializeGuild(backup),accountEntitlements);
  await saveAccountContentEntitlements(recovered.entitlements);
  await AsyncStorage.setItem(SAVE_KEY,serializeGuild(recovered));
  return recovered;
}
export async function deleteGuildSave(): Promise<void> { await AsyncStorage.multiRemove([SAVE_KEY,BACKUP_SAVE_KEY]); }
