import type { Attributes, DerivedStats } from "./types";

/** Derived values are recalculated from final attributes and are never persisted as base stats. */
export function calculateDerivedStats(a: Attributes): DerivedStats {
  return {
    maxHP: 100 + a.constitution * 10 + a.strength * 2,
    physicalAttack: a.strength * 4 + a.dexterity,
    physicalDefense: a.constitution * 3 + a.strength,
    magicPower: a.intelligence * 4 + a.wisdom * 2,
    magicDefense: a.wisdom * 3 + a.intelligence,
    speed: 10 + a.dexterity * 2,
    criticalChance: Number((0.05 + a.dexterity * 0.005).toFixed(6)),
  };
}
