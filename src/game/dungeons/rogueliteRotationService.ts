import { DUNGEONS } from "../../data/dungeons/dungeons";
import type { RandomSource } from "../../utils/random";
import type { GuildState } from "../guild/types";

export const isChapterOneComplete = (guild: GuildState): boolean => guild.world.completedCampaignNodeIds.includes("broken_wardstone");

export function generateRogueliteThemeOffers(guild: GuildState, random: RandomSource): GuildState {
  if (!isChapterOneComplete(guild)) throw new Error("Complete Chapter 1 to unlock Roguelite Expeditions");
  if (guild.currentDay < guild.rogueliteRotation.cooldownUntilDay) throw new Error(`Roguelite Expeditions recover on Day ${guild.rogueliteRotation.cooldownUntilDay}`);
  if (guild.rogueliteRotation.offeredDungeonIds.length) return guild;
  const pool = Object.keys(DUNGEONS); const offeredDungeonIds: string[] = [];
  while (offeredDungeonIds.length < Math.min(3, pool.length)) offeredDungeonIds.push(pool.splice(Math.floor(random.next() * pool.length), 1)[0]!);
  return { ...guild, rogueliteRotation: { ...guild.rogueliteRotation, offeredDungeonIds } };
}
