import { calculateHero } from "../game/heroes/heroCalculator";
import type { Hero } from "../game/heroes/types";
import { equipItem } from "../game/equipment/equipmentService";
import { resolveEquipmentDefinition } from "../game/equipment/equipmentResolver";
export interface EquipmentComparisonRow { label: string; before: number; after: number; difference: number }
export function compareEquipment(hero: Hero, equipmentId: string): EquipmentComparisonRow[] {
  const definition = resolveEquipmentDefinition(equipmentId); if (!definition) return [];
  const before = calculateHero(hero); const after = calculateHero(equipItem(hero, equipmentId));
  const entries: [string, number, number][] = [["STR", before.attributes.strength, after.attributes.strength], ["DEX", before.attributes.dexterity, after.attributes.dexterity], ["CON", before.attributes.constitution, after.attributes.constitution], ["INT", before.attributes.intelligence, after.attributes.intelligence], ["WIS", before.attributes.wisdom, after.attributes.wisdom], ["CHA", before.attributes.charisma, after.attributes.charisma], ["Max HP", before.stats.maxHP, after.stats.maxHP], ["Physical Attack", before.stats.physicalAttack, after.stats.physicalAttack], ["Physical Defense", before.stats.physicalDefense, after.stats.physicalDefense], ["Magic Power", before.stats.magicPower, after.stats.magicPower], ["Magic Defense", before.stats.magicDefense, after.stats.magicDefense], ["Speed", before.stats.speed, after.stats.speed], ["Critical Chance", before.stats.criticalChance, after.stats.criticalChance]];
  const calculated = entries.filter(([, a, b]) => a !== b).map(([label, a, b]) => ({ label, before: a, after: b, difference: b - a }));
  const labels: Record<string, string> = { attackRoll: "Attack Roll", armorClass: "Armor Class", physicalDamage: "Physical Damage", magicDamage: "Magic Damage", movementRange: "Movement Range" };
  const tactical = definition.modifiers.filter((modifier) => labels[modifier.target]).map((modifier) => ({ label: labels[modifier.target]!, before: 0, after: modifier.value, difference: modifier.value }));
  return [...calculated, ...tactical];
}
