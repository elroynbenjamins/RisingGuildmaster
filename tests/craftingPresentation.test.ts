import { describe, expect, it } from "vitest";
import { CRAFTING_RECIPES } from "../src/data/crafting/recipes";
import { createGuild } from "../src/game/guild/guildService";
import { getCraftingRecipePresentation, getCraftingRecipePresentations, getMaterialSourceHints, getWorkshopTierUnlocks } from "../src/game/crafting/craftingPresentationService";
import { testHero } from "./testHero";

describe("crafting presentation", () => {
  it("explains every blocker and becomes craftable when the requirements are met", () => {
    const guild = createGuild();
    const recipe = CRAFTING_RECIPES.forge_iron_longsword!;
    const blocked = getCraftingRecipePresentation(guild, recipe);
    expect(blocked.craftable).toBe(false);
    expect(blocked.blockers.some((item) => item.kind === "workshop")).toBe(true);
    expect(blocked.blockers.some((item) => item.kind === "materials")).toBe(true);

    guild.artisans.blacksmith = { level: 1, recruited: true, construction: null };
    guild.materials.iron_ore = 5;
    guild.materials.coal = 2;
    guild.materials.oak_timber = 1;
    const ready = getCraftingRecipePresentation(guild, recipe);
    expect(ready.craftable).toBe(true);
    expect(ready.blockers).toEqual([]);
  });

  it("keeps undiscovered patterns visibly locked without pretending they are craftable", () => {
    const guild = createGuild();
    guild.artisans.blacksmith = { level: 3, recruited: true, construction: null };
    const recipe = CRAFTING_RECIPES.boss_weapon_warrior!;
    const row = getCraftingRecipePresentation(guild, recipe);
    expect(row.unlocked).toBe(false);
    expect(row.hardLocked).toBe(true);
    expect(row.unlockHint).toMatch(/roguelite Boss/i);
  });

  it("identifies recipes that are real upgrades for the current roster", () => {
    const guild = createGuild();
    guild.heroes = [{ ...testHero(), level: 2, equipment: { ...testHero().equipment, weapon: null } }];
    guild.artisans.blacksmith = { level: 1, recruited: true, construction: null };
    guild.materials.iron_ore = 5;
    guild.materials.coal = 2;
    guild.materials.oak_timber = 1;
    const rows = getCraftingRecipePresentations(guild, "blacksmith", "upgrades");
    expect(rows.some((row) => row.recipe.id === "forge_iron_longsword")).toBe(true);
  });

  it("reveals exact monster sources only after they are discovered", () => {
    const guild = createGuild();
    expect(getMaterialSourceHints("serpent_scale", guild)).toContain("Unknown creature · discover it in the Monster Manual");
    guild.discoveredEnemyIds.push("great_forest_serpent");
    expect(getMaterialSourceHints("serpent_scale", guild).some((hint) => hint.includes("Great Forest Serpent"))).toBe(true);
  });

  it("describes workshop capability unlocks by tier", () => {
    expect(getWorkshopTierUnlocks("blacksmith", 1)).toContain("Repair Bench");
    expect(getWorkshopTierUnlocks("jeweler", 1)).toContain("Equipment enchanting");
  });
});
