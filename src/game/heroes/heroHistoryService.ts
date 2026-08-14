import { CONDITIONS } from "../../data/conditions/conditions";
import type { ConditionId, Hero, HeroHistory, HeroHistoryEvent, HeroHistoryEventOutcome, HeroHistoryEventType } from "./types";

export interface HeroHistoryEventInput {
  day: number;
  type: HeroHistoryEventType;
  outcome?: HeroHistoryEventOutcome;
  title: string;
  description: string;
  questId?: string;
  relatedHeroIds?: string[];
  tags?: string[];
}

export function createHeroHistory(): HeroHistory {
  return { questsCompleted: 0, enemiesDefeated: 0, achievements: [], importantEvents: [], events: [] };
}

function historyEventId(heroId: string, event: HeroHistoryEventInput, index: number): string {
  const subject = event.questId ?? event.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${heroId}:${event.day}:${event.type}:${subject}:${index}`;
}

export function appendHeroHistoryEvent(hero: Hero, input: HeroHistoryEventInput): Hero {
  const events = hero.history.events ?? [];
  const event: HeroHistoryEvent = {
    ...input,
    id: historyEventId(hero.id, input, events.length),
    outcome: input.outcome ?? "neutral",
  };
  return { ...hero, history: { ...hero.history, events: [...events, event] } };
}

export interface QuestHistoryInput {
  day: number;
  questId: string;
  questName: string;
  victory: boolean;
  xpEarned: number;
  fellInBattle: boolean;
  newlyInjured: boolean;
  injuryConditionId?: ConditionId;
  previousLevel: number;
}

export function recordQuestHistory(hero: Hero, input: QuestHistoryInput): Hero {
  const status = input.victory ? "Completed" : "Failed";
  const survival = input.fellInBattle ? " Fell in battle and was returned to the guild for revival." : input.newlyInjured ? " Returned with a serious injury." : " Returned safely.";
  let updated: Hero = {
    ...hero,
    history: {
      ...hero.history,
      questsCompleted: hero.history.questsCompleted + (input.victory ? 1 : 0),
    },
  };
  updated = appendHeroHistoryEvent(updated, {
    day: input.day,
    type: "quest",
    outcome: input.victory ? "positive" : "negative",
    title: `${status}: ${input.questName}`,
    description: `${input.victory ? "The guild completed the objective" : "The party was forced to withdraw"}.${survival}${input.xpEarned > 0 ? ` Earned ${input.xpEarned} XP.` : ""}`,
    questId: input.questId,
    tags: [input.victory ? "victory" : "defeat", input.fellInBattle ? "fallen" : input.newlyInjured ? "injured" : "survived"],
  });
  if (updated.level > input.previousLevel) {
    updated = appendHeroHistoryEvent(updated, {
      day: input.day,
      type: "level_up",
      outcome: "positive",
      title: `Reached Level ${updated.level}`,
      description: `${updated.name} advanced from Level ${input.previousLevel} to Level ${updated.level} after ${input.questName}.`,
      questId: input.questId,
    });
  }
  if (input.newlyInjured) {
    const injuryName = input.injuryConditionId ? CONDITIONS[input.injuryConditionId].name : "an injury";
    updated = appendHeroHistoryEvent(updated, {
      day: input.day,
      type: "injury",
      outcome: "negative",
      title: input.fellInBattle ? `Fell in battle: ${injuryName}` : `Suffered: ${injuryName}`,
      description: input.fellInBattle ? `${updated.name} was defeated during ${input.questName}, suffered ${injuryName}, and now requires the Temple.` : `${updated.name} returned from ${input.questName} with ${injuryName}.`,
      questId: input.questId,
    });
  }
  return updated;
}

export function migrateHeroHistory(history: Partial<HeroHistory> | undefined, heroId: string, fallbackDay = 1): HeroHistory {
  const events = [...(history?.events ?? [])];
  if (!events.length) {
    for (const [index, description] of (history?.importantEvents ?? []).entries()) {
      const parsedDay = /\bDay\s+(\d+)/i.exec(description)?.[1];
      events.push({
        id: `${heroId}:${parsedDay ?? fallbackDay}:campaign:legacy:${index}`,
        day: parsedDay ? Number(parsedDay) : fallbackDay,
        type: description.toLowerCase().includes("joined the guild") ? "recruitment" : description.toLowerCase().includes("training") || description.toLowerCase().includes("completed") ? "training" : "campaign",
        outcome: "neutral",
        title: description.split(" on Day")[0] ?? "Guild record",
        description,
        tags: ["legacy"],
      });
    }
  }
  return {
    questsCompleted: history?.questsCompleted ?? 0,
    enemiesDefeated: history?.enemiesDefeated ?? 0,
    achievements: history?.achievements ?? [],
    importantEvents: history?.importantEvents ?? [],
    events,
  };
}
