import type { AttributeKey } from "../attributes/types";
import type { EnemyFactionId } from "../enemies/enemyTypes";

export interface RegionUnlockRequirement { type: "campaign_node" | "world_flag"; id: string }
export interface MapPosition { x: number; y: number }
export interface RegionDefinition { id: string; name: string; description: string; recommendedLevelMin: number; recommendedLevelMax: number; connectedRegionIds: string[]; settlementIds: string[]; questPoolIds: string[]; enemyFactionIds: EnemyFactionId[]; bossQuestId: string | null; unlockRequirements: RegionUnlockRequirement[]; mapPosition: MapPosition }
export interface SettlementDefinition { id: string; name: string; regionId: string; serviceIds: string[]; questIds: string[]; mapPosition: MapPosition }
export interface WorldState { currentRegionId: string; unlockedRegionIds: string[]; discoveredSettlementIds: string[]; completedQuestIds: string[]; completedCampaignNodeIds: string[]; worldFlags: Record<string, boolean>; factionReputation: Record<string, number>; campaignChapter: number }
export interface AbilityCheck { attribute: AttributeKey; difficultyClass: number }
export type EventRequirement = { type: "party_attribute_at_least"; attribute: AttributeKey; value: number } | { type: "world_flag"; flag: string; value: boolean };
export type EventOutcome = { type: "gold"; value: number } | { type: "faction_reputation"; factionId: string; value: number } | { type: "world_flag"; flag: string; value: boolean } | { type: "none" };
export interface EventChoice { id: string; text: string; requirements?: EventRequirement[]; abilityCheck?: AbilityCheck; successOutcomes: EventOutcome[]; failureOutcomes?: EventOutcome[] }
export interface WorldEventDefinition { id: string; title: string; description: string; weight: number; regionIds: string[]; choices: EventChoice[] }
export interface LoreEntryDefinition { id: string; title: string; category: "region" | "history" | "faction" | "character" | "creature" | "artifact"; text: string; unlockFlag: string }
