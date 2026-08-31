import { describe, expect, it } from "vitest";
import { EQUIPMENT } from "../src/data/equipment/equipment";
import { CRAFTING_RECIPES } from "../src/data/crafting/recipes";
import { WORLD_EVENTS } from "../src/data/world/worldEvents";
import { generateHero } from "../src/game/heroes/heroGenerator";
import type { ClassId } from "../src/game/heroes/types";
import { createSeededRandom } from "../src/utils/random";
import { createGuild } from "../src/game/guild/guildService";
import { resolveGuildEventChoice } from "../src/game/world/worldEventResolver";

const CLASSES: ClassId[] = ["warrior", "ranger", "mage", "cleric", "paladin", "berserker", "monk", "bard"];
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
