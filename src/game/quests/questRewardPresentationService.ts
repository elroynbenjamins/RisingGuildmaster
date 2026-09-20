import type { EquipmentRarity } from "../../data/equipment/equipment";
import { resolveEquipmentDefinition } from "../equipment/equipmentResolver";
import { xpRequiredForNextLevel } from "../progression/xpSystem";
import type { QuestHeroOutcomeRecord } from "./questChronicleTypes";

export type RewardRarityTone = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface HeroQuestProgressPresentation {
  xpEarned: number;
  xpAfter: number;
  xpRequired: number;
  xpRatioAfter: number;
  xpRatioBefore: number;
  levelled: boolean;
  levelsGained: number;
  newSkillPoints: number;
  bankedXp: boolean;
  milestoneLabels: string[];
}

export interface EquipmentRewardPresentation {
  inventoryKey: string;
  name: string;
  rarity: RewardRarityTone;
  rarityLabel: string;
  levelRequirement: number;
  value: number;
}

/**
 * Calculates XP gained between two raw hero snapshots, including level wraps.
 * This remains useful for legacy result summaries that predate explicit xpEarned.
 */
export function calculateHeroXpGain(levelBefore: number, xpBefore: number, levelAfter: number, xpAfter: number): number {
  if (levelAfter < levelBefore) return 0;
  if (levelAfter === levelBefore) return Math.max(0, Math.round(xpAfter - xpBefore));
  let gained = Math.max(0, xpRequiredForNextLevel(levelBefore) - xpBefore);
  for (let level = levelBefore + 1; level < levelAfter; level += 1) gained += xpRequiredForNextLevel(level);
  gained += Math.max(0, xpAfter);
  return Math.max(0, Math.round(gained));
}

export function getHeroQuestProgressPresentation(outcome: QuestHeroOutcomeRecord): HeroQuestProgressPresentation {
  const xpBefore = Math.max(0, outcome.xpBefore ?? 0);
  const xpAfter = Math.max(0, outcome.xpAfter ?? 0);
  const levelBefore = Math.max(1, outcome.levelBefore);
  const levelAfter = Math.max(levelBefore, outcome.levelAfter);
  const xpRequiredBefore = Math.max(1, xpRequiredForNextLevel(levelBefore));
  const xpRequiredAfter = Math.max(1, xpRequiredForNextLevel(levelAfter));
  const availableBefore = Math.max(0, outcome.availableSkillPointsBefore ?? 0);
  const availableAfter = Math.max(0, outcome.availableSkillPointsAfter ?? outcome.availableSkillPoints ?? 0);
  const levelled = levelAfter > levelBefore;
  const milestoneLabels: string[] = [];
  if (levelBefore < 5 && levelAfter >= 5) milestoneLabels.push("SUBCLASS CHOICE UNLOCKED");
  if (levelBefore < 10 && levelAfter >= 10) milestoneLabels.push("MASTERY CHOICE UNLOCKED");
  const newSkillPoints = Math.max(0, availableAfter - availableBefore);
  if (newSkillPoints > 0) milestoneLabels.push(`${newSkillPoints} CLASS SKILL POINT${newSkillPoints === 1 ? "" : "S"} EARNED`);
  return {
    xpEarned: Math.max(0, outcome.xpEarned ?? calculateHeroXpGain(levelBefore, xpBefore, levelAfter, xpAfter)),
    xpAfter,
    xpRequired: xpRequiredAfter,
    xpRatioAfter: Math.max(0, Math.min(1, xpAfter / xpRequiredAfter)),
    xpRatioBefore: Math.max(0, Math.min(1, xpBefore / xpRequiredBefore)),
    levelled,
    levelsGained: Math.max(0, levelAfter - levelBefore),
    newSkillPoints,
    bankedXp: !levelled && xpAfter >= xpRequiredAfter,
    milestoneLabels,
  };
}

export function getEquipmentRewardPresentation(inventoryKey: string): EquipmentRewardPresentation | null {
  const item = resolveEquipmentDefinition(inventoryKey);
  if (!item) return null;
  const rarity = item.rarity as EquipmentRarity;
  return {
    inventoryKey,
    name: item.name,
    rarity,
    rarityLabel: rarity.toUpperCase(),
    levelRequirement: item.levelRequirement,
    value: item.value,
  };
}

export function getHighestLootRarity(inventoryKeys: readonly string[]): RewardRarityTone | null {
  const order: RewardRarityTone[] = ["common", "uncommon", "rare", "epic", "legendary"];
  let highestIndex = -1;
  for (const key of inventoryKeys) {
    const item = getEquipmentRewardPresentation(key);
    if (!item) continue;
    highestIndex = Math.max(highestIndex, order.indexOf(item.rarity));
  }
  return highestIndex >= 0 ? order[highestIndex]! : null;
}
