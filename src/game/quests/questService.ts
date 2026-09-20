import { QUESTS } from "../../data/quests/quests";
import type { RandomSource } from "../../utils/random";
import type { Party } from "../party/partyTypes";
import type { ActiveQuest, QuestDefinition } from "./questTypes";
export function startQuest(definition: QuestDefinition, party: Party): ActiveQuest {
  if (party.heroIds.length < definition.minPartySize || party.heroIds.length > definition.maxPartySize) throw new Error("Party size does not meet quest requirements");
  return { questDefinitionId: definition.id, partyId: party.id, currentEncounterIndex: 0, status: "active", goldEarned: 0, xpEarnedPerHero: 0, collectedLootIds: [], collectedMaterials: {} };
}
export function getQuestDefinition(id: string): QuestDefinition { const quest = QUESTS[id]; if (!quest) throw new Error(`Unknown quest: ${id}`); return quest; }
export function rollQuestGold(quest: QuestDefinition, random: RandomSource): number { return random.int(quest.goldRewardMin, quest.goldRewardMax); }
