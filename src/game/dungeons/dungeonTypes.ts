import type { AttributeKey } from "../attributes/types";
import type { HeroCombatInstance } from "../combat/combatTypes";
import type { Modifier } from "../modifiers/types";

export type DungeonNodeType = "combat" | "elite" | "event" | "treasure" | "rest" | "merchant" | "boss";
export type DungeonThemeId = "forest" | "arctic" | "jungle" | "wasteland" | "desert" | "undead";
export interface DungeonThemeCombatModifiers { heroInitiativeModifier?: number; enemyInitiativeModifier?: number; heroMovementRangeModifier?: number; enemyMovementRangeModifier?: number; enemyPhysicalDamageModifier?: number; enemyDamageModifier?: number; heroHealingPowerModifier?: number }
export interface DungeonNodeDefinition { id: string; type: DungeonNodeType; title: string; description: string; nextNodeIds: string[]; encounterId?: string; encounterPoolIds?: string[]; goldReward?: number; xpRewardPerHero?: number; healMaxHpModifier?: number; manaRecoveryModifier?: number; staminaRecoveryModifier?: number; abilityCheck?: { attribute: AttributeKey; difficultyClass: number }; successGoldReward?: number; merchantCost?: number }
export interface DungeonDefinition { id: string; themeId: DungeonThemeId; name: string; description: string; themeRule: string; recommendedLevelMin: number; recommendedLevelMax: number; accentColor: string; startNodeId: string; nodeIds: string[]; runModifierIds: string[]; combatModifiers: DungeonThemeCombatModifiers }
export interface DungeonRunModifierDefinition { id: string; name: string; description: string; enemyModifiers: Modifier[]; rewardGoldModifier: number; rareLootModifier: number; healingPowerModifier: number }
export interface DungeonRunState { id: string; dungeonId: string; currentNodeId: string; selectedEncounterIds: Record<string, string>; visitedNodeIds: string[]; resolvedNodeIds: string[]; selectedModifierIds: string[]; partyHeroIds: string[]; heroInstances: HeroCombatInstance[]; goldEarned: number; xpEarnedPerHero: number; recipeIdsUnlocked: string[]; lastResolutionText: string | null; status: "active" | "victory" | "defeat" | "abandoned" }
