import { UnsupportedSaveSchemaError } from "./saveSchema";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RECRUITMENT_ARCHETYPES } from "../../data/recruitment/recruitmentBalance";
import { emptyAttributes } from "../attributes/types";
import type { GuildState,UiPreferences } from "../guild/types";
import { getContractStatus } from "../recruitment/contractService";
import { createRecruitmentState } from "../recruitment/recruitmentService";
import { attributeEstimates, financialEstimate } from "../recruitment/scoutingService";
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
const LEGACY_SAVE_KEY = "guildmaster.guild.v1";
const LEGACY_BACKUP_SAVE_KEY = "guildmaster.guild.v1.backup";
export type SaveSlotId = 1 | 2;
export interface SaveSlotSummary {
  slotId: SaveSlotId;
  exists: boolean;
  guildName?: string;
  guildCrestId?: GuildState["guildCrestId"];
  currentDay?: number;
  difficultyId?: GuildState["difficultyId"];
  heroCount?: number;
  lastPlayedAt?: string;
}
const SAVE_SLOT_IDS: SaveSlotId[] = [1, 2];
const saveKey = (slotId: SaveSlotId) => `guildmaster.guild.slot.${slotId}.v2`;
const backupKey = (slotId: SaveSlotId) => `${saveKey(slotId)}.backup`;
const metaKey = (slotId: SaveSlotId) => `${saveKey(slotId)}.meta`;
const SETTLEMENT_FALLBACK: Record<string, string> = { greenveil: "guildhaven", iron_hills: "stonegate", frostmarch: "northwatch", ashlands: "emberfall", shadowfen: "blackwater" };
type PersistedGuild = Omit<GuildState, "saveVersion" | "uiPreferences" | "tutorial" | "achievementClaims" | "seenUnlockSummaryIds" | "metrics" | "bountyProgress" | "guildCrestId"> & {
  saveVersion?: number;
  uiPreferences?: Partial<UiPreferences>;
  tutorial?: Partial<TutorialState>;
  achievementClaims?: string[];
  seenUnlockSummaryIds?: string[];
  metrics?: Partial<GuildState["metrics"]>;
  bountyProgress?: Partial<GuildState["bountyProgress"]>;
  guildCrestId?: GuildState["guildCrestId"];
};
function migrateV1ToV2(saved: PersistedGuild): PersistedGuild {
  return {
    ...saved,
    saveVersion: 2,
    tutorial: { ...(saved.tutorial ?? {}), contextualSeen: saved.tutorial?.contextualSeen ?? {} },
  };
}
function migrateV2ToV3(saved: PersistedGuild): PersistedGuild {
  const seenUnlockSummaryIds = [
    ...(saved.world?.unlockedRegionIds ?? []).map((id) => `region:${id}`),
    ...(saved.entitlements?.unlockedClassIds ?? []).map((id) => `class:${id}`),
    ...(saved.entitlements?.unlockedRaceIds ?? []).map((id) => `race:${id}`),
    ...(saved.unlockedRecipeIds ?? []).map((id) => `recipe:${id}`),
    ...Object.entries(saved.artisans ?? {}).flatMap(([id,state]) => state?.recruited && state.level > 0 ? [`workshop:${id}:${state.level}`] : []),
    ...(saved.world?.completedCampaignNodeIds?.includes("broken_wardstone") ? ["system:operations"] : []),
    ...(saved.world?.completedCampaignNodeIds?.includes("broken_wardstone") && (saved.heroes?.length ?? 0) >= 6 ? ["system:roguelite"] : []),
  ];
  return {
    ...saved,
    saveVersion: 3,
    achievementClaims: saved.achievementClaims ?? [],
    seenUnlockSummaryIds: saved.seenUnlockSummaryIds ?? seenUnlockSummaryIds,
    metrics: { craftedItemsCount: saved.metrics?.craftedItemsCount ?? 0 },
  };
}
function migrateV3ToV4(saved: PersistedGuild): PersistedGuild {
  return {
    ...saved,
    saveVersion: 4,
    guildCrestId: saved.guildCrestId ?? "crownroad",
    bountyProgress: { claimedOfferIds: saved.bountyProgress?.claimedOfferIds ?? [] },
    heroContracts: (saved.heroContracts ?? []).map((contract) => ({ ...contract, renewalIntent: contract.renewalIntent ?? "undecided" })),
    finance: saved.finance ? { ...saved.finance, tavernUpgrade: saved.finance.tavernUpgrade ?? null } : saved.finance,
  };
}
function migrateV4ToV5(saved: PersistedGuild): PersistedGuild {
  return {
    ...saved,
    saveVersion: 5,
    recruitment: saved.recruitment ? { ...saved.recruitment, formerMembers: saved.recruitment.formerMembers ?? [] } : saved.recruitment,
  };
}
function migrateV5ToV6(saved: PersistedGuild): PersistedGuild {
  return {
    ...saved,
    saveVersion: 6,
    recruitment: saved.recruitment ? {
      ...saved.recruitment,
      formerMembers: (saved.recruitment.formerMembers ?? []).map((member) => ({ ...member, departureKind: member.departureKind ?? "contract_end" })),
    } : saved.recruitment,
  };
}
function migrateSaveVersions(saved: PersistedGuild): PersistedGuild {
  let current = saved;
  let version = saved.saveVersion ?? 1;
  if (version > CURRENT_SAVE_VERSION) throw new UnsupportedSaveSchemaError(version, CURRENT_SAVE_VERSION);
  while (version < CURRENT_SAVE_VERSION) {
    if (version === 1) { current = migrateV1ToV2(current); version = 2; continue; }
    if (version === 2) { current = migrateV2ToV3(current); version = 3; continue; }
    if (version === 3) { current = migrateV3ToV4(current); version = 4; continue; }
    if (version === 4) { current = migrateV4ToV5(current); version = 5; continue; }
    if (version === 5) { current = migrateV5ToV6(current); version = 6; continue; }
    throw new Error(`No migration path from save version ${version}.`);
  }
  return { ...current, saveVersion: CURRENT_SAVE_VERSION };
}
function migrateGender(gender: string | undefined): "female" | "male" {
  return gender === "female" ? "female" : "male";
}
function stripLegacyPotential<T>(value: T): T {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return value;
  const copy = { ...(value as Record<string, unknown>) };
  delete copy.potential;
  delete copy.potentialEstimateMin;
  delete copy.potentialEstimateMax;
  delete copy.truePotential;
  return copy as T;
}
export function serializeGuild(guild: GuildState): string { return JSON.stringify({ ...guild, saveVersion: CURRENT_SAVE_VERSION }); }
function deserializeGuildData(value: string): GuildState {
  const saved = migrateSaveVersions(JSON.parse(value) as PersistedGuild); const recruitment = saved.recruitment ?? createRecruitmentState(saved.currentDay ?? 1); const currentDay = saved.currentDay ?? 1;
  const candidates = (recruitment.candidates ?? []).map((candidate) => { const radius = RECRUITMENT_ARCHETYPES[candidate.archetype].estimateRadius / 100; const fee = financialEstimate(candidate.recruitmentFee, radius); const salary = financialEstimate(candidate.weeklySalary, radius); const gender = migrateGender(candidate.heroPreview.gender); const portraitVariant = candidate.heroPreview.portraitVariant ?? 0; const heroPreview = stripLegacyPotential(candidate.heroPreview); return { ...stripLegacyPotential(candidate), source: candidate.source ?? "guild_board", sourceRaceId: candidate.sourceRaceId ?? null, sourceRegionId: candidate.sourceRegionId ?? null, sourceLocationName: candidate.sourceLocationName ?? null, attributeEstimates: candidate.attributeEstimates ?? attributeEstimates(candidate.heroPreview.baseAttributes, candidate.scoutingLevel ?? 0), recruitmentFeeEstimateMin: candidate.recruitmentFeeEstimateMin ?? fee.minimum, recruitmentFeeEstimateMax: candidate.recruitmentFeeEstimateMax ?? fee.maximum, weeklySalaryEstimateMin: candidate.weeklySalaryEstimateMin ?? salary.minimum, weeklySalaryEstimateMax: candidate.weeklySalaryEstimateMax ?? salary.maximum, heroPreview: { ...heroPreview, gender, portraitVariant, portraitKey: `${candidate.heroPreview.raceId}-${candidate.heroPreview.classId}-${gender}-v${portraitVariant}`, learnedSkillIds: candidate.heroPreview.learnedSkillIds ?? [], history: migrateHeroHistory(candidate.heroPreview.history, candidate.heroPreview.id, currentDay) } }; });
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
  return { ...saved, saveVersion: CURRENT_SAVE_VERSION, achievementClaims: saved.achievementClaims ?? [], seenUnlockSummaryIds: saved.seenUnlockSummaryIds ?? [], metrics: { craftedItemsCount: saved.metrics?.craftedItemsCount ?? 0 }, bountyProgress: { claimedOfferIds: saved.bountyProgress?.claimedOfferIds ?? [] }, guildCrestId: saved.guildCrestId ?? "crownroad", guildmaster: saved.guildmaster ?? createGuildmasterProfile(), gems: saved.gems ?? GAME_CONFIG.startingGems, gemTransactions: saved.gemTransactions ?? [], finance: { ...financeDefaults, ...(saved.finance ?? {}), tavernUpgrade: saved.finance?.tavernUpgrade ?? null, salaryArrearsByHeroId: { ...financeDefaults.salaryArrearsByHeroId, ...(saved.finance?.salaryArrearsByHeroId ?? {}) }, transactions: saved.finance?.transactions ?? [] }, materials: { ...emptyMaterialInventory(), ...(saved.materials ?? {}) }, potions: { ...emptyPotionInventory(), ...(saved.potions ?? {}) }, artisans, trainingGround: { ...createTrainingGroundState(), ...(saved.trainingGround ?? {}), sessions: saved.trainingGround?.sessions ?? [], upgrade: saved.trainingGround?.upgrade ?? null }, gatheringMissions: saved.gatheringMissions ?? [], world: saved.world ?? createWorldState(), recentPartyHeroIds: saved.recentPartyHeroIds ?? [], partyPresets: (saved.partyPresets ?? []).slice(0,3).map((preset,index)=>({id:preset.id??`squad-${index+1}`,name:preset.name??`Squad ${index+1}`,heroIds:(preset.heroIds??[]).filter((id)=>saved.heroes.some((hero)=>hero.id===id))})), equipmentLoadoutsByHeroId:saved.equipmentLoadoutsByHeroId??{},uiPreferences:{reduceCombatEffects:false,reduceMotion:false,strongerCombatContrast:false,tactileFeedback:true,confirmEndTurn:false,defaultCombatZoom:"fit",compactQuestCards:true,enemyTurnSpeed:"normal",...saved.uiPreferences}, discoveredEnemyIds: saved.discoveredEnemyIds ?? [], heroContracts: (saved.heroContracts ?? []).map((contract) => ({ ...contract, renewalIntent: contract.renewalIntent ?? "undecided", status: getContractStatus(contract, currentDay) })), huntRewardProgress: saved.huntRewardProgress ?? {}, tutorial: saved.tutorial ? { ...tutorialDefaults, ...saved.tutorial, contextualSeen: saved.tutorial.contextualSeen ?? {} } : { ...tutorialDefaults, active: false, completed: true, step: "complete" }, rogueliteRotation: migrateRogueliteRotationState(saved.rogueliteRotation), guildOperations: migrateGuildOperationState(saved.guildOperations), activeDungeonRun: saved.activeDungeonRun ?? null, activeRogueliteRun: saved.activeRogueliteRun ?? null, recruitment: { ...recruitment, candidates, candidateIds: candidates.map((candidate) => candidate.candidateId), reservedCandidateId: recruitment.reservedCandidateId ?? null, reservationExpiresAtDay: recruitment.reservationExpiresAtDay ?? null, regionalScoutMission: recruitment.regionalScoutMission ?? null, formerMembers: (recruitment.formerMembers ?? []).map((member) => ({ ...member, departureKind: member.departureKind ?? "contract_end" })) }, heroes: saved.heroes.map((hero) => { const gender = migrateGender(hero.gender); const portraitVariant = hero.portraitVariant ?? 0; return { ...stripLegacyPotential(hero), gender, portraitVariant, portraitKey: `${hero.raceId}-${hero.classId}-${gender}-v${portraitVariant}`, learnedSkillIds: hero.learnedSkillIds ?? [], subclassId: hero.subclassId ?? null, isAvailable: hero.isAvailable ?? true, adventureStamina: hero.adventureStamina ?? GAME_CONFIG.maxAdventureStamina, attributeGrowthProgress: hero.attributeGrowthProgress ?? emptyAttributes(), history: migrateHeroHistory(hero.history, hero.id, currentDay) }; }) };
}
export function deserializeGuild(value: string): GuildState { return applyStoryRaceUnlocks(deserializeGuildData(value)); }
