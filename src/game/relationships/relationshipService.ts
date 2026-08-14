import type { CombatUnit } from "../combat/combatTypes";
import type { HeroRelationship, RelationshipBand } from "./relationshipTypes";
import type { GuildState } from "../guild/types";
import { appendHeroHistoryEvent } from "../heroes/heroHistoryService";
import type { QuestHeroOutcomeRecord, QuestRelationshipChange } from "../quests/questChronicleTypes";
export function clampRelationshipScore(score: number): number { return Math.max(-100, Math.min(100, Math.round(score))); }
export function relationshipBand(score: number): RelationshipBand { const value = clampRelationshipScore(score); return value <= -51 ? "rival" : value <= -21 ? "dislike" : value <= 20 ? "neutral" : value <= 50 ? "friend" : "close_friend"; }
export function relationshipScore(relationships: readonly HeroRelationship[], a: string, b: string): number { return relationships.find((item) => (item.heroIdA === a && item.heroIdB === b) || (item.heroIdA === b && item.heroIdB === a))?.score ?? 0; }
export function setRelationship(relationships: readonly HeroRelationship[], heroIdA: string, heroIdB: string, score: number): HeroRelationship[] { if (heroIdA === heroIdB) throw new Error("A hero cannot have a relationship with themselves"); const rest = relationships.filter((item) => !((item.heroIdA === heroIdA && item.heroIdB === heroIdB) || (item.heroIdA === heroIdB && item.heroIdB === heroIdA))); return [...rest, { heroIdA, heroIdB, score: clampRelationshipScore(score) }]; }
const adjacent = (a: CombatUnit, b: CombatUnit) => Math.abs(a.position.x - b.position.x) + Math.abs(a.position.y - b.position.y) === 1;
export function relationshipCombatBonuses(heroId: string, party: readonly CombatUnit[], relationships: readonly HeroRelationship[]) { const allies = party.filter((unit) => unit.combatantId !== heroId && unit.isAlive); const self = party.find((unit) => unit.combatantId === heroId); const friendAdjacent = !!self && allies.some((ally) => relationshipScore(relationships, heroId, ally.combatantId) >= 21 && adjacent(self, ally)); const rivalPresent = allies.some((ally) => relationshipScore(relationships, heroId, ally.combatantId) <= -51); return { attackRollModifier: friendAdjacent ? 1 : 0, physicalDamageModifier: rivalPresent ? .05 : 0 }; }
export function healingReceivedFromHeroModifier(healerId: string, targetId: string, relationships: readonly HeroRelationship[]): number { return relationshipScore(relationships, healerId, targetId) <= -51 ? -.10 : 0; }

export const RELATIONSHIP_BAND_LABELS: Record<RelationshipBand, string> = { rival: "Rival", dislike: "Dislike", neutral: "Neutral", friend: "Friend", close_friend: "Close Friend" };

function questRelationshipDelta(status: "victory" | "defeat", a: QuestHeroOutcomeRecord, b: QuestHeroOutcomeRecord): { delta: number; reason: string } {
  if (status === "defeat") return { delta: -2, reason: "The failed mission strained their trust." };
  if (a.fellInBattle || b.fellInBattle) return { delta: 2, reason: "Shared danger strengthened their bond." };
  return { delta: 4, reason: "Returning victorious together strengthened their bond." };
}

export function applyQuestRelationshipConsequences(guild: GuildState, status: "victory" | "defeat", outcomes: readonly QuestHeroOutcomeRecord[], questId: string, questName: string): { guild: GuildState; changes: QuestRelationshipChange[] } {
  let relationships = [...guild.relationships]; const changes: QuestRelationshipChange[] = [];
  for (let aIndex = 0; aIndex < outcomes.length; aIndex += 1) for (let bIndex = aIndex + 1; bIndex < outcomes.length; bIndex += 1) {
    const a = outcomes[aIndex]!; const b = outcomes[bIndex]!; const previousScore = relationshipScore(relationships, a.heroId, b.heroId); const consequence = questRelationshipDelta(status, a, b); const newScore = clampRelationshipScore(previousScore + consequence.delta); const previousBand = relationshipBand(previousScore); const newBand = relationshipBand(newScore);
    relationships = setRelationship(relationships, a.heroId, b.heroId, newScore);
    changes.push({ heroIdA: a.heroId, heroNameA: a.name, heroIdB: b.heroId, heroNameB: b.name, previousScore, newScore, delta: newScore - previousScore, previousBand, newBand, reason: consequence.reason });
  }
  let heroes = guild.heroes;
  for (const change of changes.filter((item) => item.previousBand !== item.newBand)) {
    heroes = heroes.map((hero) => {
      if (hero.id !== change.heroIdA && hero.id !== change.heroIdB) return hero;
      const partnerName = hero.id === change.heroIdA ? change.heroNameB : change.heroNameA; const positive = change.newScore > change.previousScore;
      return appendHeroHistoryEvent(hero, { day: guild.currentDay, type: "relationship", outcome: positive ? "positive" : "negative", title: `${RELATIONSHIP_BAND_LABELS[change.newBand as RelationshipBand]}: ${partnerName}`, description: `${questName} changed their relationship from ${RELATIONSHIP_BAND_LABELS[change.previousBand as RelationshipBand]} to ${RELATIONSHIP_BAND_LABELS[change.newBand as RelationshipBand]}.`, questId, relatedHeroIds: [hero.id === change.heroIdA ? change.heroIdB : change.heroIdA], tags: ["relationship", change.newBand] });
    });
  }
  return { guild: { ...guild, heroes, relationships }, changes };
}
