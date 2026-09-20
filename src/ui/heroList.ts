import type { Hero } from "../game/heroes/types";
import { hasInjury } from "../game/conditions/conditionService";
export type HeroFilter = "All" | "Attention" | "Available" | "Injured" | "Fallen";
export type HeroSort = "Level" | "Attention" | "Name" | "Class" | "Potential";
export function filterAndSortHeroes(heroes: Hero[], filter: HeroFilter, sort: HeroSort, attentionScore: (hero: Hero) => number = () => 0): Hero[] {
  const filtered = heroes.filter((hero) => filter === "All" || (filter === "Attention" ? attentionScore(hero) > 0 : filter === "Available" ? hero.isAvailable && hero.currentHP > 0 : filter === "Injured" ? hero.currentHP > 0 && hasInjury(hero.conditions) : hero.currentHP <= 0));
  return [...filtered].sort((a, b) => sort === "Attention" ? attentionScore(b) - attentionScore(a) || b.level - a.level : sort === "Name" ? a.name.localeCompare(b.name) : sort === "Class" ? a.classId.localeCompare(b.classId) || a.name.localeCompare(b.name) : sort === "Potential" ? b.potentialEstimateMax - a.potentialEstimateMax : b.level - a.level || a.name.localeCompare(b.name));
}
