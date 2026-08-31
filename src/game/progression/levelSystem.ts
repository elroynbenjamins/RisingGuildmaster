import type { Hero } from "../heroes/types";
import type { WorldState } from "../world/worldTypes";
import { applyLevelAttributeGrowth } from "./attributeGrowth";
import { xpRequiredForNextLevel } from "./xpSystem";

export const CHAPTER_ONE_HERO_LEVEL_CAP = 4;
export function getCampaignHeroLevelCap(world: WorldState): number {
  return world.completedCampaignNodeIds.includes("goblin_chieftain") || world.completedQuestIds.includes("goblin_chieftain_boss") ? Number.POSITIVE_INFINITY : CHAPTER_ONE_HERO_LEVEL_CAP;
}

export function grantHeroXp(hero: Hero, amount: number, maximumLevel = Number.POSITIVE_INFINITY): Hero {
  let updated = { ...hero, xp: hero.xp + Math.max(0, Math.round(amount)) };
  while (updated.level < maximumLevel && updated.xp >= xpRequiredForNextLevel(updated.level)) {
    updated = { ...updated, xp: updated.xp - xpRequiredForNextLevel(updated.level), level: updated.level + 1 };
    updated = applyLevelAttributeGrowth(updated);
  }
  return updated;
}

export function grantCampaignHeroXp(hero: Hero, amount: number, world: WorldState): Hero { return grantHeroXp(hero, amount, getCampaignHeroLevelCap(world)); }
export function releaseBankedCampaignXp(heroes: readonly Hero[], world: WorldState): Hero[] { const cap = getCampaignHeroLevelCap(world); return heroes.map((hero) => grantHeroXp(hero, 0, cap)); }
