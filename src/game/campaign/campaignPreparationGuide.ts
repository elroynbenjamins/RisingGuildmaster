import { CAMPAIGN_CHAPTERS } from "../../data/campaign/chapter1";
import { CRAFTING_RECIPES } from "../../data/crafting/recipes";
import { EQUIPMENT } from "../../data/equipment/equipment";
import { QUESTS } from "../../data/quests/quests";
import { DUNGEON_UNLOCK_HERO_COUNT } from "../dungeons/dungeonDraftService";
import { resolveEquipmentDefinition } from "../equipment/equipmentResolver";
import type { GuildState } from "../guild/types";
import { isQuestAvailableForGuild } from "../quests/questAvailability";
import { getAvailableCampaignNodes } from "./campaignService";

export type CampaignPreparationRecommendation =
  | { type: "side_quest"; questId: string; title: string; detail: string; reason: "level" | "weapon" | "boss" }
  | { type: "dungeon"; title: string; detail: string; reason: "level" | "weapon" }
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

function coreFieldHeroes(guild: GuildState) {
  const active = guild.heroes.filter((hero) => hero.isAvailable && hero.currentHP > 0);
  const pool = active.length >= 4 ? active : guild.heroes;
  return [...pool].sort((a, b) => b.level - a.level).slice(0, 4);
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

  const sideQuests = (chapter.sideQuestIds ?? [])
    .map((id) => QUESTS[id])
    .filter((quest): quest is NonNullable<typeof quest> => Boolean(quest))
    .filter((quest) => !guild.world.completedQuestIds.includes(quest.id))
    .filter((quest) => isQuestAvailableForGuild(quest, guild.world, guild.heroes))
    .sort((a, b) => Number(hasUsableWeaponRecipe(b.id, coreClassIds)) - Number(hasUsableWeaponRecipe(a.id, coreClassIds))
      || Number(hasWeaponRecipe(b.id)) - Number(hasWeaponRecipe(a.id))
      || Math.abs((a.recommendedLevelMin ?? recommendedMin) - fieldLevel) - Math.abs((b.recommendedLevelMin ?? recommendedMin) - fieldLevel)
      || (a.difficulty ?? 0) - (b.difficulty ?? 0));

  const reason: "level" | "weapon" | "boss" | null =
    underLevel ? "level" : weaponLag ? "weapon" : nextQuest.questType === "boss" && sideQuests.length ? "boss" : null;

  if (reason && sideQuests.length) {
    const quest = sideQuests[0]!;
    const weaponRecipe = hasUsableWeaponRecipe(quest.id, coreClassIds);
    const detail = reason === "level"
      ? `Your top four average Level ${fieldLevel.toFixed(1)}; the next story mission recommends Level ${recommendedMin}. This one-clear side quest gives XP and a guaranteed equipment reward${weaponRecipe ? ", plus a weapon recipe" : ""}.`
      : reason === "weapon"
        ? `${laggingWeaponHeroes} of your core heroes have weapons at least three levels behind. This one-clear side quest gives a guaranteed equipment reward${weaponRecipe ? " and a permanent weapon recipe" : ""}.`
        : `You are ready for the boss, but this one-clear local story is a good final preparation route for XP and guaranteed gear${weaponRecipe ? ", with a permanent weapon recipe" : ""}.`;
    return { type: "side_quest", questId: quest.id, title: quest.name, detail, reason };
  }

  const dungeonUnlocked = guild.world.completedCampaignNodeIds.includes("broken_wardstone") && guild.heroes.length >= DUNGEON_UNLOCK_HERO_COUNT;
  if ((underLevel || weaponLag) && dungeonUnlocked) {
    const detail = underLevel
      ? `Your top four average Level ${fieldLevel.toFixed(1)}; the next story mission recommends Level ${recommendedMin}. A Wardstone expedition is the best remaining catch-up route for XP and equipment.`
      : `${laggingWeaponHeroes} of your core heroes have weapons at least three levels behind. A Wardstone expedition is the best remaining catch-up route for equipment and extra XP.`;
    return { type: "dungeon", title: "Wardstone Expedition", detail, reason: underLevel ? "level" : "weapon" };
  }

  return null;
}
