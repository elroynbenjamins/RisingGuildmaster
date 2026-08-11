import { BOSS_WEAPON_RECIPE_IDS, ELITE_RING_RECIPE_IDS } from "../../data/crafting/rogueliteRecipePools";
import type { GuildState } from "../guild/types";
import type { RandomSource } from "../../utils/random";
import type { RogueliteRecipeDropResult, RogueliteRewardNodeType, RogueliteRunState } from "./rogueliteTypes";

export function createRogueliteRun(day: number, id = `run-${day}`): RogueliteRunState { return { id, startedDay: day, eliteRewardAttempts: 0, bossRewardAttempts: 0, eliteRecipeAwarded: false, bossRecipeAwarded: false, recipeIdsUnlockedThisRun: [] }; }
export function startRogueliteRun(guild: GuildState, id?: string): GuildState { if (guild.activeRogueliteRun) throw new Error("A roguelite run is already active"); return { ...guild, activeRogueliteRun: createRogueliteRun(guild.currentDay, id) }; }
export function finishRogueliteRun(guild: GuildState): GuildState { if (!guild.activeRogueliteRun) throw new Error("No roguelite run is active"); return { ...guild, activeRogueliteRun: null }; }

export function resolveRogueliteRecipeDrop(guild: GuildState, nodeType: RogueliteRewardNodeType, random: RandomSource): { guild: GuildState; result: RogueliteRecipeDropResult } {
  const run = guild.activeRogueliteRun; if (!run) throw new Error("No roguelite run is active");
  const awardKey = nodeType === "elite" ? "eliteRecipeAwarded" : "bossRecipeAwarded";
  if (run[awardKey]) return { guild, result: { guildChanged: false, roll: null, droppedRecipeId: null, alreadyAwarded: true, poolExhausted: false } };
  const allRecipeIds = Object.values(nodeType === "elite" ? ELITE_RING_RECIPE_IDS : BOSS_WEAPON_RECIPE_IDS);
  const unlocked = new Set(guild.unlockedRecipeIds ?? []); const eligible = allRecipeIds.filter((id) => !unlocked.has(id));
  if (!eligible.length) return { guild, result: { guildChanged: false, roll: null, droppedRecipeId: null, alreadyAwarded: false, poolExhausted: true } };
  const roll = random.next(); const attemptsKey = nodeType === "elite" ? "eliteRewardAttempts" : "bossRewardAttempts";
  const attemptedRun = { ...run, [attemptsKey]: run[attemptsKey] + 1 };
  if (roll >= .50) return { guild: { ...guild, activeRogueliteRun: attemptedRun }, result: { guildChanged: true, roll, droppedRecipeId: null, alreadyAwarded: false, poolExhausted: false } };
  const droppedRecipeId = random.pick(eligible);
  const nextRun = { ...attemptedRun, [awardKey]: true, recipeIdsUnlockedThisRun: [...attemptedRun.recipeIdsUnlockedThisRun, droppedRecipeId] };
  return { guild: { ...guild, unlockedRecipeIds: [...unlocked, droppedRecipeId], activeRogueliteRun: nextRun }, result: { guildChanged: true, roll, droppedRecipeId, alreadyAwarded: false, poolExhausted: false } };
}
