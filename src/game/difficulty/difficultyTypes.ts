export type GameDifficultyId = "standard" | "veteran" | "iron_guild";
export type EnemyAiLevel = "trained" | "tactical" | "ruthless";

export interface DifficultyDefinition {
  id: GameDifficultyId; name: string; tagline: string; description: string; enemyAiLevel: EnemyAiLevel;
  enemyHpMultiplier: number; enemyDamageMultiplier: number; enemyDefenseMultiplier: number; enemySpeedMultiplier: number;
  enemyAttackRollModifier: number; enemyDefenseScoreModifier: number; questGoldMultiplier: number; tavernIncomeMultiplier: number;
  allowsPaidRecruitmentRefresh: boolean;
}
