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
  // Each expedition gets its own route ordering. The authored graph still controls
  // which rooms converge, while shuffling makes the three choices feel fresh and
  // keeps the result reproducible when a seeded RandomSource is supplied in tests.
  const routeNextNodeIds = Object.fromEntries(dungeon.nodeIds.map((nodeId) => {
    const edges = [...(DUNGEON_NODES[nodeId]?.nextNodeIds ?? [])];
    // Keep the opening presentation stable for onboarding; later forks are
    // shuffled per run so repeat expeditions still offer different route order.
    for (let index = edges.length - 1; nodeId !== dungeon.startNodeId && index > 0; index -= 1) {
      const swapIndex = random ? random.int(0, index) : Math.floor(Math.random() * (index + 1));
      [edges[index], edges[swapIndex]] = [edges[swapIndex]!, edges[index]!];
    }
    return [nodeId, edges];
  }));
  return { id: `dungeon-${dungeonId}`, dungeonId, currentNodeId: dungeon.startNodeId, selectedEncounterIds, routeNextNodeIds, visitedNodeIds: [], resolvedNodeIds: [], selectedModifierIds: [...new Set(modifierIds)], selectedBoonIds: [], pendingBoonChoiceIds: [], partyHeroIds: [...new Set(partyHeroIds)], heroInstances, goldEarned: 0, xpEarnedPerHero: 0, recipeIdsUnlocked: [], gearIdsAwarded: [], lastResolutionText: null, status: "active" };
}
export function isCurrentDungeonNodeResolved(run: DungeonRunState): boolean { return run.resolvedNodeIds.includes(run.currentNodeId); }
export function availableDungeonNodeIds(run: DungeonRunState): string[] { return run.status === "active" && isCurrentDungeonNodeResolved(run) && !(run.pendingBoonChoiceIds?.length) ? run.routeNextNodeIds?.[run.currentNodeId] ?? DUNGEON_NODES[run.currentNodeId]?.nextNodeIds ?? [] : []; }
export function chooseDungeonNode(run: DungeonRunState, nodeId: string): DungeonRunState { if (run.pendingBoonChoiceIds?.length) throw new Error("Choose an expedition boon before taking the next route"); if (!availableDungeonNodeIds(run).includes(nodeId)) throw new Error("Dungeon node is not connected to the current route"); return { ...run, currentNodeId: nodeId, visitedNodeIds: [...run.visitedNodeIds, run.currentNodeId], lastResolutionText: null }; }
export function markDungeonNodeResolved(run: DungeonRunState, resolutionText: string): DungeonRunState { if (run.status !== "active") throw new Error("Dungeon run is not active"); const node = DUNGEON_NODES[run.currentNodeId]; if (!node) throw new Error("Unknown dungeon node"); return { ...run, resolvedNodeIds: [...new Set([...run.resolvedNodeIds, node.id])], lastResolutionText: resolutionText, status: node.type === "boss" ? "victory" : "active" }; }
