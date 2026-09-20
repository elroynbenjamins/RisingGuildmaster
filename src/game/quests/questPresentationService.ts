import { NPC_PORTRAITS } from "../../data/characters/npcPortraits";
import { getQuestDialogue } from "../../data/quests/questDialogue";
import { QUESTS } from "../../data/quests/quests";
import type { GuildState } from "../guild/types";
import type { QuestDefinition, QuestType } from "./questTypes";

export interface QuestTypePresentation {
  badge: string;
  heading: string;
  summary: string;
  completionNote: string;
}

const PRESENTATION: Record<QuestType, QuestTypePresentation> = {
  campaign: {
    badge: "MAIN STORY",
    heading: "Campaign Mission",
    summary: "Advances Eldoria's main story, chapter progression, and world state.",
    completionNote: "The outcome becomes part of the campaign record.",
  },
  side: {
    badge: "LOCAL STORY",
    heading: "Side Quest",
    summary: "A one-time optional story tied to a place, person, or regional problem.",
    completionNote: "Optional, but its people and discoveries can echo into later stories.",
  },
  contract: {
    badge: "GUILD WORK",
    heading: "Contract",
    summary: "Repeatable professional work that builds the guild through practical field experience.",
    completionNote: "Designed as repeatable guild work rather than a major story chapter.",
  },
  boss: {
    badge: "MAJOR THREAT",
    heading: "Boss Mission",
    summary: "A named enemy or decisive confrontation with higher tactical stakes.",
    completionNote: "Expect a defining encounter and a larger story consequence.",
  },
};

export interface ReturningQuestContact {
  speaker: string;
  portraitId: string;
  role: string;
  previousQuestId: string;
  previousQuestName: string;
}

export interface QuestContinuity {
  previousBeat?: {
    questId: string;
    questName: string;
    aftermath: string;
    status: "victory" | "defeat";
    day: number;
  };
  returningContacts: ReturningQuestContact[];
}

export function getQuestTypePresentation(quest: Pick<QuestDefinition, "questType">): QuestTypePresentation {
  return PRESENTATION[quest.questType];
}

function portraitIdsForQuest(questId: string): string[] {
  const dialogue = getQuestDialogue(questId);
  return [...new Set([...dialogue.briefing, ...dialogue.victory, ...dialogue.defeat].flatMap((line) => line.portraitId ? [line.portraitId] : []))];
}

function findPreviousBeat(guild: GuildState, quest: QuestDefinition): QuestContinuity["previousBeat"] {
  const prior = [...guild.questChronicle].reverse().find((entry) => {
    if (entry.questId === quest.id) return false;
    const previousQuest = QUESTS[entry.questId];
    if (!previousQuest) return false;
    if (quest.storyArcId) return previousQuest.storyArcId === quest.storyArcId;
    if (quest.questType === "campaign" || quest.questType === "boss") return previousQuest.questType === "campaign" || previousQuest.questType === "boss";
    return previousQuest.regionId === quest.regionId && previousQuest.questType === "side";
  });
  return prior ? { questId: prior.questId, questName: prior.questName, aftermath: prior.aftermath, status: prior.status, day: prior.day } : undefined;
}

export function getQuestContinuity(guild: GuildState, questId: string): QuestContinuity {
  const quest = QUESTS[questId];
  if (!quest) return { returningContacts: [] };
  const currentDialogue = getQuestDialogue(questId);
  const currentContacts = [...new Map(
    [...currentDialogue.briefing, ...currentDialogue.victory, ...currentDialogue.defeat]
      .filter((line): line is typeof line & { portraitId: string } => Boolean(line.portraitId))
      .map((line) => [line.portraitId, { speaker: line.speaker, portraitId: line.portraitId }]),
  ).values()];

  const returningContacts: ReturningQuestContact[] = [];
  for (const contact of currentContacts) {
    const previous = [...guild.questChronicle].reverse().find((entry) =>
      entry.questId !== questId && portraitIdsForQuest(entry.questId).includes(contact.portraitId));
    if (!previous) continue;
    returningContacts.push({
      ...contact,
      role: NPC_PORTRAITS[contact.portraitId]?.role ?? "Story contact",
      previousQuestId: previous.questId,
      previousQuestName: previous.questName,
    });
  }

  return { previousBeat: findPreviousBeat(guild, quest), returningContacts };
}
