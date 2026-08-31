import type { EquipmentDefinition } from "./equipment";
import type { Modifier } from "../../game/modifiers/types";

const mod = (id: string, target: Modifier["target"], operation: Modifier["operation"], value: number): Modifier => ({ source: "equipment", sourceId: id, target, operation, value });
const item = (id: string, name: string, slot: EquipmentDefinition["slot"], rarity: EquipmentDefinition["rarity"], level: number, value: number, modifiers: Modifier[], classes: EquipmentDefinition["classRestrictions"] = [], effects: string[] = []): EquipmentDefinition => ({ id, name, slot, rarity, level, value, modifiers, specialEffectIds: effects, classRestrictions: classes, levelRequirement: level });

/** Low- and mid-tier tactical gear added after the Monk/Bard equipment coverage audit. */
export const EQUIPMENT_BALANCE_EXPANSION: Record<string, EquipmentDefinition> = {
  "novice-quarterstaff": item("novice-quarterstaff", "Novice Quarterstaff", "weapon", "common", 1, 32, [mod("novice-quarterstaff", "physicalDamage", "percentage", .03)], ["monk"]),
  "practice-rapier": item("practice-rapier", "Practice Rapier", "weapon", "common", 1, 32, [mod("practice-rapier", "magicDamage", "percentage", .03)], ["bard"]),
  "disciple-wraps": item("disciple-wraps", "Disciple Wraps", "armor", "common", 1, 28, [mod("disciple-wraps", "physicalDefense", "percentage", .03)], ["monk"]),
  "minstrel-coat": item("minstrel-coat", "Minstrel's Road Coat", "armor", "common", 1, 29, [mod("minstrel-coat", "magicDefense", "percentage", .04)], ["bard"]),
  "focus-headband": item("focus-headband", "Focus Headband", "helmet", "common", 1, 25, [mod("focus-headband", "magicDefenseScore", "flat", 1)], ["mage", "monk", "bard"]),
  "traveler-feather-cap": item("traveler-feather-cap", "Traveler's Feather Cap", "helmet", "common", 1, 25, [mod("traveler-feather-cap", "initiative", "flat", 1)], ["ranger", "bard"]),
  "windstep-sandals": item("windstep-sandals", "Windstep Sandals", "boots", "common", 1, 25, [mod("windstep-sandals", "speed", "percentage", .03)], ["monk"]),
  "performers-boots": item("performers-boots", "Performer's Boots", "boots", "common", 1, 25, [mod("performers-boots", "initiative", "flat", 1)], ["bard"]),
  "wayfarer-clasp": item("wayfarer-clasp", "Wayfarer Clasp", "accessory2", "common", 1, 36, [mod("wayfarer-clasp", "maxHP", "percentage", .03)]),
  "meditation-beads": item("meditation-beads", "Meditation Beads", "accessory2", "common", 1, 38, [mod("meditation-beads", "magicDefense", "percentage", .04)], ["monk"]),
  "pitch-pipe-charm": item("pitch-pipe-charm", "Pitch-Pipe Charm", "accessory2", "common", 1, 38, [mod("pitch-pipe-charm", "healingPower", "percentage", .04)], ["bard"]),
  "runewood-shortbow": item("runewood-shortbow", "Runewood Shortbow", "weapon", "common", 1, 34, [mod("runewood-shortbow", "magicDamage", "percentage", .03)], ["spellbow"]),
  "spellthread-coat": item("spellthread-coat", "Spellthread Coat", "armor", "common", 1, 29, [mod("spellthread-coat", "magicDefense", "percentage", .04)], ["spellbow"]),
  "watch-shield": item("watch-shield", "Watch Shield", "weapon", "common", 1, 34, [mod("watch-shield", "armorClass", "flat", 1)], ["bulwark"]),
  "recruit-bulwark-mail": item("recruit-bulwark-mail", "Recruit Bulwark Mail", "armor", "common", 1, 32, [mod("recruit-bulwark-mail", "physicalDefense", "percentage", .05)], ["bulwark"]),

  "ironwood-quarterstaff": item("ironwood-quarterstaff", "Ironwood Quarterstaff", "weapon", "uncommon", 2, 128, [mod("ironwood-quarterstaff", "attackRoll", "flat", 1), mod("ironwood-quarterstaff", "physicalDamage", "percentage", .06)], ["monk"]),
  "silver-tongue-rapier": item("silver-tongue-rapier", "Silver-Tongue Rapier", "weapon", "uncommon", 2, 132, [mod("silver-tongue-rapier", "attackRoll", "flat", 1), mod("silver-tongue-rapier", "magicDamage", "percentage", .06)], ["bard"]),
  "warded-handwraps": item("warded-handwraps", "Warded Handwraps", "armor", "uncommon", 2, 126, [mod("warded-handwraps", "armorClass", "flat", 1), mod("warded-handwraps", "physicalDefense", "percentage", .04)], ["monk"]),
  "chorus-coat": item("chorus-coat", "Chorus Coat", "armor", "uncommon", 2, 130, [mod("chorus-coat", "magicDefenseScore", "flat", 1), mod("chorus-coat", "healingPower", "percentage", .05)], ["bard"]),
  "stillwater-circlet": item("stillwater-circlet", "Stillwater Circlet", "helmet", "uncommon", 3, 112, [mod("stillwater-circlet", "magicDefenseScore", "flat", 1), mod("stillwater-circlet", "initiative", "flat", 1)], ["monk"]),
  "chorus-mask": item("chorus-mask", "Chorus Mask", "helmet", "uncommon", 3, 114, [mod("chorus-mask", "magicDefenseScore", "flat", 1), mod("chorus-mask", "healingPower", "percentage", .04)], ["bard"]),
  "cloudstep-boots": item("cloudstep-boots", "Cloudstep Boots", "boots", "uncommon", 3, 118, [mod("cloudstep-boots", "movementRange", "flat", 1), mod("cloudstep-boots", "speed", "percentage", .03)], ["monk"]),
  "roadshow-boots": item("roadshow-boots", "Roadshow Boots", "boots", "uncommon", 3, 116, [mod("roadshow-boots", "initiative", "flat", 2), mod("roadshow-boots", "speed", "percentage", .03)], ["bard"]),
  "temple-prayer-wheel": item("temple-prayer-wheel", "Temple Prayer Wheel", "accessory2", "uncommon", 3, 172, [mod("temple-prayer-wheel", "physicalDamage", "percentage", .04), mod("temple-prayer-wheel", "magicDefense", "percentage", .05)], ["monk"]),
  "resonant-tuning-fork": item("resonant-tuning-fork", "Resonant Tuning Fork", "accessory2", "uncommon", 3, 174, [mod("resonant-tuning-fork", "magicDamage", "percentage", .04), mod("resonant-tuning-fork", "healingPower", "percentage", .04)], ["bard"]),
  "stormstring-recurve": item("stormstring-recurve", "Stormstring Recurve", "weapon", "uncommon", 3, 182, [mod("stormstring-recurve", "attackRoll", "flat", 1), mod("stormstring-recurve", "magicDamage", "percentage", .06)], ["spellbow"]),
  "runehunter-mantle": item("runehunter-mantle", "Runehunter Mantle", "armor", "uncommon", 3, 176, [mod("runehunter-mantle", "magicDefenseScore", "flat", 1), mod("runehunter-mantle", "speed", "percentage", .03)], ["spellbow"]),
  "gateward-shield": item("gateward-shield", "Gateward Shield", "weapon", "uncommon", 3, 190, [mod("gateward-shield", "armorClass", "flat", 1), mod("gateward-shield", "physicalDefense", "percentage", .06)], ["bulwark"]),
  "formation-plate": item("formation-plate", "Formation Plate", "armor", "uncommon", 3, 196, [mod("formation-plate", "maxHP", "percentage", .06), mod("formation-plate", "physicalDefense", "percentage", .06)], ["bulwark"]),
  "warding-brooch": item("warding-brooch", "Warding Brooch", "accessory2", "uncommon", 3, 170, [mod("warding-brooch", "magicDefenseScore", "flat", 1)]),

  "stormglass-boots": item("stormglass-boots", "Stormglass Boots", "boots", "rare", 6, 330, [mod("stormglass-boots", "movementRange", "flat", 1), mod("stormglass-boots", "speed", "percentage", .06), mod("stormglass-boots", "magicDefense", "percentage", .05)]),
  "oathkeepers-helm": item("oathkeepers-helm", "Oathkeeper's Helm", "helmet", "rare", 6, 345, [mod("oathkeepers-helm", "armorClass", "flat", 1), mod("oathkeepers-helm", "maxHP", "percentage", .06)], ["warrior", "cleric", "paladin", "berserker"]),
  "harmonic-locket": item("harmonic-locket", "Harmonic Locket", "accessory2", "rare", 6, 365, [mod("harmonic-locket", "magicDamage", "percentage", .07), mod("harmonic-locket", "healingPower", "percentage", .07)], ["mage", "cleric", "bard"]),
  "jade-prayer-wheel": item("jade-prayer-wheel", "Jade Prayer Wheel", "accessory2", "rare", 6, 360, [mod("jade-prayer-wheel", "armorClass", "flat", 1), mod("jade-prayer-wheel", "physicalDamage", "percentage", .06), mod("jade-prayer-wheel", "magicDefense", "percentage", .06)], ["monk"]),
  "astral-limb-longbow": item("astral-limb-longbow", "Astral-Limb Longbow", "weapon", "rare", 6, 390, [mod("astral-limb-longbow", "attackRoll", "flat", 1), mod("astral-limb-longbow", "magicDamage", "percentage", .1)], ["spellbow"]),
  "adamant-door-shield": item("adamant-door-shield", "Adamant Door Shield", "weapon", "rare", 6, 410, [mod("adamant-door-shield", "armorClass", "flat", 2), mod("adamant-door-shield", "magicDefense", "percentage", .08)], ["bulwark"]),
  "runebound-archer-ring": item("runebound-archer-ring", "Runebound Archer Ring", "accessory1", "uncommon", 4, 225, [mod("runebound-archer-ring", "magicDamage", "percentage", .05), mod("runebound-archer-ring", "magicDefenseScore", "flat", 1)], ["spellbow"]),
  "gatekeepers-band": item("gatekeepers-band", "Gatekeeper's Band", "accessory1", "uncommon", 4, 230, [mod("gatekeepers-band", "maxHP", "percentage", .05), mod("gatekeepers-band", "physicalDefense", "percentage", .05)], ["bulwark"]),
};
