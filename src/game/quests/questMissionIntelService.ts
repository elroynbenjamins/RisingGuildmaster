import { QUEST_ENCOUNTERS } from "../../data/encounters/questEncounters";
import { getEnemyDefinition } from "../../data/enemies";
import { ENEMY_FACTIONS } from "../../data/enemies/factions";
import { ENEMY_BEHAVIORS } from "../../data/enemyBehaviors/enemyBehaviors";
import { ENEMY_SKILLS } from "../../data/skills/enemySkills";
import type { EnemyRole } from "../enemies/enemyTypes";
import type { QuestDefinition } from "./questTypes";

export type MissionIntelCoverage = "none" | "low" | "partial" | "good" | "complete";

export interface MissionIntelEnemyEntry {
  enemyDefinitionId: string;
  name: string;
  role: EnemyRole;
  count: number;
}

export interface QuestMissionIntel {
  totalEnemyUnits: number;
  knownEnemyUnits: number;
  unknownEnemyUnits: number;
  coverageRatio: number;
  coverage: MissionIntelCoverage;
  coverageLabel: string;
  factionNames: string[];
  knownEnemies: MissionIntelEnemyEntry[];
  knownRoles: EnemyRole[];
  knownConditionIds: string[];
  unknownEnemyTypes: number;
  summary: string;
}

function coverageBand(ratio: number, total: number): MissionIntelCoverage {
  if (total <= 0 || ratio <= 0) return "none";
  if (ratio < .35) return "low";
  if (ratio < .7) return "partial";
  if (ratio < 1) return "good";
  return "complete";
}

const COVERAGE_LABELS: Record<MissionIntelCoverage, string> = {
  none: "NO FIELD INTEL",
  low: "LIMITED INTEL",
  partial: "PARTIAL INTEL",
  good: "GOOD INTEL",
  complete: "COMPLETE INTEL",
};

/**
 * Quest briefings always reveal the broad faction and encounter scale. Exact
 * creature identities and roles are earned by meeting those enemies in play,
 * making the Monster Manual useful during future preparation without blocking
 * the player from attempting new content.
 */
export function getQuestMissionIntel(quest: QuestDefinition, discoveredEnemyIds: readonly string[]): QuestMissionIntel {
  const discovered = new Set(discoveredEnemyIds);
  const counts = new Map<string, number>();
  const factions = new Set<string>();
  let totalEnemyUnits = 0;

  for (const encounterId of quest.encounterIds) {
    for (const entry of QUEST_ENCOUNTERS[encounterId]?.enemies ?? []) {
      const enemy = getEnemyDefinition(entry.enemyDefinitionId);
      totalEnemyUnits += entry.count;
      factions.add(ENEMY_FACTIONS[enemy.factionId].name);
      counts.set(enemy.id, (counts.get(enemy.id) ?? 0) + entry.count);
    }
  }

  const knownEnemies = [...counts.entries()]
    .filter(([enemyId]) => discovered.has(enemyId))
    .map(([enemyId, count]) => {
      const enemy = getEnemyDefinition(enemyId);
      return { enemyDefinitionId: enemyId, name: enemy.name, role: enemy.role, count };
    })
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const knownEnemyUnits = knownEnemies.reduce((sum, entry) => sum + entry.count, 0);
  const unknownEnemyUnits = Math.max(0, totalEnemyUnits - knownEnemyUnits);
  const coverageRatio = totalEnemyUnits > 0 ? knownEnemyUnits / totalEnemyUnits : 0;
  const coverage = coverageBand(coverageRatio, totalEnemyUnits);
  const knownRoles = [...new Set(knownEnemies.map((entry) => entry.role))];
  const knownConditionIds = new Set<string>();
  for (const entry of knownEnemies) {
    const enemy = getEnemyDefinition(entry.enemyDefinitionId);
    const behavior = ENEMY_BEHAVIORS[enemy.behaviorId];
    const skillIds = [behavior?.basicAttackSkillId, ...(behavior?.rules.map((rule) => rule.skillId) ?? [])].filter((id): id is string => Boolean(id));
    for (const skillId of skillIds) ENEMY_SKILLS[skillId]?.conditionApplications?.forEach((condition) => knownConditionIds.add(condition.conditionId));
  }
  const unknownEnemyTypes = [...counts.keys()].filter((id) => !discovered.has(id)).length;
  const factionNames = [...factions];
  const summary = coverage === "complete"
    ? "Your guild has field reports for every expected enemy type."
    : coverage === "none"
      ? "The quest briefing identifies the opposing faction, but no exact creature reports are in the Monster Manual yet."
      : `${knownEnemyUnits} of roughly ${totalEnemyUnits} expected enemy bodies match creatures already recorded in the Monster Manual.`;

  return {
    totalEnemyUnits,
    knownEnemyUnits,
    unknownEnemyUnits,
    coverageRatio,
    coverage,
    coverageLabel: COVERAGE_LABELS[coverage],
    factionNames,
    knownEnemies,
    knownRoles,
    knownConditionIds: [...knownConditionIds],
    unknownEnemyTypes,
    summary,
  };
}
