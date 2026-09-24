import { TRAITS } from "../../data/traits/traits";
import type { Hero } from "../heroes/types";
import { getBackgroundModifier } from "../../data/backgrounds/backgrounds";

function traitModifier(hero: Hero, target: "salary"): number { return hero.traitIds.flatMap((id) => TRAITS[id].modifiers).filter((modifier) => modifier.target === target && modifier.operation === "percentage").reduce((sum, modifier) => sum + modifier.value, 0); }
export function calculateRecruitmentFee(level: number, potential: number, archetypeModifier = 0, raceModifier = 0, traitModifierValue = 0): number { return Math.round((100 + level * 100 + potential * 5) * (1 + archetypeModifier + raceModifier + traitModifierValue)); }
export function salaryCostMultiplierForLevel(level: number): number {
  const normalizedLevel = Math.max(1, Math.min(10, level));
  const discount = .10 + ((normalizedLevel - 1) / 9) * .05;
  return 1 - discount;
}
export function calculateWeeklySalary(hero: Hero, archetypeModifier = 0, raceModifier = 0): number { const power = Object.values(hero.baseAttributes).reduce((sum, value) => sum + value, 0); return Math.round((25 + hero.level * 15 + power * .75) * (1 + archetypeModifier + raceModifier + traitModifier(hero, "salary") + getBackgroundModifier(hero.backgroundId, "salary")) * salaryCostMultiplierForLevel(hero.level)); }
export function calculateContractCosts(recruitmentFee: number, weeklySalary: number, weeks: number) { const contractSalary = weeklySalary * weeks; return { contractSalary, totalEstimatedCost: recruitmentFee + contractSalary }; }
