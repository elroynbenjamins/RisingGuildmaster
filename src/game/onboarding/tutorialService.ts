import type { GuildState } from "../guild/types";
import type { ContextualTutorialId } from "./onboardingTypes";

export function beginTutorial(guild: GuildState): GuildState { return { ...guild, tutorial: { ...guild.tutorial, active: true, step: "recruit_first" } }; }
export function skipTutorial(guild: GuildState): GuildState { return { ...guild, tutorial: { ...guild.tutorial, active: false, completed: true, step: "complete" } }; }
export function recordTutorialRecruit(guild: GuildState): GuildState {
  if (!guild.tutorial.active) return guild;
  if (guild.heroes.length >= 2) return skipTutorial(guild);
  if (guild.heroes.length === 1) return { ...guild, tutorial: { ...guild.tutorial, step: "refresh_board" } };
  return guild;
}
export function recordTutorialRefresh(guild: GuildState): GuildState {
  if (!guild.tutorial.active || guild.tutorial.step !== "refresh_board") return guild;
  return { ...guild, tutorial: { ...guild.tutorial, step: "recruit_second", freeRefreshUsed: true } };
}
export function hasSeenContextualTutorial(guild: GuildState, id: ContextualTutorialId): boolean { return guild.tutorial.contextualSeen?.[id] === true; }
export function markContextualTutorialSeen(guild: GuildState, id: ContextualTutorialId): GuildState {
  if (hasSeenContextualTutorial(guild, id)) return guild;
  return { ...guild, tutorial: { ...guild.tutorial, contextualSeen: { ...(guild.tutorial.contextualSeen ?? {}), [id]: true } } };
}
