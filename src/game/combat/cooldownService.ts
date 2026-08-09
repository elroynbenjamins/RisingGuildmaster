export function isSkillReady(activeCooldowns: Readonly<Record<string, number>>, skillId: string): boolean { return (activeCooldowns[skillId] ?? 0) <= 0; }
export function setSkillCooldown(activeCooldowns: Readonly<Record<string, number>>, skillId: string, cooldownTurns: number): Record<string, number> {
  return cooldownTurns > 0 ? { ...activeCooldowns, [skillId]: cooldownTurns } : { ...activeCooldowns };
}
/** Decrements existing cooldowns after a turn, excluding the skill just placed on cooldown. */
export function advanceCooldowns(activeCooldowns: Readonly<Record<string, number>>, usedSkillId?: string): Record<string, number> {
  return Object.fromEntries(Object.entries(activeCooldowns).map(([id, turns]) => [id, id === usedSkillId ? turns : Math.max(0, turns - 1)]));
}
