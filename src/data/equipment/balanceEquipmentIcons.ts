import { parseEquipmentKey } from "../../game/equipment/equipmentResolver";

export interface BalanceEquipmentIconCell { column: number; row: number }
const IDS = [
  "novice-quarterstaff", "practice-rapier", "disciple-wraps", "minstrel-coat", "focus-headband",
  "traveler-feather-cap", "windstep-sandals", "performers-boots", "wayfarer-clasp", "meditation-beads",
  "pitch-pipe-charm", "ironwood-quarterstaff", "silver-tongue-rapier", "warded-handwraps", "chorus-coat",
  "stillwater-circlet", "chorus-mask", "cloudstep-boots", "roadshow-boots", "temple-prayer-wheel",
  "resonant-tuning-fork", "warding-brooch", "stormglass-boots", "oathkeepers-helm", "harmonic-locket",
] as const;

export const BALANCE_EQUIPMENT_ICON_CELLS: Readonly<Record<string, BalanceEquipmentIconCell>> = Object.fromEntries(IDS.map((id, index) => [id, { column: index % 5, row: Math.floor(index / 5) }]));
export function getBalanceEquipmentIconCell(equipmentKey: string): BalanceEquipmentIconCell | undefined {
  const id = parseEquipmentKey(equipmentKey).equipmentId;
  return BALANCE_EQUIPMENT_ICON_CELLS[id === "jade-prayer-wheel" ? "temple-prayer-wheel" : id];
}
