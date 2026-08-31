import { DUNGEONS, DUNGEON_NODES } from "../../data/dungeons/dungeons";
import type { DungeonRunState } from "./dungeonTypes";
import type { HeroCombatInstance } from "../combat/combatTypes";
import type { RandomSource } from "../../utils/random";
import { ROGUELITE_ENCOUNTERS } from "../../data/dungeons/rogueliteEncounters";

export function isRogueliteEncounterDiscovered(encounterId: string, discoveredEnemyIds: readonly string[]): boolean {
  const encounter = ROGUELITE_ENCOUNTERS[encounterId];
  if (!encounter) return false;
  const discovered = new Set(discoveredEnemyIds);
  return encounter.enemies.every((group) => discovered.has(group.enemyDefinitionId));
}

export function startDungeonRun(dungeonId: string, modifierIds: string[] = [], partyHeroIds: string[] = [], heroInstances: HeroCombatInstance[] = [], random?: RandomSource, discoveredEnemyIds?: readonly string[], partyAverageLevel = Number.MAX_SAFE_INTEGER): DungeonRunState {
  const dungeon = DUNGEONS[dungeonId]; if (!dungeon) throw new Error("Unknown dungeon");
  if (modifierIds.some((id) => !dungeon.runModifierIds.includes(id))) throw new Error("Invalid dungeon modifier");
  const selectedEncounterIds = Object.fromEntries(dungeon.nodeIds.flatMap((nodeId) => {
    const node = DUNGEON_NODES[nodeId];
    const fullPool = node?.encounterPoolIds ?? [];
    const levelEligiblePool = fullPool.filter((id) => (ROGUELITE_ENCOUNTERS[id]?.minimumRoguelitePartyLevel ?? 0) <= partyAverageLevel);
    const pool = discoveredEnemyIds ? levelEligiblePool.filter((id) => isRogueliteEncounterDiscovered(id, discoveredEnemyIds)) : levelEligiblePool;
    if (fullPool.length && !pool.length) throw new Error(`${node?.title ?? "Dungeon route"} has no encounters containing only discovered creatures`);
    return pool.length ? [[nodeId, random ? random.pick(pool) : pool[0]!]] : [];
  }));
  return { id: `dungeon-${dungeonId}`, dungeonId, currentNodeId: dungeon.startNodeId, selectedEncounterIds, visitedNodeIds: [], resolvedNodeIds: [], selectedModifierIds: [...new Set(modifierIds)], partyHeroIds: [...new Set(partyHeroIds)], heroInstances, goldEarned: 0, xpEarnedPerHero: 0, recipeIdsUnlocked: [], lastResolutionText: null, status: "active" };
}
export function isCurrentDungeonNodeResolved(run: DungeonRunState): boolean { return run.resolvedNodeIds.includes(run.currentNodeId); }
export function availableDungeonNodeIds(run: DungeonRunState): string[] { return run.status === "active" && isCurrentDungeonNodeResolved(run) ? DUNGEON_NODES[run.currentNodeId]?.nextNodeIds ?? [] : []; }
export function chooseDungeonNode(run: DungeonRunState, nodeId: string): DungeonRunState { if (!availableDungeonNodeIds(run).includes(nodeId)) throw new Error("Dungeon node is not connected to the current route"); return { ...run, currentNodeId: nodeId, visitedNodeIds: [...run.visitedNodeIds, run.currentNodeId], lastResolutionText: null }; }
export function markDungeonNodeResolved(run: DungeonRunState, resolutionText: string): DungeonRunState { if (run.status !== "active") throw new Error("Dungeon run is not active"); const node = DUNGEON_NODES[run.currentNodeId]; if (!node) throw new Error("Unknown dungeon node"); return { ...run, resolvedNodeIds: [...new Set([...run.resolvedNodeIds, node.id])], lastResolutionText: resolutionText, status: node.type === "boss" ? "victory" : "active" }; }
