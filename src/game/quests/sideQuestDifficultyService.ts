import type { QuestDefinition } from "./questTypes";

export const SIDE_QUEST_ENEMY_ATTACK_ROLL_BONUS = 1;
export const SIDE_QUEST_ENEMY_DEFENSE_SCORE_BONUS = 1;

export function getSideQuestEnemyRollModifiers(quest: QuestDefinition): { attackRoll: number; defenseScore: number } {
  return quest.questType === "side"
    ? { attackRoll: SIDE_QUEST_ENEMY_ATTACK_ROLL_BONUS, defenseScore: SIDE_QUEST_ENEMY_DEFENSE_SCORE_BONUS }
    : { attackRoll: 0, defenseScore: 0 };
}

export function getSideQuestDifficultyLabel(quest: QuestDefinition): string | null {
  const modifier = getSideQuestEnemyRollModifiers(quest);
  return modifier.attackRoll || modifier.defenseScore
    ? `Side Quest Challenge · Enemies +${modifier.attackRoll} attack rolls and +${modifier.defenseScore} AC/MDS`
    : null;
}
