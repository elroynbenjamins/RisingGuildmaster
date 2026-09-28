import type { GuildState } from "../guild/types";

export type GuidedScreenId = "guild_management" | "temple" | "crafting";

export const GUIDED_SCREEN_FLAGS: Record<GuidedScreenId, string> = {
  guild_management: "guided_screen_guild_management_seen",
  temple: "guided_screen_temple_seen",
  crafting: "guided_screen_crafting_seen",
};

export function isGuidedOnboardingPlayer(guild: GuildState): boolean {
  return guild.tutorial.completed && guild.tutorial.freeRefreshUsed && guild.tutorial.guided?.enabled === true;
}

export function shouldShowGuidedScreenTip(guild: GuildState, id: GuidedScreenId): boolean {
  return isGuidedOnboardingPlayer(guild) && guild.world.worldFlags[GUIDED_SCREEN_FLAGS[id]] !== true;
}

export function markGuidedScreenTipSeen(guild: GuildState, id: GuidedScreenId): GuildState {
  const flag = GUIDED_SCREEN_FLAGS[id];
  if (guild.world.worldFlags[flag] === true) return guild;
  return {
    ...guild,
    world: {
      ...guild.world,
      worldFlags: {
        ...guild.world.worldFlags,
        [flag]: true,
      },
    },
  };
}
