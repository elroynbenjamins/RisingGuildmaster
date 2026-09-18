import { getDifficulty } from "../../data/difficulty/difficulties";
import { GUILD_OPERATIONS } from "../../data/operations/guildOperations";
import { REGIONAL_THREATS } from "../../data/world/regionalThreats";
import { areRegionalThreatsUnlocked } from "../world/regionalThreatService";
import type { RandomSource } from "../../utils/random";
import { advanceGuildTime } from "../economy/guildCalendarService";
import type { GuildState } from "../guild/types";
import { grantGuildmasterXp } from "../guildmaster/guildmasterProgression";
import { appendHeroHistoryEvent } from "../heroes/heroHistoryService";
import { grantHeroXp } from "../progression/levelSystem";
import { resolveAbilityCheck } from "../world/worldEventResolver";
import type { GuildOperationDefinition, GuildOperationResult, GuildOperationState } from "./guildOperationTypes";

export const GUILD_OPERATION_TEAM_SIZE = 3;
export const GUILD_OPERATION_STAMINA_COST = 50;
export const GUILD_OPERATION_COOLDOWN_DAYS = 3;

export function isGuildOperationsUnlocked(guild: GuildState): boolean {
  return guild.world.completedCampaignNodeIds.includes("broken_wardstone");
}

export function getAvailableGuildOperations(guild: GuildState): GuildOperationDefinition[] {
  if (!isGuildOperationsUnlocked(guild)) return [];
  return Object.values(GUILD_OPERATIONS).filter((operation) =>
    guild.world.unlockedRegionIds.includes(operation.regionId)
    && (operation.requiredWorldFlags ?? []).every((flag) => guild.world.worldFlags[flag] === true)
    && (operation.forbiddenWorldFlags ?? []).every((flag) => guild.world.worldFlags[flag] !== true),
  );
}

export function getEligibleOperationHeroIds(guild: GuildState): string[] {
  return guild.heroes.filter((hero) => hero.currentHP > 0 && hero.isAvailable && hero.adventureStamina >= GUILD_OPERATION_STAMINA_COST).map((hero) => hero.id);
}

function validateTeams(guild: GuildState, vanguardHeroIds: readonly string[], supportHeroIds: readonly string[]): void {
  if (vanguardHeroIds.length !== GUILD_OPERATION_TEAM_SIZE || supportHeroIds.length !== GUILD_OPERATION_TEAM_SIZE) throw new Error("Assign exactly three heroes to each operation team");
  const allIds = [...vanguardHeroIds, ...supportHeroIds];
  if (new Set(allIds).size !== allIds.length) throw new Error("A hero cannot serve on both operation teams");
  const eligibleIds = new Set(getEligibleOperationHeroIds(guild));
  const invalid = allIds.find((id) => !eligibleIds.has(id));
  if (invalid) throw new Error("Every assigned hero must be alive, available, and have 50 readiness stamina");
}

function applyThreatOutcome(guild: GuildState, operation: GuildOperationDefinition, rank: GuildOperationResult["rank"]): { guild: GuildState; threatDelta: number } {
  const crisis = REGIONAL_THREATS[operation.regionId];
  if (!areRegionalThreatsUnlocked(guild.world) || !crisis || guild.world.completedQuestIds.includes(crisis.resolutionQuestId)) return { guild, threatDelta: 0 };
  const before = guild.world.regionThreat?.[operation.regionId] ?? 0;
  const requestedDelta = rank === "decisive_victory" ? -2 : rank === "hard_won_victory" ? -1 : 1;
  const after = Math.max(0, Math.min(crisis.maximumThreat, before + requestedDelta));
  return {
    guild: { ...guild, world: { ...guild.world, regionThreat: { ...(guild.world.regionThreat ?? {}), [operation.regionId]: after } } },
    threatDelta: after - before,
  };
}

export function resolveGuildOperation(guild: GuildState, operationId: string, vanguardHeroIds: readonly string[], supportHeroIds: readonly string[], random: RandomSource): { guild: GuildState; result: GuildOperationResult } {
  if (!isGuildOperationsUnlocked(guild)) throw new Error("Complete Chapter 1 to unlock Crisis Operations");
  if (guild.currentDay < guild.guildOperations.nextAvailableDay) throw new Error(`Crisis Operations recover on Day ${guild.guildOperations.nextAvailableDay}`);
  const operation = getAvailableGuildOperations(guild).find((entry) => entry.id === operationId);
  if (!operation) throw new Error("This operation is not currently available");
  validateTeams(guild, vanguardHeroIds, supportHeroIds);
  const vanguard = guild.heroes.filter((hero) => vanguardHeroIds.includes(hero.id));
  const support = guild.heroes.filter((hero) => supportHeroIds.includes(hero.id));
  const checks = operation.phases.flatMap((phase) => [
    { phaseId: phase.id, phaseTitle: phase.title, team: "vanguard" as const, title: phase.vanguard.title, result: resolveAbilityCheck({ attribute: phase.vanguard.attribute, difficultyClass: phase.vanguard.difficultyClass }, vanguard, random) },
    { phaseId: phase.id, phaseTitle: phase.title, team: "support" as const, title: phase.support.title, result: resolveAbilityCheck({ attribute: phase.support.attribute, difficultyClass: phase.support.difficultyClass }, support, random) },
  ]);
  const successes = checks.filter((check) => check.result.success).length;
  const rank = successes >= 5 ? "decisive_victory" : successes >= 3 ? "hard_won_victory" : "setback";
  const rewardMultiplier = rank === "decisive_victory" ? 1.5 : rank === "hard_won_victory" ? 1 : .35;
  const xpMultiplier = rank === "setback" ? .5 : rewardMultiplier;
  const difficultyGold = getDifficulty(guild.difficultyId).questGoldMultiplier;
  const goldReward = Math.round(operation.baseGoldReward * rewardMultiplier * difficultyGold);
  const xpRewardPerHero = Math.round(operation.baseXpReward * xpMultiplier);
  const reputationReward = rank === "setback" ? 0 : Math.round(operation.reputationReward * rewardMultiplier);
  const participantIds = new Set([...vanguardHeroIds, ...supportHeroIds]);
  let updated: GuildState = {
    ...guild,
    gold: guild.gold + goldReward,
    reputation: guild.reputation + reputationReward,
    guildmaster: grantGuildmasterXp(guild.guildmaster, rank === "setback" ? 70 : 140),
    materials: { ...guild.materials },
    heroes: guild.heroes.map((hero) => {
      if (!participantIds.has(hero.id)) return hero;
      const progressed = grantHeroXp({ ...hero, adventureStamina: hero.adventureStamina - GUILD_OPERATION_STAMINA_COST }, xpRewardPerHero);
      return appendHeroHistoryEvent(progressed, {
        day: guild.currentDay,
        type: "campaign",
        outcome: rank === "setback" ? "negative" : "positive",
        title: `${rank === "setback" ? "Survived" : "Completed"}: ${operation.name}`,
        description: `${hero.name} served with the ${vanguardHeroIds.includes(hero.id) ? "Vanguard" : "Support"} team during a six-hero Crisis Operation. The guild achieved ${successes} of ${checks.length} objectives.`,
        tags: ["guild_operation", rank, vanguardHeroIds.includes(hero.id) ? "vanguard" : "support"],
      });
    }),
  };
  for (const [materialId, baseAmount] of Object.entries(operation.materialRewards)) {
    const amount = Math.max(rank === "setback" ? 0 : 1, Math.floor((baseAmount ?? 0) * rewardMultiplier));
    updated.materials[materialId as keyof typeof updated.materials] += amount;
  }
  const threat = applyThreatOutcome(updated, operation, rank);
  updated = advanceGuildTime(threat.guild).guild;
  updated = {
    ...updated,
    guildOperations: {
      completedCount: guild.guildOperations.completedCount + 1,
      nextAvailableDay: updated.currentDay + GUILD_OPERATION_COOLDOWN_DAYS,
      lastOperationId: operation.id,
    },
  };
  return {
    guild: updated,
    result: {
      operationId: operation.id,
      rank,
      successes,
      totalChecks: checks.length,
      goldReward,
      xpRewardPerHero,
      reputationReward,
      threatDelta: threat.threatDelta,
      checks,
      dialogue: rank === "setback" ? operation.setbackDialogue : operation.victoryDialogue,
    },
  };
}

export function migrateGuildOperationState(state: GuildOperationState | undefined): GuildOperationState {
  return { completedCount: state?.completedCount ?? 0, nextAvailableDay: state?.nextAvailableDay ?? 1, lastOperationId: state?.lastOperationId ?? null };
}
