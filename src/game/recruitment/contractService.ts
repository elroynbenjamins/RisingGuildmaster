import type { GuildState } from "../guild/types";
import type { Hero } from "../heroes/types";
import type { ContractLengthWeeks, HeroContract, RenewalLengthWeeks } from "./recruitmentTypes";

export const CONTRACT_DEPARTURE_GRACE_DAYS = 3;

export function createHeroContract(hero: Hero, weeklySalary: number, weeks: ContractLengthWeeks, currentDay: number): HeroContract {
  return { heroId: hero.id, weeklySalary, startDay: currentDay, endDay: currentDay + weeks * 7, startLevel: hero.level, status: "active", renewalIntent: "undecided" };
}
export function getContractStatus(contract: HeroContract, currentDay: number): HeroContract["status"] {
  const remaining = contract.endDay - currentDay;
  return remaining <= 0 ? "expired" : remaining <= 14 ? "expiring" : "active";
}
export function calculateRenewalSalary(contract: HeroContract, currentLevel: number): number {
  const modifier = Math.min(.5, Math.max(.05, .05 + Math.max(0, currentLevel - contract.startLevel) * .02));
  return Math.round(contract.weeklySalary * (1 + modifier));
}
export function renewalSalaryForLength(contract: HeroContract, currentLevel: number, weeks: RenewalLengthWeeks): number {
  const base = calculateRenewalSalary(contract, currentLevel);
  const termModifier = weeks === 4 ? 1.08 : weeks === 8 ? 1.04 : 1;
  return Math.max(1, Math.round(base * termModifier));
}
export function renewHeroContract(guild: GuildState, heroId: string, weeks: RenewalLengthWeeks): GuildState {
  const hero = guild.heroes.find((entry) => entry.id === heroId);
  const contract = guild.heroContracts.find((entry) => entry.heroId === heroId);
  if (!hero || !contract) throw new Error("Hero contract is unavailable");
  if ((guild.finance.salaryArrearsByHeroId[heroId] ?? 0) > 0) throw new Error("Pay this hero's salary arrears before renewing");
  const weeklySalary = renewalSalaryForLength(contract, hero.level, weeks);
  const startDay = guild.currentDay;
  return {
    ...guild,
    heroContracts: guild.heroContracts.map((entry) => entry.heroId === heroId ? { ...entry, weeklySalary, startDay, endDay: startDay + weeks * 7, startLevel: hero.level, status: "active", renewalIntent: "undecided" } : entry),
    heroes: guild.heroes.map((entry) => entry.id === heroId ? { ...entry, salary: weeklySalary } : entry),
  };
}
export function markContractForDeparture(guild: GuildState, heroId: string): GuildState {
  if (!guild.heroContracts.some((entry) => entry.heroId === heroId)) throw new Error("Hero contract is unavailable");
  return { ...guild, heroContracts: guild.heroContracts.map((entry) => entry.heroId === heroId ? { ...entry, renewalIntent: "depart" } : entry) };
}
export function cancelContractDeparture(guild: GuildState, heroId: string): GuildState {
  return { ...guild, heroContracts: guild.heroContracts.map((entry) => entry.heroId === heroId ? { ...entry, renewalIntent: "undecided" } : entry) };
}
export function contractDepartureDay(contract: HeroContract): number { return contract.endDay + CONTRACT_DEPARTURE_GRACE_DAYS; }
