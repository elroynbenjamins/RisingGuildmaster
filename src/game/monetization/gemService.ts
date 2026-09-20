import type { GuildState } from "../guild/types";
import type { GemTransaction, VerifiedGemCredit } from "./gemTypes";
import { GAME_CONFIG } from "../../config/gameConfig";

export function creditVerifiedGems(guild: GuildState, credit: VerifiedGemCredit): GuildState {
  if (!credit.verified) throw new Error("Gem reward could not be verified");
  if (!Number.isInteger(credit.gems) || credit.gems <= 0) throw new Error("Gem reward must be a positive whole number");
  if (!credit.transactionId.trim()) throw new Error("Gem transaction ID is required");
  if (guild.gemTransactions.some((item) => item.id === credit.transactionId)) return guild;
  const transaction: GemTransaction = { id: credit.transactionId, type: credit.source, amount: credit.gems, day: guild.currentDay, note: credit.note ?? "Gem credit" };
  return { ...guild, gems: guild.gems + credit.gems, gemTransactions: [...guild.gemTransactions, transaction] };
}

export function exchangeGemsForGold(guild: GuildState, gems: number): GuildState {
  if (!Number.isInteger(gems) || gems < 1) throw new Error("Choose at least one gem");
  if (guild.gems < gems) throw new Error("Not enough gems");
  const gold = gems * GAME_CONFIG.goldPerGem;
  const transaction: GemTransaction = { id: `gold-exchange-${guild.currentDay}-${guild.gemTransactions.length}`, type: "gold_exchange", amount: -gems, day: guild.currentDay, note: `Exchanged ${gems} gem${gems === 1 ? "" : "s"} for ${gold} gold` };
  return { ...guild, gems: guild.gems - gems, gold: guild.gold + gold, gemTransactions: [...guild.gemTransactions, transaction] };
}
