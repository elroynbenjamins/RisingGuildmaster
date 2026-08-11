import { ENCHANTMENTS } from "../../data/crafting/enchantments";
import { CRAFTING_RECIPES } from "../../data/crafting/recipes";
import type { GuildState } from "../guild/types";
import { createEnchantedEquipmentKey, resolveEquipmentDefinition } from "../equipment/equipmentResolver";
import type { ArtisanType, MaterialId } from "./craftingTypes";
import { startArtisanConstruction } from "./artisanBuildingService";

function spendMaterials(guild: GuildState, costs: Partial<Record<MaterialId, number>>): GuildState {
  for (const [id, amount] of Object.entries(costs) as [MaterialId, number][]) if ((guild.materials[id] ?? 0) < amount) throw new Error(`Not enough ${id.replace(/_/g, " ")}`);
  return { ...guild, materials: { ...guild.materials, ...Object.fromEntries((Object.entries(costs) as [MaterialId, number][]).map(([id, amount]) => [id, guild.materials[id] - amount])) } };
}

export function craftEquipment(guild: GuildState, recipeId: string): GuildState {
  const recipe = CRAFTING_RECIPES[recipeId]; if (!recipe) throw new Error("Unknown crafting recipe");
  if (recipe.unlockSource && !(guild.unlockedRecipeIds ?? []).includes(recipe.id)) throw new Error("Recipe has not been unlocked");
  const artisan = guild.artisans[recipe.artisanType]; if (!artisan?.recruited) throw new Error(`${recipe.artisanType} has not been recruited`);
  if (artisan.level < recipe.artisanLevel) throw new Error("Artisan level is too low");
  if (guild.gold < recipe.goldCost) throw new Error("Not enough gold");
  const paid = spendMaterials(guild, recipe.materials);
  return { ...paid, gold: paid.gold - recipe.goldCost, inventory: [...paid.inventory, recipe.outputEquipmentId] };
}

export function enchantInventoryEquipment(guild: GuildState, inventoryIndex: number, enchantmentId: string): GuildState {
  const key = guild.inventory[inventoryIndex]; if (!key) throw new Error("Inventory item is unavailable");
  const item = resolveEquipmentDefinition(key); if (!item) throw new Error("Only equipment can be enchanted");
  const enchantment = ENCHANTMENTS[enchantmentId]; if (!enchantment) throw new Error("Unknown enchantment");
  const jeweler = guild.artisans.jeweler; if (!jeweler.recruited || jeweler.level < enchantment.artisanLevel) throw new Error("Jeweler level is too low");
  if (!enchantment.applicableSlots.includes(item.slot)) throw new Error("Enchantment cannot be applied to this slot");
  if (guild.gold < enchantment.goldCost) throw new Error("Not enough gold");
  const paid = spendMaterials(guild, enchantment.materials); const inventory = [...paid.inventory]; inventory[inventoryIndex] = createEnchantedEquipmentKey(key, enchantmentId);
  return { ...paid, gold: paid.gold - enchantment.goldCost, inventory };
}

export function upgradeArtisan(guild: GuildState, artisanType: ArtisanType): GuildState {
  return startArtisanConstruction(guild, artisanType);
}

export function materialRequirementsMet(guild: GuildState, costs: Partial<Record<MaterialId, number>>): boolean { return (Object.entries(costs) as [MaterialId, number][]).every(([id, amount]) => guild.materials[id] >= amount); }
