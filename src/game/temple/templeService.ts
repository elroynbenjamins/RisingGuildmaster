import { TEMPLE_CONFIG } from "../../config/templeConfig";
import { SETTLEMENTS } from "../../data/world/settlements";
import type { WorldState } from "../world/worldTypes";
import { addCondition, hasInjury } from "../conditions/conditionService";
import type { GuildState } from "../guild/types";
import { calculateHero } from "../heroes/heroCalculator";
import type { ConditionId, Hero } from "../heroes/types";
import type { GemTransaction } from "../monetization/gemTypes";

const TREATABLE_CONDITIONS = new Set<ConditionId>(Object.keys(TEMPLE_CONFIG.conditionTreatmentCosts) as ConditionId[]);

export function hasLocalHealingService(world: WorldState): boolean {
  const settlement = world.currentSettlementId ? SETTLEMENTS[world.currentSettlementId] : undefined;
  return Boolean(settlement?.serviceIds.includes("temple") || settlement?.serviceIds.includes("healer"));
}

function requireLocalHealingService(guild: GuildState): void {
  if (!hasLocalHealingService(guild.world)) throw new Error("No Temple or healer is available at the guild's current location");
}

function findHero(guild: GuildState, heroId: string): Hero {
  const hero = guild.heroes.find((item) => item.id === heroId);
  if (!hero) throw new Error("Hero not found");
  return hero;
}

function replaceHero(guild: GuildState, hero: Hero): GuildState {
  return { ...guild, heroes: guild.heroes.map((item) => item.id === hero.id ? hero : item) };
}

export function getHealingCost(hero: Hero): number {
  if (hero.currentHP <= 0) return 0;
  const missingHp = Math.max(0, calculateHero(hero).stats.maxHP - hero.currentHP);
  return Math.ceil(missingHp * TEMPLE_CONFIG.goldPerMissingHp);
}

export function getHalfHealingCost(hero: Hero): number {
  if (hero.currentHP <= 0) return 0;
  const maxHP = calculateHero(hero).stats.maxHP;
  const targetHP = Math.max(1, Math.round(maxHP * .5));
  return Math.ceil(Math.max(0, targetHP - hero.currentHP) * TEMPLE_CONFIG.goldPerMissingHp);
}

export function getConditionTreatmentCost(hero: Hero): number {
  return hero.conditions.reduce((sum, condition) => sum + (TEMPLE_CONFIG.conditionTreatmentCosts[condition.conditionId as keyof typeof TEMPLE_CONFIG.conditionTreatmentCosts] ?? 0), 0);
}

export function getFullTreatmentCost(hero: Hero): number {
  if (hero.currentHP <= 0) return 0;
  const treated = { ...hero, conditions: hero.conditions.filter((condition) => !TREATABLE_CONDITIONS.has(condition.conditionId)) };
  const missingHp = Math.max(0, calculateHero(treated).stats.maxHP - hero.currentHP);
  return Math.ceil(missingHp * TEMPLE_CONFIG.goldPerMissingHp) + getConditionTreatmentCost(hero);
}

function spendGold(guild: GuildState, cost: number): GuildState {
  if (cost <= 0) throw new Error("No treatment is needed");
  if (guild.gold < cost) throw new Error("Not enough gold");
  return { ...guild, gold: guild.gold - cost };
}

export function healHeroToHalf(guild: GuildState, heroId: string): GuildState {
  requireLocalHealingService(guild);
  const hero = findHero(guild, heroId);
  if (hero.currentHP <= 0) throw new Error("Fallen heroes must be revived first");
  const paid = spendGold(guild, getHalfHealingCost(hero));
  const targetHP = Math.max(1, Math.round(calculateHero(hero).stats.maxHP * .5));
  return replaceHero(paid, { ...hero, currentHP: Math.max(hero.currentHP, targetHP) });
}

export function healHero(guild: GuildState, heroId: string): GuildState {
  requireLocalHealingService(guild);
  const hero = findHero(guild, heroId);
  if (hero.currentHP <= 0) throw new Error("Fallen heroes must be revived first");
  const paid = spendGold(guild, getHealingCost(hero));
  return replaceHero(paid, { ...hero, currentHP: calculateHero(hero).stats.maxHP });
}

export function treatHeroConditions(guild: GuildState, heroId: string): GuildState {
  requireLocalHealingService(guild);
  const hero = findHero(guild, heroId);
  if (hero.currentHP <= 0) throw new Error("Fallen heroes must be revived first");
  const paid = spendGold(guild, getConditionTreatmentCost(hero));
  return replaceHero(paid, { ...hero, conditions: hero.conditions.filter((condition) => !TREATABLE_CONDITIONS.has(condition.conditionId)) });
}

export function fullyTreatHero(guild: GuildState, heroId: string): GuildState {
  requireLocalHealingService(guild);
  const hero = findHero(guild, heroId);
  if (hero.currentHP <= 0) throw new Error("Fallen heroes must be revived first");
  const paid = spendGold(guild, getFullTreatmentCost(hero));
  const treated = { ...hero, conditions: hero.conditions.filter((condition) => !TREATABLE_CONDITIONS.has(condition.conditionId)) };
  return replaceHero(paid, { ...treated, currentHP: calculateHero(treated).stats.maxHP, isAvailable: true });
}

export function reviveHero(guild: GuildState, heroId: string): GuildState {
  requireLocalHealingService(guild);
  const hero = findHero(guild, heroId);
  if (hero.currentHP > 0) throw new Error("This hero is not fallen");
  if (guild.gems < TEMPLE_CONFIG.revivalGemCost) throw new Error("Not enough gems");
  const revived = { ...hero, currentHP: Math.max(1, Math.round(calculateHero(hero).stats.maxHP * TEMPLE_CONFIG.revivedHpRatio)), conditions: hasInjury(hero.conditions) ? hero.conditions : addCondition(hero.conditions, "injured"), isAvailable: true };
  const transaction: GemTransaction = { id: `revival-${hero.id}-${guild.currentDay}-${guild.gemTransactions.length}`, type: "revival", amount: -TEMPLE_CONFIG.revivalGemCost, day: guild.currentDay, note: `Revived ${hero.name}` };
  return replaceHero({ ...guild, gems: guild.gems - TEMPLE_CONFIG.revivalGemCost, gemTransactions: [...guild.gemTransactions, transaction] }, revived);
}
