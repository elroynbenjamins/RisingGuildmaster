import type { HeroLoyaltyState } from "../heroes/heroLoyaltyTypes";
import type { Hero } from "../heroes/types";
import type { WorldState } from "../world/worldTypes";
import type { HeroContract, RecruitmentState } from "../recruitment/recruitmentTypes";
import type { GemTransaction } from "../monetization/gemTypes";
import type { GuildArtisanState, MaterialInventory } from "../crafting/craftingTypes";
import type { GatheringMissionInstance } from "../gathering/gatheringTypes";
import type { GuildmasterProfile } from "../guildmaster/guildmasterTypes";
import type { RogueliteRunState } from "../roguelite/rogueliteTypes";
import type { GuildFinanceState } from "../economy/economyTypes";
import type { DungeonRunState } from "../dungeons/dungeonTypes";
import type { TrainingGroundState } from "../training/trainingTypes";
import type { TutorialState } from "../onboarding/onboardingTypes";
import type { RogueliteRotationState } from "../dungeons/rogueliteRotationTypes";
import type { PotionInventory } from "../alchemy/potionTypes";
import type { QuestChronicleEntry } from "../quests/questChronicleTypes";
import type { QuestResultSummary } from "../quests/questResultTypes";
import type { HeroRelationship } from "../relationships/relationshipTypes";
import type { GameDifficultyId } from "../difficulty/difficultyTypes";
import type { GuildOperationState } from "../operations/guildOperationTypes";
import type { GuildLegacyState } from "../renown/guildLegacyTypes";
import type { RaidProgressState } from "../raids/raidTypes";
import type { ContentEntitlements, DailyLoginState } from "../monetization/contentUnlockService";
import type { GuildCrestId } from "../../data/guild/guildCrests";
export interface HuntRewardProgress { victories: number; failuresSinceFragment: number }
export interface PartyPreset { id: string; name: string; heroIds: string[] }
export interface EquipmentLoadout { id: string; name: string; equipment: Hero["equipment"] }
export interface GuildProgressMetrics { craftedItemsCount: number }
export interface BountyProgressState { claimedOfferIds: string[] }
export interface UiPreferences { reduceCombatEffects:boolean; reduceMotion:boolean; strongerCombatContrast:boolean; tactileFeedback:boolean; confirmEndTurn:boolean; defaultCombatZoom:"fit"|"close"; compactQuestCards:boolean; enemyTurnSpeed:"normal"|"fast"|"very_fast"; themeId?:"guild_dark"|"oled_dark"|"high_contrast" }
export interface GuildState { heroLoyaltyByHeroId: Record<string, HeroLoyaltyState>; saveVersion: number; achievementClaims: string[]; seenUnlockSummaryIds: string[]; metrics: GuildProgressMetrics; bountyProgress: BountyProgressState; guildId: string; guildName: string; guildCrestId: GuildCrestId; difficultyId: GameDifficultyId; guildmaster: GuildmasterProfile; legacy?: GuildLegacyState; gold: number; gems: number; rations: number; gemTransactions: GemTransaction[]; viewedAdMilestoneDays: number[]; entitlements: ContentEntitlements; dailyLogin: DailyLoginState; lastFreeReviveDate: string | null; finance: GuildFinanceState; reputation: number; heroes: Hero[]; inventory: string[]; materials: MaterialInventory; potions: PotionInventory; artisans: GuildArtisanState; trainingGround: TrainingGroundState; gatheringMissions: GatheringMissionInstance[]; currentDay: number; world: WorldState; recentPartyHeroIds: string[]; partyPresets: PartyPreset[]; equipmentLoadoutsByHeroId: Record<string,EquipmentLoadout[]>; uiPreferences:UiPreferences; discoveredEnemyIds: string[]; questChronicle: QuestChronicleEntry[]; relationships: HeroRelationship[]; recruitment: RecruitmentState; heroContracts: HeroContract[]; huntRewardProgress: Record<string, HuntRewardProgress>; tutorial: TutorialState; rogueliteRotation: RogueliteRotationState; guildOperations: GuildOperationState; raidProgress?: RaidProgressState; unlockedRecipeIds?: string[]; activeRogueliteRun?: RogueliteRunState | null; activeDungeonRun?: DungeonRunState | null; pendingQuestResult?: QuestResultSummary | null }
