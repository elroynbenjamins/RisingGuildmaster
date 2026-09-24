import AsyncStorage from "@react-native-async-storage/async-storage";
import type { GuildState } from "../guild/types";
import type { GemTransaction } from "./gemTypes";

const ACCOUNT_GEM_WALLET_KEY = "guildmaster.account.gem-wallet.v1";

export interface AccountGemWallet {
  gems: number;
  transactions: GemTransaction[];
}

function normalizeWallet(value: Partial<AccountGemWallet> | null | undefined): AccountGemWallet | null {
  if (!value || !Number.isFinite(value.gems)) return null;
  return {
    gems: Math.max(0, Math.floor(value.gems ?? 0)),
    transactions: Array.isArray(value.transactions) ? value.transactions : [],
  };
}

/** Account-wide gem balance. Save slots only keep a compatibility snapshot. */
export async function loadAccountGemWallet(): Promise<AccountGemWallet | null> {
  const stored = await AsyncStorage.getItem(ACCOUNT_GEM_WALLET_KEY);
  if (!stored) return null;
  try {
    return normalizeWallet(JSON.parse(stored) as Partial<AccountGemWallet>);
  } catch {
    return null;
  }
}

let pendingWrite: Promise<void> = Promise.resolve();

export function saveAccountGemWallet(wallet: AccountGemWallet): Promise<void> {
  const normalized = normalizeWallet(wallet);
  if (!normalized) return Promise.reject(new Error("Invalid account gem wallet"));
  const write = pendingWrite.catch(() => undefined).then(() =>
    AsyncStorage.setItem(ACCOUNT_GEM_WALLET_KEY, JSON.stringify(normalized)),
  );
  pendingWrite = write;
  return write;
}

export function applyAccountGemWallet(guild: GuildState, wallet: AccountGemWallet | null): GuildState {
  if (!wallet) return guild;
  return { ...guild, gems: wallet.gems, gemTransactions: wallet.transactions };
}

export function gemWalletFromGuild(guild: GuildState): AccountGemWallet {
  return { gems: guild.gems, transactions: guild.gemTransactions };
}
