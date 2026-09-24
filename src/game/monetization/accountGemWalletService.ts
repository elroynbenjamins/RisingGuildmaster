import AsyncStorage from "@react-native-async-storage/async-storage";
import { GAME_CONFIG } from "../../config/gameConfig";
import type { GuildState } from "../guild/types";
import type { GemTransaction } from "./gemTypes";
import { createDailyLoginState, type DailyLoginState } from "./contentUnlockService";

const ACCOUNT_GEM_WALLET_KEY = "guildmaster.account.gem-wallet.v1";

export interface AccountGemWallet {
  gems: number;
  gemTransactions: GemTransaction[];
  dailyLogin: DailyLoginState;
  lastFreeReviveDate: string | null;
}

let writeQueue: Promise<void> = Promise.resolve();

export function createAccountGemWallet(): AccountGemWallet {
  return {
    gems: GAME_CONFIG.startingGems,
    gemTransactions: [],
    dailyLogin: createDailyLoginState(),
    lastFreeReviveDate: null,
  };
}

export function accountGemWalletFromGuild(guild: GuildState): AccountGemWallet {
  return {
    gems: Math.max(0, Math.floor(guild.gems)),
    gemTransactions: [...guild.gemTransactions],
    dailyLogin: { ...guild.dailyLogin },
    lastFreeReviveDate: guild.lastFreeReviveDate,
  };
}

export function applyAccountGemWallet(guild: GuildState, wallet: AccountGemWallet): GuildState {
  return {
    ...guild,
    gems: wallet.gems,
    gemTransactions: [...wallet.gemTransactions],
    dailyLogin: { ...wallet.dailyLogin },
    lastFreeReviveDate: wallet.lastFreeReviveDate,
  };
}

function normalizeWallet(value: unknown): AccountGemWallet | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Partial<AccountGemWallet>;
  if (typeof raw.gems !== "number" || !Number.isFinite(raw.gems) || raw.gems < 0) return null;
  const dailyLogin = raw.dailyLogin && typeof raw.dailyLogin === "object"
    ? {
      lastClaimDate: typeof raw.dailyLogin.lastClaimDate === "string" ? raw.dailyLogin.lastClaimDate : null,
      totalClaims: typeof raw.dailyLogin.totalClaims === "number" && Number.isFinite(raw.dailyLogin.totalClaims) ? Math.max(0, Math.floor(raw.dailyLogin.totalClaims)) : 0,
    }
    : createDailyLoginState();
  return {
    gems: Math.max(0, Math.floor(raw.gems!)),
    gemTransactions: Array.isArray(raw.gemTransactions) ? raw.gemTransactions : [],
    dailyLogin,
    lastFreeReviveDate: typeof raw.lastFreeReviveDate === "string" ? raw.lastFreeReviveDate : null,
  };
}

export async function loadAccountGemWallet(): Promise<AccountGemWallet | null> {
  const stored = await AsyncStorage.getItem(ACCOUNT_GEM_WALLET_KEY);
  if (!stored) return null;
  try { return normalizeWallet(JSON.parse(stored)); }
  catch { return null; }
}

export async function saveAccountGemWallet(wallet: AccountGemWallet): Promise<void> {
  const normalized = normalizeWallet(wallet) ?? createAccountGemWallet();
  const queued = writeQueue.catch(() => undefined).then(() => AsyncStorage.setItem(ACCOUNT_GEM_WALLET_KEY, JSON.stringify(normalized)));
  writeQueue = queued.catch(() => undefined);
  return queued;
}

export async function getOrCreateAccountGemWallet(seed?: AccountGemWallet): Promise<AccountGemWallet> {
  await writeQueue.catch(() => undefined);
  const existing = await loadAccountGemWallet();
  if (existing) return existing;
  const wallet = seed ?? createAccountGemWallet();
  await saveAccountGemWallet(wallet);
  return wallet;
}
