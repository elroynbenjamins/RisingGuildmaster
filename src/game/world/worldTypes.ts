import type { AttributeKey } from "../attributes/types";
import type { EnemyFactionId } from "../enemies/enemyTypes";
import type { SkillId } from "../proficiencies/proficiencyTypes";

export interface RegionUnlockRequirement { type: "campaign_node" | "world_flag"; id: string }
export interface MapPosition { x: number; y: number }
export interface RegionDefinition { id: string; name: string; description: string; recommendedLevelMin: number; recommendedLevelMax: number; connectedRegionIds: string[]; settlementIds: string[]; questPoolIds: string[]; enemyFactionIds: EnemyFactionId[]; bossQuestId: string | null; unlockRequirements: RegionUnlockRequirement[]; mapPosition: MapPosition }
export interface SettlementDefinition { id: string; name: string; regionId: string; serviceIds: string[]; questIds: string[]; mapPosition: MapPosition }
export type RegionLocationType = "city" | "town" | "village" | "homeland" | "stronghold" | "landmark" | "ruin" | "dungeon";
export interface RegionLocationDefinition {
  id: string;
  name: string;
  regionId: string;
  type: RegionLocationType;
  description: string;
  mapPosition: MapPosition;
  settlementId?: string;
  questId?: string;
  recommendedLevel?: number;
}
export interface WorldState { currentRegionId: string; currentSettlementId: string | null; unlockedRegionIds: string[]; discoveredSettlementIds: string[]; completedQuestIds: string[]; completedCampaignNodeIds: string[]; worldFlags: Record<string, boolean>; factionReputation: Record<string, number>; campaignChapter: number; regionThreat?: Record<string, number>; regionCrisisDays?: Record<string, number> }
export interface AbilityCheck { attribute: AttributeKey; skillId?: SkillId; difficultyClass: number }
export type EventRequirement = { type: "party_attribute_at_least"; attribute: AttributeKey; value: number } | { type: "world_flag"; flag: string; value: boolean };
export type EventOutcome = { type: "gold"; value: number } | { type: "rations"; value: number } | { type: "faction_reputation"; factionId: string; value: number } | { type: "world_flag"; flag: string; value: boolean } | { type: "party_relationship"; value: number } | { type: "equipment"; equipmentId: string } | { type: "recipe_unlock"; recipeId: string } | { type: "none" };
export interface EventDialogue { successNarration?: string; failureNarration?: string; successLead?: string; failureLead?: string; companion?: string }
export interface EventChoice { id: string; text: string; requirements?: EventRequirement[]; abilityCheck?: AbilityCheck; successOutcomes: EventOutcome[]; failureOutcomes?: EventOutcome[]; dialogue?: EventDialogue }
export type TravelEventTier = "common" | "uncommon" | "rare" | "legendary";
export interface WorldEventDefinition { id: string; title: string; description: string; weight: number; tier?: TravelEventTier; regionIds: string[]; choices: EventChoice[] }
export type LorePerspectiveKind = "eyewitness" | "oral_tradition" | "official_claim" | "scholarly_record" | "field_note";
export interface LorePerspective { speaker: string; role?: string; text: string; kind: LorePerspectiveKind }
export interface LoreEntryDefinition { id: string; title: string; category: "region" | "history" | "faction" | "character" | "creature" | "artifact"; text: string; unlockFlag: string; perspectives?: LorePerspective[] }
export interface RegionLoreDefinition {
  regionId: string;
  epithet: string;
  overview: string;
  history: string;
  peopleAndCulture: string;
  tradeAndCraft: string;
  wardstoneLegacy: string;
  travelNotes: string;
  customs: string[];
  sayings: string[];
}
