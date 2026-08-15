import { CLASS_SKILL_TREES, type ClassSkillNodeDefinition } from "../../../data/skills/classSkillTrees";
import type { Hero } from "../../heroes/types";

/** Heroes earn one permanent class-skill choice at each milestone. */
export const CLASS_SKILL_POINT_LEVELS = [2, 4, 6, 8] as const;

export type SkillNodeState = "learned" | "available" | "locked_level" | "locked_prerequisite" | "no_points";
export interface HeroSkillNode extends ClassSkillNodeDefinition { state: SkillNodeState }

export function getEarnedClassSkillPoints(level: number): number {
  return CLASS_SKILL_POINT_LEVELS.filter((requiredLevel) => level >= requiredLevel).length;
}

export function getLearnedClassSkillIds(hero: Hero): string[] {
  const validIds = new Set(CLASS_SKILL_TREES[hero.classId].nodes.map((node) => node.skillId));
  return [...new Set(hero.learnedSkillIds)].filter((id) => validIds.has(id));
}

export function getAvailableClassSkillPoints(hero: Hero): number {
  return Math.max(0, getEarnedClassSkillPoints(hero.level) - getLearnedClassSkillIds(hero).length);
}

export function getNextClassSkillPointLevel(level: number): number | null {
  return CLASS_SKILL_POINT_LEVELS.find((requiredLevel) => requiredLevel > level) ?? null;
}

function nodeState(hero: Hero, node: ClassSkillNodeDefinition): SkillNodeState {
  const learned = getLearnedClassSkillIds(hero);
  if (learned.includes(node.skillId)) return "learned";
  if (hero.level < node.requiredLevel) return "locked_level";
  if ((node.prerequisiteSkillIds ?? []).some((id) => !learned.includes(id))) return "locked_prerequisite";
  return getAvailableClassSkillPoints(hero) > 0 ? "available" : "no_points";
}

export function getHeroSkillTree(hero: Hero): HeroSkillNode[] {
  return CLASS_SKILL_TREES[hero.classId].nodes.map((node) => ({ ...node, state: nodeState(hero, node) }));
}

export function learnClassSkill(hero: Hero, skillId: string): Hero {
  const node = CLASS_SKILL_TREES[hero.classId].nodes.find((entry) => entry.skillId === skillId);
  if (!node) throw new Error("Skill does not belong to this hero's class");
  const state = nodeState(hero, node);
  if (state === "learned") throw new Error("Skill is already learned");
  if (state === "locked_level") throw new Error(`Skill unlocks at Level ${node.requiredLevel}`);
  if (state === "locked_prerequisite") throw new Error("Required earlier skill has not been learned");
  if (state === "no_points") throw new Error("No class skill points available");
  return { ...hero, learnedSkillIds: [...getLearnedClassSkillIds(hero), skillId] };
}
