export type QuestType = "campaign" | "side" | "contract" | "boss";
export interface HuntRewardDefinition { recipeFragmentMaterialId: MaterialId; firstVictoryCount: number; repeatDropChance: number; pityAfterFailures: number }
export interface QuestStoryContext {
  patron: string;
  guildReason: string;
  immediateGoal: string;
  campaignConnection: string;
}
export interface PersonalHeroRequirement { raceIds?: string[]; classIds?: string[]; backgroundIds?: string[]; minimumLevel?: number }
export interface QuestDefinition { id: string; name: string; description?: string; storyContext?: QuestStoryContext; personalHeroRequirement?: PersonalHeroRequirement; questType: QuestType; regionId: string; settlementIds?: string[]; repeatable: boolean; hiddenFromQuestBoard?: boolean; difficulty: number; recommendedLevelMin?: number; recommendedLevelMax?: number; minimumPartyAverageLevel?: number; preparationNotes?: string[]; betweenEncounterHealthRecoveryRatio?: number; minPartySize: number; maxPartySize: number; explorationStageIds?: string[]; decisionStageIds?: string[]; encounterIds: string[]; goldRewardMin: number; goldRewardMax: number; xpRewardPerHero: number; lootTableId: string; huntReward?: HuntRewardDefinition; recipeUnlockIdsOnVictory?: string[]; storyArcId?: string; campaignChapter?: number; prerequisiteQuestIds?: string[]; prerequisiteCampaignNodeIds?: string[]; requiredWorldFlags?: string[]; setWorldFlagsOnVictory?: Record<string, boolean> }
import type { GridPosition } from "../combat/grid/gridTypes";

export interface EncounterEnemyGroup {
  enemyDefinitionId: string;
  count: number;
  level: number;
  /** Encounter-specific multiplier for elite guards and bosses. 1.15 means +15%. */
  difficultyMultiplier?: number;
  spawnPositions: GridPosition[];
}

export type EncounterObjectiveDefinition =
  | { type: "eliminate_all"; label?: string }
  | { type: "eliminate_targets"; enemyDefinitionIds: readonly string[]; label?: string }
  | { type: "survive_rounds"; rounds: number; label?: string; allowEliminationVictory?: boolean }
  | { type: "reach_zone"; positions: readonly GridPosition[]; requiredHeroes?: number; label?: string };

export interface EncounterDefinition {
  id: string;
  battlefieldId: string;
  objective?: EncounterObjectiveDefinition;
  /** Roguelite-only progression gate. Ordinary quest encounters ignore this field. */
  minimumRoguelitePartyLevel?: number;
  heroSpawnPositions: GridPosition[];
  obstaclePositions?: GridPosition[];
  enemies: EncounterEnemyGroup[];
}
export type ActiveQuestStatus = "not_started" | "active" | "victory" | "defeat";
import type { MaterialId } from "../crafting/craftingTypes";
export interface ActiveQuest { questDefinitionId: string; partyId: string; currentEncounterIndex: number; status: ActiveQuestStatus; goldEarned: number; xpEarnedPerHero: number; collectedLootIds: string[]; collectedMaterials: Partial<Record<MaterialId, number>> }
