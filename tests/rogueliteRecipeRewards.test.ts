import { describe, expect, it } from "vitest";
import { BOSS_WEAPON_RECIPE_IDS, ELITE_RING_RECIPE_IDS, THEME_BOSS_RECIPE_IDS, THEME_ELITE_RECIPE_IDS } from "../src/data/crafting/rogueliteRecipePools";
import { CRAFTING_RECIPES } from "../src/data/crafting/recipes";
import { EQUIPMENT } from "../src/data/equipment/equipment";
import { craftEquipment } from "../src/game/crafting/craftingService";
import { createGuild } from "../src/game/guild/guildService";
import { resolveRogueliteRecipeDrop, startRogueliteRun } from "../src/game/roguelite/recipeRewardService";
import { sequenceRandom } from "./combatTestUtils";

describe("roguelite recipe rewards", () => {
  it("provides exactly one rare weapon and one uncommon ring recipe per playable class", () => {
    expect(Object.keys(BOSS_WEAPON_RECIPE_IDS)).toHaveLength(11);
    expect(Object.keys(ELITE_RING_RECIPE_IDS)).toHaveLength(11);
    for (const [classId, recipeId] of Object.entries(BOSS_WEAPON_RECIPE_IDS)) {
      const recipe = CRAFTING_RECIPES[recipeId]!; const item = EQUIPMENT[recipe.outputEquipmentId]!;
      expect(recipe.unlockSource).toBe("roguelite_boss"); expect(item).toMatchObject({ rarity: "rare", slot: "weapon", classRestrictions: [classId] });
    }
    for (const [classId, recipeId] of Object.entries(ELITE_RING_RECIPE_IDS)) {
      const recipe = CRAFTING_RECIPES[recipeId]!; const item = EQUIPMENT[recipe.outputEquipmentId]!;
      expect(recipe.unlockSource).toBe("roguelite_elite"); expect(item).toMatchObject({ rarity: "uncommon", slot: "accessory1", classRestrictions: [classId] });
    }
  });

  it("adds one fitting Elite and Boss recipe to every dungeon theme pool", () => {
    expect(Object.keys(THEME_ELITE_RECIPE_IDS)).toHaveLength(6);
    expect(Object.keys(THEME_BOSS_RECIPE_IDS)).toHaveLength(6);
    for (const recipeId of Object.values(THEME_ELITE_RECIPE_IDS)) {
      const recipe = CRAFTING_RECIPES[recipeId]!;
      expect(EQUIPMENT[recipe.outputEquipmentId]).toMatchObject({ rarity: "uncommon" });
    }
    for (const recipeId of Object.values(THEME_BOSS_RECIPE_IDS)) {
      const recipe = CRAFTING_RECIPES[recipeId]!;
      expect(EQUIPMENT[recipe.outputEquipmentId]).toMatchObject({ rarity: "rare" });
    }
  });

  it("includes the current theme recipe without exposing recipes from other themes", () => {
    const started = startRogueliteRun(createGuild(), "forest-theme");
    const drop = resolveRogueliteRecipeDrop(started, "elite", sequenceRandom([0, .999]), 0, "forest");
    expect(drop.result.droppedRecipeId).toBe(THEME_ELITE_RECIPE_IDS.forest);
  });

  it("uses a 50 percent Elite roll, then selects uniformly from all class rings", () => {
    const started = startRogueliteRun(createGuild(), "elite-test");
    const miss = resolveRogueliteRecipeDrop(started, "elite", sequenceRandom([.50]));
    expect(miss.result).toMatchObject({ roll: .50, droppedRecipeId: null });
    const first = resolveRogueliteRecipeDrop(miss.guild, "elite", sequenceRandom([.49, 0]));
    expect(first.result.droppedRecipeId).toBe(Object.values(ELITE_RING_RECIPE_IDS)[0]);
    expect(first.guild.unlockedRecipeIds).toContain(first.result.droppedRecipeId);
  });

  it("applies a dungeon rare-loot modifier to the recipe drop chance", () => {
    const normal = resolveRogueliteRecipeDrop(startRogueliteRun(createGuild(), "normal-chance"), "elite", sequenceRandom([.60]));
    expect(normal.result.droppedRecipeId).toBeNull();
    const improved = resolveRogueliteRecipeDrop(startRogueliteRun(createGuild(), "improved-chance"), "elite", sequenceRandom([.60, 0]), .20);
    expect(improved.result.droppedRecipeId).toBe(Object.values(ELITE_RING_RECIPE_IDS)[0]);
  });

  it("adds a matching late-boss recipe only after its party-level gate", () => {
    const standardPool = [...Object.values(BOSS_WEAPON_RECIPE_IDS), THEME_BOSS_RECIPE_IDS.undead];
    const base = { ...createGuild(), unlockedRecipeIds: standardPool };
    const low = resolveRogueliteRecipeDrop(startRogueliteRun(base, "late-low"), "boss", sequenceRandom([0, .99]), 0, "undead", { encounterId: "rl_undead_archivist_echo_boss", partyAverageLevel: 7 });
    expect(low.result.poolExhausted).toBe(true);
    const ready = resolveRogueliteRecipeDrop(startRogueliteRun(base, "late-ready"), "boss", sequenceRandom([0, .99]), 0, "undead", { encounterId: "rl_undead_archivist_echo_boss", partyAverageLevel: 8 });
    expect(ready.result.droppedRecipeId).toBe("tailor_archivists_mantle");
  });

  it("allows at most one Elite recipe and one Boss recipe per run", () => {
    let guild = startRogueliteRun(createGuild(), "cap-test");
    const elite = resolveRogueliteRecipeDrop(guild, "elite", sequenceRandom([0, .99])); guild = elite.guild;
    expect(resolveRogueliteRecipeDrop(guild, "elite", sequenceRandom([0, 0])).result.alreadyAwarded).toBe(true);
    const boss = resolveRogueliteRecipeDrop(guild, "boss", sequenceRandom([0, .99])); guild = boss.guild;
    expect(boss.result.droppedRecipeId).toBe(Object.values(BOSS_WEAPON_RECIPE_IDS).at(-1));
    expect(guild.activeRogueliteRun?.recipeIdsUnlockedThisRun).toHaveLength(2);
    expect(resolveRogueliteRecipeDrop(guild, "boss", sequenceRandom([0, 0])).result.alreadyAwarded).toBe(true);
  });

  it("prevents crafting a discovered recipe before it has dropped", () => {
    const guild = createGuild(); guild.artisans.jeweler = { level: 1, recruited: true, construction: null }; guild.materials.silver_ore = 10; guild.materials.iron_ore = 10; guild.materials.rough_ruby = 2;
    expect(() => craftEquipment(guild, "elite_ring_warrior")).toThrow("not been unlocked");
  });
});
