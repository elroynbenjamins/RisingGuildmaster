import { CAMP_CONVERSATIONS } from "../../data/relationships/campConversations";
import type { RandomSource } from "../../utils/random";
import type { GuildState } from "../guild/types";
import { appendHeroHistoryEvent } from "../heroes/heroHistoryService";
import type { Hero } from "../heroes/types";
import type { QuestHeroOutcomeRecord } from "../quests/questChronicleTypes";
import type { CampConversationDefinition, CampConversationRecord, CampConversationTrigger } from "./campConversationTypes";
import { clampRelationshipScore, relationshipBand, relationshipScore, setRelationship } from "./relationshipService";

const volatile = new Set(["reckless", "glory_hungry"]); const guarded = new Set(["rigid", "suspicious"]);
function pairTriggers(a: Hero, b: Hero, status: "victory" | "defeat", outcomes: readonly QuestHeroOutcomeRecord[], score: number): Set<CampConversationTrigger> {
  const triggers = new Set<CampConversationTrigger>([status]);
  if (a.roleplayProfile?.idealId && a.roleplayProfile.idealId === b.roleplayProfile?.idealId) triggers.add("shared_ideal");
  if (a.roleplayProfile?.bondId && a.roleplayProfile.bondId === b.roleplayProfile?.bondId) triggers.add("shared_bond");
  if (a.raceId === b.raceId) triggers.add("shared_race");
  if (a.classId === b.classId) triggers.add("shared_class");
  if (a.backgroundId && a.backgroundId === b.backgroundId) triggers.add("shared_background");
  if ((volatile.has(a.roleplayProfile?.flawId ?? "") && guarded.has(b.roleplayProfile?.flawId ?? "")) || (volatile.has(b.roleplayProfile?.flawId ?? "") && guarded.has(a.roleplayProfile?.flawId ?? ""))) triggers.add("friction");
  if (score >= 21) triggers.add("friendship"); if (score <= -51) triggers.add("rivalry");
  if (outcomes.some((outcome) => outcome.fellInBattle && (outcome.heroId === a.id || outcome.heroId === b.id))) triggers.add("fallen_companion");
  if (a.conditions.length || b.conditions.length) triggers.add("injured_companion");
  return triggers;
}
function render(text: string, a: Hero, b: Hero): string { return text.replaceAll("{a}", a.name).replaceAll("{b}", b.name); }

export function resolveCampConversation(guild: GuildState, status: "victory" | "defeat", partyHeroIds: readonly string[], outcomes: readonly QuestHeroOutcomeRecord[], questId: string, questName: string, random: RandomSource): { guild: GuildState; conversation?: CampConversationRecord } {
  const party = guild.heroes.filter((hero) => partyHeroIds.includes(hero.id)); if (party.length < 2) return { guild };
  const candidates: { a: Hero; b: Hero; definition: CampConversationDefinition }[] = [];
  for (let i=0;i<party.length;i+=1) for (let j=i+1;j<party.length;j+=1) { const a=party[i]!;const b=party[j]!;const triggers=pairTriggers(a,b,status,outcomes,relationshipScore(guild.relationships,a.id,b.id));for(const definition of Object.values(CAMP_CONVERSATIONS))if(triggers.has(definition.trigger))candidates.push({a,b,definition}); }
  if (!candidates.length) return { guild }; const highest=Math.max(...candidates.map((entry)=>entry.definition.priority));const chosen=random.pick(candidates.filter((entry)=>entry.definition.priority===highest));const {a,b,definition}=chosen;
  const before=relationshipScore(guild.relationships,a.id,b.id);const after=clampRelationshipScore(before+definition.relationshipDelta);const relationships=setRelationship(guild.relationships,a.id,b.id,after);const reason=`${definition.title} after ${questName} changed their bond by ${after-before>=0?"+":""}${after-before}.`;
  const heroes=guild.heroes.map((hero)=>hero.id!==a.id&&hero.id!==b.id?hero:appendHeroHistoryEvent(hero,{day:guild.currentDay,type:"relationship",outcome:definition.relationshipDelta>=0?"positive":"negative",title:definition.title,description:reason,questId,relatedHeroIds:[hero.id===a.id?b.id:a.id],tags:["camp_conversation",relationshipBand(after)]}));
  const lines=definition.lines.map((line)=>({speaker:line.speaker==="a"?a.name:line.speaker==="b"?b.name:"Narrator",text:render(line.text,a,b)}));
  return {guild:{...guild,heroes,relationships},conversation:{id:`${questId}:${guild.currentDay}:${definition.id}:${a.id}:${b.id}`,definitionId:definition.id,title:definition.title,heroIdA:a.id,heroNameA:a.name,heroIdB:b.id,heroNameB:b.name,lines,relationshipDelta:after-before,reason}};
}
