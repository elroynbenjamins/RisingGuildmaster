import { CLASSES } from "../../data/classes/classes";
import { TRAINING_PROGRAMS } from "../../data/training/trainingPrograms";
import { TRAINING_GROUND_CONFIG } from "../../config/trainingConfig";
import { ATTRIBUTE_KEYS, type AttributeKey, type Attributes } from "../attributes/types";
import type { GuildState } from "../guild/types";
import { collectHeroModifiers } from "../heroes/heroCalculator";
import type { Hero } from "../heroes/types";
import { applyModifiers } from "../modifiers/modifierEngine";
import { potentialMultiplier } from "../progression/potential";
import { grantHeroXp } from "../progression/levelSystem";
import { xpRequiredForNextLevel } from "../progression/xpSystem";
import type { TrainingProgramId, TrainingSession } from "./trainingTypes";

export function trainingCapacity(guild: GuildState): number { return TRAINING_GROUND_CONFIG.capacityByLevel[guild.trainingGround.level] ?? 1; }

export interface TrainingProgressionLimit { campaignCap: number; rosterCap: number; levelCap: number; developmentSessionsUsed: number; developmentSessionsMax: number }

export function getCampaignTrainingLevelCap(guild: GuildState): number {
  const completed = new Set(guild.world.completedCampaignNodeIds);
  if (guild.world.worldFlags.chapter_2_complete || completed.has("hollow_warden_boss")) return 11;
  if (completed.has("chainbreaker_boss")) return 8;
  if (completed.has("broken_wardstone") || guild.world.campaignChapter >= 2) return 6;
  return 3;
}

export function getTrainingProgressionLimit(guild: GuildState, hero: Hero): TrainingProgressionLimit {
  const peers = guild.heroes.filter((entry) => entry.id !== hero.id && entry.isAvailable && entry.currentHP > 0).sort((a, b) => b.level - a.level).slice(0, 4);
  const rosterCap = peers.length ? Math.max(hero.level, Math.floor(peers.reduce((sum, entry) => sum + entry.level, 0) / peers.length) - 1) : hero.level;
  const campaignCap = getCampaignTrainingLevelCap(guild);
  const developmentSessionsUsed = hero.focusedTrainingLevel === hero.level ? hero.focusedTrainingSessions ?? 0 : 0;
  return { campaignCap, rosterCap, levelCap: Math.max(hero.level, Math.min(campaignCap, rosterCap)), developmentSessionsUsed, developmentSessionsMax: TRAINING_GROUND_CONFIG.maxDevelopmentSessionsPerHeroLevel };
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

export function calculateTrainingQuote(hero: Hero, programId: TrainingProgramId, guild?: GuildState): { goldCost: number; xpReward: number; growthReward: number; levelCap?: number; developmentSessionsUsed?: number } {
  const program = TRAINING_PROGRAMS[programId]; const modifiers = collectHeroModifiers(hero); const context = { currentHP: hero.currentHP, maxHP: hero.currentHP };
  const costMultiplier = Math.max(.25, applyModifiers(1, "trainingCost", modifiers, context));
  const xpMultiplier = Math.max(.1, applyModifiers(1, "trainingXp", modifiers, context));
  const rawXp = Math.max(1, Math.round(program.baseXp * potentialMultiplier(hero.potential) * xpMultiplier));
  const limit = guild ? getTrainingProgressionLimit(guild, hero) : undefined;
  const canDevelop = !limit || limit.developmentSessionsUsed < limit.developmentSessionsMax;
  return { goldCost: Math.max(1, Math.round(program.baseGoldCost * costMultiplier)), xpReward: limit ? Math.min(rawXp, maxXpBeforeLevelCap(hero, limit.levelCap)) : rawXp, growthReward: canDevelop ? program.classWeightedGrowth * potentialMultiplier(hero.potential) : 0, levelCap: limit?.levelCap, developmentSessionsUsed: limit?.developmentSessionsUsed };
}
export function startHeroTraining(guild: GuildState, heroId: string, programId: TrainingProgramId, focusedAttribute?: AttributeKey): GuildState {
  const hero = guild.heroes.find((item) => item.id === heroId); const program = TRAINING_PROGRAMS[programId];
  if (!hero || !program) throw new Error("Training selection is unavailable");
  if (guild.trainingGround.sessions.length >= trainingCapacity(guild)) throw new Error("Every training slot is occupied");
  if (guild.trainingGround.level < program.trainingGroundLevel) throw new Error(`Requires Training Grounds Level ${program.trainingGroundLevel}`);
  if (!hero.isAvailable || hero.currentHP <= 0) throw new Error("Hero is not available for training");
  if (guild.trainingGround.sessions.some((session) => session.heroId === heroId)) throw new Error("Hero is already training");
  if (programId === "focused_practice" && !focusedAttribute) throw new Error("Choose an attribute to focus");
  const quote = calculateTrainingQuote(hero, programId, guild); if (guild.gold < quote.goldCost) throw new Error("Not enough gold");
  if (quote.xpReward <= 0 && quote.growthReward <= 0) throw new Error(`Training cannot advance this hero beyond Level ${quote.levelCap}`);
  const consumesDevelopment = quote.growthReward > 0;
  const session: TrainingSession = { id: `training-${guild.currentDay}-${heroId}-${guild.trainingGround.completedTrainingCount}`, heroId, programId, startDay: guild.currentDay, completionDay: guild.currentDay + program.durationDays, goldCost: quote.goldCost, xpReward: quote.xpReward, focusedAttribute, growthReward: quote.growthReward, levelCap: quote.levelCap, developmentLevel: consumesDevelopment ? hero.level : undefined };
  return { ...guild, gold: guild.gold - quote.goldCost, heroes: guild.heroes.map((item) => item.id === heroId ? { ...item, isAvailable: false, focusedTrainingLevel: consumesDevelopment ? hero.level : item.focusedTrainingLevel, focusedTrainingSessions: consumesDevelopment ? (hero.focusedTrainingLevel === hero.level ? hero.focusedTrainingSessions ?? 0 : 0) + 1 : item.focusedTrainingSessions } : item), trainingGround: { ...guild.trainingGround, sessions: [...guild.trainingGround.sessions, session] } };
}

function applyGrowth(hero: Hero, session: TrainingSession): Hero {
  if (session.growthReward <= 0) return hero;
  const progress = { ...hero.attributeGrowthProgress }; const baseAttributes = { ...hero.baseAttributes };
  if (session.focusedAttribute) progress[session.focusedAttribute] += session.growthReward;
  else {
    const weights = CLASSES[hero.classId].attributeGrowthWeights; const total = ATTRIBUTE_KEYS.reduce((sum, key) => sum + weights[key], 0);
    for (const key of ATTRIBUTE_KEYS) progress[key] += session.growthReward * weights[key] / total;
  }
  for (const key of ATTRIBUTE_KEYS) { const gain = Math.floor(progress[key]); if (gain > 0) { baseAttributes[key] += gain; progress[key] -= gain; } }
  return { ...hero, baseAttributes, attributeGrowthProgress: progress as Attributes };
}

export function resolveTrainingGroundDay(guild: GuildState): { guild: GuildState; completedHeroNames: string[]; upgraded: boolean } {
  const ready = guild.trainingGround.sessions.filter((session) => session.completionDay <= guild.currentDay); const names: string[] = [];
  let heroes = guild.heroes.map((hero) => { const session = ready.find((item) => item.heroId === hero.id); if (!session) return hero; names.push(hero.name); const progressed = session.levelCap === undefined ? grantHeroXp(hero, session.xpReward) : grantTrainingXp(hero, session.xpReward, session.levelCap); return { ...applyGrowth(progressed, session), isAvailable: true, history: { ...hero.history, importantEvents: [...hero.history.importantEvents, `Completed ${TRAINING_PROGRAMS[session.programId].name} on Day ${guild.currentDay}.`] } }; });
  const upgradeReady = Boolean(guild.trainingGround.upgrade && guild.trainingGround.upgrade.completionDay <= guild.currentDay);
  return { guild: { ...guild, heroes, trainingGround: { ...guild.trainingGround, level: upgradeReady ? guild.trainingGround.upgrade!.targetLevel : guild.trainingGround.level, upgrade: upgradeReady ? null : guild.trainingGround.upgrade, sessions: guild.trainingGround.sessions.filter((session) => session.completionDay > guild.currentDay), completedTrainingCount: guild.trainingGround.completedTrainingCount + ready.length } }, completedHeroNames: names, upgraded: upgradeReady };
}

export function startTrainingGroundUpgrade(guild: GuildState): GuildState {
  if (guild.trainingGround.upgrade) throw new Error("A Training Grounds upgrade is already underway");
  const targetLevel = guild.trainingGround.level + 1; if (targetLevel > TRAINING_GROUND_CONFIG.maxLevel) throw new Error("Training Grounds are already fully upgraded");
  const upgrade = TRAINING_GROUND_CONFIG.upgrades[targetLevel]!; if (guild.gold < upgrade.goldCost) throw new Error("Not enough gold");
  return { ...guild, gold: guild.gold - upgrade.goldCost, trainingGround: { ...guild.trainingGround, upgrade: { targetLevel, startDay: guild.currentDay, completionDay: guild.currentDay + upgrade.durationDays, goldCost: upgrade.goldCost } } };
}
