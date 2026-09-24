import type { GuidedTourProgress } from './guidedTourService';
export type TutorialStep = "welcome" | "inspect_candidate" | "recruit_first" | "refresh_board" | "recruit_second" | "party_complete" | "complete";
export type TutorialCandidateTab = "Overview" | "Stats" | "Traits" | "Contract";

export type ContextualTutorialId = "campaign_travel" | "combat_basics" | "idle_missions" | "roguelite_expeditions" | "regional_threats";

export interface TutorialState {
  active: boolean;
  completed: boolean;
  step: TutorialStep;
  freeRefreshUsed: boolean;
  contextualSeen: Partial<Record<ContextualTutorialId, boolean>>;
  inspectedCandidateId: string | null;
  inspectedCandidateTabs: TutorialCandidateTab[];
  /** Optional so older saves do not unexpectedly start the new tours. */
  guided?: GuidedTourProgress;
}
export const createTutorialState = (): TutorialState => ({ active:true, completed:false, step: "welcome", freeRefreshUsed:false, contextualSeen:{}, inspectedCandidateId:null, inspectedCandidateTabs:[] });
