import { BOSS_WEAPON_RECIPE_IDS, ELITE_RING_RECIPE_IDS, THEME_BOSS_RECIPE_IDS, THEME_ELITE_RECIPE_IDS } from "../../data/crafting/rogueliteRecipePools";
import type { DungeonThemeId } from "../dungeons/dungeonTypes";
import type { GuildState } from "../guild/types";
import type { RandomSource } from "../../utils/random";
import type { RogueliteRecipeDropResult, RogueliteRewardNodeType, RogueliteRunState } from "./rogueliteTypes";
import { LATE_ROGUELITE_RECIPE_DROPS } from "../../data/crafting/lateRogueliteRecipeDrops";

export interface RogueliteRecipeDropContext { encounterId?: string; partyAverageLevel?: number }

export function createRogueliteRun(day: number, id = `run-${day}`): RogueliteRunState { return { id, startedDay: day, eliteRewardAttempts: 0, bossRewardAttempts: 0, eliteRecipeAwarded: false, bossRecipeAwarded: false, recipeIdsUnlockedThisRun: [] }; }
export function startRogueliteRun(guild: GuildState, id?: string): GuildState { if (guild.activeRogueliteRun) throw new Error("A roguelite run is already active"); return { ...guild, activeRogueliteRun: createRogueliteRun(guild.currentDay, id) }; }
export function finishRogueliteRun(guild: GuildState): GuildState { if (!guild.activeRogueliteRun) throw new Error("No roguelite run is active"); return { ...guild, activeRogueliteRun: null }; }

export function resolveRogueliteRecipeDrop(guild: GuildState, nodeType: RogueliteRewardNodeType, random: RandomSource, chanceModifier = 0, themeId?: DungeonThemeId, context: RogueliteRecipeDropContext = {}): { guild: GuildState; result: RogueliteRecipeDropResult } {
  const run = guild.activeRogueliteRun; if (!run) throw new Error("No roguelite run is active");
  const awardKey = nodeType === "elite" ? "eliteRecipeAwarded" : "bossRecipeAwarded";
  if (run[awardKey]) return { guild, result: { guildChanged: false, roll: null, droppedRecipeId: null, alreadyAwarded: true, poolExhausted: false } };
  const classRecipeIds = Object.values(nodeType === "elite" ? ELITE_RING_RECIPE_IDS : BOSS_WEAPON_RECIPE_IDS);
  const themeRecipeId = themeId ? (nodeType === "elite" ? THEME_ELITE_RECIPE_IDS : THEME_BOSS_RECIPE_IDS)[themeId] : undefined;
  const lateDrop = context.encounterId ? LATE_ROGUELITE_RECIPE_DROPS[context.encounterId] : undefined;
  const lateRecipeId = lateDrop && lateDrop.nodeType === nodeType && (context.partyAverageLevel ?? 0) >= lateDrop.minimumPartyLevel ? lateDrop.recipeId : undefined;
  const allRecipeIds = [...classRecipeIds, ...(themeRecipeId ? [themeRecipeId] : []), ...(lateRecipeId ? [lateRecipeId] : [])];
  const unlocked = new Set(guild.unlockedRecipeIds ?? []); const eligible = allRecipeIds.filter((id) => !unlocked.has(id));
  if (!eligible.length) return { guild, result: { guildChanged: false, roll: null, droppedRecipeId: null, alreadyAwarded: false, poolExhausted: true } };
  const roll = random.next(); const attemptsKey = nodeType === "elite" ? "eliteRewardAttempts" : "bossRewardAttempts";
  const attemptedRun = { ...run, [attemptsKey]: run[attemptsKey] + 1 };
  const dropChance = Math.max(0, Math.min(1, .50 + chanceModifier));
  if (roll >= dropChance) return { guild: { ...guild, activeRogueliteRun: attemptedRun }, result: { guildChanged: true, roll, droppedRecipeId: null, alreadyAwarded: false, poolExhausted: false } };
  const droppedRecipeId = random.pick(eligible);
  const nextRun = { ...attemptedRun, [awardKey]: true, recipeIdsUnlockedThisRun: [...attemptedRun.recipeIdsUnlockedThisRun, droppedRecipeId] };
  return { guild: { ...guild, unlockedRecipeIds: [...unlocked, droppedRecipeId], activeRogueliteRun: nextRun }, result: { guildChanged: true, roll, droppedRecipeId, alreadyAwarded: false, poolExhausted: false } };
}
