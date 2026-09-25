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
  const materials = { ...guild.materials };
  for (const [materialId, amount] of Object.entries(effects.materials ?? {})) materials[materialId as keyof typeof materials] = (materials[materialId as keyof typeof materials] ?? 0) + (amount ?? 0);
  return {
    ...guild,
    world: resolveCampaignChoice(guild.world, choiceId),
    gold: guild.gold + (effects.gold ?? 0),
    reputation: guild.reputation + (effects.reputation ?? 0),
    rations: Math.max(0, guild.rations + (effects.rations ?? 0)),
    materials,
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


export function getGhorakChoiceEcho(state: WorldState): { title: string; detail: string } | null {
  if (state.worldFlags.ghorak_allied) return {
    title: "Ghorak's Oath Opens a Safer Deep Road",
    detail: state.worldFlags.ghorak_guide_unused
      ? "An orc pathfinder is waiting for one Iron Hills Idle Mission. That expedition receives +2 on its D20 check."
      : "The guild honored Ghorak's oath and already used the clan's pathfinder to guide an Iron Hills expedition.",
  };
  if (state.worldFlags.ghorak_imprisoned) return {
    title: "Stonegate Builds a Case",
    detail: "Ghorak's testimony is entered into the keepers' record. The interrogation accelerated Guildmaster progression and gives Stonegate a formal account of the forced excavation.",
  };
  if (state.worldFlags.ghorak_banished) return {
    title: "Flintwatch Reclaims the Liftworks",
    detail: "Ghorak's clan leaves the deep roads. Flintwatch recovers abandoned ore and forge fuel from the vacated stores for your guild workshops.",
  };
  return null;
}
