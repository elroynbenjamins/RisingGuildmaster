import { parseEquipmentKey } from "../../game/equipment/equipmentResolver";

export interface RogueliteThemeEquipmentIconCell { column: number; row: number }
const IDS = [
  "thornseed-charm", "thornwarden-hood", "glacier-spike-sabatons", "rimeguard-greathelm",
  "rootstrider-boots", "venomward-charm", "ashglass-visor", "cinderward-talisman",
  "dunewalker-boots", "sunscar-veil", "gravewater-waders", "ossuary-reliquary",
] as const;
export const ROGUELITE_THEME_EQUIPMENT_ICON_CELLS: Readonly<Record<string, RogueliteThemeEquipmentIconCell>> = Object.fromEntries(IDS.map((id, index) => [id, { column: index % 4, row: Math.floor(index / 4) }]));
export function getRogueliteThemeEquipmentIconCell(equipmentKey: string): RogueliteThemeEquipmentIconCell | undefined {
  return ROGUELITE_THEME_EQUIPMENT_ICON_CELLS[parseEquipmentKey(equipmentKey).equipmentId];
}
