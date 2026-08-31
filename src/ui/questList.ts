import type { QuestDefinition } from "../game/quests/questTypes";
export type QuestTab = "Contracts" | "Side Quests" | "Campaign" | "Bosses";
export function filterQuests(quests: QuestDefinition[], tab: QuestTab, completedIds: string[] = []): QuestDefinition[] { const type = tab === "Contracts" ? "contract" : tab === "Side Quests" ? "side" : tab === "Campaign" ? "campaign" : "boss"; return quests.filter((quest) => quest.questType === type && (quest.repeatable || !completedIds.includes(quest.id))); }
export type QuestReadiness = "READY" | "DANGER" | "ROUTINE";
export function getQuestReadiness(quest: QuestDefinition, fieldLevel: number): QuestReadiness {
  if (fieldLevel < (quest.recommendedLevelMin ?? 1)) return "DANGER";
  if (fieldLevel > (quest.recommendedLevelMax ?? quest.recommendedLevelMin ?? 1) + 2) return "ROUTINE";
  return "READY";
}
export function sortQuestsForRoster(quests: QuestDefinition[], fieldLevel: number): QuestDefinition[] {
  const rank: Record<QuestReadiness, number> = { READY: 0, ROUTINE: 1, DANGER: 2 };
  return [...quests].sort((a, b) => rank[getQuestReadiness(a, fieldLevel)] - rank[getQuestReadiness(b, fieldLevel)] || (a.recommendedLevelMin ?? 1) - (b.recommendedLevelMin ?? 1) || a.difficulty - b.difficulty || a.name.localeCompare(b.name));
}
