import type { GameIconId } from "../../data/ui/gameIcons";

export type AchievementCategory = "Guild" | "Heroes" | "Adventures" | "Collection" | "Crafting";
export type AchievementMetric =
  | "hero_count"
  | "max_hero_level"
  | "completed_quests"
  | "campaign_chapter"
  | "roguelite_victories"
  | "operation_completions"
  | "operation_best"
  | "raid_victories"
  | "lore_entries"
  | "close_friend_bonds"
  | "trophies"
  | "crafted_items"
  | "reputation"
  | "resolved_crises";

export interface AchievementDefinition {
  id: string;
  category: AchievementCategory;
  title: string;
  description: string;
  metric: AchievementMetric;
  target: number;
  rewardGems: number;
  iconId: GameIconId;
}

export interface AchievementProgress {
  definition: AchievementDefinition;
  current: number;
  target: number;
  complete: boolean;
  claimed: boolean;
}
