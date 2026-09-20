import { GAME_CONFIG } from "../../config/gameConfig";
import { RECRUITMENT_ARCHETYPES } from "../../data/recruitment/recruitmentBalance";
import { emptyPotionInventory } from "../alchemy/potionTypes";
import { emptyAttributes } from "../attributes/types";
import { createGuildArtisanState, emptyMaterialInventory } from "../crafting/craftingTypes";
import { migrateRogueliteRotationState } from "../dungeons/rogueliteRotationTypes";
import { createGuildFinanceState } from "../economy/economyTypes";
import type { GuildState, UiPreferences } from "../guild/types";
import { createGuildmasterProfile } from "../guildmaster/guildmasterProgression";
import { migrateHeroHistory } from "../heroes/heroHistoryService";
import { createHeroLoyaltyState } from "../heroes/heroLoyaltyService";
import { createContentEntitlements, createDailyLoginState } from "../monetization/contentUnlockService";
import { migrateGuildOperationState } from "../operations/guildOperationService";
import { clampPotential } from "../progression/potential";
import { getContractStatus } from "../recruitment/contractService";
import { createRecruitmentState } from "../recruitment/recruitmentService";
import { attributeEstimates, financialEstimate } from "../recruitment/scoutingService";
import { createRaidProgressState } from "../raids/raidService";
import { createTrainingGroundState } from "../training/trainingTypes";
import { createTutorialState } from "../onboarding/onboardingTypes";
import { createWorldState } from "../world/worldState";

const SETTLEMENT_FALLBACK: Record<string, string> = {
  greenveil: "guildhaven",
  iron_hills: "stonegate",
  frostmarch: "northwatch",
  ashlands: "emberfall",
  shadowfen: "blackwater",
};

type PersistedGuildShape = Partial<Omit<GuildState, "uiPreferences" | "tutorial">> & {
  heroes: GuildState["heroes"];
  uiPreferences?: Partial<UiPreferences>;
  tutorial?: Omit<GuildState["tutorial"], "step"> & { step: GuildState["tutorial"]["step"] | "compare_candidates" };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseGuildShape(value: unknown): PersistedGuildShape {
  if (!isRecord(value)) throw new Error("Save does not contain a guild object.");
  if (!Array.isArray(value.heroes)) throw new Error("Save is missing its hero roster.");
  if (value.guildName !== undefined && typeof value.guildName !== "string") throw new Error("Save has an invalid guild name.");
  if (value.currentDay !== undefined && (typeof value.currentDay !== "number" || !Number.isFinite(value.currentDay))) throw new Error("Save has an invalid current day.");
  return value as PersistedGuildShape;
}

function migrateGender(gender: string | undefined): "female" | "male" {
  return gender === "female" ? "female" : "male";
}

function migrateActiveDungeonRun(run: GuildState["activeDungeonRun"]): GuildState["activeDungeonRun"] {
  if (!run) return null;
  return {
    ...run,
    selectedBoonIds: run.selectedBoonIds ?? [],
    pendingBoonChoiceIds: run.pendingBoonChoiceIds ?? [],
  };
}

/**
 * Normalizes historical GuildState shapes into the current runtime model.
 * Serialized envelope migrations live in saveSchema.ts; field/default migrations
 * live here so persistence I/O stays small and future changes remain auditable.
 */
export function migrateGuildState(value: unknown): GuildState {
  const saved = parseGuildShape(value);
  const currentDay = saved.currentDay ?? GAME_CONFIG.startingDay;
  const heroes = saved.heroes;
  const recruitment = saved.recruitment ?? createRecruitmentState(currentDay);

  const candidates = (recruitment.candidates ?? []).map((candidate) => {
    const truePotential = clampPotential(candidate.truePotential);
    const radius = RECRUITMENT_ARCHETYPES[candidate.archetype].estimateRadius / 100;
    const fee = financialEstimate(candidate.recruitmentFee, radius);
    const salary = financialEstimate(candidate.weeklySalary, radius);
    const gender = migrateGender(candidate.heroPreview.gender);
    const portraitVariant = candidate.heroPreview.portraitVariant ?? 0;

    return {
      ...candidate,
      truePotential,
      source: candidate.source ?? "guild_board",
      sourceRaceId: candidate.sourceRaceId ?? null,
      sourceRegionId: candidate.sourceRegionId ?? null,
      sourceLocationName: candidate.sourceLocationName ?? null,
      potentialEstimateMin: clampPotential(candidate.potentialEstimateMin),
      potentialEstimateMax: clampPotential(candidate.potentialEstimateMax),
      attributeEstimates: candidate.attributeEstimates ?? attributeEstimates(candidate.heroPreview.baseAttributes, candidate.scoutingLevel ?? 0),
      recruitmentFeeEstimateMin: candidate.recruitmentFeeEstimateMin ?? fee.minimum,
      recruitmentFeeEstimateMax: candidate.recruitmentFeeEstimateMax ?? fee.maximum,
      weeklySalaryEstimateMin: candidate.weeklySalaryEstimateMin ?? salary.minimum,
      weeklySalaryEstimateMax: candidate.weeklySalaryEstimateMax ?? salary.maximum,
      heroPreview: {
        ...candidate.heroPreview,
        gender,
        portraitVariant,
        portraitKey: `${candidate.heroPreview.raceId}-${candidate.heroPreview.classId}-${gender}-v${portraitVariant}`,
        learnedSkillIds: candidate.heroPreview.learnedSkillIds ?? [],
        potential: truePotential,
        potentialEstimateMin: clampPotential(candidate.heroPreview.potentialEstimateMin),
        potentialEstimateMax: clampPotential(candidate.heroPreview.potentialEstimateMax),
        history: migrateHeroHistory(candidate.heroPreview.history, candidate.heroPreview.id, currentDay),
      },
    };
  });

  const artisanDefaults = createGuildArtisanState();
  const artisans = Object.fromEntries(
    (Object.keys(artisanDefaults) as (keyof typeof artisanDefaults)[]).map((id) => {
      const savedState = saved.artisans?.[id];
      return [id, savedState ? { ...savedState, construction: savedState.construction ?? null } : artisanDefaults[id]];
    }),
  ) as GuildState["artisans"];

  const financeDefaults = createGuildFinanceState();
  const world = {
    ...(saved.world ?? createWorldState()),
    currentSettlementId: saved.world?.currentSettlementId
      ?? SETTLEMENT_FALLBACK[saved.world?.currentRegionId ?? "greenveil"]
      ?? null,
  };
  const tutorial = saved.tutorial
    ? {
      ...createTutorialState(),
      ...saved.tutorial,
      // Older saves may be paused at the retired mandatory comparison step.
      step: saved.tutorial.step === "compare_candidates" ? "recruit_first" as const : saved.tutorial.step,
      inspectedCandidateId: saved.tutorial.inspectedCandidateId ?? null,
      inspectedCandidateTabs: saved.tutorial.inspectedCandidateTabs ?? [],
    }
    : { ...createTutorialState(), active: false, completed: true, step: "complete" as const };

  const heroLoyaltyByHeroId = Object.fromEntries(
    heroes.map((hero) => {
      const current = saved.heroLoyaltyByHeroId?.[hero.id];
      return [
        hero.id,
        current
          ? {
            score: Math.max(0, Math.min(100, Math.round(current.score ?? 60))),
            recentChanges: (current.recentChanges ?? []).slice(0, 6),
          }
          : createHeroLoyaltyState(),
      ];
    }),
  );

  const migratedHeroes = heroes.map((hero) => {
    const gender = migrateGender(hero.gender);
    const portraitVariant = hero.portraitVariant ?? 0;
    return {
      ...hero,
      gender,
      portraitVariant,
      portraitKey: `${hero.raceId}-${hero.classId}-${gender}-v${portraitVariant}`,
      learnedSkillIds: hero.learnedSkillIds ?? [],
      potential: clampPotential(hero.potential),
      potentialEstimateMin: clampPotential(hero.potentialEstimateMin),
      potentialEstimateMax: clampPotential(hero.potentialEstimateMax),
      subclassId: hero.subclassId ?? null,
      isAvailable: hero.isAvailable ?? true,
      adventureStamina: hero.adventureStamina ?? GAME_CONFIG.maxAdventureStamina,
      attributeGrowthProgress: hero.attributeGrowthProgress ?? emptyAttributes(),
      focusedTrainingLevel: hero.focusedTrainingLevel ?? hero.level,
      focusedTrainingSessions: hero.focusedTrainingLevel === hero.level ? hero.focusedTrainingSessions ?? 0 : 0,
      history: migrateHeroHistory(hero.history, hero.id, currentDay),
    };
  });

  const migratedRecruitment = {
    ...recruitment,
    batchRecruitmentUsed: recruitment.batchRecruitmentUsed ?? false,
  };

  return {
    ...(saved as GuildState),
    guildId: saved.guildId ?? "guild-player",
    guildName: saved.guildName ?? "The Wayfarers",
    currentDay,
    gold: saved.gold ?? GAME_CONFIG.startingGold,
    reputation: saved.reputation ?? GAME_CONFIG.startingReputation,
    inventory: saved.inventory ?? [],
    difficultyId: saved.difficultyId ?? "standard",
    guildmaster: saved.guildmaster ?? createGuildmasterProfile(),
    gems: saved.gems ?? GAME_CONFIG.startingGems,
    rations: saved.rations ?? GAME_CONFIG.startingRations,
    gemTransactions: saved.gemTransactions ?? [],
    viewedAdMilestoneDays: saved.viewedAdMilestoneDays ?? [],
    entitlements: saved.entitlements ?? createContentEntitlements(),
    dailyLogin: saved.dailyLogin ?? createDailyLoginState(),
    finance: {
      ...financeDefaults,
      ...(saved.finance ?? {}),
      salaryArrearsByHeroId: {
        ...financeDefaults.salaryArrearsByHeroId,
        ...(saved.finance?.salaryArrearsByHeroId ?? {}),
      },
      transactions: saved.finance?.transactions ?? [],
    },
    materials: { ...emptyMaterialInventory(), ...(saved.materials ?? {}) },
    potions: { ...emptyPotionInventory(), ...(saved.potions ?? {}) },
    artisans,
    trainingGround: {
      ...createTrainingGroundState(),
      ...(saved.trainingGround ?? {}),
      sessions: saved.trainingGround?.sessions ?? [],
      upgrade: saved.trainingGround?.upgrade ?? null,
    },
    gatheringMissions: saved.gatheringMissions ?? [],
    world,
    recentPartyHeroIds: saved.recentPartyHeroIds ?? [],
    partyPresets: (saved.partyPresets ?? []).slice(0, 3).map((preset, index) => ({
      id: preset.id ?? `squad-${index + 1}`,
      name: preset.name ?? `Squad ${index + 1}`,
      heroIds: (preset.heroIds ?? []).filter((id) => heroes.some((hero) => hero.id === id)),
    })),
    equipmentLoadoutsByHeroId: saved.equipmentLoadoutsByHeroId ?? {},
    uiPreferences: {
      reduceCombatEffects: false, reduceMotion: false, strongerCombatContrast: false, tactileFeedback: true, enemyTurnSpeed: "normal",
      confirmEndTurn: false,
      defaultCombatZoom: "fit",
      compactQuestCards: true,
      ...saved.uiPreferences,
    },
    discoveredEnemyIds: saved.discoveredEnemyIds ?? [],
    questChronicle: (saved.questChronicle ?? []).map((entry) => ({
      ...entry,
      relationshipChanges: entry.relationshipChanges ?? [],
    })),
    relationships: saved.relationships ?? [],
    heroLoyaltyByHeroId,
    heroContracts: (saved.heroContracts ?? []).map((contract) => ({
      ...contract,
      status: getContractStatus(contract, currentDay),
    })),
    huntRewardProgress: saved.huntRewardProgress ?? {},
    tutorial,
    rogueliteRotation: migrateRogueliteRotationState(saved.rogueliteRotation),
    guildOperations: migrateGuildOperationState(saved.guildOperations),
    raidProgress: saved.raidProgress ?? createRaidProgressState(),
    activeDungeonRun: migrateActiveDungeonRun(saved.activeDungeonRun ?? null),
    activeRogueliteRun: saved.activeRogueliteRun ?? null,
    recruitment: {
      ...migratedRecruitment,
      candidates,
      candidateIds: candidates.map((candidate) => candidate.candidateId),
      reservedCandidateId: recruitment.reservedCandidateId ?? null,
      reservationExpiresAtDay: recruitment.reservationExpiresAtDay ?? null,
      regionalScoutMission: recruitment.regionalScoutMission ?? null,
    },
    heroes: migratedHeroes,
  };
}
