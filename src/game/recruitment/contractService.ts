import type { Hero } from "../heroes/types";
import type { ContractLengthWeeks, HeroContract } from "./recruitmentTypes";
export function createHeroContract(hero: Hero, weeklySalary: number, weeks: ContractLengthWeeks, currentDay: number): HeroContract { return { heroId: hero.id, weeklySalary, startDay: currentDay, endDay: currentDay + weeks * 7, startLevel: hero.level, status: "active" }; }
export function getContractStatus(contract: HeroContract, currentDay: number): HeroContract["status"] { const remaining = contract.endDay - currentDay; return remaining <= 0 ? "expired" : remaining <= 14 ? "expiring" : "active"; }
export function calculateRenewalSalary(contract: HeroContract, currentLevel: number): number { const modifier = Math.min(.5, Math.max(.05, .05 + Math.max(0, currentLevel - contract.startLevel) * .02)); return Math.round(contract.weeklySalary * (1 + modifier)); }
