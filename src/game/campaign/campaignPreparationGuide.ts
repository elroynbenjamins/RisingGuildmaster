import { CAMPAIGN_CHAPTERS } from "../../data/campaign/chapter1";
import { CRAFTING_RECIPES } from "../../data/crafting/recipes";
import { EQUIPMENT } from "../../data/equipment/equipment";
import { QUESTS } from "../../data/quests/quests";
import { DUNGEON_UNLOCK_HERO_COUNT } from "../dungeons/dungeonDraftService";
import { getDungeonCatchupXpTarget } from "../dungeons/dungeonRunService";
import { resolveEquipmentDefinition } from "../equipment/equipmentResolver";
import { xpRequiredForNextLevel } from "../progression/xpSystem";
import type { GuildState } from "../guild/types";
import { isQuestAvailableForGuild } from "../quests/questAvailability";
import { getAvailableCampaignNodes } from "./campaignService";
import { getTrainingProgressionLimit, trainingCapacity } from "../training/trainingService";

export interface CampaignTrainingAlternative {
  heroId: string;
  heroName: string;
  currentLevel: number;
  targetLevel: number;
}

export type CampaignPreparationRecommendation =
  | { type: "side_quest"; questId: string; title: string; detail: string; reason: "level" | "weapon" | "armor" | "secondary" | "boss"; trainingAlternative?: CampaignTrainingAlternative }
  | { type: "dungeon"; title: string; detail: string; reason: "level" | "weapon" | "armor" | "secondary"; suggestedRuns: 1 | 2; trainingAlternative?: CampaignTrainingAlternative }
  | null;

function hasWeaponRecipe(questId: string): boolean {
  const quest = QUESTS[questId];
  return (quest?.recipeUnlockIdsOnVictory ?? []).some((recipeId) => {
    const equipmentId = CRAFTING_RECIPES[recipeId]?.outputEquipmentId;
    return Boolean(equipmentId && EQUIPMENT[equipmentId]?.slot === "weapon");
  });
}

function hasUsableWeaponRecipe(questId: string, heroClassIds: ReadonlySet<string>): boolean {
  const quest = QUESTS[questId];
  return (quest?.recipeUnlockIdsOnVictory ?? []).some((recipeId) => {
    const equipmentId = CRAFTING_RECIPES[recipeId]?.outputEquipmentId;
    const equipment = equipmentId ? EQUIPMENT[equipmentId] : undefined;
    return Boolean(
      equipment
      && equipment.slot === "weapon"
      && (!equipment.classRestrictions.length || equipment.classRestrictions.some((classId) => heroClassIds.has(classId))),
    );
  });
}

function hasUsableArmorRecipe(questId: string, heroClassIds: ReadonlySet<string>): boolean {
  const quest = QUESTS[questId];
  return (quest?.recipeUnlockIdsOnVictory ?? []).some((recipeId) => {
    const equipmentId = CRAFTING_RECIPES[recipeId]?.outputEquipmentId;
    const equipment = equipmentId ? EQUIPMENT[equipmentId] : undefined;
    return Boolean(
      equipment
      && equipment.slot === "armor"
      && (!equipment.classRestrictions.length || equipment.classRestrictions.some((classId) => heroClassIds.has(classId))),
    );
  });
}

const SECONDARY_GEAR_SLOTS = ["helmet", "boots", "accessory1", "accessory2"] as const;

function hasUsableSecondaryRecipe(questId: string, heroClassIds: ReadonlySet<string>): boolean {
  const quest = QUESTS[questId];
  return (quest?.recipeUnlockIdsOnVictory ?? []).some((recipeId) => {
    const equipmentId = CRAFTING_RECIPES[recipeId]?.outputEquipmentId;
    const equipment = equipmentId ? EQUIPMENT[equipmentId] : undefined;
    return Boolean(
      equipment
      && SECONDARY_GEAR_SLOTS.includes(equipment.slot as (typeof SECONDARY_GEAR_SLOTS)[number])
      && (!equipment.classRestrictions.length || equipment.classRestrictions.some((classId) => heroClassIds.has(classId))),
    );
  });
}

function coreFieldHeroes(guild: GuildState) {
  const active = guild.heroes.filter((hero) => hero.isAvailable && hero.currentHP > 0);
  const pool = active.length >= 4 ? active : guild.heroes;
  const sorted = [...pool].sort((a, b) => b.level - a.level);
  const byId = new Map(sorted.map((hero) => [hero.id, hero]));
  const recent = guild.recentPartyHeroIds.map((id) => byId.get(id)).filter((hero): hero is GuildState["heroes"][number] => Boolean(hero));
  if (!recent.length) return sorted.slice(0, 4);
  const chosen = [...recent.slice(0, 4)];
  for (const hero of sorted) {
    if (chosen.length >= 4) break;
    if (!chosen.some((entry) => entry.id === hero.id)) chosen.push(hero);
  }
  return chosen;
}

function xpNeededToReachLevel(hero: GuildState["heroes"][number], targetLevel: number): number {
  if (hero.level >= targetLevel) return 0;
  let remaining = Math.max(0, xpRequiredForNextLevel(hero.level) - hero.xp);
  for (let level = hero.level + 1; level < targetLevel; level += 1) remaining += xpRequiredForNextLevel(level);
  return remaining;
}

function suggestedDungeonRuns(heroes: ReturnType<typeof coreFieldHeroes>, recommendedLevel: number): 1 | 2 {
  const averageXpGap = heroes.reduce((sum, hero) => sum + xpNeededToReachLevel(hero, recommendedLevel), 0) / Math.max(1, heroes.length);
  const averageRunTarget = heroes.reduce((sum, hero) => sum + getDungeonCatchupXpTarget(hero.level), 0) / Math.max(1, heroes.length);
  return averageXpGap <= averageRunTarget ? 1 : 2;
}

function getTrainingAlternative(
  guild: GuildState,
  heroes: ReturnType<typeof coreFieldHeroes>,
  recommendedLevel: number,
): CampaignTrainingAlternative | undefined {
  if (guild.trainingGround.sessions.length >= trainingCapacity(guild)) return undefined;
  const activeTrainingIds = new Set(guild.trainingGround.sessions.map((session) => session.heroId));
  const candidate = [...heroes]
    .filter((hero) => hero.level < recommendedLevel && hero.isAvailable && hero.currentHP > 0 && !activeTrainingIds.has(hero.id))
    .sort((a, b) => a.level - b.level || a.xp - b.xp || a.name.localeCompare(b.name))[0];
  if (!candidate) return undefined;
  const limit = getTrainingProgressionLimit(guild, candidate);
  if (limit.levelCap <= candidate.level && candidate.xp >= xpRequiredForNextLevel(candidate.level) - 1) return undefined;
  return {
    heroId: candidate.id,
    heroName: candidate.name,
    currentLevel: candidate.level,
    targetLevel: Math.min(recommendedLevel, Math.max(candidate.level, limit.levelCap)),
  };
}

export function getCampaignPreparationRecommendation(guild: GuildState): CampaignPreparationRecommendation {
  const chapter = CAMPAIGN_CHAPTERS[guild.world.campaignChapter];
  if (!chapter) return null;

  const heroes = coreFieldHeroes(guild);
  if (!heroes.length) return null;
  const fieldLevel = heroes.reduce((sum, hero) => sum + hero.level, 0) / heroes.length;
  const coreClassIds = new Set(heroes.map((hero) => hero.classId));

  const nextNode = getAvailableCampaignNodes(guild.world).find((node) => Boolean(node.questId));
  const nextQuest = nextNode?.questId ? QUESTS[nextNode.questId] : undefined;
  if (!nextQuest) return null;

  const recommendedMin = nextQuest.recommendedLevelMin ?? chapter.recommendedLevelMin ?? 1;
  const underLevel = fieldLevel + .01 < recommendedMin;
  const meaningfulLevelGap = fieldLevel + .50 < recommendedMin;
  const laggingWeaponHeroes = heroes.filter((hero) => {
    const weaponId = hero.equipment.weapon;
    if (!weaponId) return true;
    const weapon = resolveEquipmentDefinition(weaponId);
    return !weapon || hero.level - weapon.levelRequirement >= 3;
  }).length;
  const weaponLag = laggingWeaponHeroes >= 2;
  const laggingArmorHeroes = heroes.filter((hero) => {
    const armorId = hero.equipment.armor;
    if (!armorId) return true;
    const armor = resolveEquipmentDefinition(armorId);
    return !armor || hero.level - armor.levelRequirement >= 3;
  }).length;
  const armorLag = laggingArmorHeroes >= 2;
  const secondaryGapHeroes = recommendedMin >= 12
    ? heroes.filter((hero) => SECONDARY_GEAR_SLOTS.filter((slot) => !hero.equipment[slot]).length >= 3).length
    : 0;
  const secondaryGearGap = secondaryGapHeroes >= 1;

  const sideQuests = (chapter.sideQuestIds ?? [])
    .map((id) => QUESTS[id])
    .filter((quest): quest is NonNullable<typeof quest> => Boolean(quest))
    .filter((quest) => !guild.world.completedQuestIds.includes(quest.id))
    .filter((quest) => isQuestAvailableForGuild(quest, guild.world, guild.heroes))
    .sort((a, b) => (weaponLag
      ? Number(hasUsableWeaponRecipe(b.id, coreClassIds)) - Number(hasUsableWeaponRecipe(a.id, coreClassIds))
      : armorLag
        ? Number(hasUsableArmorRecipe(b.id, coreClassIds)) - Number(hasUsableArmorRecipe(a.id, coreClassIds))
        : secondaryGearGap
          ? Number(hasUsableSecondaryRecipe(b.id, coreClassIds)) - Number(hasUsableSecondaryRecipe(a.id, coreClassIds))
          : Number(hasUsableWeaponRecipe(b.id, coreClassIds)) - Number(hasUsableWeaponRecipe(a.id, coreClassIds)))
      || Number(hasWeaponRecipe(b.id)) - Number(hasWeaponRecipe(a.id))
      || Math.abs((a.recommendedLevelMin ?? recommendedMin) - fieldLevel) - Math.abs((b.recommendedLevelMin ?? recommendedMin) - fieldLevel)
      || (a.difficulty ?? 0) - (b.difficulty ?? 0));

  const reason: "level" | "weapon" | "armor" | "secondary" | "boss" | null =
    meaningfulLevelGap ? "level" : weaponLag ? "weapon" : armorLag ? "armor" : secondaryGearGap ? "secondary" : underLevel ? "level" : nextQuest.questType === "boss" && sideQuests.length ? "boss" : null;

  const dungeonUnlocked = guild.world.completedCampaignNodeIds.includes("broken_wardstone") && guild.heroes.length >= DUNGEON_UNLOCK_HERO_COUNT;
  const trainingAlternative = reason === "level" ? getTrainingAlternative(guild, heroes, recommendedMin) : undefined;

  if (reason === "level" && dungeonUnlocked) {
    const runs = suggestedDungeonRuns(heroes, recommendedMin);
    const runText = runs === 1
      ? "Start with one Roguelite Expedition, then reassess."
      : "Plan on two Roguelite Expeditions, then reassess.";
    const trainingText = trainingAlternative
      ? ` Or send ${trainingAlternative.heroName} to the Training Hall for safe catch-up XP toward Level ${trainingAlternative.targetLevel} while the rest of the guild handles other work.`
      : "";
    return {
      type: "dungeon",
      title: runs === 1 ? "Roguelite Expedition" : "2 Roguelite Expeditions",
      detail: `Your field team averages Level ${fieldLevel.toFixed(1)}; the next story mission recommends Level ${recommendedMin}. ${runText} Expeditions give catch-up XP plus an equipment cache.${trainingText}`,
      reason: "level",
      suggestedRuns: runs,
      ...(trainingAlternative ? { trainingAlternative } : {}),
    };
  }

  if (reason && sideQuests.length) {
    const quest = sideQuests[0]!;
    const weaponRecipe = hasUsableWeaponRecipe(quest.id, coreClassIds);
    const armorRecipe = hasUsableArmorRecipe(quest.id, coreClassIds);
    const secondaryRecipe = hasUsableSecondaryRecipe(quest.id, coreClassIds);
    const detail = reason === "level"
      ? `Your top four average Level ${fieldLevel.toFixed(1)}; the next story mission recommends Level ${recommendedMin}. This one-clear side quest gives XP and a guaranteed equipment reward${weaponRecipe ? ", plus a weapon recipe" : armorRecipe ? ", plus an armor recipe" : secondaryRecipe ? ", plus a secondary-slot recipe" : ""}.`
      : reason === "weapon"
        ? `${laggingWeaponHeroes} of your core heroes have weapons at least three levels behind. This one-clear side quest gives a guaranteed equipment reward${weaponRecipe ? " and a permanent weapon recipe" : ""}.`
        : reason === "armor"
          ? `${laggingArmorHeroes} of your core heroes have armor at least three levels behind. This one-clear side quest gives a guaranteed equipment reward${armorRecipe ? " and a permanent armor recipe" : ""}.`
          : reason === "secondary"
            ? `${secondaryGapHeroes} of your core heroes ${secondaryGapHeroes === 1 ? "is" : "are"} missing three or more helmet, boots, or accessory slots. This one-clear side quest gives XP and a guaranteed equipment reward${secondaryRecipe ? ", plus a permanent secondary-slot recipe" : ""}.`
            : `You are ready for the boss, but this one-clear local story is a good final preparation route for XP and guaranteed gear${weaponRecipe ? ", with a permanent weapon recipe" : armorRecipe ? ", with a permanent armor recipe" : secondaryRecipe ? ", with a permanent secondary-slot recipe" : ""}.`;
    return { type: "side_quest", questId: quest.id, title: quest.name, detail, reason, ...(reason === "level" && trainingAlternative ? { trainingAlternative } : {}) };
  }

  if ((underLevel || weaponLag || armorLag || secondaryGearGap) && dungeonUnlocked) {
    const runs: 1 | 2 = (weaponLag || armorLag || secondaryGearGap) ? 2 : suggestedDungeonRuns(heroes, recommendedMin);
    const runText = runs === 1
      ? "Start with one Wardstone Expedition."
      : "Plan on two Wardstone Expeditions, then reassess before the next story push.";
    const dungeonReason: "level" | "weapon" | "armor" | "secondary" = meaningfulLevelGap ? "level" : weaponLag ? "weapon" : armorLag ? "armor" : secondaryGearGap ? "secondary" : "level";
    const detail = dungeonReason === "level"
      ? `Your top four average Level ${fieldLevel.toFixed(1)}; the next story mission recommends Level ${recommendedMin}. ${runText} Each clear gives catch-up XP plus an equipment cache.`
      : dungeonReason === "weapon"
        ? `${laggingWeaponHeroes} of your core heroes have weapons at least three levels behind. ${runText} Each clear gives an equipment cache plus extra XP.`
        : dungeonReason === "armor"
          ? `${laggingArmorHeroes} of your core heroes have armor at least three levels behind. ${runText} Each clear gives an equipment cache plus extra XP.`
          : `${secondaryGapHeroes} of your core heroes ${secondaryGapHeroes === 1 ? "is" : "are"} missing three or more secondary gear slots. ${runText} Each clear gives an equipment cache plus extra XP.`;
    return {
      type: "dungeon",
      title: runs === 1 ? "Roguelite Expedition" : "2 Roguelite Expeditions",
      detail,
      reason: dungeonReason,
      suggestedRuns: runs,
      ...(dungeonReason === "level" && trainingAlternative ? { trainingAlternative } : {}),
    };
  }

  return null;
}
