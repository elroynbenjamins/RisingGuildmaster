import { describe, expect, it } from "vitest";
import { createEnchantedEquipmentKey } from "../src/game/equipment/equipmentResolver";
import { previewEquipmentDisposition, salvageInventoryEquipment, sellInventoryEquipment } from "../src/game/equipment/equipmentDispositionService";
import { createGuild } from "../src/game/guild/guildService";

describe("equipment quartermaster", () => {
  it("sells exactly one inventory copy and records the income", () => {
    const key = createEnchantedEquipmentKey("militia-handaxe", "ember_edge");
    const guild = { ...createGuild(), inventory: [key, key] };
    const preview = previewEquipmentDisposition(key);
    const sold = sellInventoryEquipment(guild, key);
    expect(sold.inventory).toEqual([key]);
    expect(sold.gold).toBe(guild.gold + preview.saleGold);
    expect(sold.finance.transactions.at(-1)).toMatchObject({ type: "equipment_sale", amount: preview.saleGold });
  });

  it("requires the matching workshop before salvaging", () => {
    const guild = { ...createGuild(), inventory: ["iron-longsword"] };
    expect(() => salvageInventoryEquipment(guild, "iron-longsword")).toThrow("blacksmith workshop");
  });

  it("recovers deterministic partial recipe materials without granting gold", () => {
    const base = createGuild();
    const guild = { ...base, inventory: ["sapphire-lamellar"], artisans: { ...base.artisans, blacksmith: { level: 2, recruited: true, construction: null } } };
    const preview = previewEquipmentDisposition("sapphire-lamellar");
    expect(preview).toMatchObject({ salvageArtisan: "blacksmith", salvageMaterials: { iron_ore: 2, coal: 1 } });
    const salvaged = salvageInventoryEquipment(guild, "sapphire-lamellar");
    expect(salvaged.inventory).toEqual([]);
    expect(salvaged.gold).toBe(guild.gold);
    expect(salvaged.materials.iron_ore).toBe(2);
    expect(salvaged.materials.coal).toBe(1);
  });

  it("never recovers unique hunt recipe fragments", () => {
    const preview = previewEquipmentDisposition("coilfang-longbow");
    expect(preview.salvageMaterials.serpent_recipe_fragment).toBeUndefined();
    expect(preview.salvageMaterials.serpent_scale).toBe(1);
  });

  it("rejects stale inventory actions", () => {
    const guild = createGuild();
    expect(() => sellInventoryEquipment(guild, "worn-sword")).toThrow("no longer in inventory");
  });
});
