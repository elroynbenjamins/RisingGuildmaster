import type { Hero } from "../heroes/types";
import { resolveEquipmentDefinition } from "./equipmentResolver";

export function equipItem(hero: Hero, equipmentId: string): Hero {
  const item = resolveEquipmentDefinition(equipmentId);
  if (!item) throw new Error(`Unknown equipment: ${equipmentId}`);
  if (hero.level < item.levelRequirement) throw new Error("Hero does not meet the level requirement");
  if (item.classRestrictions.length && !item.classRestrictions.includes(hero.classId)) throw new Error("Hero class cannot equip this item");
  return { ...hero, equipment: { ...hero.equipment, [item.slot]: equipmentId } };
}

export function unequipSlot(hero: Hero, slot: keyof Hero["equipment"]): Hero {
  return { ...hero, equipment: { ...hero.equipment, [slot]: null } };
}
