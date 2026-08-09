import type { Hero } from "../heroes/types";
import { applyLevelAttributeGrowth } from "./attributeGrowth";
import { xpRequiredForNextLevel } from "./xpSystem";
export function grantHeroXp(hero: Hero, amount: number): Hero {
  let updated = { ...hero, xp: hero.xp + Math.max(0, Math.round(amount)) };
  while (updated.xp >= xpRequiredForNextLevel(updated.level)) {
    updated = { ...updated, xp: updated.xp - xpRequiredForNextLevel(updated.level), level: updated.level + 1 };
    updated = applyLevelAttributeGrowth(updated);
  }
  return updated;
}
