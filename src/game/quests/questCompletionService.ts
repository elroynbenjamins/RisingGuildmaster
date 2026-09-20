import type { GuildState } from "../guild/types";

/** Includes repeatable quests, whose victories live in the chronicle rather than completedQuestIds. */
export function hasCompletedQuestOnce(guild: GuildState, questId: string): boolean {
  return guild.world.completedQuestIds.includes(questId)
    || guild.questChronicle.some((entry) => entry.questId === questId && entry.status === "victory");
}
