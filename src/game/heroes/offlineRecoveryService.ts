import { GAME_CONFIG } from "../../config/gameConfig";
import { isInjuryCondition } from "../conditions/conditionService";
import type { GuildState } from "../guild/types";
import { calculateHero } from "./heroCalculator";

const HOUR_MS = 60 * 60 * 1000;

export interface OfflineRecoverySummary {
  elapsedMs: number;
  appliedMs: number;
  offlineHours: number;
  injuryDaysRecovered: number;
  healthRecovered: number;
  heroesHealed: number;
  injuryConditionsAdvanced: number;
  injuryConditionsRecovered: number;
  capped: boolean;
}

export interface OfflineRecoveryResult {
  guild: GuildState;
  summary: OfflineRecoverySummary;
}

function engagedHeroIds(guild: GuildState): Set<string> {
  const ids = new Set<string>(guild.activeQuestCombat?.party.heroIds ?? []);
  if (guild.activeDungeonRun?.status === "active") {
    guild.activeDungeonRun.partyHeroIds.forEach((heroId) => ids.add(heroId));
  }
  return ids;
}

export function applyOfflineRecovery(guild: GuildState, elapsedMs: number): OfflineRecoveryResult {
  const normalizedElapsedMs = Number.isFinite(elapsedMs) ? Math.max(0, elapsedMs) : 0;
  const maxMs = GAME_CONFIG.offlineRecoveryMaxHours * HOUR_MS;
  const appliedMs = Math.min(normalizedElapsedMs, maxMs);
  const offlineHours = appliedMs / HOUR_MS;
  const injuryDaysRecovered = offlineHours / GAME_CONFIG.offlineHoursPerInGameDay;
  const engaged = engagedHeroIds(guild);

  let healthRecovered = 0;
  let heroesHealed = 0;
  let injuryConditionsAdvanced = 0;
  let injuryConditionsRecovered = 0;
  let changed = false;

  const heroes = guild.heroes.map((hero) => {
    // Fallen heroes still require Temple/revive systems, and heroes in a
    // suspended quest/dungeon cannot rest by closing the app mid-encounter.
    if (hero.currentHP <= 0 || engaged.has(hero.id) || appliedMs <= 0) return hero;

    const conditions = hero.conditions.flatMap((condition) => {
      if (!isInjuryCondition(condition.conditionId)) return [condition];
      injuryConditionsAdvanced += 1;
      changed = true;
      const remainingDuration = condition.remainingDuration - injuryDaysRecovered;
      if (remainingDuration <= 0) {
        injuryConditionsRecovered += 1;
        return [];
      }
      return [{ ...condition, remainingDuration }];
    });

    const recoveredHero = { ...hero, conditions };
    const maxHP = calculateHero(recoveredHero).stats.maxHP;
    const healing = Math.round(maxHP * GAME_CONFIG.offlineHeroHealthRecoveryPerHourRatio * offlineHours);
    const nextHP = Math.max(hero.currentHP, Math.min(maxHP, hero.currentHP + Math.max(0, healing)));

    if (nextHP > hero.currentHP) {
      changed = true;
      healthRecovered += nextHP - hero.currentHP;
      heroesHealed += 1;
    }

    return { ...recoveredHero, currentHP: nextHP };
  });

  return {
    guild: changed ? { ...guild, heroes } : guild,
    summary: {
      elapsedMs: normalizedElapsedMs,
      appliedMs,
      offlineHours,
      injuryDaysRecovered,
      healthRecovered,
      heroesHealed,
      injuryConditionsAdvanced,
      injuryConditionsRecovered,
      capped: normalizedElapsedMs > maxMs,
    },
  };
}

export function formatOfflineDuration(milliseconds: number): string {
  const totalMinutes = Math.max(0, Math.floor(milliseconds / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `${minutes}m`;
  if (minutes <= 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}
