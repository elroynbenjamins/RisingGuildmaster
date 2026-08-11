import type { GuildState } from "../guild/types";
import type { GemTransaction, VerifiedGemCredit } from "./gemTypes";

export function creditVerifiedGems(guild: GuildState, credit: VerifiedGemCredit): GuildState {
  if (!credit.verified) throw new Error("Gem reward could not be verified");
  if (!Number.isInteger(credit.gems) || credit.gems <= 0) throw new Error("Gem reward must be a positive whole number");
  if (!credit.transactionId.trim()) throw new Error("Gem transaction ID is required");
  if (guild.gemTransactions.some((item) => item.id === credit.transactionId)) return guild;
  const transaction: GemTransaction = { id: credit.transactionId, type: credit.source, amount: credit.gems, day: guild.currentDay, note: credit.note ?? "Gem credit" };
  return { ...guild, gems: guild.gems + credit.gems, gemTransactions: [...guild.gemTransactions, transaction] };
}
