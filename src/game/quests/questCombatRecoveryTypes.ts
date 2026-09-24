import type { CombatState } from "../combat/combatEngine";
import type { QuestCombatSetup } from "../combat/combatTypes";
import type { Party } from "../party/partyTypes";

export interface ActiveQuestCombatRecovery {
  questId: string;
  party: Party;
  campaignNodeId?: string;
  combatSetup?: QuestCombatSetup;
  randomState: number;
  state: CombatState | null;
}
