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

export type CampaignPreparationRecommendation =
  | { type: "side_quest"; questId: string; title: string; detail: string; reason: "level" | "weapon" | "armor" | "boss" }
  | { type: "dungeon"; title: string; detail: string; reason: "level" | "weapon" | "armor"; suggestedRuns: 1 | 2 }
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

function coreFieldHeroes(guild: GuildState) {
  const active = guild.heroes.filter((hero) => hero.isAvailable && hero.currentHP > 0);
  const pool = active.length >= 4 ? active : guild.heroes;
  return [...pool].sort((a, b) => b.level - a.level).slice(0, 4);
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

  const sideQuests = (chapter.sideQuestIds ?? [])
    .map((id) => QUESTS[id])
    .filter((quest): quest is NonNullable<typeof quest> => Boolean(quest))
    .filter((quest) => !guild.world.completedQuestIds.includes(quest.id))
    .filter((quest) => isQuestAvailableForGuild(quest, guild.world, guild.heroes))
    .sort((a, b) => (armorLag
      ? Number(hasUsableArmorRecipe(b.id, coreClassIds)) - Number(hasUsableArmorRecipe(a.id, coreClassIds))
      : Number(hasUsableWeaponRecipe(b.id, coreClassIds)) - Number(hasUsableWeaponRecipe(a.id, coreClassIds)))
      || Number(hasWeaponRecipe(b.id)) - Number(hasWeaponRecipe(a.id))
      || Math.abs((a.recommendedLevelMin ?? recommendedMin) - fieldLevel) - Math.abs((b.recommendedLevelMin ?? recommendedMin) - fieldLevel)
      || (a.difficulty ?? 0) - (b.difficulty ?? 0));

  const reason: "level" | "weapon" | "armor" | "boss" | null =
    underLevel ? "level" : weaponLag ? "weapon" : armorLag ? "armor" : nextQuest.questType === "boss" && sideQuests.length ? "boss" : null;

  if (reason && sideQuests.length) {
    const quest = sideQuests[0]!;
    const weaponRecipe = hasUsableWeaponRecipe(quest.id, coreClassIds);
    const armorRecipe = hasUsableArmorRecipe(quest.id, coreClassIds);
    const detail = reason === "level"
      ? `Your top four average Level ${fieldLevel.toFixed(1)}; the next story mission recommends Level ${recommendedMin}. This one-clear side quest gives XP and a guaranteed equipment reward${weaponRecipe ? ", plus a weapon recipe" : armorRecipe ? ", plus an armor recipe" : ""}.`
      : reason === "weapon"
        ? `${laggingWeaponHeroes} of your core heroes have weapons at least three levels behind. This one-clear side quest gives a guaranteed equipment reward${weaponRecipe ? " and a permanent weapon recipe" : ""}.`
        : reason === "armor"
          ? `${laggingArmorHeroes} of your core heroes have armor at least three levels behind. This one-clear side quest gives a guaranteed equipment reward${armorRecipe ? " and a permanent armor recipe" : ""}.`
          : `You are ready for the boss, but this one-clear local story is a good final preparation route for XP and guaranteed gear${weaponRecipe ? ", with a permanent weapon recipe" : armorRecipe ? ", with a permanent armor recipe" : ""}.`;
    return { type: "side_quest", questId: quest.id, title: quest.name, detail, reason };
  }

  const dungeonUnlocked = guild.world.completedCampaignNodeIds.includes("broken_wardstone") && guild.heroes.length >= DUNGEON_UNLOCK_HERO_COUNT;
  if ((underLevel || weaponLag || armorLag) && dungeonUnlocked) {
    const runs = underLevel ? suggestedDungeonRuns(heroes, recommendedMin) : 1;
    const runText = runs === 1
      ? "Start with one Wardstone Expedition."
      : "Plan on two Wardstone Expeditions, then reassess before the next story push.";
    const dungeonReason: "level" | "weapon" | "armor" = underLevel ? "level" : weaponLag ? "weapon" : "armor";
    const detail = dungeonReason === "level"
      ? `Your top four average Level ${fieldLevel.toFixed(1)}; the next story mission recommends Level ${recommendedMin}. ${runText} Each clear gives catch-up XP plus an equipment cache.`
      : dungeonReason === "weapon"
        ? `${laggingWeaponHeroes} of your core heroes have weapons at least three levels behind. ${runText} Each clear gives an equipment cache plus extra XP.`
        : `${laggingArmorHeroes} of your core heroes have armor at least three levels behind. ${runText} Each clear gives an equipment cache plus extra XP.`;
    return { type: "dungeon", title: runs === 1 ? "Wardstone Expedition" : "2 Wardstone Expeditions", detail, reason: dungeonReason, suggestedRuns: runs };
  }

  return null;
}
