import type { GuildState } from "../guild/types";
import type { ContextualTutorialId } from "./onboardingTypes";
import type { TutorialCandidateTab } from "./onboardingTypes";
import { createGuidedTourProgress, normalizeGuidedTourProgress, reduceGuidedTour } from './guidedTourService';

const hasCoreCandidateReview = (tabs: readonly TutorialCandidateTab[]): boolean => tabs.includes("Overview") && (tabs.includes("Stats") || tabs.includes("Traits"));

export function beginTutorial(guild: GuildState): GuildState { return { ...guild, tutorial: { ...guild.tutorial, active: true, step: "inspect_candidate", inspectedCandidateId: null, inspectedCandidateTabs: [], guided: guild.tutorial.guided ?? createGuidedTourProgress() } }; }
export function completeTutorial(guild: GuildState): GuildState { return { ...guild, tutorial: { ...guild.tutorial, active: false, completed: true, step: "complete" } }; }
export function skipTutorial(guild: GuildState): GuildState { const completed = completeTutorial(guild); return { ...completed, tutorial: { ...completed.tutorial, guided: reduceGuidedTour(normalizeGuidedTourProgress(guild.tutorial.guided), { type: 'pause' }) } }; }
export function recordTutorialCandidateTab(guild: GuildState, candidateId: string, tab: TutorialCandidateTab): GuildState {
  if (!guild.tutorial.active || guild.tutorial.step !== "inspect_candidate") return guild;
  const sameCandidate = guild.tutorial.inspectedCandidateId === candidateId || guild.tutorial.inspectedCandidateId === null;
  const visited = sameCandidate ? guild.tutorial.inspectedCandidateTabs : [];
  const inspectedCandidateTabs = [...new Set([...visited, tab])];
  return { ...guild, tutorial: { ...guild.tutorial, inspectedCandidateId: candidateId, inspectedCandidateTabs, step: hasCoreCandidateReview(inspectedCandidateTabs) ? "recruit_first" : "inspect_candidate" } };
}
export function recordTutorialRecruit(guild: GuildState): GuildState {
  if (!guild.tutorial.active) return guild;
  if (guild.heroes.length >= 2) return { ...guild, tutorial: { ...guild.tutorial, step: "party_complete" } };
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
