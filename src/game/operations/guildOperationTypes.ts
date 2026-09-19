import type { AttributeKey } from "../attributes/types";
import type { MaterialId } from "../crafting/craftingTypes";
import type { AbilityCheckResult } from "../world/worldEventResolver";

export interface GuildOperationCheckDefinition {
  title: string;
  description: string;
  attribute: AttributeKey;
  difficultyClass: number;
}

export interface GuildOperationPhaseDefinition {
  id: string;
  title: string;
  vanguard: GuildOperationCheckDefinition;
  support: GuildOperationCheckDefinition;
}

export interface GuildOperationDefinition {
  id: string;
  name: string;
  regionId: string;
  description: string;
  patron: { speaker: string; portraitId: string; briefing: string };
  phases: GuildOperationPhaseDefinition[];
  baseGoldReward: number;
  baseXpReward: number;
  reputationReward: number;
  materialRewards: Partial<Record<MaterialId, number>>;
  requiredWorldFlags?: string[];
  forbiddenWorldFlags?: string[];
  victoryDialogue: string;
  setbackDialogue: string;
}

export interface GuildOperationState {
  completedCount: number;
  nextAvailableDay: number;
  lastOperationId: string | null;
  bestSuccessesByOperationId: Record<string, number>;
}

export type GuildOperationRank = "decisive_victory" | "hard_won_victory" | "setback";

export interface GuildOperationCheckResult {
  phaseId: string;
  phaseTitle: string;
  team: "vanguard" | "support";
  title: string;
  result: AbilityCheckResult;
}

export interface GuildOperationResult {
  operationId: string;
  rank: GuildOperationRank;
  successes: number;
  totalChecks: number;
  goldReward: number;
  xpRewardPerHero: number;
  reputationReward: number;
  threatDelta: number;
  checks: GuildOperationCheckResult[];
  dialogue: string;
}

export const createGuildOperationState = (): GuildOperationState => ({ completedCount: 0, nextAvailableDay: 1, lastOperationId: null, bestSuccessesByOperationId: {} });


export interface GuildOperationCheckPreview {
  phaseId: string;
  phaseTitle: string;
  team: "vanguard" | "support";
  title: string;
  difficultyClass: number;
  bestHeroId: string | null;
  bestHeroName: string | null;
  modifier: number;
  expectedMargin: number;
  rating: "strong" | "tense" | "weak";
}

export interface GuildOperationTeamPreview {
  checks: GuildOperationCheckPreview[];
  warnings: string[];
}

export interface GuildOperationSuggestedTeams {
  vanguardHeroIds: string[];
  supportHeroIds: string[];
  score: number;
}
