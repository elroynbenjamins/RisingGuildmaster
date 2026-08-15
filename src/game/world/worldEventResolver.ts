import type { RandomSource } from "../../utils/random";
import { calculateHero } from "../heroes/heroCalculator";
import type { Hero } from "../heroes/types";
import { rollDie } from "../combat/dice/diceService";
import type { AbilityCheck, EventChoice, EventOutcome, WorldState } from "./worldTypes";
import { calculateAbilityModifier } from "../attributes/dndAttributes";

export interface AbilityCheckResult { diceRoll: number; modifier: number; total: number; difficultyClass: number; success: boolean; heroId: string }
export interface EventResolution { worldState: WorldState; goldDelta: number; check: AbilityCheckResult | null; outcomes: EventOutcome[] }
export function resolveAbilityCheck(check: AbilityCheck, heroes: readonly Hero[], random: RandomSource, optionalModifier = 0): AbilityCheckResult {
  if (!heroes.length) throw new Error("An ability check requires a hero");
  const hero = [...heroes].sort((a, b) => calculateHero(b).attributes[check.attribute] - calculateHero(a).attributes[check.attribute])[0]!;
  const attribute = calculateHero(hero).attributes[check.attribute]; const modifier = calculateAbilityModifier(attribute) + optionalModifier; const diceRoll = rollDie(20, random); const total = diceRoll + modifier;
  return { diceRoll, modifier, total, difficultyClass: check.difficultyClass, success: total >= check.difficultyClass, heroId: hero.id };
}
export function choiceRequirementsMet(choice: EventChoice, heroes: readonly Hero[], state: WorldState): boolean { return (choice.requirements ?? []).every((requirement) => requirement.type === "world_flag" ? state.worldFlags[requirement.flag] === requirement.value : heroes.some((hero) => calculateHero(hero).attributes[requirement.attribute] >= requirement.value)); }
function applyOutcomes(state: WorldState, outcomes: readonly EventOutcome[]): { state: WorldState; goldDelta: number } { let next = state; let goldDelta = 0; for (const outcome of outcomes) { if (outcome.type === "gold") goldDelta += outcome.value; else if (outcome.type === "faction_reputation") next = { ...next, factionReputation: { ...next.factionReputation, [outcome.factionId]: (next.factionReputation[outcome.factionId] ?? 0) + outcome.value } }; else if (outcome.type === "world_flag") next = { ...next, worldFlags: { ...next.worldFlags, [outcome.flag]: outcome.value } }; } return { state: next, goldDelta }; }
export function resolveEventChoice(choice: EventChoice, heroes: readonly Hero[], state: WorldState, random: RandomSource): EventResolution {
  if (!choiceRequirementsMet(choice, heroes, state)) throw new Error("Event choice requirements are not met");
  const check = choice.abilityCheck ? resolveAbilityCheck(choice.abilityCheck, heroes, random) : null;
  const outcomes = check && !check.success ? choice.failureOutcomes ?? [] : choice.successOutcomes; const applied = applyOutcomes(state, outcomes);
  return { worldState: applied.state, goldDelta: applied.goldDelta, check, outcomes: [...outcomes] };
}
