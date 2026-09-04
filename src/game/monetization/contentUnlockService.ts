import type { ClassId, RaceId } from "../heroes/types";
import type { GuildState } from "../guild/types";
import type { GemTransaction } from "./gemTypes";

export const CONTENT_UNLOCK_COST = 50;
export const DAILY_LOGIN_GEMS = 10;
export const BASE_CLASS_IDS: ClassId[] = ["warrior", "ranger", "mage", "cleric", "paladin", "berserker"];
export const BASE_RACE_IDS: RaceId[] = ["human", "elf", "dwarf", "orc"];
export type PremiumContentId = "monk" | "bard" | "spellbow" | "bulwark" | "summoner" | "tiefling";
export interface ContentEntitlements { unlockedClassIds: ClassId[]; unlockedRaceIds: RaceId[]; adsRemoved?: boolean }
export interface DailyLoginState { lastClaimDate: string | null; totalClaims: number }
export const createContentEntitlements = (): ContentEntitlements => ({ unlockedClassIds: [...BASE_CLASS_IDS], unlockedRaceIds: [...BASE_RACE_IDS] });
export function mergeContentEntitlements(...sources: Array<Partial<ContentEntitlements> | null | undefined>): ContentEntitlements {
  return {
    adsRemoved: sources.some((source) => source?.adsRemoved === true),
    unlockedClassIds: [...new Set([...BASE_CLASS_IDS, ...sources.flatMap((source) => source?.unlockedClassIds ?? [])])],
    unlockedRaceIds: [...new Set([...BASE_RACE_IDS, ...sources.flatMap((source) => source?.unlockedRaceIds ?? [])])],
  };
}
export function applyContentEntitlements(guild: GuildState, accountEntitlements: Partial<ContentEntitlements>): GuildState {
  return { ...guild, entitlements: mergeContentEntitlements(guild.entitlements, accountEntitlements) };
}
export const createDailyLoginState = (): DailyLoginState => ({ lastClaimDate: null, totalClaims: 0 });
export const calendarDateKey = (date = new Date()): string => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export const canClaimDailyLogin = (guild: GuildState, date = new Date()): boolean => guild.dailyLogin.lastClaimDate !== calendarDateKey(date);

export function claimDailyLogin(guild: GuildState, date = new Date()): GuildState {
  if (!canClaimDailyLogin(guild, date)) throw new Error("Daily login reward already claimed today");
  const dateKey = calendarDateKey(date);
  const transaction: GemTransaction = { id: `daily-login-${dateKey}`, type: "daily_login", amount: DAILY_LOGIN_GEMS, day: guild.currentDay, note: `Daily login reward (${dateKey})` };
  return { ...guild, gems: guild.gems + DAILY_LOGIN_GEMS, dailyLogin: { lastClaimDate: dateKey, totalClaims: guild.dailyLogin.totalClaims + 1 }, gemTransactions: [...guild.gemTransactions, transaction] };
}

export function unlockPremiumContent(guild: GuildState, contentId: PremiumContentId): GuildState {
  const isClass = contentId !== "tiefling";
  const alreadyOwned = isClass ? guild.entitlements.unlockedClassIds.includes(contentId) : guild.entitlements.unlockedRaceIds.includes(contentId);
  if (alreadyOwned) throw new Error("Content already unlocked");
  if (guild.gems < CONTENT_UNLOCK_COST) throw new Error(`Requires ${CONTENT_UNLOCK_COST} gems`);
  const transaction: GemTransaction = { id: `content-${contentId}-${guild.currentDay}-${guild.gemTransactions.length}`, type: "content_unlock", amount: -CONTENT_UNLOCK_COST, day: guild.currentDay, note: `Unlocked ${contentId}` };
  return { ...guild, gems: guild.gems - CONTENT_UNLOCK_COST, entitlements: { ...guild.entitlements, unlockedClassIds: isClass ? [...guild.entitlements.unlockedClassIds, contentId] : guild.entitlements.unlockedClassIds, unlockedRaceIds: isClass ? guild.entitlements.unlockedRaceIds : [...guild.entitlements.unlockedRaceIds, contentId] }, gemTransactions: [...guild.gemTransactions, transaction] };
}

export const STORY_RACE_UNLOCKS = { stoneborn: "kharum_seventh_bell", veilborn: "archive_below" } as const;
export function applyStoryRaceUnlocks(guild:GuildState):GuildState{const unlocked=[...guild.entitlements.unlockedRaceIds];for(const [raceId,questId] of Object.entries(STORY_RACE_UNLOCKS) as ["stoneborn"|"veilborn",string][])if(guild.world.completedQuestIds.includes(questId)&&!unlocked.includes(raceId))unlocked.push(raceId);return unlocked.length===guild.entitlements.unlockedRaceIds.length?guild:{...guild,entitlements:{...guild.entitlements,unlockedRaceIds:unlocked}};}
