import { QUEST_OUTCOME_CONSEQUENCES } from "../../data/quests/questOutcomeConsequences";
import { QUEST_OUTCOME_NARRATIVES } from "../../data/quests/questOutcomeNarratives";
import { LORE_ENTRIES } from "../../data/world/lore";
import type { GuildState } from "../guild/types";
import { appendHeroHistoryEvent } from "../heroes/heroHistoryService";
import type { WorldState } from "../world/worldTypes";
import type { QuestChronicleEntry, QuestConsequenceRecord, QuestHeroMoment, QuestHeroOutcomeRecord, QuestLoreRecord, QuestRelationshipChange } from "./questChronicleTypes";
import type { QuestDefinition } from "./questTypes";

function sentenceFromId(id: string): string { const text = id.replace(/_/g, " "); return text.charAt(0).toUpperCase() + text.slice(1) + "."; }
function changedTrueFlags(before: WorldState, after: WorldState): string[] { return Object.keys(after.worldFlags).filter((flag) => after.worldFlags[flag] === true && before.worldFlags[flag] !== true); }

function buildConsequences(quest: QuestDefinition, status: "victory" | "defeat", before: WorldState, after: WorldState, outcomes: readonly QuestHeroOutcomeRecord[]): QuestConsequenceRecord[] {
  const authored = QUEST_OUTCOME_CONSEQUENCES[quest.id]?.[status] ?? [];
  const records: QuestConsequenceRecord[] = authored.map((text, index) => ({ id: `authored-${index}`, text, tone: status === "victory" ? "positive" : "negative" }));
  if (status === "victory" && !before.completedQuestIds.includes(quest.id) && after.completedQuestIds.includes(quest.id)) records.push({ id: "quest-completed", text: "This quest is now permanently recorded as completed.", tone: "positive" });
  for (const flag of changedTrueFlags(before, after).filter((flag) => !flag.startsWith("lore_"))) records.push({ id: `flag-${flag}`, text: `World state changed: ${sentenceFromId(flag)}`, tone: "neutral" });
  const fallen = outcomes.filter((hero) => hero.fellInBattle).length;
  if (fallen > 0) records.push({ id: "fallen-heroes", text: `${fallen} hero${fallen === 1 ? "" : "es"} fell in battle and now require Temple revival.`, tone: "negative" });
  if (!records.length) records.push({ id: "quest-open", text: status === "victory" ? "The contract is fulfilled and entered into the guild ledger." : "The objective remains unresolved and may be attempted again.", tone: status === "victory" ? "positive" : "negative" });
  return records;
}

function buildLore(quest: QuestDefinition, status: "victory" | "defeat", before: WorldState, after: WorldState): QuestLoreRecord[] {
  if (status !== "victory") return [];
  const discovered: QuestLoreRecord[] = Object.values(LORE_ENTRIES).filter((entry) => before.worldFlags[entry.unlockFlag] !== true && after.worldFlags[entry.unlockFlag] === true).map((entry) => ({ id: entry.id, title: entry.title, category: entry.category, text: entry.text, perspectives: entry.perspectives }));
  const journal = QUEST_OUTCOME_NARRATIVES[quest.id]?.journalUpdate;
  if (journal && !discovered.some((entry) => entry.text === journal)) discovered.unshift({ id: `field-note-${quest.id}`, title: `Field Note: ${quest.name}`, category: "quest", text: journal });
  return discovered;
}

function momentForHero(hero: QuestHeroOutcomeRecord, questName: string, status: "victory" | "defeat"): QuestHeroMoment {
  const portrait = { heroId: hero.heroId, name: hero.name, raceId: hero.raceId, classId: hero.classId, gender: hero.gender, portraitVariant: hero.portraitVariant };
  if (hero.fellInBattle) return { ...portrait, title: "Fell in the line of duty", description: `${hero.name} was brought home after falling during ${questName}.`, tone: "negative" };
  if (hero.levelAfter > hero.levelBefore) return { ...portrait, title: `Rose to Level ${hero.levelAfter}`, description: `${hero.name}'s deeds during ${questName} marked a new step in their career.`, tone: "positive" };
  if (hero.newlyInjured) return { ...portrait, title: "Carried the scars home", description: `${hero.name} completed the mission but returned with an injury that will be remembered.`, tone: "negative" };
  if (status === "victory" && hero.currentHP / Math.max(1, hero.maxHP) <= .25) return { ...portrait, title: "Held the line", description: `${hero.name} survived ${questName} with little strength remaining.`, tone: "positive" };
  return { ...portrait, title: status === "victory" ? "Shared in the victory" : "Survived the withdrawal", description: status === "victory" ? `${hero.name} returned beneath the guild banner after completing ${questName}.` : `${hero.name} returned from ${questName} carrying lessons from the defeat.`, tone: status === "victory" ? "positive" : "neutral" };
}

export function createQuestChronicleEntry(input: { quest: QuestDefinition; status: "victory" | "defeat"; day: number; worldBefore: WorldState; worldAfter: WorldState; heroOutcomes: QuestHeroOutcomeRecord[]; relationshipChanges?: QuestRelationshipChange[] }): QuestChronicleEntry {
  const narrative = QUEST_OUTCOME_NARRATIVES[input.quest.id];
  return { id: `${input.quest.id}:${input.day}:${input.status}`, day: input.day, questId: input.quest.id, questName: input.quest.name, status: input.status, aftermath: input.status === "victory" ? narrative?.victory ?? "The guild completes its objective." : narrative?.defeat ?? "The party is forced to withdraw.", consequences: buildConsequences(input.quest, input.status, input.worldBefore, input.worldAfter, input.heroOutcomes), loreDiscoveries: buildLore(input.quest, input.status, input.worldBefore, input.worldAfter), heroMoments: input.heroOutcomes.map((hero) => momentForHero(hero, input.quest.name, input.status)), relationshipChanges: input.relationshipChanges ?? [] };
}

export function recordQuestChronicle(guild: GuildState, entry: QuestChronicleEntry): GuildState {
  const heroes = guild.heroes.map((hero) => { const moment = entry.heroMoments.find((item) => item.heroId === hero.id); return moment ? appendHeroHistoryEvent(hero, { day: entry.day, type: "campaign", outcome: moment.tone, title: moment.title, description: moment.description, questId: entry.questId, tags: ["hero_moment", entry.status] }) : hero; });
  return { ...guild, heroes, questChronicle: [...guild.questChronicle, entry] };
}
