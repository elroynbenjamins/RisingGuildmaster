import { parseEquipmentKey } from "../../game/equipment/equipmentResolver";

export interface PremiumClassEquipmentIconCell { column: number; row: number }
const IDS = [
  "runewood-shortbow", "spellthread-coat", "watch-shield", "recruit-bulwark-mail",
  "stormstring-recurve", "runehunter-mantle", "gateward-shield", "formation-plate",
  "astral-limb-longbow", "adamant-door-shield", "runebound-archer-ring", "gatekeepers-band",
  "binding-rod", "conjurers-robe", "riftglass-crozier", "eidolon-loop",
] as const;
export const PREMIUM_CLASS_EQUIPMENT_ICON_CELLS: Readonly<Record<string, PremiumClassEquipmentIconCell>> = Object.fromEntries(IDS.map((id,index)=>[id,{column:index%4,row:Math.floor(index/4)}]));
export function getPremiumClassEquipmentIconCell(equipmentKey:string):PremiumClassEquipmentIconCell|undefined{return PREMIUM_CLASS_EQUIPMENT_ICON_CELLS[parseEquipmentKey(equipmentKey).equipmentId];}
