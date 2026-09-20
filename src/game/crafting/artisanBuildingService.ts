import { ARTISAN_BUILDINGS } from "../../data/crafting/artisans";
import type { GuildState } from "../guild/types";
import { hasGuildmasterSkill } from "../guildmaster/guildmasterProgression";
import type { ArtisanType } from "./craftingTypes";

export function getNextArtisanBuildingTier(guild: GuildState, artisanType: ArtisanType) {
  return ARTISAN_BUILDINGS[artisanType].find((tier) => tier.level === guild.artisans[artisanType].level + 1) ?? null;
}

export function startArtisanConstruction(guild: GuildState, artisanType: ArtisanType): GuildState {
  const state = guild.artisans[artisanType];
  if (state.construction) throw new Error("This workshop already has an active construction project");
  const tier = getNextArtisanBuildingTier(guild, artisanType);
  if (!tier) throw new Error("Workshop is already at maximum level");
  if (!hasGuildmasterSkill(guild.guildmaster, tier.requiredSkillId)) throw new Error("Required Guildmaster skill is not unlocked");
  if (guild.gold < tier.goldCost) throw new Error("Not enough gold");
  return {
    ...guild,
    gold: guild.gold - tier.goldCost,
    artisans: {
      ...guild.artisans,
      [artisanType]: { ...state, construction: { targetLevel: tier.level, startDay: guild.currentDay, completionDay: guild.currentDay + tier.durationDays, goldCost: tier.goldCost } },
    },
  };
}

export function completeArtisanConstructions(guild: GuildState): GuildState {
  let changed = false;
  const artisans = { ...guild.artisans };
  for (const artisanType of Object.keys(artisans) as ArtisanType[]) {
    const state = artisans[artisanType];
    if (!state.construction || guild.currentDay < state.construction.completionDay) continue;
    artisans[artisanType] = { level: state.construction.targetLevel, recruited: true, construction: null };
    changed = true;
  }
  return changed ? { ...guild, artisans } : guild;
}
