import { CRAFTING_RECIPES } from "../data/crafting/recipes";
import { EQUIPMENT } from "../data/equipment/equipment";
import type { CraftingRecipeDefinition } from "../game/crafting/craftingTypes";
import type { GuildState } from "../game/guild/types";
import type { Hero } from "../game/heroes/types";
import { materialRequirementsMet } from "../game/crafting/craftingService";
import { compareEquipment } from "./equipmentComparison";

export function canHeroEquipRecipeOutput(hero: Hero, recipe: CraftingRecipeDefinition): boolean {
  const output = EQUIPMENT[recipe.outputEquipmentId];
  if (!output) return false;
  return hero.level >= output.levelRequirement && (!output.classRestrictions.length || output.classRestrictions.includes(hero.classId));
}

export function recipeUpgradeScoreForHero(hero: Hero, recipe: CraftingRecipeDefinition): number {
  if (!canHeroEquipRecipeOutput(hero, recipe)) return Number.NEGATIVE_INFINITY;
  return compareEquipment(hero, recipe.outputEquipmentId).reduce((sum, row) => sum + row.difference, 0);
}

export function getRecipeUpgradeHeroes(guild: GuildState, recipe: CraftingRecipeDefinition): Hero[] {
  return guild.heroes.filter((hero) => recipeUpgradeScoreForHero(hero, recipe) > 0);
}

export function isRecipeCraftableNow(guild: GuildState, recipe: CraftingRecipeDefinition): boolean {
  const artisan = guild.artisans[recipe.artisanType];
  return Boolean(artisan?.recruited
    && artisan.level >= recipe.artisanLevel
    && guild.gold >= recipe.goldCost
    && materialRequirementsMet(guild, recipe.materials));
}

export function getBestRecipeForHeroSlot(guild: GuildState, heroId: string, slot: keyof Hero["equipment"]): CraftingRecipeDefinition | undefined {
  const hero = guild.heroes.find((entry) => entry.id === heroId);
  if (!hero) return undefined;
  return Object.values(CRAFTING_RECIPES)
    .filter((recipe) => {
      const output = EQUIPMENT[recipe.outputEquipmentId];
      return output?.slot === slot
        && (!recipe.unlockSource || (guild.unlockedRecipeIds ?? []).includes(recipe.id))
        && canHeroEquipRecipeOutput(hero, recipe);
    })
    .map((recipe) => ({ recipe, score: recipeUpgradeScoreForHero(hero, recipe) }))
    .sort((a,b) => b.score - a.score || EQUIPMENT[b.recipe.outputEquipmentId]!.level - EQUIPMENT[a.recipe.outputEquipmentId]!.level)[0]?.recipe;
}
