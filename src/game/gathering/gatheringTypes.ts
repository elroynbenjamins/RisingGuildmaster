import type { AttributeKey } from "../attributes/types";
import type { MaterialId } from "../crafting/craftingTypes";

export interface GatheringMaterialDrop { materialId: MaterialId; quantityMin: number; quantityMax: number }
export interface GatheringMissionDefinition { id: string; name: string; regionId: string; description: string; durationDays: number; difficultyClass: number; recommendedLevel: number; baseXpPerHero: number; primaryAttribute: AttributeKey; secondaryAttribute: AttributeKey; materialDrops: GatheringMaterialDrop[]; equipmentPoolIds: string[] }
export interface GatheringMissionInstance { id: string; definitionId: string; heroIds: [string, string]; startDay: number; completionDay: number; resolutionSeed: number; status: "active" | "claimed" }
export type GatheringQuality = "meager" | "common" | "uncommon" | "rare";
export interface GatheringMissionResult { success: boolean; diceRoll: number; modifier: number; total: number; difficultyClass: number; quality: GatheringQuality; materials: Partial<Record<MaterialId, number>>; equipmentIds: string[]; xpPerHero: number }
