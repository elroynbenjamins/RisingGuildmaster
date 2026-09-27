import { describe, expect, it } from "vitest";
import { EQUIPMENT } from "../src/data/equipment/equipment";
import { getBalanceEquipmentIconCell } from "../src/data/equipment/balanceEquipmentIcons";
import { BOW_ICON_CELLS, getBowIconCell, getWeaponIconCell, WEAPON_ICON_CELLS } from "../src/data/equipment/weaponIcons";
import { getPremiumClassEquipmentIconCell } from "../src/data/equipment/premiumClassEquipmentIcons";
import { EQUIPMENT_ICON_ART } from "../src/data/equipment/equipmentIconArt";

describe("weapon icon atlas", () => {
  it("provides artwork for every weapon and keeps legacy atlas mappings collision-free", () => {
    const weaponIds = Object.values(EQUIPMENT).filter((item) => item.slot === "weapon").map((item) => item.id);
    for (const id of weaponIds) expect(getBalanceEquipmentIconCell(id) ?? getPremiumClassEquipmentIconCell(id) ?? getWeaponIconCell(id) ?? EQUIPMENT_ICON_ART[id], id).toBeDefined();
    const legacyCells = Object.values(WEAPON_ICON_CELLS).map((cell) => `${cell.column}:${cell.row}`);
    expect(new Set(legacyCells).size).toBe(legacyCells.length);
  });

  it("keeps the base icon for enchanted inventory keys", () => {
    expect(getWeaponIconCell("worn-sword::keen_edge")).toEqual(getWeaponIconCell("worn-sword"));
  });

  it("uses the dedicated corrected silhouette sheet for every bow", () => {
    const bowIds = Object.keys(BOW_ICON_CELLS);
    expect(bowIds).toHaveLength(7);
    expect(bowIds.every((id) => getBowIconCell(id) !== undefined)).toBe(true);
    expect(new Set(bowIds.map((id) => { const cell = getBowIconCell(id)!; return `${cell.column}:${cell.row}`; })).size).toBe(7);
  });
});
