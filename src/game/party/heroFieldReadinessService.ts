import type { Hero } from "../heroes/types";
import { resolveEquipmentDefinition } from "../equipment/equipmentResolver";

const PRIMARY_SLOTS = ["weapon", "armor"] as const;
const SECONDARY_SLOTS = ["helmet", "boots", "accessory1", "accessory2"] as const;

/**
 * Score penalty used only by automatic party suggestions.
 * It mirrors player-facing deployment warnings without hard-blocking a hero.
 */
export function getHeroFieldReadinessPenalty(hero: Hero): number {
  let penalty = 0;
  for (const slot of PRIMARY_SLOTS) {
    const key = hero.equipment[slot];
    const item = key ? resolveEquipmentDefinition(key) : undefined;
    if (!item) penalty += 24;
    else if (hero.level - item.levelRequirement >= 3) penalty += 16;
  }
  if (hero.level >= 10) {
    const secondaryEquipped = SECONDARY_SLOTS.filter((slot) => Boolean(hero.equipment[slot])).length;
    if (secondaryEquipped <= 1) penalty += 14;
  }
  return penalty;
}
