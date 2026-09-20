import { describe, expect, it } from "vitest";
import { EQUIPMENT } from "../src/data/equipment/equipment";
import { getBalanceEquipmentIconCell } from "../src/data/equipment/balanceEquipmentIcons";
import { BOW_ICON_CELLS, getBowIconCell, getWeaponIconCell, WEAPON_ICON_CELLS } from "../src/data/equipment/weaponIcons";
import { getPremiumClassEquipmentIconCell } from "../src/data/equipment/premiumClassEquipmentIcons";

describe("weapon icon atlas", () => {
  it("assigns every weapon a unique atlas cell", () => {
    const weaponIds = Object.values(EQUIPMENT).filter((item) => item.slot === "weapon").map((item) => item.id);
    const cells = weaponIds.map((id) => {
      const balanceCell = getBalanceEquipmentIconCell(id);
      if (balanceCell) return `balance:${balanceCell.column}:${balanceCell.row}`;
      const premiumCell = getPremiumClassEquipmentIconCell(id);
      if (premiumCell) return `premium:${premiumCell.column}:${premiumCell.row}`;
      const weaponCell = getWeaponIconCell(id);
      expect(weaponCell, id).toBeDefined();
      return `weapon:${weaponCell?.column}:${weaponCell?.row}`;
    });
    expect(new Set(cells).size).toBe(weaponIds.length);
    expect(Object.keys(WEAPON_ICON_CELLS).length).toBe(weaponIds.length - 12);
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
