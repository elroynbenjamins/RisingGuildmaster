import { GAME_CONFIG } from "../../config/gameConfig";
import { TRAINING_PROGRAMS } from "../../data/training/trainingPrograms";
import { getCampaignLevelGuidance } from "../campaign/campaignReadinessService";
import type { GuildState } from "../guild/types";
import type { Hero } from "../heroes/types";
import { xpRequiredForNextLevel } from "../progression/xpSystem";
import { calculateTrainingQuote, getTrainingProgressionLimit, grantTrainingXp, trainingCapacity } from "./trainingService";
import type { TrainingProgramId, TrainingSession } from "./trainingTypes";

export interface TrainingBlocker {
  id: "capacity" | "facility" | "hero" | "gold" | "cap";
  label: string;
  tone: "danger" | "gold";
}

export interface TrainingQuotePresentation {
  programId: TrainingProgramId;
  goldCost: number;
  xpReward: number;
  completionDay: number;
  durationDays: number;
  readinessBefore: number;
  readinessAfter: number;
  levelBefore: number;
  levelAfter: number;
  xpBefore: number;
  xpAfter: number;
  xpNeededBefore: number;
  xpNeededAfter: number;
  levelCap: number;
  blockers: TrainingBlocker[];
  canBegin: boolean;
}

export interface TrainingSessionPresentation {
  sessionId: string;
  heroId: string;
  heroName: string;
  programName: string;
  completionDay: number;
  daysRemaining: number;
  elapsedDays: number;
  durationDays: number;
  progress: number;
  xpReward: number;
  readinessAtCompletion: number;
}

export interface TrainingCatchupAdvice {
  averageLevel: number;
  targetLevel: number;
  nextQuestName: string;
  sideQuestCount: number;
  message: string;
}

export function projectReadinessAfterDays(hero: Hero, days: number): number {
  return Math.min(GAME_CONFIG.maxAdventureStamina, hero.adventureStamina + Math.max(0, days) * GAME_CONFIG.adventureStaminaRecoveryPerDay);
}

export function getTrainingQuotePresentation(guild: GuildState, hero: Hero, programId: TrainingProgramId): TrainingQuotePresentation {
  const program = TRAINING_PROGRAMS[programId];
  const quote = calculateTrainingQuote(hero, programId, guild);
  const limit = getTrainingProgressionLimit(guild, hero);
  const blockers: TrainingBlocker[] = [];
  if (guild.trainingGround.sessions.length >= trainingCapacity(guild)) blockers.push({ id: "capacity", label: "Every Training Hall slot is occupied.", tone: "danger" });
  if (guild.trainingGround.level < program.trainingGroundLevel) blockers.push({ id: "facility", label: `Requires Training Hall Level ${program.trainingGroundLevel}.`, tone: "gold" });
  if (!hero.isAvailable || hero.currentHP <= 0) blockers.push({ id: "hero", label: "This hero is not currently available for training.", tone: "danger" });
  if (guild.gold < quote.goldCost) blockers.push({ id: "gold", label: `Need ${(quote.goldCost - guild.gold).toLocaleString()} more gold.`, tone: "gold" });
  if (quote.xpReward <= 0) blockers.push({ id: "cap", label: `Training cannot advance this hero beyond Level ${limit.levelCap}.`, tone: "gold" });
  const progressed = grantTrainingXp(hero, quote.xpReward, limit.levelCap);
  return {
    programId,
    goldCost: quote.goldCost,
    xpReward: quote.xpReward,
    completionDay: guild.currentDay + program.durationDays,
    durationDays: program.durationDays,
    readinessBefore: hero.adventureStamina,
    readinessAfter: projectReadinessAfterDays(hero, program.durationDays),
    levelBefore: hero.level,
    levelAfter: progressed.level,
    xpBefore: hero.xp,
    xpAfter: progressed.xp,
    xpNeededBefore: xpRequiredForNextLevel(hero.level),
    xpNeededAfter: xpRequiredForNextLevel(progressed.level),
    levelCap: limit.levelCap,
    blockers,
    canBegin: blockers.length === 0,
  };
}

export function getTrainingSessionPresentation(guild: GuildState, session: TrainingSession): TrainingSessionPresentation {
  const hero = guild.heroes.find((entry) => entry.id === session.heroId);
  const program = TRAINING_PROGRAMS[session.programId];
  const durationDays = Math.max(1, session.completionDay - session.startDay);
  const elapsedDays = Math.max(0, Math.min(durationDays, guild.currentDay - session.startDay));
  const daysRemaining = Math.max(0, session.completionDay - guild.currentDay);
  return {
    sessionId: session.id,
    heroId: session.heroId,
    heroName: hero?.name ?? "Unknown hero",
    programName: program.name,
    completionDay: session.completionDay,
    daysRemaining,
    elapsedDays,
    durationDays,
    progress: elapsedDays / durationDays,
    xpReward: session.xpReward,
    readinessAtCompletion: hero ? projectReadinessAfterDays(hero, daysRemaining) : 0,
  };
}

export function getTrainingCatchupAdvice(guild: GuildState): TrainingCatchupAdvice | null {
  const guidance = getCampaignLevelGuidance(guild);
  if (!guidance) return null;
  const gap = Math.max(0, guidance.targetLevel - guidance.averageLevel);
  return {
    averageLevel: guidance.averageLevel,
    targetLevel: guidance.targetLevel,
    nextQuestName: guidance.nextQuestName,
    sideQuestCount: guidance.sideQuestIds.length,
    message: `Your top-four roster is ${gap.toFixed(1)} level${Math.abs(gap - 1) < .001 ? "" : "s"} below the next campaign recommendation. One-clear Side Quests are the main active catch-up path; use Training Hall slots to supplement heroes while the rest of the guild adventures or recovers.`,
  };
}
