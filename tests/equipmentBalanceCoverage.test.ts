import { describe, expect, it } from "vitest";
import { EQUIPMENT } from "../src/data/equipment/equipment";
import { CRAFTING_RECIPES } from "../src/data/crafting/recipes";
import { WORLD_EVENTS } from "../src/data/world/worldEvents";
import { generateHero } from "../src/game/heroes/heroGenerator";
import type { ClassId } from "../src/game/heroes/types";
import { createSeededRandom } from "../src/utils/random";
import { createGuild } from "../src/game/guild/guildService";
import { resolveGuildEventChoice } from "../src/game/world/worldEventResolver";
import { QUEST_LOOT_TABLES } from "../src/data/loot/questLootTables";
import { CAMPAIGN_CHAPTERS, CAMPAIGN_NODES } from "../src/data/campaign/chapter1";
import { QUESTS } from "../src/data/quests/quests";

const CLASSES: ClassId[] = ["warrior", "ranger", "mage", "cleric", "paladin", "berserker", "monk", "bard", "spellbow", "bulwark", "summoner"];
const ATTRIBUTE_TARGETS = new Set(["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"]);

describe("equipment balance coverage", () => {
  it("generates every class with legal level-one equipment", () => {
    for (const classId of CLASSES) {
      const hero = generateHero(createSeededRandom(1200 + CLASSES.indexOf(classId)), { classId });
      for (const equipmentId of Object.values(hero.equipment).filter((id): id is string => Boolean(id))) {
        const item = EQUIPMENT[equipmentId]!;
        expect(item, `${classId} starter ${equipmentId}`).toBeDefined();
        expect(item.levelRequirement).toBeLessThanOrEqual(1);
        expect(item.classRestrictions.length === 0 || item.classRestrictions.includes(classId)).toBe(true);
      }
    }
  });

  it("keeps equipment tactical and never changes base attributes", () => {
    for (const item of Object.values(EQUIPMENT)) expect(item.modifiers.some((modifier) => ATTRIBUTE_TARGETS.has(modifier.target))).toBe(false);
  });

  it("gives Monk and Bard real progression across thin equipment slots", () => {
    for (const classId of ["monk", "bard"] as const) {
      const usable = Object.values(EQUIPMENT).filter((item) => !item.classRestrictions.length || item.classRestrictions.includes(classId));
      expect(usable.filter((item) => item.slot === "weapon" && item.rarity === "common").length).toBeGreaterThanOrEqual(1);
      expect(usable.filter((item) => item.slot === "weapon" && item.rarity === "uncommon").length).toBeGreaterThanOrEqual(1);
      for (const slot of ["armor", "helmet", "boots", "accessory2"] as const) expect(usable.filter((item) => item.slot === slot).length, `${classId} ${slot}`).toBeGreaterThanOrEqual(3);
    }
  });

  it("keeps every premium class on reachable Level-4 primary bridge gear", () => {
    const premiumClasses: ClassId[] = ["monk", "bard", "spellbow", "bulwark", "summoner"];
    const earlyLootIds = new Set([
      ...QUEST_LOOT_TABLES.mosswatch_quest_loot!.itemIds,
      ...QUEST_LOOT_TABLES.caravan_escort_loot!.itemIds,
      ...QUEST_LOOT_TABLES.brambleford_defense_loot!.itemIds,
    ]);
    const defaultLevelOneOutputs = new Set(Object.values(CRAFTING_RECIPES)
      .filter((recipe) => !recipe.unlockSource && recipe.artisanLevel <= 1)
      .map((recipe) => recipe.outputEquipmentId));
    const reachable = (itemId: string) => earlyLootIds.has(itemId) || defaultLevelOneOutputs.has(itemId);

    for (const classId of premiumClasses) {
      const usable = Object.values(EQUIPMENT).filter((item) => !item.classRestrictions.length || item.classRestrictions.includes(classId));
      const weapons = usable.filter((item) => item.slot === "weapon" && item.levelRequirement === 4 && reachable(item.id));
      const armor = usable.filter((item) => item.slot === "armor" && item.levelRequirement === 4 && reachable(item.id));
      expect(weapons.length, `${classId} reachable Level-4 weapon`).toBeGreaterThanOrEqual(1);
      expect(armor.length, `${classId} reachable Level-4 armor`).toBeGreaterThanOrEqual(1);
    }
  });

  it("keeps every class on reachable primary bridge gear through Chapter 5", () => {
    const accessibleQuestIds = new Set<string>();
    for (let chapterNumber = 1; chapterNumber <= 5; chapterNumber += 1) {
      const chapter = CAMPAIGN_CHAPTERS[chapterNumber]!;
      for (const nodeId of chapter.nodeIds) {
        const questId = CAMPAIGN_NODES[nodeId]?.questId;
        if (questId) accessibleQuestIds.add(questId);
      }
      for (const questId of chapter.sideQuestIds ?? []) accessibleQuestIds.add(questId);
    }

    const questLootIds = new Set<string>();
    const questRecipeOutputs = new Set<string>();
    for (const questId of accessibleQuestIds) {
      const quest = QUESTS[questId];
      if (!quest) continue;
      for (const itemId of QUEST_LOOT_TABLES[quest.lootTableId]?.itemIds ?? []) questLootIds.add(itemId);
      for (const recipeId of quest.recipeUnlockIdsOnVictory ?? []) {
        const outputId = CRAFTING_RECIPES[recipeId]?.outputEquipmentId;
        if (outputId) questRecipeOutputs.add(outputId);
      }
    }

    const defaultLevelTwoOutputs = new Set(Object.values(CRAFTING_RECIPES)
      .filter((recipe) => !recipe.unlockSource && recipe.artisanLevel <= 2)
      .map((recipe) => recipe.outputEquipmentId));
    const reachable = (itemId: string) =>
      questLootIds.has(itemId)
      || questRecipeOutputs.has(itemId)
      || defaultLevelTwoOutputs.has(itemId);

    for (const classId of CLASSES) {
      const usable = Object.values(EQUIPMENT).filter((item) => !item.classRestrictions.length || item.classRestrictions.includes(classId));
      const weapons = usable.filter((item) => item.slot === "weapon" && item.levelRequirement >= 7 && item.levelRequirement <= 9 && reachable(item.id));
      const armor = usable.filter((item) => item.slot === "armor" && item.levelRequirement >= 7 && item.levelRequirement <= 9 && reachable(item.id));
      expect(weapons.length, `${classId} reachable Chapter 5 bridge weapon`).toBeGreaterThanOrEqual(1);
      expect(armor.length, `${classId} reachable Chapter 5 bridge armor`).toBeGreaterThanOrEqual(1);
    }
  });

  it("keeps every class on a current equipment path into Chapter 7", () => {
    for (const classId of CLASSES) {
      const usable = Object.values(EQUIPMENT).filter((item) => !item.classRestrictions.length || item.classRestrictions.includes(classId));
      const bridgeWeapons = usable.filter((item) => item.slot === "weapon" && item.levelRequirement >= 9 && item.levelRequirement <= 11);
      expect(bridgeWeapons.length, `${classId} Chapter 6 bridge weapon`).toBeGreaterThanOrEqual(1);

      for (const slot of ["weapon", "armor", "helmet", "boots", "accessory1", "accessory2"] as const) {
        const currentTier = usable.filter((item) => item.slot === slot && item.levelRequirement >= 10 && item.levelRequirement <= 12);
        expect(currentTier.length, `${classId} Chapter 7 ${slot}`).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it("keeps every class on current-tier equipment through Chapters 8 and 9", () => {
    for (const classId of CLASSES) {
      const usable = Object.values(EQUIPMENT).filter((item) => !item.classRestrictions.length || item.classRestrictions.includes(classId));
      for (const [chapter, minLevel, maxLevel] of [["Chapter 8", 14, 15], ["Chapter 9", 16, 17]] as const) {
        for (const slot of ["weapon", "armor", "helmet", "boots", "accessory1", "accessory2"] as const) {
          const currentTier = usable.filter((item) => item.slot === slot && item.levelRequirement >= minLevel && item.levelRequirement <= maxLevel);
          expect(currentTier.length, `${classId} ${chapter} ${slot}`).toBeGreaterThanOrEqual(1);
        }
      }
    }
  });

  it("keeps every class geared for the Lv 18-19 postgame", () => {
    for (const classId of CLASSES) {
      const usable = Object.values(EQUIPMENT).filter((item) => !item.classRestrictions.length || item.classRestrictions.includes(classId));
      for (const slot of ["weapon", "armor", "helmet", "boots", "accessory1", "accessory2"] as const) {
        const postgame = usable.filter((item) => item.slot === slot && item.levelRequirement >= 18 && item.levelRequirement <= 19);
        expect(postgame.length, `${classId} postgame ${slot}`).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it("has valid outputs for every crafting recipe", () => {
    for (const recipe of Object.values(CRAFTING_RECIPES)) expect(EQUIPMENT[recipe.outputEquipmentId], recipe.id).toBeDefined();
  });

  it("lets the traveling quartermaster sell gear and permanent recipe folios once", () => {
    const event = WORLD_EVENTS.aldren_road_quartermaster!;
    const guild = createGuild(); const hero = generateHero(createSeededRandom(77), { classId: "bard" });
    const gear = resolveGuildEventChoice(event.choices[0]!, guild, [hero], createSeededRandom(1)).guild;
    expect(gear.gold).toBe(guild.gold - 170); expect(gear.inventory).toContain("warding-brooch"); expect(gear.world.worldFlags.merchant_warding_brooch_bought).toBe(true);
    const folio = resolveGuildEventChoice(event.choices[1]!, guild, [hero], createSeededRandom(1)).guild;
    expect(folio.unlockedRecipeIds).toEqual(expect.arrayContaining(["merchant_jade_prayer_wheel", "merchant_stormglass_boots"]));
    expect(() => resolveGuildEventChoice(event.choices[1]!, folio, [hero], createSeededRandom(1))).toThrow("requirements");
    expect(() => resolveGuildEventChoice(event.choices[2]!, { ...guild, gold: 10 }, [hero], createSeededRandom(1))).toThrow("Not enough gold");
  });
});
