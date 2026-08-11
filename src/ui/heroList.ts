import type { Hero } from "../game/heroes/types";
export type HeroFilter = "All" | "Available" | "Injured";
export type HeroSort = "Level" | "Name" | "Class" | "Potential";
export function filterAndSortHeroes(heroes: Hero[], filter: HeroFilter, sort: HeroSort): Hero[] {
  const filtered = heroes.filter((hero) => filter === "All" || (filter === "Available" ? hero.isAvailable && hero.currentHP > 0 : hero.conditions.some((item) => item.conditionId === "injured")));
  return [...filtered].sort((a, b) => sort === "Name" ? a.name.localeCompare(b.name) : sort === "Class" ? a.classId.localeCompare(b.classId) || a.name.localeCompare(b.name) : sort === "Potential" ? b.potentialEstimateMax - a.potentialEstimateMax : b.level - a.level || a.name.localeCompare(b.name));
}
