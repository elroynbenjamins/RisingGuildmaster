import type { MaterialId } from "../crafting/craftingTypes";
import type { QuestChronicleEntry, QuestHeroOutcomeRecord } from "./questChronicleTypes";

export interface QuestResultSummary {
  questId: string;
  status: "victory" | "defeat";
  goldEarned: number;
  /** Total reputation granted before the End Day resolution. */
  reputationEarned?: number;
  /** Guildmaster progression granted by the quest itself. */
  guildmasterXpEarned?: number;
  guildmasterLevelBefore?: number;
  guildmasterLevelAfter?: number;
  guildmasterSkillPointsBefore?: number;
  guildmasterSkillPointsAfter?: number;
  /** Set when this result closed a campaign chapter. */
  campaignChapterCompleted?: number;
  xpEarnedPerHero: number;
  lootIds: string[];
  materials?: Partial<Record<MaterialId, number>>;
  heroOutcomes: QuestHeroOutcomeRecord[];
  chronicle: QuestChronicleEntry;
  campaignNodeId?: string;
  returnRegionId?: string;
  selectedChoiceId?: string;
}
