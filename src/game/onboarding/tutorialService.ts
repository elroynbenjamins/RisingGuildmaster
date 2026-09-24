import type { GuildState } from "../guild/types";
import type { ContextualTutorialId } from "./onboardingTypes";
import type { TutorialCandidateTab } from "./onboardingTypes";
import { advanceCombatTutorial, type CombatTutorialAction, type CombatTutorialStep } from "./combatTutorialService";

const hasCoreCandidateReview = (tabs: readonly TutorialCandidateTab[]): boolean => tabs.includes("Overview") && (tabs.includes("Stats") || tabs.includes("Traits"));

export type TutorialResumeDestination = "recruitment" | null;
export function getTutorialResumeDestination(guild: GuildState): TutorialResumeDestination {
  if (!guild.tutorial.active || guild.tutorial.step === "welcome" || guild.tutorial.step === "complete") return null;
  return "recruitment";
}

export function beginTutorial(guild: GuildState): GuildState { return { ...guild, tutorial: { ...guild.tutorial, active: true, step: "inspect_candidate", inspectedCandidateId: null, inspectedCandidateTabs: [] } }; }
export function completeTutorial(guild: GuildState): GuildState { return { ...guild, tutorial: { ...guild.tutorial, active: false, completed: true, step: "complete" } }; }
export function skipTutorial(guild: GuildState): GuildState { return completeTutorial(guild); }
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
export function getCombatTutorialStep(guild: GuildState): CombatTutorialStep {
  return guild.tutorial.contextualSeen?.combat_basics === true ? "complete" : (guild.tutorial.combatStep ?? "move");
}
export function recordCombatTutorialAction(guild: GuildState, action: CombatTutorialAction): GuildState {
  const current = getCombatTutorialStep(guild);
  if (current === "complete") return guild;
  const combatStep = advanceCombatTutorial(current, action);
  return { ...guild, tutorial: { ...guild.tutorial, combatStep, contextualSeen: combatStep === "complete" ? { ...(guild.tutorial.contextualSeen ?? {}), combat_basics: true } : guild.tutorial.contextualSeen } };
}

export function hasSeenContextualTutorial(guild: GuildState, id: ContextualTutorialId): boolean { return guild.tutorial.contextualSeen?.[id] === true; }
export function markContextualTutorialSeen(guild: GuildState, id: ContextualTutorialId): GuildState {
  if (hasSeenContextualTutorial(guild, id)) return guild;
  return { ...guild, tutorial: { ...guild.tutorial, contextualSeen: { ...(guild.tutorial.contextualSeen ?? {}), [id]: true } } };
}
