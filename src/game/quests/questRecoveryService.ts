import { QUESTS } from "../../data/quests/quests";
import type { Hero } from "../heroes/types";
import type { WorldState } from "../world/worldTypes";
import type { ActiveQuestCombatRecovery } from "./questCombatRecoveryTypes";
import type { QuestResultSummary } from "./questResultTypes";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizePendingQuestResult(value: unknown, world: WorldState): QuestResultSummary | null {
  if (!isRecord(value) || typeof value.questId !== "string" || typeof value.status !== "string") return null;
  if (!QUESTS[value.questId]) return null;
  const campaignNodeId = typeof value.campaignNodeId === "string" ? value.campaignNodeId : undefined;
  if (!campaignNodeId || world.completedCampaignNodeIds.includes(campaignNodeId)) return null;
  if (!isRecord(value.chronicle) || typeof value.chronicle.id !== "string") return null;
  return value as unknown as QuestResultSummary;
}

export function normalizeActiveQuestCombatRecovery(
  value: unknown,
  heroes: readonly Hero[],
  world: WorldState,
  pendingQuestResult: QuestResultSummary | null,
): ActiveQuestCombatRecovery | null {
  if (pendingQuestResult || !isRecord(value)) return null;
  if (typeof value.questId !== "string" || !QUESTS[value.questId]) return null;
  if (typeof value.randomState !== "number" || !Number.isFinite(value.randomState)) return null;
  if (!isRecord(value.party) || !Array.isArray(value.party.heroIds) || !value.party.heroIds.length || value.party.heroIds.some((id) => typeof id !== "string")) return null;

  const partyHeroIds = value.party.heroIds as string[];
  const heroIds = new Set(heroes.map((hero) => hero.id));
  if (partyHeroIds.some((id) => !heroIds.has(id))) return null;
  if (!QUESTS[value.questId]!.repeatable && world.completedQuestIds.includes(value.questId)) return null;

  const campaignNodeId = typeof value.campaignNodeId === "string" ? value.campaignNodeId : undefined;
  if (campaignNodeId && world.completedCampaignNodeIds.includes(campaignNodeId)) return null;

  if (value.state !== null && value.state !== undefined) {
    if (!isRecord(value.state) || value.state.questId !== value.questId || !Array.isArray(value.state.heroes)) return null;
    const combatHeroIds = value.state.heroes.flatMap((entry) => isRecord(entry) && isRecord(entry.hero) && typeof entry.hero.id === "string" ? [entry.hero.id] : []);
    if (combatHeroIds.length !== partyHeroIds.length || partyHeroIds.some((id) => !combatHeroIds.includes(id))) return null;
  }

  return value as unknown as ActiveQuestCombatRecovery;
}
