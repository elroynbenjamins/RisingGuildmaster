import { CRAFTING_RECIPES } from "../../data/crafting/recipes";
import { MATERIALS } from "../../data/crafting/materials";
import { ENEMIES } from "../../data/enemies";
import { resolveEquipmentDefinition, type ResolvedEquipmentDefinition } from "../equipment/equipmentResolver";
import { getInventoryItemPresentation, type PresentationTone } from "../equipment/inventoryPresentationService";
import type { GuildState } from "../guild/types";
import type { ArtisanType, CraftingRecipeDefinition, EnchantmentDefinition, MaterialId, RecipeUnlockSource } from "./craftingTypes";

export type CraftingRecipeFilter = "all" | "craftable" | "upgrades" | "locked";
export type CraftingBlockerKind = "pattern" | "workshop" | "workshop_level" | "gold" | "materials";

export interface CraftingBlocker {
  kind: CraftingBlockerKind;
  label: string;
  tone: "danger" | "gold";
}

export interface MaterialRequirementPresentation {
  materialId: MaterialId;
  name: string;
  owned: number;
  required: number;
  missing: number;
  met: boolean;
  sourceHints: string[];
}

export interface CraftingRecipePresentation {
  recipe: CraftingRecipeDefinition;
  output: ResolvedEquipmentDefinition;
  unlocked: boolean;
  craftable: boolean;
  hardLocked: boolean;
  blockers: CraftingBlocker[];
  materials: MaterialRequirementPresentation[];
  compatibleHeroCount: number;
  upgradeHeroCount: number;
  tradeoffHeroCount: number;
  bestFitLabel: string;
  bestFitTone: PresentationTone;
  unlockHint: string | null;
}

export interface EnchantmentPresentation {
  craftable: boolean;
  blockers: CraftingBlocker[];
  materials: MaterialRequirementPresentation[];
}

const UNLOCK_HINTS: Record<RecipeUnlockSource, string> = {
  roguelite_elite: "Find the pattern in a roguelite Elite cache.",
  roguelite_boss: "Defeat a roguelite Boss to discover this pattern.",
  side_quest: "Complete the linked one-clear Side Quest to discover this pattern.",
  traveling_merchant: "Obtain this pattern from a traveling merchant event.",
};

const SOURCE_TAG_HINTS: Record<string, string> = {
  mine: "Mining and ore-gathering missions",
  forest: "Greenveil forest gathering routes",
  goblins: "Goblin enemies and caches",
  orcs: "Orc enemies and war camps",
  bandits: "Bandit enemies and stolen supplies",
  undead: "Undead enemies and haunted sites",
  spiders: "Spider enemies and Shadowfen nests",
  shadowfen: "Shadowfen quests and gathering routes",
  magic: "Magical enemies, relics, and arcane encounters",
  wardstones: "Wardstone and arcane encounters",
  ashlands: "Ashlands exploration and enemies",
  frostmarch: "Frostmarch exploration and enemies",
  ruins: "Ruins, caches, and exploration rewards",
  greenveil: "Greenveil quests and hunts",
  guildhaven: "Guildhaven quests and local hunts",
  recipe_fragment: "Named monster-hunt quest fragments",
};

function titleCase(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function getRecipeUnlockHint(recipe: CraftingRecipeDefinition): string | null {
  return recipe.unlockSource ? UNLOCK_HINTS[recipe.unlockSource] : null;
}

export function getMaterialSourceHints(materialId: MaterialId, guild?: Pick<GuildState, "discoveredEnemyIds">): string[] {
  const material = MATERIALS[materialId];
  const hints: string[] = [];
  for (const tag of material.sourceTags) {
    const enemy = ENEMIES[tag];
    if (enemy) {
      if (!guild || guild.discoveredEnemyIds.includes(enemy.id)) hints.push(`${enemy.name} · Monster Manual source`);
      else hints.push("Unknown creature · discover it in the Monster Manual");
      continue;
    }
    hints.push(SOURCE_TAG_HINTS[tag] ?? titleCase(tag));
  }
  return [...new Set(hints)];
}

function materialRows(guild: GuildState, costs: Partial<Record<MaterialId, number>>): MaterialRequirementPresentation[] {
  return (Object.entries(costs) as [MaterialId, number][]).map(([materialId, required]) => {
    const owned = guild.materials[materialId] ?? 0;
    return {
      materialId,
      name: MATERIALS[materialId].name,
      owned,
      required,
      missing: Math.max(0, required - owned),
      met: owned >= required,
      sourceHints: getMaterialSourceHints(materialId, guild),
    };
  });
}

function recipeUnlocked(guild: GuildState, recipe: CraftingRecipeDefinition): boolean {
  return !recipe.unlockSource || (guild.unlockedRecipeIds ?? []).includes(recipe.id);
}

export function getCraftingRecipePresentation(guild: GuildState, recipe: CraftingRecipeDefinition): CraftingRecipePresentation {
  const output = resolveEquipmentDefinition(recipe.outputEquipmentId);
  if (!output) throw new Error(`Unknown recipe output: ${recipe.outputEquipmentId}`);
  const artisan = guild.artisans[recipe.artisanType];
  const unlocked = recipeUnlocked(guild, recipe);
  const materials = materialRows(guild, recipe.materials);
  const blockers: CraftingBlocker[] = [];
  if (!unlocked) blockers.push({ kind: "pattern", label: getRecipeUnlockHint(recipe) ?? "Pattern has not been discovered.", tone: "gold" });
  if (!artisan.recruited) blockers.push({ kind: "workshop", label: `Construct the ${recipe.artisanType === "blacksmith" ? "Blacksmith" : recipe.artisanType === "tailor" ? "Tailor" : "Jeweler"} workshop first.`, tone: "danger" });
  else if (artisan.level < recipe.artisanLevel) blockers.push({ kind: "workshop_level", label: `Requires Workshop Level ${recipe.artisanLevel}. Current level: ${artisan.level}.`, tone: "gold" });
  if (guild.gold < recipe.goldCost) blockers.push({ kind: "gold", label: `Need ${(recipe.goldCost - guild.gold).toLocaleString()} more gold.`, tone: "gold" });
  const missing = materials.filter((entry) => !entry.met);
  if (missing.length) blockers.push({ kind: "materials", label: `Missing ${missing.map((entry) => `${entry.missing} ${entry.name}`).join(", ")}.`, tone: "gold" });
  const fit = getInventoryItemPresentation(output, guild.heroes);
  return {
    recipe,
    output,
    unlocked,
    craftable: unlocked && blockers.length === 0,
    hardLocked: !unlocked || !artisan.recruited || artisan.level < recipe.artisanLevel,
    blockers,
    materials,
    compatibleHeroCount: fit.compatibleCount,
    upgradeHeroCount: fit.upgradeCount,
    tradeoffHeroCount: fit.tradeoffCount,
    bestFitLabel: fit.bestFitLabel,
    bestFitTone: fit.bestFitTone,
    unlockHint: getRecipeUnlockHint(recipe),
  };
}

export function getCraftingRecipePresentations(guild: GuildState, artisanType: ArtisanType, filter: CraftingRecipeFilter = "all"): CraftingRecipePresentation[] {
  const rows = Object.values(CRAFTING_RECIPES)
    .filter((recipe) => recipe.artisanType === artisanType)
    .map((recipe) => getCraftingRecipePresentation(guild, recipe));
  const filtered = rows.filter((row) => {
    if (filter === "craftable") return row.craftable;
    if (filter === "upgrades") return row.unlocked && row.upgradeHeroCount > 0;
    if (filter === "locked") return row.hardLocked;
    return true;
  });
  return filtered.sort((a, b) => Number(b.craftable) - Number(a.craftable)
    || Number(b.upgradeHeroCount > 0) - Number(a.upgradeHeroCount > 0)
    || Number(a.hardLocked) - Number(b.hardLocked)
    || a.recipe.artisanLevel - b.recipe.artisanLevel
    || a.output.name.localeCompare(b.output.name));
}

export function getEnchantmentPresentation(guild: GuildState, enchantment: EnchantmentDefinition): EnchantmentPresentation {
  const materials = materialRows(guild, enchantment.materials);
  const blockers: CraftingBlocker[] = [];
  const jeweler = guild.artisans.jeweler;
  if (!jeweler.recruited) blockers.push({ kind: "workshop", label: "Construct the Jeweler workshop first.", tone: "danger" });
  else if (jeweler.level < enchantment.artisanLevel) blockers.push({ kind: "workshop_level", label: `Requires Jeweler Level ${enchantment.artisanLevel}.`, tone: "gold" });
  if (guild.gold < enchantment.goldCost) blockers.push({ kind: "gold", label: `Need ${(enchantment.goldCost - guild.gold).toLocaleString()} more gold.`, tone: "gold" });
  const missing = materials.filter((entry) => !entry.met);
  if (missing.length) blockers.push({ kind: "materials", label: `Missing ${missing.map((entry) => `${entry.missing} ${entry.name}`).join(", ")}.`, tone: "gold" });
  return { craftable: blockers.length === 0, blockers, materials };
}

export function getWorkshopTierUnlocks(artisanType: ArtisanType, targetLevel: number): string[] {
  const recipeCount = Object.values(CRAFTING_RECIPES).filter((recipe) => recipe.artisanType === artisanType && recipe.artisanLevel === targetLevel && !recipe.unlockSource).length;
  const unlocks: string[] = [];
  if (recipeCount) unlocks.push(`${recipeCount} workshop recipe${recipeCount === 1 ? "" : "s"}`);
  if (artisanType === "blacksmith" && targetLevel === 1) unlocks.push("Repair Bench");
  if (artisanType === "jeweler" && targetLevel === 1) unlocks.push("Equipment enchanting");
  if (targetLevel >= 2) unlocks.push("Higher-tier discovered patterns");
  if (targetLevel === 3) unlocks.push("Master-tier crafting access");
  return unlocks.length ? unlocks : ["Higher-tier workshop recipes"];
}
