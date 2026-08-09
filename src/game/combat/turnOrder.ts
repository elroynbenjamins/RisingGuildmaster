import type { RandomSource } from "../../utils/random";
import type { CombatUnit } from "./combatTypes";
import { getModifiedCombatStat } from "./modifierService";

export function determineTurnOrder(units: readonly CombatUnit[], random: RandomSource): CombatUnit[] {
  return units.filter((unit) => unit.isAlive).map((unit) => ({ unit, tie: random.next() })).sort((a, b) => getModifiedCombatStat(b.unit, "speed") - getModifiedCombatStat(a.unit, "speed") || a.tie - b.tie).map(({ unit }) => unit);
}
