import type { RandomSource } from "../../utils/random";
import type { Hero } from "../heroes/types";
import { resolveAbilityCheck } from "../world/worldEventResolver";
import type { QuestDecisionChoiceDefinition, QuestDecisionConclusion, QuestDecisionProgress, QuestDecisionResult } from "./questDecisionTypes";

export const EMPTY_QUEST_DECISION_PROGRESS: QuestDecisionProgress = { awareness: 0, heroArmorClassModifier: 0, results: [] };

export function resolveQuestDecision(choice: QuestDecisionChoiceDefinition, heroes: readonly Hero[], random: RandomSource): QuestDecisionResult {
  const check = choice.abilityCheck ? resolveAbilityCheck(choice.abilityCheck, heroes, random) : null;
  const effect = check && !check.success ? choice.failure ?? { awareness: 0, text: "The attempt changes nothing." } : choice.success;
  return { choiceId: choice.id, check, awarenessDelta: effect.awareness, heroArmorClassModifier: effect.heroArmorClassModifier ?? 0, outcomeText: effect.text };
}

export function advanceQuestDecision(progress: QuestDecisionProgress, result: QuestDecisionResult): QuestDecisionProgress {
  return { awareness: progress.awareness + result.awarenessDelta, heroArmorClassModifier: progress.heroArmorClassModifier + result.heroArmorClassModifier, results: [...progress.results, result] };
}

export function concludeCaravanDecisions(progress: QuestDecisionProgress): QuestDecisionConclusion {
  const expectedAmbush = progress.awareness >= 1;
  return {
    expectedAmbush,
    summary: expectedAmbush ? "AMBUSH EXPECTED — The party identifies the kill zone and enters in battle formation." : "AMBUSH UNEXPECTED — Bandits strike from both sides after the caravan enters the trap.",
    combatSetup: expectedAmbush
      ? { encounterIds: ["brambleway_expected_ambush"], label: "Ambush Expected · Heroes +2 initiative", heroInitiativeModifier: 2, enemyInitiativeModifier: 0, heroArmorClassModifier: progress.heroArmorClassModifier, heroOpeningAttackRollModifier: 0, enemyOpeningAttackRollModifier: 0 }
      : { encounterIds: ["brambleway_surprise_ambush"], label: "Surprise Ambush · Bandits +2 initiative and +2 opening attack rolls", heroInitiativeModifier: 0, enemyInitiativeModifier: 2, heroArmorClassModifier: progress.heroArmorClassModifier, heroOpeningAttackRollModifier: -1, enemyOpeningAttackRollModifier: 2 },
  };
}
