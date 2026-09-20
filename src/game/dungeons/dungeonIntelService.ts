import { CRAFTING_RECIPES } from "../../data/crafting/recipes";
import { DUNGEONS, DUNGEON_NODES, DUNGEON_RUN_MODIFIERS } from "../../data/dungeons/dungeons";
import { ROGUELITE_ENCOUNTERS } from "../../data/dungeons/rogueliteEncounters";
import { ENEMIES } from "../../data/enemies";
import type { DungeonNodeDefinition, DungeonRunGrade, DungeonRunScore, DungeonRunState } from "./dungeonTypes";
import { isRogueliteEncounterDiscovered } from "./dungeonService";

export type DungeonRisk = "SAFE" | "UNCERTAIN" | "DANGEROUS" | "DEADLY" | "BOSS";

const riskByType: Record<DungeonNodeDefinition["type"], DungeonRisk> = {
  rest: "SAFE", merchant: "SAFE", treasure: "UNCERTAIN", event: "UNCERTAIN", combat: "DANGEROUS", elite: "DEADLY", boss: "BOSS",
};

export function getDungeonNodeRisk(node: DungeonNodeDefinition): DungeonRisk { return riskByType[node.type]; }

export interface DungeonDiscoveryReadiness {
  ready: boolean;
  eligibleByType: Record<"combat" | "elite" | "boss", number>;
  totalByType: Record<"combat" | "elite" | "boss", number>;
  missingEnemyIds: string[];
}

export function getDungeonDiscoveryReadiness(dungeonId: string, discoveredEnemyIds: readonly string[]): DungeonDiscoveryReadiness {
  const dungeon = DUNGEONS[dungeonId];
  const types = ["combat", "elite", "boss"] as const;
  const eligibleByType = { combat: 0, elite: 0, boss: 0 };
  const totalByType = { combat: 0, elite: 0, boss: 0 };
  const missingEnemyIds = new Set<string>();
  const discovered = new Set(discoveredEnemyIds);
  for (const type of types) {
    const encounterIds = [...new Set((dungeon?.nodeIds ?? []).map((id) => DUNGEON_NODES[id]).filter((node) => node?.type === type).flatMap((node) => node?.encounterPoolIds ?? []))];
    totalByType[type] = encounterIds.length;
    eligibleByType[type] = encounterIds.filter((id) => isRogueliteEncounterDiscovered(id, discoveredEnemyIds)).length;
    for (const id of encounterIds) for (const group of ROGUELITE_ENCOUNTERS[id]?.enemies ?? []) if (!discovered.has(group.enemyDefinitionId)) missingEnemyIds.add(group.enemyDefinitionId);
  }
  return { ready: types.every((type) => eligibleByType[type] > 0), eligibleByType, totalByType, missingEnemyIds: [...missingEnemyIds] };
}

export function getDungeonEncounterSummary(encounterId?: string): string | null {
  const encounter = encounterId ? ROGUELITE_ENCOUNTERS[encounterId] : undefined;
  if (!encounter) return null;
  return encounter.enemies.map((group) => `${group.count}× ${ENEMIES[group.enemyDefinitionId]?.name ?? group.enemyDefinitionId} · Lv ${group.level}`).join("  •  ");
}

export function getDungeonNodeRewardSummary(node: DungeonNodeDefinition): string {
  if (node.type === "event") return `D20 ${node.abilityCheck?.attribute.toUpperCase()} · DC ${node.abilityCheck?.difficultyClass} · Success: +${node.successGoldReward ?? 0} base gold · Failure: party loses ${Math.round((node.failureDamageMaxHpModifier ?? 0) * 100)}% max HP`;
  if (node.type === "combat") return `${node.goldReward ?? 0} base gold · up to ${node.xpRewardPerHero ?? 0} XP per survivor`;
  if (node.type === "elite") return `${node.goldReward ?? 0} base gold · up to ${node.xpRewardPerHero ?? 0} XP · uncommon ring recipe chance or theme gear`;
  if (node.type === "boss") return `${node.goldReward ?? 0} base gold · up to ${node.xpRewardPerHero ?? 0} XP · rare weapon recipe chance or theme gear`;
  if (node.type === "treasure") return `${node.goldReward ?? 0} base gold · no combat`;
  if (node.type === "rest") return `Recover ${Math.round((node.healMaxHpModifier ?? 0) * 100)}% HP · ${Math.round((node.manaRecoveryModifier ?? 0) * 100)}% mana/stamina`;
  return `Supplies cost ${node.merchantCost ?? 0} gold · recover ${Math.round((node.healMaxHpModifier ?? 0) * 100)}% HP and ${Math.round((node.manaRecoveryModifier ?? 0) * 100)}% mana/stamina`;
}

export function getDungeonRouteLayers(dungeonId: string, run?: DungeonRunState): string[][] {
  const dungeon = DUNGEONS[dungeonId];
  if (!dungeon) return [];
  const depths = new Map<string, number>([[dungeon.startNodeId, 0]]); const queue = [dungeon.startNodeId];
  while (queue.length) {
    const id = queue.shift()!; const depth = depths.get(id)!;
    for (const nextId of run?.routeNextNodeIds?.[id] ?? DUNGEON_NODES[id]?.nextNodeIds ?? []) if (!depths.has(nextId) || depths.get(nextId)! > depth + 1) { depths.set(nextId, depth + 1); queue.push(nextId); }
  }
  const maxDepth = Math.max(...depths.values());
  return Array.from({ length: maxDepth + 1 }, (_, depth) => dungeon.nodeIds.filter((id) => depths.get(id) === depth));
}

export function dungeonGrade(score: number): DungeonRunGrade {
  if (score >= 1750) return "S";
  if (score >= 1400) return "A";
  if (score >= 1000) return "B";
  if (score >= 700) return "C";
  return "D";
}

export function calculateDungeonRunScore(run: DungeonRunState): DungeonRunScore {
  const roomScore = run.resolvedNodeIds.length * 100;
  const resolved = run.resolvedNodeIds.map((id) => DUNGEON_NODES[id]).filter(Boolean);
  const dangerScore = resolved.reduce((sum, node) => sum + (node!.type === "elite" ? 150 : node!.type === "boss" ? 300 : 0), 0) + run.selectedModifierIds.reduce((sum, id) => sum + (DUNGEON_RUN_MODIFIERS[id]?.scoreBonus ?? 0), 0);
  const survivalScore = run.heroInstances.filter((hero) => hero.isAlive && hero.currentHP > 0).length * 75;
  const victoryScore = run.status === "victory" ? 400 : 0;
  const total = roomScore + dangerScore + survivalScore + victoryScore;
  return { total, roomScore, dangerScore, survivalScore, victoryScore, grade: dungeonGrade(total) };
}

export function getUnlockedRecipeNames(run: DungeonRunState): string[] {
  return run.recipeIdsUnlocked.map((id) => CRAFTING_RECIPES[id]?.description ?? id);
}
