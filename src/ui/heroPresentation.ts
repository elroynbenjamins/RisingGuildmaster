import { CONDITIONS } from "../data/conditions/conditions";
import { TRAINING_PROGRAMS } from "../data/training/trainingPrograms";
import type { ClassId, Hero } from "../game/heroes/types";
import type { HeroContract } from "../game/recruitment/recruitmentTypes";
import type { TrainingSession } from "../game/training/trainingTypes";

export type HeroUiTone = "neutral" | "gold" | "good" | "danger" | "blue";

export const HERO_CLASS_ACCENTS: Record<ClassId, string> = {
  warrior: "#c98758",
  ranger: "#71ad77",
  mage: "#8f79c8",
  cleric: "#d3b96a",
  paladin: "#cfae63",
  berserker: "#c96358",
  monk: "#71a9a0",
  bard: "#b977ad",
  spellbow: "#6a9ec3",
  bulwark: "#8d9ca0",
  summoner: "#8b73ad",
};

export const HERO_COMBAT_ROLES: Record<ClassId, string> = {
  warrior: "FRONTLINE FIGHTER",
  ranger: "RANGED STRIKER",
  mage: "ARCANE DAMAGE",
  cleric: "HEALER / SUPPORT",
  paladin: "FRONTLINE SUPPORT",
  berserker: "MELEE STRIKER",
  monk: "MOBILE SKIRMISHER",
  bard: "SUPPORT / CONTROL",
  spellbow: "ARCANE MARKSMAN",
  bulwark: "TANK / PROTECTOR",
  summoner: "SUMMONER / CONTROL",
};

export interface HeroDutyStatus {
  label: string;
  tone: HeroUiTone;
  detail: string;
}

export function getHeroDutyStatus(hero: Hero, session: TrainingSession | undefined, currentDay: number): HeroDutyStatus {
  if (hero.currentHP <= 0) return { label: "FALLEN", tone: "danger", detail: "Requires revival at the Temple" };
  if (session) {
    const program = TRAINING_PROGRAMS[session.programId];
    const days = Math.max(0, session.completionDay - currentDay);
    return { label: "TRAINING", tone: "blue", detail: `${program.name} · ${days} day${days === 1 ? "" : "s"} remaining` };
  }
  const firstCondition = hero.conditions[0];
  if (firstCondition) {
    const definition = CONDITIONS[firstCondition.conditionId];
    return {
      label: definition.category === "boon" ? "INSPIRED" : "INJURED",
      tone: definition.category === "boon" ? "good" : "gold",
      detail: `${definition.name}${hero.conditions.length > 1 ? ` +${hero.conditions.length - 1}` : ""}`,
    };
  }
  if (!hero.isAvailable) return { label: "BUSY", tone: "neutral", detail: "Unavailable for field duty" };
  return { label: "FIELD READY", tone: "good", detail: "Available for quests" };
}

export interface HeroContractPresentation {
  label: string;
  tone: HeroUiTone;
  daysRemaining: number;
  detail: string;
}

export function getHeroContractPresentation(contract: HeroContract | undefined, currentDay: number): HeroContractPresentation | null {
  if (!contract) return null;
  const daysRemaining = contract.endDay - currentDay;
  if (daysRemaining <= 0) {
    return { label: "CONTRACT EXPIRED", tone: "danger", daysRemaining, detail: `Ended Day ${contract.endDay}` };
  }
  if (daysRemaining <= 14) {
    return { label: `CONTRACT ${daysRemaining}D`, tone: "gold", daysRemaining, detail: `Renewal approaching · ends Day ${contract.endDay}` };
  }
  return { label: `CONTRACT ${daysRemaining}D`, tone: "neutral", daysRemaining, detail: `Signed through Day ${contract.endDay}` };
}
