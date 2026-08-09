export interface EnemySkillRuleConditions {
  selfHpRatioMax?: number;
  selfHpRatioMin?: number;
  targetHpRatioMax?: number;
  targetHpRatioMin?: number;
  minLivingEnemies?: number;
  minLivingHeroes?: number;
  minTargetsInRange?: number;
  targetRange?: number;
}
export interface EnemySkillRule { skillId: string; priority: number; conditions?: EnemySkillRuleConditions }
export interface EnemyBehaviorDefinition { id: string; basicAttackSkillId: string; rules: EnemySkillRule[] }
