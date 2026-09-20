import { QUEST_OUTCOME_CONSEQUENCES } from "../../data/quests/questOutcomeConsequences";
import { QUEST_OUTCOME_NARRATIVES } from "../../data/quests/questOutcomeNarratives";
import { LORE_ENTRIES } from "../../data/world/lore";
import type { GuildState } from "../guild/types";
import { appendHeroHistoryEvent } from "../heroes/heroHistoryService";
import type { WorldState } from "../world/worldTypes";
import type { QuestChronicleEntry, QuestConsequenceRecord, QuestHeroMoment, QuestHeroOutcomeRecord, QuestLoreRecord, QuestRelationshipChange } from "./questChronicleTypes";
import type { QuestDefinition } from "./questTypes";
import type { CampConversationRecord } from "../relationships/campConversationTypes";

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

function classReflection(hero: QuestHeroOutcomeRecord, quest: QuestDefinition, status: "victory" | "defeat"): Pick<QuestHeroMoment, "title" | "description" | "tone"> {
  const storyWord = quest.questType === "campaign" || quest.questType === "boss" ? "story" : quest.questType === "side" ? "local tale" : "guild record";
  if (status === "defeat") {
    if (["warrior", "paladin", "bulwark", "berserker"].includes(hero.classId)) return { title: "Remembers where the line broke", description: `${hero.name} returns from ${quest.name} already talking through the formation that failed and where the next stand should begin.`, tone: "neutral" };
    if (["ranger", "spellbow"].includes(hero.classId)) return { title: "Maps a safer return", description: `${hero.name} marks the sightlines, tracks, and exits the party missed during ${quest.name}.`, tone: "neutral" };
    if (["mage", "summoner"].includes(hero.classId)) return { title: "Studies the pattern", description: `${hero.name} treats the defeat at ${quest.name} as evidence—something in the enemy's rhythm can be understood before the rematch.`, tone: "neutral" };
    if (["cleric", "bard"].includes(hero.classId)) return { title: "Keeps the company together", description: `${hero.name} makes sure the retreat from ${quest.name} becomes a lesson shared by the party instead of a private shame.`, tone: "neutral" };
    return { title: "Carries the lesson home", description: `${hero.name} returns from ${quest.name} quieter, but with a clearer sense of what must change.`, tone: "neutral" };
  }
  if (["warrior", "paladin", "bulwark", "berserker"].includes(hero.classId)) return { title: "Anchored the field", description: `${hero.name} remembers ${quest.name} by the ground the party refused to surrender; it now belongs to the guild's ${storyWord}.`, tone: "positive" };
  if (["ranger", "spellbow"].includes(hero.classId)) return { title: "Read the battlefield", description: `${hero.name} carries home the routes, firing lanes, and enemy habits learned during ${quest.name}.`, tone: "positive" };
  if (["mage", "summoner"].includes(hero.classId)) return { title: "Found a pattern worth keeping", description: `${hero.name} records the strange details of ${quest.name} before memory can turn them into a cleaner story than the truth.`, tone: "positive" };
  if (["cleric", "bard"].includes(hero.classId)) return { title: "Gave the victory a voice", description: `${hero.name} makes certain the people and promises behind ${quest.name} are remembered alongside the reward.`, tone: "positive" };
  if (hero.classId === "monk") return { title: "Carries the lesson forward", description: `${hero.name} treats the victory at ${quest.name} as another measure of the party's discipline rather than a reason to grow careless.`, tone: "positive" };
  return { title: "Shared in the victory", description: `${hero.name} returned beneath the guild banner after completing ${quest.name}.`, tone: "positive" };
}

function momentForHero(hero: QuestHeroOutcomeRecord, quest: QuestDefinition, status: "victory" | "defeat"): QuestHeroMoment {
  const portrait = { heroId: hero.heroId, name: hero.name, raceId: hero.raceId, classId: hero.classId, gender: hero.gender, portraitVariant: hero.portraitVariant };
  if (hero.fellInBattle) return { ...portrait, title: "Fell in the line of duty", description: `${hero.name} was brought home after falling during ${quest.name}.`, tone: "negative" };
  if (hero.levelAfter > hero.levelBefore) return { ...portrait, title: `Rose to Level ${hero.levelAfter}`, description: `${hero.name}'s deeds during ${quest.name} marked a new step in their career.`, tone: "positive" };
  if (hero.newlyInjured) return { ...portrait, title: "Carried the scars home", description: `${hero.name} completed the mission but returned with an injury that will be remembered.`, tone: "negative" };
  if (status === "victory" && hero.currentHP / Math.max(1, hero.maxHP) <= .25) return { ...portrait, title: "Held the line", description: `${hero.name} survived ${quest.name} with little strength remaining.`, tone: "positive" };
  return { ...portrait, ...classReflection(hero, quest, status) };
}

export function createQuestChronicleEntry(input: { quest: QuestDefinition; status: "victory" | "defeat"; day: number; worldBefore: WorldState; worldAfter: WorldState; heroOutcomes: QuestHeroOutcomeRecord[]; relationshipChanges?: QuestRelationshipChange[]; campConversation?: CampConversationRecord }): QuestChronicleEntry {
  const narrative = QUEST_OUTCOME_NARRATIVES[input.quest.id];
  return { id: `${input.quest.id}:${input.day}:${input.status}`, day: input.day, questId: input.quest.id, questName: input.quest.name, status: input.status, aftermath: input.status === "victory" ? narrative?.victory ?? "The guild completes its objective." : narrative?.defeat ?? "The party is forced to withdraw.", consequences: buildConsequences(input.quest, input.status, input.worldBefore, input.worldAfter, input.heroOutcomes), loreDiscoveries: buildLore(input.quest, input.status, input.worldBefore, input.worldAfter), heroMoments: input.heroOutcomes.map((hero) => momentForHero(hero, input.quest, input.status)), relationshipChanges: input.relationshipChanges ?? [], ...(input.campConversation ? { campConversation: input.campConversation } : {}) };
}

export function recordQuestChronicle(guild: GuildState, entry: QuestChronicleEntry): GuildState {
  const heroes = guild.heroes.map((hero) => { const moment = entry.heroMoments.find((item) => item.heroId === hero.id); return moment ? appendHeroHistoryEvent(hero, { day: entry.day, type: "campaign", outcome: moment.tone, title: moment.title, description: moment.description, questId: entry.questId, tags: ["hero_moment", entry.status] }) : hero; });
  return { ...guild, heroes, questChronicle: [...guild.questChronicle, entry] };
}
