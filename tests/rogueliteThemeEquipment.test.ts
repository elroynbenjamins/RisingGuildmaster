import { describe, expect, it } from "vitest";
import { THEME_BOSS_RECIPE_IDS, THEME_ELITE_RECIPE_IDS } from "../src/data/crafting/rogueliteRecipePools";
import { CRAFTING_RECIPES } from "../src/data/crafting/recipes";
import { EQUIPMENT } from "../src/data/equipment/equipment";
import { ROGUELITE_THEME_EQUIPMENT_ICON_CELLS } from "../src/data/equipment/rogueliteThemeEquipmentIcons";

describe("roguelite theme equipment", () => {
  it("fills helmets, boots, and second accessories evenly", () => {
    const ids = [...Object.values(THEME_ELITE_RECIPE_IDS), ...Object.values(THEME_BOSS_RECIPE_IDS)].map((recipeId) => CRAFTING_RECIPES[recipeId]!.outputEquipmentId);
    expect(ids).toHaveLength(12);
    for (const slot of ["helmet", "boots", "accessory2"] as const) expect(ids.filter((id) => EQUIPMENT[id]!.slot === slot)).toHaveLength(4);
  });

  it("gives every new item a dedicated atlas cell", () => {
    const ids = [...Object.values(THEME_ELITE_RECIPE_IDS), ...Object.values(THEME_BOSS_RECIPE_IDS)].map((recipeId) => CRAFTING_RECIPES[recipeId]!.outputEquipmentId);
    for (const id of ids) expect(ROGUELITE_THEME_EQUIPMENT_ICON_CELLS[id], id).toBeDefined();
    expect(new Set(Object.values(ROGUELITE_THEME_EQUIPMENT_ICON_CELLS).map((cell) => `${cell.column}:${cell.row}`)).size).toBe(12);
  });
});
