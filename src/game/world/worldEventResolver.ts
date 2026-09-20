import type { RandomSource } from "../../utils/random";
import { calculateHero } from "../heroes/heroCalculator";
import type { Hero } from "../heroes/types";
import { rollDie } from "../combat/dice/diceService";
import type { AbilityCheck, EventChoice, EventOutcome, WorldState } from "./worldTypes";
import { calculateAbilityModifier } from "../attributes/dndAttributes";
import { getHeroSkillBonus } from "../proficiencies/proficiencyService";
import type { GuildState } from "../guild/types";
import { relationshipBand, relationshipScore, setRelationship } from "../relationships/relationshipService";
export interface AbilityCheckResult { diceRoll: number; modifier: number; proficiencyBonus: number; total: number; difficultyClass: number; success: boolean; heroId: string; skillId?: import("../proficiencies/proficiencyTypes").SkillId }
export interface EventResolution { worldState: WorldState; goldDelta: number; rationDelta: number; check: AbilityCheckResult | null; outcomes: EventOutcome[] }
export interface TravelRelationshipChange { heroIdA: string; heroIdB: string; previousScore: number; newScore: number; delta: number; newBand: ReturnType<typeof relationshipBand> }
export interface GuildEventResolution extends EventResolution { guild: GuildState; relationshipChange: TravelRelationshipChange | null }
export function resolveAbilityCheck(check: AbilityCheck, heroes: readonly Hero[], random: RandomSource, optionalModifier = 0): AbilityCheckResult { if (!heroes.length) throw new Error("An ability check requires a hero"); const totalBonus = (hero: Hero) => calculateAbilityModifier(calculateHero(hero).attributes[check.attribute]) + (check.skillId ? getHeroSkillBonus(hero, check.skillId) : 0); const hero = [...heroes].sort((a, b) => totalBonus(b) - totalBonus(a))[0]!; const proficiencyBonus = check.skillId ? getHeroSkillBonus(hero, check.skillId) : 0; const modifier = calculateAbilityModifier(calculateHero(hero).attributes[check.attribute]) + proficiencyBonus + optionalModifier; const diceRoll = rollDie(20, random); const total = diceRoll + modifier; return { diceRoll, modifier, proficiencyBonus, total, difficultyClass: check.difficultyClass, success: total >= check.difficultyClass, heroId: hero.id, ...(check.skillId ? { skillId: check.skillId } : {}) }; }
export function choiceRequirementsMet(choice: EventChoice, heroes: readonly Hero[], state: WorldState): boolean { return (choice.requirements ?? []).every((requirement) => requirement.type === "world_flag" ? Boolean(state.worldFlags[requirement.flag]) === requirement.value : heroes.some((hero) => calculateHero(hero).attributes[requirement.attribute] >= requirement.value)); }
function applyOutcomes(state: WorldState, outcomes: readonly EventOutcome[]): { state: WorldState; goldDelta: number; rationDelta: number } { let next = state; let goldDelta = 0; let rationDelta = 0; for (const outcome of outcomes) { if (outcome.type === "gold") goldDelta += outcome.value; else if (outcome.type === "rations") rationDelta += outcome.value; else if (outcome.type === "faction_reputation") next = { ...next, factionReputation: { ...next.factionReputation, [outcome.factionId]: (next.factionReputation[outcome.factionId] ?? 0) + outcome.value } }; else if (outcome.type === "world_flag") next = { ...next, worldFlags: { ...next.worldFlags, [outcome.flag]: outcome.value } }; } return { state: next, goldDelta, rationDelta }; }
export function resolveEventChoice(choice: EventChoice, heroes: readonly Hero[], state: WorldState, random: RandomSource): EventResolution { if (!choiceRequirementsMet(choice, heroes, state)) throw new Error("Event choice requirements are not met"); const check = choice.abilityCheck ? resolveAbilityCheck(choice.abilityCheck, heroes, random) : null; const outcomes = check && !check.success ? choice.failureOutcomes ?? [] : choice.successOutcomes; const applied = applyOutcomes(state, outcomes); return { worldState: applied.state, goldDelta: applied.goldDelta, rationDelta: applied.rationDelta, check, outcomes: [...outcomes] }; }

export function resolveGuildEventChoice(choice: EventChoice, guild: GuildState, heroes: readonly Hero[], random: RandomSource): GuildEventResolution {
  const resolution = resolveEventChoice(choice, heroes, guild.world, random);
  if (guild.gold + resolution.goldDelta < 0) throw new Error("Not enough gold for this merchant purchase");
  const relationshipDelta = resolution.outcomes.reduce((sum, outcome) => sum + (outcome.type === "party_relationship" ? outcome.value : 0), 0);
  let relationships = guild.relationships;
  let relationshipChange: TravelRelationshipChange | null = null;
  if (relationshipDelta && heroes.length >= 2) {
    const lead = heroes.find((hero) => hero.id === resolution.check?.heroId) ?? heroes[0]!;
    const companion = heroes.find((hero) => hero.id !== lead.id)!;
    const previousScore = relationshipScore(relationships, lead.id, companion.id);
    const newScore = Math.max(-100, Math.min(100, previousScore + relationshipDelta));
    relationships = setRelationship(relationships, lead.id, companion.id, newScore);
    relationshipChange = { heroIdA: lead.id, heroIdB: companion.id, previousScore, newScore, delta: newScore - previousScore, newBand: relationshipBand(newScore) };
  }
  const purchasedEquipment = resolution.outcomes.filter((outcome): outcome is Extract<EventOutcome, { type: "equipment" }> => outcome.type === "equipment").map((outcome) => outcome.equipmentId);
  const unlockedRecipes = resolution.outcomes.filter((outcome): outcome is Extract<EventOutcome, { type: "recipe_unlock" }> => outcome.type === "recipe_unlock").map((outcome) => outcome.recipeId);
  const updatedGuild = { ...guild, gold: guild.gold + resolution.goldDelta, rations: Math.max(0, guild.rations + resolution.rationDelta), inventory: [...guild.inventory, ...purchasedEquipment], unlockedRecipeIds: [...new Set([...(guild.unlockedRecipeIds ?? []), ...unlockedRecipes])], world: resolution.worldState, relationships };
  return { ...resolution, guild: updatedGuild, relationshipChange };
}

export function describeEventOutcomes(outcomes: readonly EventOutcome[]): string[] {
  return outcomes.flatMap((outcome) => {
    if (outcome.type === "none") return [];
    if (outcome.type === "gold") return [`${outcome.value >= 0 ? "+" : ""}${outcome.value} gold`];
    if (outcome.type === "rations") return [`${outcome.value >= 0 ? "+" : ""}${outcome.value} rations`];
    if (outcome.type === "faction_reputation") return [`${outcome.value >= 0 ? "+" : ""}${outcome.value} ${outcome.factionId.replace(/_/g, " ")} reputation`];
    if (outcome.type === "party_relationship") return [`${outcome.value >= 0 ? "+" : ""}${outcome.value} party bond`];
    if (outcome.type === "equipment") return [`Receive ${outcome.equipmentId.replace(/-/g, " ")}`];
    if (outcome.type === "recipe_unlock") return [`Unlock ${outcome.recipeId.replace(/_/g, " ")}`];
    return [outcome.value ? `World state changed: ${outcome.flag.replace(/_/g, " ")}` : `World state cleared: ${outcome.flag.replace(/_/g, " ")}`];
  });
}
