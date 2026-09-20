import type { SkillModifier } from "../combat/skillTypes";

/**
 * Standard/campaign bosses use short signature phase reactions.  These are
 * intentionally lighter than Raid mechanics: no persistent arena objectives,
 * squad coordination rules, or repeating hazard scripts live here.
 */
export interface BossPhaseDefinition {
  id: string;
  bossEnemyDefinitionId: string;
  hpRatioAtMost: number;
  name: string;
  announcement: string;
  playerHint: string;
  summonGroups: { enemyDefinitionId: string; count: number }[];
  selfModifiers: SkillModifier[];
  heroModifiers?: SkillModifier[];
  bossHealMaxHpRatio?: number;
  heroPulseDamageMaxHpRatio?: number;
}
