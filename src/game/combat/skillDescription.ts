import type { CombatSkillDefinition, SkillModifier, SkillTriggerConditions } from "./skillTypes";

const pct = (value: number) => `${value >= 0 ? "+" : ""}${Math.round(value * 100)}%`;
const signed = (value: number) => `${value >= 0 ? "+" : ""}${value}`;
const words = (value: string) => value.replace(/_/g, " ");
const modifierLine = (modifier: SkillModifier) => `${words(modifier.stat)} ${modifier.operation === "percentage" ? pct(modifier.value) : signed(modifier.value)}${modifier.durationTurns < 0 ? " permanently" : ` for ${modifier.durationTurns} turn${modifier.durationTurns === 1 ? "" : "s"}`}`;
function triggerText(trigger: SkillTriggerConditions) { const lines: string[] = []; if (trigger.selfHpRatioMax !== undefined) lines.push(`self HP ≤ ${Math.round(trigger.selfHpRatioMax * 100)}%`); if (trigger.selfHpRatioMin !== undefined) lines.push(`self HP ≥ ${Math.round(trigger.selfHpRatioMin * 100)}%`); if (trigger.targetHpRatioMax !== undefined) lines.push(`target HP ≤ ${Math.round(trigger.targetHpRatioMax * 100)}%`); if (trigger.targetHpRatioMin !== undefined) lines.push(`target HP ≥ ${Math.round(trigger.targetHpRatioMin * 100)}%`); return lines.join(" and "); }

export function getSkillDescriptionLines(skill: CombatSkillDefinition): string[] {
  const lines: string[] = [];
  if (skill.damageMultiplier !== undefined) lines.push(`Deals ${skill.damageMultiplier.toFixed(2)}× ${skill.damageType ?? "base"} damage.`);
  if (skill.healMaxHpModifier !== undefined) lines.push(`Heals ${Math.round(skill.healMaxHpModifier * 100)}% of the target's maximum HP.`);
  if (skill.range !== undefined) lines.push(`Range ${skill.range}. Target: ${words(skill.targetType ?? "self")}.`);
  if (skill.areaRadius !== undefined) lines.push(`Affects an area with radius ${skill.areaRadius}${skill.friendlyFire ? "; allies can be hit" : "; allies are safe"}.`);
  if ((skill.resourceCost ?? 0) > 0) lines.push(`Costs ${skill.resourceCost} ${skill.resourceType}.`);
  if ((skill.cooldownTurns ?? 0) > 0) lines.push(`Cooldown: ${skill.cooldownTurns} turns.`);
  if (skill.attackRollModifier) lines.push(`Attack roll modifier: ${signed(skill.attackRollModifier)}.`);
  if (skill.accuracyModifier) lines.push(`Accuracy modifier: ${pct(skill.accuracyModifier)}.`);
  if (skill.criticalChanceModifier) lines.push(`Critical chance modifier: ${pct(skill.criticalChanceModifier)}.`);
  for (const condition of skill.conditionApplications ?? []) lines.push(`${Math.round(condition.chance * 100)}% chance to apply ${words(condition.conditionId)} for ${condition.durationTurns} turn${condition.durationTurns === 1 ? "" : "s"}.`);
  for (const modifier of skill.selfModifiers ?? []) lines.push(`Self: ${modifierLine(modifier)}.`);
  for (const modifier of skill.targetModifiers ?? []) lines.push(`Target: ${modifierLine(modifier)}.`);
  for (const conditional of skill.conditionalModifiers ?? []) lines.push(`While ${triggerText(conditional.conditions)}: ${conditional.modifiers.map(modifierLine).join(", ")}.`);
  if (skill.selfMaxHpDamageModifier) lines.push(`Costs ${Math.round(skill.selfMaxHpDamageModifier * 100)}% of the user's maximum HP.`);
  if (skill.lifeStealModifier) lines.push(`Heals the user for ${Math.round(skill.lifeStealModifier * 100)}% of damage dealt.`);
  if (skill.taunt) lines.push(`Taunts for ${skill.taunt.durationTurns} turns; attacks against others receive ${signed(skill.taunt.offTargetAttackRollModifier)} to the attack roll.`);
  if (skill.companion) lines.push(`Summons one ${words(skill.companion.id)} with ${Math.round(skill.companion.hpMultiplier * 100)}% hero HP and ${Math.round(skill.companion.physicalDamageMultiplier * 100)}% hero physical damage.`);
  if (skill.flameWall) lines.push(`Creates ${skill.flameWall.connectedTileCount} connected tiles for ${skill.flameWall.durationRounds} rounds; entering deals ${Math.round(skill.flameWall.magicPowerDamageMultiplier * 100)}% magic power damage.`);
  if (skill.savingThrowCondition) lines.push(`Target makes a DC ${skill.savingThrowCondition.difficultyClass} ${skill.savingThrowCondition.type} save or becomes ${words(skill.savingThrowCondition.conditionId)} for ${skill.savingThrowCondition.durationTurns} turn.`);
  if (skill.clearTargetBuffsDurationTurns) lines.push(`Removes the target's active buffs for ${skill.clearTargetBuffsDurationTurns} turn.`);
  if (skill.charge) lines.push(`Charge up to ${skill.charge.maxTiles} tiles. After ${skill.charge.minimumTilesForSave}+ tiles, target makes a DC ${skill.charge.difficultyClass} Strength save or becomes ${words(skill.charge.failureConditionId)}.`);
  if (skill.aura) lines.push(`Aura affects ${words(skill.aura.target)}${skill.aura.excludeSelf ? ", excluding the user" : ""}: ${skill.aura.modifiers.map(modifierLine).join(", ")}.`);
  for (const [faction, modifier] of Object.entries(skill.factionDamageModifiers ?? {})) lines.push(`Deals ${pct(modifier)} damage against ${words(faction)}.`);
  return lines.length ? lines : [skill.type === "passive" ? "Provides its listed passive effect while equipped." : "Uses the standard combat action rules."];
}
