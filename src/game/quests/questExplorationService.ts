import type { RandomSource } from "../../utils/random";
import type { Hero } from "../heroes/types";
import { resolveAbilityCheck } from "../world/worldEventResolver";
import type { QuestExplorationStageDefinition, QuestExplorationStageResult } from "./explorationTypes";
import { getQuestStageProficiency } from "../../data/quests/questProficiencies";

export function resolveQuestExplorationStage(stage: QuestExplorationStageDefinition, partyHeroes: readonly Hero[], random: RandomSource): QuestExplorationStageResult {
  const check = resolveAbilityCheck({ attribute: stage.attribute, skillId: getQuestStageProficiency(stage.id, stage.skillId), difficultyClass: stage.difficultyClass }, partyHeroes, random);
  const combatEffect = check.success ? stage.successCombatEffect : stage.failureCombatEffect;
  return { stageId: stage.id, check, outcomeText: check.success ? stage.successText : stage.failureText, ...(!check.success && stage.failureConditionId ? { appliedConditionId: stage.failureConditionId } : {}), ...(combatEffect ? { combatEffect } : {}) };
}
