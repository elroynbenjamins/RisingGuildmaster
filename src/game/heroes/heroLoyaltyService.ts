import type { QuestDefinition } from "../quests/questTypes";
import { isHeroEligibleForPersonalQuest } from "../quests/questAvailability";
import type { GuildState } from "../guild/types";
import type { HeroContract, ContractLengthWeeks, RenewalLengthWeeks } from "../recruitment/recruitmentTypes";
import { calculateRenewalSalary } from "../recruitment/contractService";
import type { HeroLoyaltyBand, HeroLoyaltyState } from "./heroLoyaltyTypes";

export const DEFAULT_HERO_LOYALTY = 60;
const MAX_RECENT_CHANGES = 6;

export function createHeroLoyaltyState(score = DEFAULT_HERO_LOYALTY): HeroLoyaltyState {
  return { score: Math.max(0, Math.min(100, Math.round(score))), recentChanges: [] };
}

export function getHeroLoyalty(guild: Pick<GuildState, "heroLoyaltyByHeroId">, heroId: string): HeroLoyaltyState {
  return guild.heroLoyaltyByHeroId[heroId] ?? createHeroLoyaltyState();
}

export function getHeroLoyaltyBand(score: number): HeroLoyaltyBand {
  if (score < 25) return "resentful";
  if (score < 45) return "unhappy";
  if (score < 70) return "steady";
  if (score < 85) return "loyal";
  return "devoted";
}

export const HERO_LOYALTY_LABELS: Record<HeroLoyaltyBand, string> = {
  resentful: "Resentful",
  unhappy: "Unhappy",
  steady: "Steady",
  loyal: "Loyal",
  devoted: "Devoted",
};

export function changeHeroLoyalty(guild: GuildState, heroId: string, amount: number, reason: string, day = guild.currentDay): GuildState {
  if (!amount || !guild.heroes.some((hero) => hero.id === heroId)) return guild;
  const current = getHeroLoyalty(guild, heroId);
  const score = Math.max(0, Math.min(100, current.score + amount));
  if (score === current.score) return guild;
  const change = { day, amount: score - current.score, reason };
  return {
    ...guild,
    heroLoyaltyByHeroId: {
      ...guild.heroLoyaltyByHeroId,
      [heroId]: { score, recentChanges: [change, ...current.recentChanges].slice(0, MAX_RECENT_CHANGES) },
    },
  };
}

export interface LoyaltyQuestOutcome {
  heroId: string;
  fellInBattle: boolean;
  newlyInjured: boolean;
}

/**
 * Keeps loyalty tied to things the player already does instead of becoming a
 * second isolated progression bar. Routine victories move it slowly; neglect,
 * serious failures and unpaid salaries move it much faster.
 */
export function applyQuestLoyaltyConsequences(
  guild: GuildState,
  status: "victory" | "defeat",
  outcomes: readonly LoyaltyQuestOutcome[],
  quest: QuestDefinition,
): GuildState {
  let updated = guild;
  for (const outcome of outcomes) {
    if (status === "victory") updated = changeHeroLoyalty(updated, outcome.heroId, 1, `Won ${quest.name}`);
    else updated = changeHeroLoyalty(updated, outcome.heroId, -3, `Defeated on ${quest.name}`);
    if (outcome.fellInBattle) updated = changeHeroLoyalty(updated, outcome.heroId, -2, `Fell in battle on ${quest.name}`);
    else if (outcome.newlyInjured) updated = changeHeroLoyalty(updated, outcome.heroId, -1, `Injured on ${quest.name}`);
    const hero = updated.heroes.find((entry) => entry.id === outcome.heroId);
    if (status === "victory" && hero && quest.personalHeroRequirement && isHeroEligibleForPersonalQuest(hero, quest)) updated = changeHeroLoyalty(updated, outcome.heroId, 2, `Personal duty completed: ${quest.name}`);
  }
  return updated;
}

export function applyPayrollLoyalty(guild: GuildState, heroId: string, paid: number, due: number, day: number): GuildState {
  if (due <= 0) return guild;
  if (paid >= due) return changeHeroLoyalty(guild, heroId, 1, "Weekly salary paid in full", day);
  if (paid <= 0) return changeHeroLoyalty(guild, heroId, -7, "Weekly salary went unpaid", day);
  return changeHeroLoyalty(guild, heroId, -4, "Weekly salary was only partly paid", day);
}

export function applyArrearsSettlementLoyalty(guild: GuildState, heroId: string): GuildState {
  return changeHeroLoyalty(guild, heroId, 2, "Outstanding salary arrears were settled");
}

export function getRenewalSalaryForGuild(guild: GuildState, contract: HeroContract, currentLevel: number, weeks: RenewalLengthWeeks | ContractLengthWeeks = 12): number {
  const base = Math.round(calculateRenewalSalary(contract, currentLevel) * (weeks === 4 ? 1.08 : weeks === 8 ? 1.04 : 1));
  const band = getHeroLoyaltyBand(getHeroLoyalty(guild, contract.heroId).score);
  const loyaltyModifier: Record<HeroLoyaltyBand, number> = { resentful: .20, unhappy: .10, steady: 0, loyal: -.05, devoted: -.10 };
  return Math.max(1, Math.round(base * (1 + loyaltyModifier[band])));
}

export function renewHeroContract(guild: GuildState, heroId: string, weeks: ContractLengthWeeks | RenewalLengthWeeks = 12): GuildState {
  const hero = guild.heroes.find((entry) => entry.id === heroId);
  const contract = guild.heroContracts.find((entry) => entry.heroId === heroId);
  if (!hero || !contract) throw new Error("Hero contract could not be found");
  if (contract.status === "active") throw new Error("This contract is not ready for renewal yet");
  if ((guild.finance.salaryArrearsByHeroId[heroId] ?? 0) > 0) throw new Error("Pay this hero’s salary arrears before renewing");
  const weeklySalary = getRenewalSalaryForGuild(guild, contract, hero.level, weeks);
  const contracts = guild.heroContracts.map((entry) => entry.heroId === heroId ? {
    ...entry,
    weeklySalary,
    startDay: guild.currentDay,
    endDay: guild.currentDay + weeks * 7,
    startLevel: hero.level,
    status: "active" as const,
    renewalIntent: "undecided" as const,
  } : entry);
  return changeHeroLoyalty({ ...guild, heroContracts: contracts, heroes: guild.heroes.map(entry => entry.id === heroId ? {...entry, salary: weeklySalary} : entry) }, heroId, 3, `Signed a new ${weeks}-week contract`);
}
