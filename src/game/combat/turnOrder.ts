import type { RandomSource } from "../../utils/random";
import type { CombatUnit, InitiativeRoll } from "./combatTypes";
import { getModifiedCombatStat } from "./modifierService";

export interface RolledInitiative extends InitiativeRoll { unit: CombatUnit }

export function rollInitiative(units: readonly CombatUnit[], random: RandomSource): RolledInitiative[] {
  return units.filter((unit) => unit.isAlive).map((unit) => {
    const d20 = random.int(1, 20); const modifier = unit.stats.initiativeBonus;
    return { unit, combatantId: unit.combatantId, d20, modifier, total: d20 + modifier };
  }).sort((a, b) => b.total - a.total || b.modifier - a.modifier || getModifiedCombatStat(b.unit, "speed") - getModifiedCombatStat(a.unit, "speed") || a.combatantId.localeCompare(b.combatantId));
}

export function determineTurnOrder(units: readonly CombatUnit[], random: RandomSource): CombatUnit[] {
  return rollInitiative(units, random).map(({ unit }) => unit);
}
