import type { Hero } from "../game/heroes/types";
import { hasInjury } from "../game/conditions/conditionService";
export type HeroFilter = "All" | "Available" | "Injured";
export type HeroSort = "Level" | "Name" | "Class" | "Potential";
export function filterAndSortHeroes(heroes: Hero[], filter: HeroFilter, sort: HeroSort): Hero[] {
  const filtered = heroes.filter((hero) => filter === "All" || (filter === "Available" ? hero.isAvailable && hero.currentHP > 0 : hasInjury(hero.conditions)));
  return [...filtered].sort((a, b) => sort === "Name" ? a.name.localeCompare(b.name) : sort === "Class" ? a.classId.localeCompare(b.classId) || a.name.localeCompare(b.name) : sort === "Potential" ? b.potentialEstimateMax - a.potentialEstimateMax : b.level - a.level || a.name.localeCompare(b.name));
}
