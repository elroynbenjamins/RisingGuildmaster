import { describe, expect, it } from "vitest";
import { EQUIPMENT } from "../src/data/equipment/equipment";
import { craftEquipment, enchantInventoryEquipment } from "../src/game/crafting/craftingService";
import { equipItem } from "../src/game/equipment/equipmentService";
import { resolveEquipmentDefinition } from "../src/game/equipment/equipmentResolver";
import { createGuild } from "../src/game/guild/guildService";
import { calculateHero } from "../src/game/heroes/heroCalculator";
import { testHero } from "./testHero";
import { deserializeGuild, serializeGuild } from "../src/game/save/saveService";

describe("artisan equipment production", () => {
  it("crafts Blacksmith equipment by consuming exact materials and gold", () => {
    const guild = createGuild(); guild.artisans.blacksmith = { level: 1, recruited: true, construction: null }; guild.materials.iron_ore = 5; guild.materials.coal = 2; guild.materials.oak_timber = 1;
    const crafted = craftEquipment(guild, "forge_iron_longsword");
    expect(crafted.inventory).toContain("iron-longsword");
    expect(crafted.gold).toBe(guild.gold - 80);
    expect(crafted.materials).toMatchObject({ iron_ore: 0, coal: 0, oak_timber: 0 });
    expect(guild.inventory).toEqual([]);
  });

  it("rejects recipes when materials or artisan levels are insufficient", () => {
    const forge = createGuild(); forge.artisans.blacksmith = { level: 1, recruited: true, construction: null };
    expect(() => craftEquipment(forge, "forge_chainmail")).toThrow("Not enough iron ore");
    const guild = createGuild(); guild.artisans.jeweler = { level: 1, recruited: true, construction: null }; guild.materials.silver_ore = 3; guild.materials.rough_ruby = 1; guild.materials.arcane_dust = 3;
    expect(() => craftEquipment(guild, "jewel_ruby_talisman")).toThrow("Artisan level is too low");
  });

  it("lets the Jeweler enchant one inventory copy without mutating base definitions", () => {
    const guild = createGuild(); guild.artisans.jeweler = { level: 1, recruited: true, construction: null }; guild.inventory = ["iron-longsword"]; guild.materials.rough_ruby = 1; guild.materials.arcane_dust = 2;
    const original = structuredClone(EQUIPMENT["iron-longsword"]!); const enchanted = enchantInventoryEquipment(guild, 0, "ember_edge"); const key = enchanted.inventory[0]!;
    expect(key).toBe("iron-longsword::ember_edge");
    expect(resolveEquipmentDefinition(key)).toMatchObject({ enchantmentIds: ["ember_edge"], inventoryKey: key });
    expect(EQUIPMENT["iron-longsword"]).toEqual(original);
    expect(() => enchantInventoryEquipment(enchanted, 0, "ember_edge")).toThrow();
  });

  it("applies crafted and enchanted modifiers dynamically without changing base attributes", () => {
    const hero = { ...testHero(), level: 2 }; const baseAttributes = structuredClone(hero.baseAttributes);
    const plain = equipItem(hero, "iron-longsword"); const enchanted = equipItem(hero, "iron-longsword::ember_edge");
    expect(calculateHero(enchanted).stats.physicalAttack).toBeGreaterThan(calculateHero(plain).stats.physicalAttack);
    expect(enchanted.baseAttributes).toEqual(baseAttributes);
  });

  it("persists materials, artisans, gathering state, and enchanted inventory keys", () => {
    const guild = createGuild(); guild.materials.spider_silk = 7; guild.artisans.jeweler = { level: 2, recruited: true, construction: null }; guild.inventory = ["iron-longsword::ember_edge"];
    const loaded = deserializeGuild(serializeGuild(guild));
    expect(loaded.materials.spider_silk).toBe(7);
    expect(loaded.artisans.jeweler.level).toBe(2);
    expect(loaded.inventory).toEqual(["iron-longsword::ember_edge"]);
    const legacy = JSON.parse(serializeGuild(guild)); delete legacy.materials; delete legacy.artisans; delete legacy.gatheringMissions;
    expect(deserializeGuild(JSON.stringify(legacy))).toMatchObject({ materials: { iron_ore: 0, spider_silk: 0 }, artisans: { blacksmith: { level: 0, recruited: false }, tailor: { level: 0, recruited: false }, jeweler: { level: 0, recruited: false } }, gatheringMissions: [] });
  });
});
