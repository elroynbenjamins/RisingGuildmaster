import { calculateHero } from "../heroes/heroCalculator";
import type { Hero } from "../heroes/types";
import type { GuildState } from "../guild/types";
import { getHeroSkillBonus } from "../proficiencies/proficiencyService";
import { getQuestStageProficiency } from "../../data/quests/questProficiencies";
import { QUEST_EXPLORATION_STAGES } from "../../data/quests/questExplorationStages";
import type { QuestDefinition } from "../quests/questTypes";
import { getEligiblePersonalQuestHeroes } from "../quests/questAvailability";
import { getQuestAdventureStaminaCost } from "../heroes/adventureStaminaService";
import { getQuestSkillCoverage } from "./partyReadinessService";

export type PartyCombatRole = "frontline" | "support" | "ranged";

const FRONTLINE_CLASSES = new Set(["warrior","paladin","berserker","bulwark","monk"]);
const SUPPORT_CLASSES = new Set(["cleric","bard","summoner","paladin"]);
const RANGED_CLASSES = new Set(["ranger","mage","spellbow","summoner"]);

export function getHeroPartyRoles(hero: Hero): PartyCombatRole[] {
  const roles: PartyCombatRole[] = [];
  if (FRONTLINE_CLASSES.has(hero.classId)) roles.push("frontline");
  if (SUPPORT_CLASSES.has(hero.classId)) roles.push("support");
  if (RANGED_CLASSES.has(hero.classId)) roles.push("ranged");
  if (!roles.length) roles.push("frontline");
  return roles;
}

function questSkillIds(quest: QuestDefinition) {
  return [...new Set((quest.explorationStageIds ?? []).flatMap((id) => {
    const stage = QUEST_EXPLORATION_STAGES[id];
    const skillId = stage && getQuestStageProficiency(stage.id, stage.skillId);
    return skillId ? [skillId] : [];
  }))];
}

function heroScore(hero: Hero, quest: QuestDefinition, selected: readonly Hero[]): number {
  const stats = calculateHero(hero).stats;
  const hpRatio = stats.maxHP ? hero.currentHP / stats.maxHP : 0;
  const recommended = quest.recommendedLevelMin ?? 1;
  let score = Math.min(hero.level, recommended + 2) * 8 + hpRatio * 20 + hero.adventureStamina * .15;
  const existingRoles = new Set(selected.flatMap(getHeroPartyRoles));
  for (const role of getHeroPartyRoles(hero)) if (!existingRoles.has(role)) score += 18;
  for (const skillId of questSkillIds(quest)) {
    const existingBest = Math.max(0, ...selected.map((entry) => getHeroSkillBonus(entry, skillId)));
    const candidate = getHeroSkillBonus(hero, skillId);
    if (candidate > existingBest) score += 8 + candidate;
  }
  return score;
}

export function suggestPartyForQuest(guild: GuildState, quest: QuestDefinition): string[] {
  const staminaCost = getQuestAdventureStaminaCost(quest);
  const eligible = guild.heroes.filter((hero) => hero.isAvailable && hero.currentHP > 0 && hero.adventureStamina >= staminaCost);
  const selected: Hero[] = [];
  const personal = getEligiblePersonalQuestHeroes(quest, eligible);
  if (quest.personalHeroRequirement && personal.length) selected.push([...personal].sort((a,b)=>b.level-a.level)[0]!);
  const remaining = () => eligible.filter((hero) => !selected.some((entry) => entry.id === hero.id));
  while (selected.length < Math.min(quest.maxPartySize, eligible.length)) {
    const next = remaining().map((hero) => ({ hero, score: heroScore(hero, quest, selected) })).sort((a,b)=>b.score-a.score || b.hero.level-a.hero.level)[0]?.hero;
    if (!next) break;
    selected.push(next);
  }
  return selected.map((hero) => hero.id);
}

export interface PartyCompositionSummary {
  averageLevel: number;
  averageHpPercent: number;
  averageReadiness: number;
  frontline: number;
  support: number;
  ranged: number;
  uncoveredChecks: string[];
  warnings: string[];
}

export function getPartyCompositionSummary(quest: QuestDefinition, heroes: readonly Hero[]): PartyCompositionSummary {
  const roles = heroes.flatMap(getHeroPartyRoles);
  const averageLevel = heroes.length ? heroes.reduce((sum, hero) => sum + hero.level, 0) / heroes.length : 0;
  const averageReadiness = heroes.length ? heroes.reduce((sum, hero) => sum + hero.adventureStamina, 0) / heroes.length : 0;
  const averageHpPercent = heroes.length ? heroes.reduce((sum, hero) => {
    const maxHP = calculateHero(hero).stats.maxHP;
    return sum + (maxHP ? hero.currentHP / maxHP * 100 : 0);
  }, 0) / heroes.length : 0;
  const uncoveredChecks = getQuestSkillCoverage(quest, heroes).filter((entry) => !entry.covered).map((entry) => entry.name);
  const frontline = roles.filter((role) => role === "frontline").length;
  const support = roles.filter((role) => role === "support").length;
  const ranged = roles.filter((role) => role === "ranged").length;
  const warnings: string[] = [];
  if (heroes.length && frontline === 0) warnings.push("No frontline coverage.");
  if (heroes.length >= 3 && support === 0) warnings.push("No support coverage.");
  if (heroes.length >= 3 && ranged === 0) warnings.push("No ranged coverage.");
  if (averageHpPercent > 0 && averageHpPercent < 60) warnings.push("Party average health is below 60%.");
  if (averageReadiness > 0 && averageReadiness < getQuestAdventureStaminaCost(quest) + 15) warnings.push("Low readiness leaves little reserve after this quest.");
  if (uncoveredChecks.length) warnings.push(`Uncovered checks: ${uncoveredChecks.join(", ")}.`);
  return { averageLevel, averageHpPercent, averageReadiness, frontline, support, ranged, uncoveredChecks, warnings };
}
