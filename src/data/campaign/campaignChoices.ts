import type { CampaignChoiceDefinition } from "../../game/campaign/campaignTypes";
const chieftainFlags = ["chieftain_spared", "chieftain_killed", "chieftain_imprisoned"];
export const CAMPAIGN_CHOICES: Record<string, CampaignChoiceDefinition> = {
  track_carefully: { id: "track_carefully", text: "Follow the tracks carefully", setWorldFlags: { tracks_followed_carefully: true } },
  track_quickly: { id: "track_quickly", text: "Press ahead before the trail cools", setWorldFlags: { tracks_followed_quickly: true } },
  spare_chieftain: { id: "spare_chieftain", text: "Spare the Chieftain", setWorldFlags: { chieftain_spared: true }, mutuallyExclusiveFlagIds: chieftainFlags },
  execute_chieftain: { id: "execute_chieftain", text: "Execute the Chieftain", setWorldFlags: { chieftain_killed: true }, mutuallyExclusiveFlagIds: chieftainFlags },
  imprison_chieftain: { id: "imprison_chieftain", text: "Imprison the Chieftain", setWorldFlags: { chieftain_imprisoned: true }, mutuallyExclusiveFlagIds: chieftainFlags },
};
