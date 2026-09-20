import { GAME_CONFIG } from "../../config/gameConfig";
import type { GuildState } from "../guild/types";
import type { QuestDefinition } from "../quests/questTypes";

export function getQuestAdventureStaminaCost(quest: QuestDefinition): number {
  return quest.questType === "boss" ? 60 : quest.questType === "side" ? 55 : quest.questType === "campaign" ? 45 : GAME_CONFIG.standardQuestStaminaCost;
}

export function spendPartyAdventureStamina(guild: GuildState, heroIds: readonly string[], quest: QuestDefinition): GuildState {
  const cost = getQuestAdventureStaminaCost(quest);
  const party = guild.heroes.filter((hero) => heroIds.includes(hero.id));
  if (party.length !== new Set(heroIds).size) throw new Error("Party contains an unknown hero");
  const tired = party.find((hero) => hero.adventureStamina < cost);
  if (tired) throw new Error(`${tired.name} needs ${cost} readiness stamina for this quest`);
  return { ...guild, heroes: guild.heroes.map((hero) => heroIds.includes(hero.id) ? { ...hero, adventureStamina: hero.adventureStamina - cost } : hero) };
}

export function recoverAdventureStamina(guild: GuildState): GuildState {
  return { ...guild, heroes: guild.heroes.map((hero) => ({ ...hero, adventureStamina: Math.min(GAME_CONFIG.maxAdventureStamina, hero.adventureStamina + GAME_CONFIG.adventureStaminaRecoveryPerDay) })) };
}
