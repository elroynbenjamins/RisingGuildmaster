import type { QuestDefinition } from "../game/quests/questTypes";
export type QuestTab = "Contracts" | "Side Quests" | "Campaign" | "Bosses";
export function filterQuests(quests: QuestDefinition[], tab: QuestTab, completedIds: string[] = []): QuestDefinition[] { const type = tab === "Contracts" ? "contract" : tab === "Side Quests" ? "side" : tab === "Campaign" ? "campaign" : "boss"; return quests.filter((quest) => quest.questType === type && (quest.repeatable || !completedIds.includes(quest.id))); }
