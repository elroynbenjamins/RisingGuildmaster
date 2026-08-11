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
export interface HuntRewardProgress { victories: number; failuresSinceFragment: number }
export interface GuildState { guildId: string; guildName: string; guildmaster: GuildmasterProfile; gold: number; gems: number; gemTransactions: GemTransaction[]; finance: GuildFinanceState; reputation: number; heroes: Hero[]; inventory: string[]; materials: MaterialInventory; artisans: GuildArtisanState; trainingGround: TrainingGroundState; gatheringMissions: GatheringMissionInstance[]; currentDay: number; world: WorldState; recentPartyHeroIds: string[]; discoveredEnemyIds: string[]; recruitment: RecruitmentState; heroContracts: HeroContract[]; huntRewardProgress: Record<string, HuntRewardProgress>; unlockedRecipeIds?: string[]; activeRogueliteRun?: RogueliteRunState | null; activeDungeonRun?: DungeonRunState | null }
