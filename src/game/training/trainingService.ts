import { TRAINING_PROGRAMS } from "../../data/training/trainingPrograms";
import { TRAINING_GROUND_CONFIG } from "../../config/trainingConfig";
import type { GuildState } from "../guild/types";
import { collectHeroModifiers } from "../heroes/heroCalculator";
import type { Hero } from "../heroes/types";
import { applyModifiers } from "../modifiers/modifierEngine";
import { grantHeroXp } from "../progression/levelSystem";
import { xpRequiredForNextLevel } from "../progression/xpSystem";
import type { TrainingProgramId, TrainingSession } from "./trainingTypes";
import { appendHeroHistoryEvent } from "../heroes/heroHistoryService";

export function trainingCapacity(guild: GuildState): number { return TRAINING_GROUND_CONFIG.capacityByLevel[guild.trainingGround.level] ?? 1; }

export interface TrainingProgressionLimit { campaignCap: number; rosterCap: number; levelCap: number }

export function getCampaignTrainingLevelCap(guild: GuildState): number {
  const completed = new Set(guild.world.completedCampaignNodeIds);
  if (guild.world.worldFlags.chapter_2_complete || completed.has("hollow_warden_boss")) return 11;
  if (completed.has("chainbreaker_boss")) return 8;
  if (completed.has("broken_wardstone") || guild.world.campaignChapter >= 2) return 6;
  return 4;
}

export function getTrainingProgressionLimit(guild: GuildState, hero: Hero): TrainingProgressionLimit {
  const peers = guild.heroes.filter((entry) => entry.id !== hero.id && entry.isAvailable && entry.currentHP > 0).sort((a, b) => b.level - a.level).slice(0, 4);
  const rosterCap = peers.length ? Math.max(hero.level, Math.floor(peers.reduce((sum, entry) => sum + entry.level, 0) / peers.length) - 1) : hero.level;
  const campaignCap = getCampaignTrainingLevelCap(guild);
  return { campaignCap, rosterCap, levelCap: Math.max(hero.level, Math.min(campaignCap, rosterCap)) };
}

function maxXpBeforeLevelCap(hero: Hero, levelCap: number): number {
  if (hero.level > levelCap) return 0;
  let room = Math.max(0, xpRequiredForNextLevel(hero.level) - hero.xp - 1);
  for (let level = hero.level + 1; level <= levelCap; level += 1) room += xpRequiredForNextLevel(level);
  return room;
}

export function grantTrainingXp(hero: Hero, amount: number, levelCap: number): Hero {
  return grantHeroXp(hero, Math.min(Math.max(0, Math.round(amount)), maxXpBeforeLevelCap(hero, levelCap)));
}

export function getTrainingGoldCost(programId: TrainingProgramId, costMultiplier = 1): number {
  // Apply the price reduction and hero modifiers before rounding to whole tens.
  return Math.floor(TRAINING_PROGRAMS[programId].baseGoldCost * TRAINING_GROUND_CONFIG.programCostMultiplier * costMultiplier / 10) * 10;
}

export function calculateTrainingQuote(hero: Hero, programId: TrainingProgramId, guild?: GuildState): { goldCost: number; xpReward: number; levelCap?: number; developmentSessionsUsed?: number } {
  const program = TRAINING_PROGRAMS[programId]; const modifiers = collectHeroModifiers(hero); const context = { currentHP: hero.currentHP, maxHP: hero.currentHP };
  const costMultiplier = Math.max(.25, applyModifiers(1, "trainingCost", modifiers, context));
  const xpMultiplier = Math.max(.1, applyModifiers(1, "trainingXp", modifiers, context));
  const rawXp = Math.max(1, Math.round(program.baseXp * xpMultiplier));
  const limit = guild ? getTrainingProgressionLimit(guild, hero) : undefined;
  return { goldCost: getTrainingGoldCost(programId, costMultiplier), xpReward: limit ? Math.min(rawXp, maxXpBeforeLevelCap(hero, limit.levelCap)) : rawXp, levelCap: limit?.levelCap, developmentSessionsUsed: hero.focusedTrainingSessions ?? 0 };
}
export function startHeroTraining(guild: GuildState, heroId: string, programId: TrainingProgramId): GuildState {
  const hero = guild.heroes.find((item) => item.id === heroId); const program = TRAINING_PROGRAMS[programId];
  if (!hero || !program) throw new Error("Training selection is unavailable");
  if (guild.trainingGround.sessions.length >= trainingCapacity(guild)) throw new Error("Every training slot is occupied");
  if (guild.trainingGround.level < program.trainingGroundLevel) throw new Error(`Requires Training Hall Level ${program.trainingGroundLevel}`);
  if (!hero.isAvailable || hero.currentHP <= 0) throw new Error("Hero is not available for training");
  if (guild.trainingGround.sessions.some((session) => session.heroId === heroId)) throw new Error("Hero is already training");
  const quote = calculateTrainingQuote(hero, programId, guild); if (guild.gold < quote.goldCost) throw new Error("Not enough gold");
  if (quote.xpReward <= 0) throw new Error(`Training cannot advance this hero beyond Level ${quote.levelCap}`);
  const session: TrainingSession = { id: `training-${guild.currentDay}-${heroId}-${guild.trainingGround.completedTrainingCount}`, heroId, programId, startDay: guild.currentDay, completionDay: guild.currentDay + program.durationDays, goldCost: quote.goldCost, xpReward: quote.xpReward, levelCap: quote.levelCap };
  return { ...guild, gold: guild.gold - quote.goldCost, heroes: guild.heroes.map((item) => item.id === heroId ? { ...item, isAvailable: false } : item), trainingGround: { ...guild.trainingGround, sessions: [...guild.trainingGround.sessions, session] } };
}

export function resolveTrainingGroundDay(guild: GuildState): { guild: GuildState; completedHeroNames: string[]; upgraded: boolean } {
  const ready = guild.trainingGround.sessions.filter((session) => session.completionDay <= guild.currentDay); const names: string[] = [];
  let heroes = guild.heroes.map((hero) => { const session = ready.find((item) => item.heroId === hero.id); if (!session) return hero; names.push(hero.name); const program = TRAINING_PROGRAMS[session.programId]; const progressed = session.levelCap === undefined ? grantHeroXp(hero, session.xpReward) : grantTrainingXp(hero, session.xpReward, session.levelCap); const trained = { ...progressed, isAvailable: true, history: { ...hero.history, importantEvents: [...hero.history.importantEvents, `Completed ${program.name} on Day ${guild.currentDay}.`] } }; return appendHeroHistoryEvent(trained, { day: guild.currentDay, type: "training", outcome: "positive", title: `Completed ${program.name}`, description: `${hero.name} completed training and earned ${session.xpReward} XP.` }); });
  const upgradeReady = Boolean(guild.trainingGround.upgrade && guild.trainingGround.upgrade.completionDay <= guild.currentDay);
  return { guild: { ...guild, heroes, trainingGround: { ...guild.trainingGround, level: upgradeReady ? guild.trainingGround.upgrade!.targetLevel : guild.trainingGround.level, upgrade: upgradeReady ? null : guild.trainingGround.upgrade, sessions: guild.trainingGround.sessions.filter((session) => session.completionDay > guild.currentDay), completedTrainingCount: guild.trainingGround.completedTrainingCount + ready.length } }, completedHeroNames: names, upgraded: upgradeReady };
}

export function startTrainingGroundUpgrade(guild: GuildState): GuildState {
  if (guild.trainingGround.upgrade) throw new Error("A Training Hall upgrade is already underway");
  const targetLevel = guild.trainingGround.level + 1; if (targetLevel > TRAINING_GROUND_CONFIG.maxLevel) throw new Error("Training Hall is already fully upgraded");
  const upgrade = TRAINING_GROUND_CONFIG.upgrades[targetLevel]!; if (guild.gold < upgrade.goldCost) throw new Error("Not enough gold");
  return { ...guild, gold: guild.gold - upgrade.goldCost, trainingGround: { ...guild.trainingGround, upgrade: { targetLevel, startDay: guild.currentDay, completionDay: guild.currentDay + upgrade.durationDays, goldCost: upgrade.goldCost } } };
}
