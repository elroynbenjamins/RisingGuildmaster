export type QuestType = "campaign" | "side" | "contract" | "boss";
export interface QuestDefinition { id: string; name: string; questType: QuestType; regionId: string; repeatable: boolean; difficulty: number; minPartySize: number; maxPartySize: number; encounterIds: string[]; goldRewardMin: number; goldRewardMax: number; xpRewardPerHero: number; lootTableId: string }
import type { GridPosition } from "../combat/grid/gridTypes";

export interface EncounterEnemyGroup {
  enemyDefinitionId: string;
  count: number;
  level: number;
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
export interface ActiveQuest { questDefinitionId: string; partyId: string; currentEncounterIndex: number; status: ActiveQuestStatus; goldEarned: number; xpEarnedPerHero: number; collectedLootIds: string[] }
