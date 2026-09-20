import { CAMPAIGN_CHOICES } from "../../data/campaign/campaignChoices";
import type { WorldState } from "../world/worldTypes";
export function resolveCampaignChoice(state: WorldState, choiceId: string): WorldState { const choice = CAMPAIGN_CHOICES[choiceId]; if (!choice) throw new Error("Unknown campaign choice"); const worldFlags = { ...state.worldFlags }; for (const flag of choice.mutuallyExclusiveFlagIds ?? []) worldFlags[flag] = false; Object.assign(worldFlags, choice.setWorldFlags); return { ...state, worldFlags }; }
