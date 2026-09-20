import { CRAFTING_RECIPES } from "../../data/crafting/recipes";
import type { MaterialId, ArtisanType } from "../crafting/craftingTypes";
import type { GuildState } from "../guild/types";
import { parseEquipmentKey, resolveEquipmentDefinition } from "./equipmentResolver";

export interface EquipmentDispositionPreview {
  saleGold: number;
  salvageArtisan: ArtisanType;
  salvageMaterials: Partial<Record<MaterialId, number>>;
}

const RECOVERY_RATIO = { common: .25, uncommon: .30, rare: .20, epic: .15, legendary: .10 } as const;
const fragmentMaterial = (id: MaterialId): boolean => id.endsWith("_recipe_fragment");

function recipeForEquipment(equipmentId: string) {
  return Object.values(CRAFTING_RECIPES).find((recipe) => recipe.outputEquipmentId === equipmentId);
}

function fallbackArtisan(slot: string): ArtisanType {
  if (slot === "accessory1" || slot === "accessory2") return "jeweler";
  if (slot === "armor" || slot === "boots") return "tailor";
  return "blacksmith";
}

/**
 * Returns a deliberately partial material recovery. Pattern fragments are never
 * recovered, preventing unique hunt recipes from duplicating their unlock cost.
 */
export function previewEquipmentDisposition(key: string): EquipmentDispositionPreview {
  const item = resolveEquipmentDefinition(key);
  if (!item) throw new Error("Unknown equipment");
  const { equipmentId } = parseEquipmentKey(key);
  const recipe = recipeForEquipment(equipmentId);
  const salvageArtisan = recipe?.artisanType ?? fallbackArtisan(item.slot);
  const ratio = RECOVERY_RATIO[item.rarity];
  const salvageMaterials: Partial<Record<MaterialId, number>> = {};
  if (recipe) {
    for (const [materialId, cost] of Object.entries(recipe.materials) as [MaterialId, number][]) {
      if (fragmentMaterial(materialId)) continue;
      const recovered = Math.floor(cost * ratio);
      if (recovered > 0) salvageMaterials[materialId] = recovered;
    }
  } else {
    const fallback: MaterialId = salvageArtisan === "blacksmith" ? "iron_ore" : salvageArtisan === "tailor" ? "wolf_pelt" : "silver_ore";
    salvageMaterials[fallback] = item.rarity === "rare" ? 2 : 1;
  }
  return { saleGold: Math.max(1, Math.floor(item.value * .40)), salvageArtisan, salvageMaterials };
}

function removeInventoryCopy(guild: GuildState, key: string): string[] {
  const index = guild.inventory.indexOf(key);
  if (index < 0) throw new Error("Equipment is no longer in inventory");
  const inventory = [...guild.inventory];
  inventory.splice(index, 1);
  return inventory;
}

export function sellInventoryEquipment(guild: GuildState, key: string): GuildState {
  const item = resolveEquipmentDefinition(key);
  if (!item) throw new Error("Unknown equipment");
  const preview = previewEquipmentDisposition(key);
  const inventory = removeInventoryCopy(guild, key);
  return {
    ...guild,
    gold: guild.gold + preview.saleGold,
    inventory,
    finance: {
      ...guild.finance,
      transactions: [...guild.finance.transactions, { id: `equipment-sale-${guild.currentDay}-${guild.finance.transactions.length}`, type: "equipment_sale", day: guild.currentDay, amount: preview.saleGold, note: `Sold ${item.name}` }],
    },
  };
}

export function salvageInventoryEquipment(guild: GuildState, key: string): GuildState {
  const preview = previewEquipmentDisposition(key);
  const workshop = guild.artisans[preview.salvageArtisan];
  if (!workshop.recruited || workshop.level < 1) throw new Error(`${preview.salvageArtisan} workshop is required for salvage`);
  if (!Object.keys(preview.salvageMaterials).length) throw new Error("This item has no recoverable materials");
  const inventory = removeInventoryCopy(guild, key);
  const materials = { ...guild.materials };
  for (const [materialId, amount] of Object.entries(preview.salvageMaterials) as [MaterialId, number][]) materials[materialId] += amount;
  return { ...guild, inventory, materials };
}
