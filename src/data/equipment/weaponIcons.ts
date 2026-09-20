import { parseEquipmentKey } from "../../game/equipment/equipmentResolver";

export interface WeaponIconCell { column: number; row: number }

const BOW_ORDER = [
  "hunting-bow", "yew-shortbow", "oak-recurve-bow", "frostwood-bow",
  "moonwood-longbow", "starfall-longbow", "coilfang-longbow",
] as const;

export const BOW_ICON_CELLS: Readonly<Record<(typeof BOW_ORDER)[number], WeaponIconCell>> = Object.fromEntries(
  BOW_ORDER.map((id, index) => [id, { column: index % 4, row: Math.floor(index / 4) }]),
) as Record<(typeof BOW_ORDER)[number], WeaponIconCell>;

const WEAPON_ORDER = [
  "worn-sword", "hunting-bow", "apprentice-staff", "militia-handaxe", "yew-shortbow",
  "pilgrim-rod", "oak-spear", "novice-mace", "ash-wand", "iron-longsword",
  "iron-warhammer", "oak-recurve-bow", "runic-staff", "blessed-mace", "venomsteel-spear",
  "cinder-edge-axe", "emberglass-wand", "frostwood-bow", "barbed-war-pick", "steel-greatsword",
  "moonwood-longbow", "wardstone-scepter", "wardens-oathblade", "starfall-longbow", "astral-spire-staff",
  "dawn-chime-mace", "sunforged-judgment", "bloodiron-greataxe", "coilfang-longbow",
  "pale-echo-lance", "memoryglass-blade", "sixth-voice-blade", "concordance-glaive",
  "seven-bells-quarterstaff", "echoing-verse-rapier", "sixth-tide-blade",
  "seventh-name-glaive",
] as const;

export const WEAPON_ICON_CELLS: Readonly<Record<(typeof WEAPON_ORDER)[number], WeaponIconCell>> = Object.fromEntries(
  WEAPON_ORDER.map((id, index) => [id, index < 29 ? { column: index % 5, row: Math.floor(index / 5) } : index < 32 ? { column: index - 29, row: 6 } : { column: index - 32, row: 7 }]),
) as Record<(typeof WEAPON_ORDER)[number], WeaponIconCell>;

export function getWeaponIconCell(equipmentKey: string): WeaponIconCell | undefined {
  const { equipmentId } = parseEquipmentKey(equipmentKey);
  return WEAPON_ICON_CELLS[equipmentId as keyof typeof WEAPON_ICON_CELLS];
}

export function getBowIconCell(equipmentKey: string): WeaponIconCell | undefined {
  const { equipmentId } = parseEquipmentKey(equipmentKey);
  return BOW_ICON_CELLS[equipmentId as keyof typeof BOW_ICON_CELLS];
}
