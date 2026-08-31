import type { AttributeKey } from "../attributes/types";
import type { ConditionId } from "../heroes/types";
import type { AbilityCheckResult } from "../world/worldEventResolver";
import type { QuestCombatSetup } from "../combat/combatTypes";
import type { SkillId } from "../proficiencies/proficiencyTypes";

export type QuestExplorationCombatEffect = Partial<Omit<QuestCombatSetup, "encounterIds" | "label">> & { label: string };

export interface QuestExplorationStageDefinition {
  id: string;
  questId: string;
  title: string;
  description: string;
  attribute: AttributeKey;
  skillId?: SkillId;
  difficultyClass: number;
  successText: string;
  failureText: string;
  failureConditionId?: ConditionId;
  successCombatEffect?: QuestExplorationCombatEffect;
  failureCombatEffect?: QuestExplorationCombatEffect;
  continueLabel?: string;
}

export interface QuestExplorationStageResult { stageId: string; check: AbilityCheckResult; outcomeText: string; appliedConditionId?: ConditionId; combatEffect?: QuestExplorationCombatEffect }
