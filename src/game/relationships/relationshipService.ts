import type { CombatUnit } from "../combat/combatTypes";
import type { HeroRelationship, RelationshipBand } from "./relationshipTypes";
import type { GuildState } from "../guild/types";
import { appendHeroHistoryEvent } from "../heroes/heroHistoryService";
import type { QuestHeroOutcomeRecord, QuestRelationshipChange } from "../quests/questChronicleTypes";
import type { Hero } from "../heroes/types";
import { defaultRoleplayProfile, getRoleplayPillar } from "../../data/heroes/heroRoleplay";
import { getMentorshipBetween } from "../heroes/heroIdentityService";
export function clampRelationshipScore(score: number): number { return Math.max(-100, Math.min(100, Math.round(score))); }
export function relationshipBand(score: number): RelationshipBand { const value = clampRelationshipScore(score); return value <= -51 ? "rival" : value <= -21 ? "dislike" : value <= 20 ? "neutral" : value <= 50 ? "friend" : "close_friend"; }
export function relationshipScore(relationships: readonly HeroRelationship[], a: string, b: string): number { return relationships.find((item) => (item.heroIdA === a && item.heroIdB === b) || (item.heroIdA === b && item.heroIdB === a))?.score ?? 0; }
export function setRelationship(relationships: readonly HeroRelationship[], heroIdA: string, heroIdB: string, score: number): HeroRelationship[] { if (heroIdA === heroIdB) throw new Error("A hero cannot have a relationship with themselves"); const rest = relationships.filter((item) => !((item.heroIdA === heroIdA && item.heroIdB === heroIdB) || (item.heroIdA === heroIdB && item.heroIdB === heroIdA))); return [...rest, { heroIdA, heroIdB, score: clampRelationshipScore(score) }]; }
const adjacent = (a: CombatUnit, b: CombatUnit) => Math.abs(a.position.x - b.position.x) + Math.abs(a.position.y - b.position.y) === 1;
export function relationshipCombatBonuses(heroId: string, party: readonly CombatUnit[], relationships: readonly HeroRelationship[]) { const allies = party.filter((unit) => unit.combatantId !== heroId && unit.isAlive); const self = party.find((unit) => unit.combatantId === heroId); const friendAdjacent = !!self && allies.some((ally) => relationshipScore(relationships, heroId, ally.combatantId) >= 21 && adjacent(self, ally)); const rivalPresent = allies.some((ally) => relationshipScore(relationships, heroId, ally.combatantId) <= -51); return { attackRollModifier: friendAdjacent ? 1 : 0, physicalDamageModifier: rivalPresent ? .05 : 0 }; }
export function healingReceivedFromHeroModifier(healerId: string, targetId: string, relationships: readonly HeroRelationship[]): number { return relationshipScore(relationships, healerId, targetId) <= -51 ? -.10 : 0; }

export const RELATIONSHIP_BAND_LABELS: Record<RelationshipBand, string> = { rival: "Rival", dislike: "Dislike", neutral: "Neutral", friend: "Friend", close_friend: "Close Friend" };

export function getHeroCompatibility(a: Hero | undefined, b: Hero | undefined): { modifier: number; reason?: string } {
  if (!a?.roleplayProfile || !b?.roleplayProfile) return { modifier: 0 };
  const aProfile = a.roleplayProfile ?? defaultRoleplayProfile(a.backgroundId ?? "mercenary"); const bProfile = b.roleplayProfile ?? defaultRoleplayProfile(b.backgroundId ?? "mercenary");
  if (aProfile.idealId === bProfile.idealId) return { modifier: 2, reason: `Their shared ideal of ${getRoleplayPillar(aProfile.idealId)?.name.toLowerCase()} drew them together.` };
  if (aProfile.bondId === bProfile.bondId) return { modifier: 1, reason: `A common bond to ${getRoleplayPillar(aProfile.bondId)?.name.toLowerCase()} gave them common ground.` };
  const volatile = new Set(["reckless", "glory_hungry"]); const guarded = new Set(["rigid", "suspicious"]);
  if ((volatile.has(aProfile.flawId) && guarded.has(bProfile.flawId)) || (volatile.has(bProfile.flawId) && guarded.has(aProfile.flawId))) return { modifier: -1, reason: "One hero's appetite for risk clashed with the other's caution." };
  if (aProfile.flawId === bProfile.flawId) return { modifier: -1, reason: `Their shared ${getRoleplayPillar(aProfile.flawId)?.name.toLowerCase()} weakness caused friction.` };
  return { modifier: 0 };
}

function questRelationshipDelta(status: "victory" | "defeat", a: QuestHeroOutcomeRecord, b: QuestHeroOutcomeRecord, currentScore: number, heroA?: Hero, heroB?: Hero): { delta: number; reason: string } {
  const compatibility = getHeroCompatibility(heroA, heroB);
  const mentorship = heroA && heroB ? getMentorshipBetween(heroA, heroB, currentScore) : null;
  const base = status === "defeat" ? -2 : a.fellInBattle || b.fellInBattle ? 2 : 4;
  const mentorshipBonus = status === "victory" && mentorship ? 1 : 0;
  const reason = status === "defeat" ? "The failed mission strained their trust." : a.fellInBattle || b.fellInBattle ? "Shared danger strengthened their bond." : "Returning victorious together strengthened their bond.";
  const mentorReason = mentorshipBonus ? `${mentorship.mentorName}'s guidance gave ${mentorship.menteeName} another reason to trust them.` : undefined;
  return { delta: base + compatibility.modifier + mentorshipBonus, reason: [reason, compatibility.reason, mentorReason].filter(Boolean).join(" ") };
}

export function applyQuestRelationshipConsequences(guild: GuildState, status: "victory" | "defeat", outcomes: readonly QuestHeroOutcomeRecord[], questId: string, questName: string): { guild: GuildState; changes: QuestRelationshipChange[] } {
  let relationships = [...guild.relationships]; const changes: QuestRelationshipChange[] = [];
  for (let aIndex = 0; aIndex < outcomes.length; aIndex += 1) for (let bIndex = aIndex + 1; bIndex < outcomes.length; bIndex += 1) {
    const a = outcomes[aIndex]!; const b = outcomes[bIndex]!; const previousScore = relationshipScore(relationships, a.heroId, b.heroId); const consequence = questRelationshipDelta(status, a, b, previousScore, guild.heroes.find((hero) => hero.id === a.heroId), guild.heroes.find((hero) => hero.id === b.heroId)); const newScore = clampRelationshipScore(previousScore + consequence.delta); const previousBand = relationshipBand(previousScore); const newBand = relationshipBand(newScore);
    relationships = setRelationship(relationships, a.heroId, b.heroId, newScore);
    changes.push({ heroIdA: a.heroId, heroNameA: a.name, heroIdB: b.heroId, heroNameB: b.name, previousScore, newScore, delta: newScore - previousScore, previousBand, newBand, reason: consequence.reason });
  }
  let heroes = guild.heroes;
  for (const change of changes.filter((item) => item.previousBand !== item.newBand || Math.abs(item.delta) >= 5 || status === "defeat" || outcomes.some((outcome) => outcome.fellInBattle && (outcome.heroId === item.heroIdA || outcome.heroId === item.heroIdB)))) {
    heroes = heroes.map((hero) => {
      if (hero.id !== change.heroIdA && hero.id !== change.heroIdB) return hero;
      const partnerName = hero.id === change.heroIdA ? change.heroNameB : change.heroNameA; const positive = change.newScore > change.previousScore;
      const changedBand = change.previousBand !== change.newBand; return appendHeroHistoryEvent(hero, { day: guild.currentDay, type: "relationship", outcome: positive ? "positive" : "negative", title: changedBand ? `${RELATIONSHIP_BAND_LABELS[change.newBand as RelationshipBand]}: ${partnerName}` : `A defining mission with ${partnerName}`, description: changedBand ? `${questName} changed their relationship from ${RELATIONSHIP_BAND_LABELS[change.previousBand as RelationshipBand]} to ${RELATIONSHIP_BAND_LABELS[change.newBand as RelationshipBand]}. ${change.reason}` : `${questName} changed their bond by ${change.delta >= 0 ? "+" : ""}${change.delta}. ${change.reason}`, questId, relatedHeroIds: [hero.id === change.heroIdA ? change.heroIdB : change.heroIdA], tags: ["relationship", change.newBand] });
    });
  }
  return { guild: { ...guild, heroes, relationships }, changes };
}
