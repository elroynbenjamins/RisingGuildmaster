export type QuestType = "campaign" | "side" | "contract" | "boss";
export interface HuntRewardDefinition { recipeFragmentMaterialId: MaterialId; firstVictoryCount: number; repeatDropChance: number; pityAfterFailures: number }
export interface QuestDefinition { id: string; name: string; description?: string; questType: QuestType; regionId: string; repeatable: boolean; hiddenFromQuestBoard?: boolean; difficulty: number; recommendedLevelMin?: number; recommendedLevelMax?: number; minPartySize: number; maxPartySize: number; explorationStageIds?: string[]; decisionStageIds?: string[]; encounterIds: string[]; goldRewardMin: number; goldRewardMax: number; xpRewardPerHero: number; lootTableId: string; huntReward?: HuntRewardDefinition; recipeUnlockIdsOnVictory?: string[]; storyArcId?: string; campaignChapter?: number; prerequisiteQuestIds?: string[]; prerequisiteCampaignNodeIds?: string[]; requiredWorldFlags?: string[]; setWorldFlagsOnVictory?: Record<string, boolean> }
import type { GridPosition } from "../combat/grid/gridTypes";

export interface EncounterEnemyGroup {
  enemyDefinitionId: string;
  count: number;
  level: number;
  /** Encounter-specific multiplier for elite guards and bosses. 1.15 means +15%. */
  difficultyMultiplier?: number;
  spawnPositions: GridPosition[];
}

export interface EncounterDefinition {
  id: string;
  battlefieldId: string;
  heroSpawnPositions: GridPosition[];
  obstaclePositions?: GridPosition[];
  enemies: EncounterEnemyGroup[];
}
export type ActiveQuestStatus = "not_started" | "active" | "victory" | "defeat";
import type { MaterialId } from "../crafting/craftingTypes";
export interface ActiveQuest { questDefinitionId: string; partyId: string; currentEncounterIndex: number; status: ActiveQuestStatus; goldEarned: number; xpEarnedPerHero: number; collectedLootIds: string[]; collectedMaterials: Partial<Record<MaterialId, number>> }
