import type { SkillModifier } from "../combat/skillTypes";
export interface BossPhaseDefinition { id: string; bossEnemyDefinitionId: string; hpRatioAtMost: number; summonGroups: { enemyDefinitionId: string; count: number }[]; selfModifiers: SkillModifier[]; announcement: string }
