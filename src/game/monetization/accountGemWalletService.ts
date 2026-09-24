import AsyncStorage from "@react-native-async-storage/async-storage";
import type { GuildState } from "../guild/types";
import type { GemTransaction } from "./gemTypes";

const ACCOUNT_GEM_WALLET_KEY = "guildmaster.account.gems.v1";

export interface AccountGemWallet {
  gems: number;
  gemTransactions: GemTransaction[];
}

export async function loadAccountGemWallet(): Promise<AccountGemWallet | null> {
  const stored = await AsyncStorage.getItem(ACCOUNT_GEM_WALLET_KEY);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored) as Partial<AccountGemWallet>;
    if (!Number.isInteger(parsed.gems) || (parsed.gems ?? 0) < 0 || !Array.isArray(parsed.gemTransactions)) return null;
    return { gems: parsed.gems!, gemTransactions: parsed.gemTransactions };
  } catch {
    return null;
  }
}

let pendingWalletWrite: Promise<void> = Promise.resolve();
let pendingWalletInitialization: Promise<void> = Promise.resolve();

export function saveAccountGemWallet(wallet: AccountGemWallet): Promise<void> {
  const normalized: AccountGemWallet = {
    gems: Math.max(0, Math.floor(wallet.gems)),
    gemTransactions: [...wallet.gemTransactions],
  };
  const write = pendingWalletWrite.catch(() => undefined).then(() =>
    AsyncStorage.setItem(ACCOUNT_GEM_WALLET_KEY, JSON.stringify(normalized)),
  );
  pendingWalletWrite = write;
  return write;
}

export async function initializeAccountGemWallet(fallback: AccountGemWallet): Promise<AccountGemWallet> {
  let resolved: AccountGemWallet = fallback;
  const operation = pendingWalletInitialization.catch(() => undefined).then(async () => {
    const existing = await loadAccountGemWallet();
    if (existing) {
      resolved = existing;
      return;
    }
    await saveAccountGemWallet(fallback);
    resolved = fallback;
  });
  pendingWalletInitialization = operation;
  await operation;
  return resolved;
}

export function accountGemWalletFromGuild(guild: GuildState): AccountGemWallet {
  return { gems: guild.gems, gemTransactions: guild.gemTransactions };
}

export function applyAccountGemWallet(guild: GuildState, wallet: AccountGemWallet): GuildState {
  return { ...guild, gems: wallet.gems, gemTransactions: wallet.gemTransactions };
}
