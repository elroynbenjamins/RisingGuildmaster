import type { AttributeKey } from "../attributes/types";
import type { AbilityCheckResult } from "../world/worldEventResolver";
import type { QuestCombatSetup } from "../combat/combatTypes";

export interface QuestDecisionEffect {
  awareness: number;
  heroArmorClassModifier?: number;
  text: string;
}

export interface QuestDecisionChoiceDefinition {
  id: string;
  text: string;
  description: string;
  abilityCheck?: { attribute: AttributeKey; difficultyClass: number };
  success: QuestDecisionEffect;
  failure?: QuestDecisionEffect;
}

export interface QuestDecisionStageDefinition {
  id: string;
  questId: string;
  title: string;
  description: string;
  choiceIds: string[];
}

export interface QuestDecisionResult {
  choiceId: string;
  check: AbilityCheckResult | null;
  awarenessDelta: number;
  heroArmorClassModifier: number;
  outcomeText: string;
}

export interface QuestDecisionProgress {
  awareness: number;
  heroArmorClassModifier: number;
  results: QuestDecisionResult[];
}

export interface QuestDecisionConclusion {
  expectedAmbush: boolean;
  summary: string;
  combatSetup: QuestCombatSetup;
}
