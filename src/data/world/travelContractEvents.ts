import { QUESTS } from "../quests/quests";
import type { QuestDefinition } from "../../game/quests/questTypes";
import type { TravelEventTier, WorldEventDefinition } from "../../game/world/worldTypes";

function tierForQuest(quest: QuestDefinition): TravelEventTier {
  if (quest.difficulty >= 7) return "rare";
  if (quest.difficulty >= 4) return "uncommon";
  return "common";
}

export function getTravelContractEvents(regionId: string, tier?: TravelEventTier): WorldEventDefinition[] {
  return Object.values(QUESTS)
    .filter((quest) => quest.questType === "contract" && !quest.hiddenFromQuestBoard && quest.regionId === regionId)
    .filter((quest) => !tier || tierForQuest(quest) === tier)
    .map((quest) => ({
      id: `road_opportunity_${quest.id}`,
      title: quest.name,
      description: quest.description ?? `Your party discovers signs of trouble while travelling through ${regionId.replace(/_/g, " ")}. This job exists only as a road encounter.`,
      weight: 2,
      tier: tierForQuest(quest),
      regionIds: [quest.regionId],
      choices: [
        {
          id: `accept_${quest.id}`,
          text: `Investigate · Level ${quest.recommendedLevelMin ?? quest.difficulty}–${quest.recommendedLevelMax ?? quest.difficulty} · Party ${quest.minPartySize}–${quest.maxPartySize}`,
          successOutcomes: [{ type: "none" }],
          questId: quest.id,
        },
        { id: `leave_${quest.id}`, text: "Continue the journey", successOutcomes: [{ type: "none" }] },
      ],
    }));
}
