import { QUEST_EXPLORATION_STAGES } from "../../data/quests/questExplorationStages";
import { getQuestStageProficiency } from "../../data/quests/questProficiencies";
import { SKILLS } from "../../data/proficiencies/skills";
import type { Hero } from "../heroes/types";
import { getHeroSkillBonus } from "../proficiencies/proficiencyService";
import { relationshipBand, relationshipScore } from "../relationships/relationshipService";
import type { QuestDefinition } from "../quests/questTypes";

export interface QuestSkillCoverage { skillId: keyof typeof SKILLS; name: string; covered: boolean; bestHeroName?: string; bonus: number }
export function getQuestSkillCoverage(quest: QuestDefinition, heroes: readonly Hero[]): QuestSkillCoverage[] {
  const ids = [...new Set((quest.explorationStageIds ?? []).flatMap((id) => { const stage = QUEST_EXPLORATION_STAGES[id]; const skillId = stage && getQuestStageProficiency(stage.id, stage.skillId); return skillId ? [skillId] : []; }))];
  return ids.map((skillId) => { const ranked = heroes.map((hero) => ({ hero, bonus: getHeroSkillBonus(hero, skillId) })).sort((a, b) => b.bonus - a.bonus); const best = ranked[0]; return { skillId, name: SKILLS[skillId].name, covered: (best?.bonus ?? 0) > 0, ...(best?.bonus ? { bestHeroName: best.hero.name } : {}), bonus: best?.bonus ?? 0 }; });
}

export interface PartyBondSummary { friends: number; rivals: number; strongestLabel?: string; warning?: string }
export function getPartyBondSummary(heroes: readonly Hero[], relationships: Parameters<typeof relationshipScore>[0]): PartyBondSummary {
  let friends = 0; let rivals = 0; let strongest: { names: string; score: number } | undefined;
  for (let i = 0; i < heroes.length; i += 1) for (let j = i + 1; j < heroes.length; j += 1) { const a = heroes[i]!; const b = heroes[j]!; const score = relationshipScore(relationships, a.id, b.id); const band = relationshipBand(score); if (band === "friend" || band === "close_friend") friends += 1; if (band === "rival") rivals += 1; if (!strongest || Math.abs(score) > Math.abs(strongest.score)) strongest = { names: `${a.name} & ${b.name}`, score }; }
  return { friends, rivals, ...(strongest && strongest.score !== 0 ? { strongestLabel: `${strongest.names}: ${strongest.score > 0 ? "+" : ""}${strongest.score}` } : {}), ...(rivals ? { warning: "Rivals gain offensive drive, but heal one another less effectively." } : {}) };
}
