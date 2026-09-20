import { ENEMY_SKILLS } from "../../data/skills/enemySkills";
import { getEnemyDefinition } from "../../data/enemies";
import type { EnemyDefinition, EnemyInstance } from "../enemies/enemyTypes";
import type { CombatUnit } from "./combatTypes";
import type { SkillModifier, SkillTriggerConditions } from "./skillTypes";

function matches(conditions: SkillTriggerConditions, self: { currentHP: number; maxHP: number }, target?: { currentHP: number; maxHP: number }): boolean {
  const selfRatio = self.maxHP > 0 ? self.currentHP / self.maxHP : 0;
  const targetRatio = target && target.maxHP > 0 ? target.currentHP / target.maxHP : 0;
  return (conditions.selfHpRatioMin === undefined || selfRatio >= conditions.selfHpRatioMin)
    && (conditions.selfHpRatioMax === undefined || selfRatio <= conditions.selfHpRatioMax)
    && (conditions.targetHpRatioMin === undefined || targetRatio >= conditions.targetHpRatioMin)
    && (conditions.targetHpRatioMax === undefined || targetRatio <= conditions.targetHpRatioMax);
}
export function getConditionalPassiveModifiers(definition: EnemyDefinition, self: CombatUnit, target?: CombatUnit): SkillModifier[] {
  return definition.skillIds.flatMap((id) => ENEMY_SKILLS[id]?.conditionalModifiers ?? []).filter((entry) => matches(entry.conditions, self, target)).flatMap((entry) => entry.modifiers);
}
export function getPermanentPassiveModifiers(definition: EnemyDefinition): SkillModifier[] {
  return definition.skillIds.flatMap((id) => ENEMY_SKILLS[id]?.type === "passive" ? ENEMY_SKILLS[id]?.selfModifiers ?? [] : []);
}
export function getAuraModifiersForEnemy(instances: readonly EnemyInstance[], target: EnemyInstance): SkillModifier[] {
  return instances.filter((source) => source.isAlive).flatMap((source) => {
    const sourceDefinition = getEnemyDefinition(source.enemyDefinitionId);
    const targetDefinition = getEnemyDefinition(target.enemyDefinitionId);
    return sourceDefinition.skillIds.flatMap((id) => {
      const aura = ENEMY_SKILLS[id]?.aura;
      if (!aura || (aura.excludeSelf && source.instanceId === target.instanceId)) return [];
      if (aura.trigger && !matches(aura.trigger, source)) return [];
      if (aura.target === "same_faction_allies" && (sourceDefinition.factionId !== targetDefinition.factionId || (aura.factionId && aura.factionId !== targetDefinition.factionId))) return [];
      return aura.modifiers;
    });
  });
}

export function resolvePassiveHealing(definition: EnemyDefinition, unit: CombatUnit): CombatUnit {
  const ratio = definition.skillIds.reduce((sum, id) => sum + (ENEMY_SKILLS[id]?.type === "passive" ? ENEMY_SKILLS[id]?.healMaxHpModifier ?? 0 : 0), 0);
  if (!unit.isAlive || ratio <= 0) return unit;
  const heal = Math.round(unit.maxHP * ratio);
  return { ...unit, currentHP: Math.min(unit.maxHP, unit.currentHP + heal) };
}
