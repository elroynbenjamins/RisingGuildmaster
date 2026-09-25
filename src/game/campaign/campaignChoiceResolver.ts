import { CAMPAIGN_CHOICES } from "../../data/campaign/campaignChoices";
import type { GuildState } from "../guild/types";
import { grantGuildmasterXp } from "../guildmaster/guildmasterProgression";
import type { WorldState } from "../world/worldTypes";

export function resolveCampaignChoice(state: WorldState, choiceId: string): WorldState {
  const choice = CAMPAIGN_CHOICES[choiceId];
  if (!choice) throw new Error("Unknown campaign choice");
  const worldFlags = { ...state.worldFlags };
  for (const flag of choice.mutuallyExclusiveFlagIds ?? []) worldFlags[flag] = false;
  Object.assign(worldFlags, choice.setWorldFlags);
  return { ...state, worldFlags };
}

export function applyCampaignChoiceToGuild(guild: GuildState, choiceId: string): GuildState {
  const choice = CAMPAIGN_CHOICES[choiceId];
  if (!choice) throw new Error("Unknown campaign choice");
  const effects = choice.guildEffects ?? {};
  return {
    ...guild,
    world: resolveCampaignChoice(guild.world, choiceId),
    gold: guild.gold + (effects.gold ?? 0),
    reputation: guild.reputation + (effects.reputation ?? 0),
    rations: Math.max(0, guild.rations + (effects.rations ?? 0)),
    guildmaster: effects.guildmasterXp
      ? grantGuildmasterXp(guild.guildmaster, effects.guildmasterXp)
      : guild.guildmaster,
  };
}

export function getChieftainChoiceEcho(state: WorldState): { title: string; detail: string } | null {
  if (state.worldFlags.chieftain_spared) return {
    title: "Mercy Returned as Testimony",
    detail: "A goblin messenger reaches Stonegate with the spared Chieftain's sworn account: Laurel-marked agents supplied iron, coin, and orders to excavate the Wardstone.",
  };
  if (state.worldFlags.chieftain_killed) return {
    title: "The War Chest Speaks Instead",
    detail: "With the Chieftain dead, guild scribes work from seized command ledgers and a Laurel-marked payment token recovered from his war chest.",
  };
  if (state.worldFlags.chieftain_imprisoned) return {
    title: "Interrogation Notes Reach Stonegate",
    detail: "The imprisoned Chieftain gives names, routes, and a five-serpent sketch under questioning. Stonegate receives a controlled transcript rather than a public witness.",
  };
  return null;
}
