import type { GameDialogOptions } from "../../components/dialogs/GameDialog";
import type { GuildState } from "../guild/types";
import { showDayMilestoneRewardedInterstitial } from "./admobRewardedAdProvider";
import { pendingDayMilestone, recordDayMilestoneAd } from "./dayMilestoneAdService";
import { creditVerifiedGems } from "./gemService";

type ShowDialog = (options: GameDialogOptions) => void;

export function presentPendingDayMilestoneAd(guild: GuildState, updateGuild: (next: GuildState) => void, showDialog: ShowDialog, getCurrentGuild: () => GuildState = () => guild): boolean {
  const milestone = pendingDayMilestone(guild);
  if (milestone === null) return false;
  showDialog({
    eyebrow: `DAY ${milestone} MILESTONE`,
    title: "A Message from the Guild Scribes",
    message: "Thank you for playing Guildmaster. Watch this short message to support the developer and receive 5 gems as our thanks.",
    actions: [
      { label: "Watch · +5 Gems", tone: "primary", onPress: () => {
        void showDayMilestoneRewardedInterstitial().then((credit) => {
          const current = getCurrentGuild();
          if (current.viewedAdMilestoneDays.includes(milestone)) return;
          const recorded = recordDayMilestoneAd(current, milestone);
          updateGuild(creditVerifiedGems(recorded, credit));
          showDialog({ eyebrow: "THANK YOU, GUILDMASTER", title: "+5 Gems Received", message: "Thank you for playing Guildmaster, watching the message, and supporting the developer. As thanks, 5 gems have been added to your treasury.", tone: "success" });
        }).catch((error: unknown) => {
          showDialog({ title: "Message Unavailable", message: error instanceof Error ? error.message : "The milestone message could not be shown. Please try again shortly.", tone: "danger" });
        });
      } },
    ],
  });
  return true;
}
