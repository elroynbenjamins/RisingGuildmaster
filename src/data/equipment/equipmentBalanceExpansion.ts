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

  "ironwood-quarterstaff": item("ironwood-quarterstaff", "Ironwood Quarterstaff", "weapon", "uncommon", 4, 210, [mod("ironwood-quarterstaff", "attackRoll", "flat", 1), mod("ironwood-quarterstaff", "physicalDamage", "percentage", .06)], ["monk"]),
  "silver-tongue-rapier": item("silver-tongue-rapier", "Silver-Tongue Rapier", "weapon", "uncommon", 4, 215, [mod("silver-tongue-rapier", "attackRoll", "flat", 1), mod("silver-tongue-rapier", "magicDamage", "percentage", .06)], ["bard"]),
  "warded-handwraps": item("warded-handwraps", "Warded Handwraps", "armor", "uncommon", 4, 205, [mod("warded-handwraps", "armorClass", "flat", 1), mod("warded-handwraps", "physicalDefense", "percentage", .04)], ["monk"]),
  "chorus-coat": item("chorus-coat", "Chorus Coat", "armor", "uncommon", 4, 210, [mod("chorus-coat", "magicDefenseScore", "flat", 1), mod("chorus-coat", "healingPower", "percentage", .05)], ["bard"]),
  "stillwater-circlet": item("stillwater-circlet", "Stillwater Circlet", "helmet", "uncommon", 3, 112, [mod("stillwater-circlet", "magicDefenseScore", "flat", 1), mod("stillwater-circlet", "initiative", "flat", 1)], ["monk"]),
  "chorus-mask": item("chorus-mask", "Chorus Mask", "helmet", "uncommon", 3, 114, [mod("chorus-mask", "magicDefenseScore", "flat", 1), mod("chorus-mask", "healingPower", "percentage", .04)], ["bard"]),
  "cloudstep-boots": item("cloudstep-boots", "Cloudstep Boots", "boots", "uncommon", 3, 118, [mod("cloudstep-boots", "movementRange", "flat", 1), mod("cloudstep-boots", "speed", "percentage", .03)], ["monk"]),
  "roadshow-boots": item("roadshow-boots", "Roadshow Boots", "boots", "uncommon", 3, 116, [mod("roadshow-boots", "initiative", "flat", 2), mod("roadshow-boots", "speed", "percentage", .03)], ["bard"]),
  "temple-prayer-wheel": item("temple-prayer-wheel", "Temple Prayer Wheel", "accessory2", "uncommon", 3, 172, [mod("temple-prayer-wheel", "physicalDamage", "percentage", .04), mod("temple-prayer-wheel", "magicDefense", "percentage", .05)], ["monk"]),
  "resonant-tuning-fork": item("resonant-tuning-fork", "Resonant Tuning Fork", "accessory2", "uncommon", 3, 174, [mod("resonant-tuning-fork", "magicDamage", "percentage", .04), mod("resonant-tuning-fork", "healingPower", "percentage", .04)], ["bard"]),
  "stormstring-recurve": item("stormstring-recurve", "Stormstring Recurve", "weapon", "uncommon", 4, 220, [mod("stormstring-recurve", "attackRoll", "flat", 1), mod("stormstring-recurve", "magicDamage", "percentage", .06)], ["spellbow"]),
  "runehunter-mantle": item("runehunter-mantle", "Runehunter Mantle", "armor", "uncommon", 4, 215, [mod("runehunter-mantle", "magicDefenseScore", "flat", 1), mod("runehunter-mantle", "speed", "percentage", .03)], ["spellbow"]),
  "gateward-shield": item("gateward-shield", "Gateward Shield", "weapon", "uncommon", 4, 225, [mod("gateward-shield", "armorClass", "flat", 1), mod("gateward-shield", "physicalDefense", "percentage", .06)], ["bulwark"]),
  "formation-plate": item("formation-plate", "Formation Plate", "armor", "uncommon", 4, 230, [mod("formation-plate", "maxHP", "percentage", .06), mod("formation-plate", "physicalDefense", "percentage", .06)], ["bulwark"]),
  "eidolon-rod": item("eidolon-rod", "Eidolon Rod", "weapon", "uncommon", 4, 220, [mod("eidolon-rod", "attackRoll", "flat", 1), mod("eidolon-rod", "magicDamage", "percentage", .07)], ["summoner"]),
  "binder-fieldcoat": item("binder-fieldcoat", "Binder Fieldcoat", "armor", "uncommon", 4, 218, [mod("binder-fieldcoat", "maxHP", "percentage", .05), mod("binder-fieldcoat", "magicDefense", "percentage", .06)], ["summoner"]),
  "warding-brooch": item("warding-brooch", "Warding Brooch", "accessory2", "uncommon", 3, 170, [mod("warding-brooch", "magicDefenseScore", "flat", 1)]),

  // Chapter 5 catch-up bridge gear: intentionally uncommon and effect-free so story loot,
  // Level-2 workshops, and Wardstone caches can repair badly lagging primary slots without
  // bypassing Chapter 6 rare equipment.
  "cinderroad-fieldcoat": item("cinderroad-fieldcoat", "Cinderroad Fieldcoat", "armor", "uncommon", 7, 520, [mod("cinderroad-fieldcoat", "armorClass", "flat", 1), mod("cinderroad-fieldcoat", "maxHP", "percentage", .06), mod("cinderroad-fieldcoat", "magicDefense", "percentage", .05)]),
  "cinderroad-crozier": item("cinderroad-crozier", "Cinderroad Crozier", "weapon", "uncommon", 7, 545, [mod("cinderroad-crozier", "attackRoll", "flat", 1), mod("cinderroad-crozier", "magicDamage", "percentage", .09), mod("cinderroad-crozier", "healingPower", "percentage", .05)], ["mage", "cleric", "summoner"]),
  "cinderstep-quarterstaff": item("cinderstep-quarterstaff", "Cinderstep Quarterstaff", "weapon", "uncommon", 7, 535, [mod("cinderstep-quarterstaff", "attackRoll", "flat", 1), mod("cinderstep-quarterstaff", "physicalDamage", "percentage", .09), mod("cinderstep-quarterstaff", "speed", "percentage", .04)], ["monk"]),
  "emberverse-rapier": item("emberverse-rapier", "Emberverse Rapier", "weapon", "uncommon", 7, 540, [mod("emberverse-rapier", "attackRoll", "flat", 1), mod("emberverse-rapier", "magicDamage", "percentage", .08), mod("emberverse-rapier", "criticalChance", "flat", .02)], ["bard"]),
  "cinderscript-recurve": item("cinderscript-recurve", "Cinderscript Recurve", "weapon", "uncommon", 7, 545, [mod("cinderscript-recurve", "attackRoll", "flat", 1), mod("cinderscript-recurve", "magicDamage", "percentage", .09), mod("cinderscript-recurve", "criticalChance", "flat", .02)], ["spellbow"]),
  "hearthwall-shield": item("hearthwall-shield", "Hearthwall Shield", "weapon", "uncommon", 7, 560, [mod("hearthwall-shield", "armorClass", "flat", 1), mod("hearthwall-shield", "maxHP", "percentage", .08), mod("hearthwall-shield", "physicalDefense", "percentage", .07)], ["bulwark"]),

  // Level-11 expedition catch-up weapons. These keep Chapter 7 Wardstone recovery
  // useful without allowing generic caches to award the Level-11/12 epic story weapons.
  "wayfarers-longsword": item("wayfarers-longsword", "Wayfarer's Longsword", "weapon", "rare", 11, 1720, [mod("wayfarers-longsword", "attackRoll", "flat", 2), mod("wayfarers-longsword", "physicalDamage", "percentage", .15)], ["warrior", "paladin", "berserker"]),
  "wayfarers-longbow": item("wayfarers-longbow", "Wayfarer's Longbow", "weapon", "rare", 11, 1700, [mod("wayfarers-longbow", "attackRoll", "flat", 2), mod("wayfarers-longbow", "physicalDamage", "percentage", .15), mod("wayfarers-longbow", "criticalChance", "flat", .03)], ["ranger"]),
  "wayfarers-crozier": item("wayfarers-crozier", "Wayfarer's Crozier", "weapon", "rare", 11, 1740, [mod("wayfarers-crozier", "attackRoll", "flat", 2), mod("wayfarers-crozier", "magicDamage", "percentage", .15), mod("wayfarers-crozier", "healingPower", "percentage", .07)], ["mage", "cleric", "summoner"]),
  "wayfarers-quarterstaff": item("wayfarers-quarterstaff", "Wayfarer's Quarterstaff", "weapon", "rare", 11, 1690, [mod("wayfarers-quarterstaff", "attackRoll", "flat", 2), mod("wayfarers-quarterstaff", "physicalDamage", "percentage", .15), mod("wayfarers-quarterstaff", "speed", "percentage", .06)], ["monk"]),
  "wayfarers-rapier": item("wayfarers-rapier", "Wayfarer's Rapier", "weapon", "rare", 11, 1710, [mod("wayfarers-rapier", "attackRoll", "flat", 2), mod("wayfarers-rapier", "physicalDamage", "percentage", .10), mod("wayfarers-rapier", "magicDamage", "percentage", .10), mod("wayfarers-rapier", "criticalChance", "flat", .03)], ["bard"]),
  "wayfarers-recurve": item("wayfarers-recurve", "Wayfarer's Recurve", "weapon", "rare", 11, 1730, [mod("wayfarers-recurve", "attackRoll", "flat", 2), mod("wayfarers-recurve", "magicDamage", "percentage", .15), mod("wayfarers-recurve", "criticalChance", "flat", .03)], ["spellbow"]),
  "wayfarers-aegis": item("wayfarers-aegis", "Wayfarer's Aegis", "weapon", "rare", 11, 1760, [mod("wayfarers-aegis", "armorClass", "flat", 2), mod("wayfarers-aegis", "maxHP", "percentage", .11), mod("wayfarers-aegis", "magicDefense", "percentage", .09)], ["bulwark"]),

  // Level-14 expedition catch-up weapons. These are rare, effect-free field upgrades:
  // strong enough to repair a badly lagging primary slot, but intentionally below the
  // Level-15 epic Black Tide campaign weapons and their signature effects.
  "delvers-longsword": item("delvers-longsword", "Delver's Longsword", "weapon", "rare", 14, 2220, [mod("delvers-longsword", "attackRoll", "flat", 2), mod("delvers-longsword", "physicalDamage", "percentage", .17)], ["warrior", "paladin", "berserker"]),
  "delvers-longbow": item("delvers-longbow", "Delver's Longbow", "weapon", "rare", 14, 2200, [mod("delvers-longbow", "attackRoll", "flat", 2), mod("delvers-longbow", "physicalDamage", "percentage", .17), mod("delvers-longbow", "criticalChance", "flat", .03)], ["ranger"]),
  "delvers-crozier": item("delvers-crozier", "Delver's Crozier", "weapon", "rare", 14, 2240, [mod("delvers-crozier", "attackRoll", "flat", 2), mod("delvers-crozier", "magicDamage", "percentage", .17), mod("delvers-crozier", "healingPower", "percentage", .08)], ["mage", "cleric", "summoner"]),
  "delvers-quarterstaff": item("delvers-quarterstaff", "Delver's Quarterstaff", "weapon", "rare", 14, 2190, [mod("delvers-quarterstaff", "attackRoll", "flat", 2), mod("delvers-quarterstaff", "physicalDamage", "percentage", .17), mod("delvers-quarterstaff", "speed", "percentage", .07)], ["monk"]),
  "delvers-rapier": item("delvers-rapier", "Delver's Rapier", "weapon", "rare", 14, 2210, [mod("delvers-rapier", "attackRoll", "flat", 2), mod("delvers-rapier", "physicalDamage", "percentage", .12), mod("delvers-rapier", "magicDamage", "percentage", .12), mod("delvers-rapier", "criticalChance", "flat", .03)], ["bard"]),
  "delvers-recurve": item("delvers-recurve", "Delver's Recurve", "weapon", "rare", 14, 2230, [mod("delvers-recurve", "attackRoll", "flat", 2), mod("delvers-recurve", "magicDamage", "percentage", .17), mod("delvers-recurve", "criticalChance", "flat", .03)], ["spellbow"]),
  "delvers-aegis": item("delvers-aegis", "Delver's Aegis", "weapon", "rare", 14, 2260, [mod("delvers-aegis", "armorClass", "flat", 2), mod("delvers-aegis", "maxHP", "percentage", .13), mod("delvers-aegis", "magicDefense", "percentage", .10)], ["bulwark"]),

  // Level-16 expedition catch-up weapons. These repair Chapter 9 primary-slot lag
  // without replacing the Level-15/17 epic story weapons or their signature effects.
  "deepward-longsword": item("deepward-longsword", "Deepward Longsword", "weapon", "rare", 16, 3140, [mod("deepward-longsword", "attackRoll", "flat", 2), mod("deepward-longsword", "physicalDamage", "percentage", .18)], ["warrior", "paladin", "berserker"]),
  "deepward-longbow": item("deepward-longbow", "Deepward Longbow", "weapon", "rare", 16, 3120, [mod("deepward-longbow", "attackRoll", "flat", 2), mod("deepward-longbow", "physicalDamage", "percentage", .18), mod("deepward-longbow", "criticalChance", "flat", .03)], ["ranger"]),
  "deepward-crozier": item("deepward-crozier", "Deepward Crozier", "weapon", "rare", 16, 3160, [mod("deepward-crozier", "attackRoll", "flat", 2), mod("deepward-crozier", "magicDamage", "percentage", .19), mod("deepward-crozier", "healingPower", "percentage", .10)], ["mage", "cleric", "summoner"]),
  "deepward-quarterstaff": item("deepward-quarterstaff", "Deepward Quarterstaff", "weapon", "rare", 16, 3100, [mod("deepward-quarterstaff", "attackRoll", "flat", 2), mod("deepward-quarterstaff", "physicalDamage", "percentage", .19), mod("deepward-quarterstaff", "speed", "percentage", .08)], ["monk"]),
  "deepward-rapier": item("deepward-rapier", "Deepward Rapier", "weapon", "rare", 16, 3130, [mod("deepward-rapier", "attackRoll", "flat", 2), mod("deepward-rapier", "physicalDamage", "percentage", .13), mod("deepward-rapier", "magicDamage", "percentage", .13), mod("deepward-rapier", "criticalChance", "flat", .03)], ["bard"]),
  "deepward-recurve": item("deepward-recurve", "Deepward Recurve", "weapon", "rare", 16, 3150, [mod("deepward-recurve", "attackRoll", "flat", 2), mod("deepward-recurve", "magicDamage", "percentage", .19), mod("deepward-recurve", "criticalChance", "flat", .03)], ["spellbow"]),
  "deepward-aegis": item("deepward-aegis", "Deepward Aegis", "weapon", "rare", 16, 3180, [mod("deepward-aegis", "armorClass", "flat", 2), mod("deepward-aegis", "maxHP", "percentage", .14), mod("deepward-aegis", "magicDefense", "percentage", .11)], ["bulwark"]),

  // Generic late field armor for replacement heroes and expedition catch-up.
  // Effect-free and universal so it cannot replace authored class/story armor.
  "wayfarer-fieldcoat": item("wayfarer-fieldcoat", "Wayfarer Fieldcoat", "armor", "rare", 11, 1680, [mod("wayfarer-fieldcoat", "armorClass", "flat", 1), mod("wayfarer-fieldcoat", "maxHP", "percentage", .09), mod("wayfarer-fieldcoat", "physicalDefense", "percentage", .06), mod("wayfarer-fieldcoat", "magicDefense", "percentage", .06)]),
  "delver-fieldcoat": item("delver-fieldcoat", "Delver Fieldcoat", "armor", "rare", 14, 2180, [mod("delver-fieldcoat", "armorClass", "flat", 1), mod("delver-fieldcoat", "maxHP", "percentage", .11), mod("delver-fieldcoat", "physicalDefense", "percentage", .08), mod("delver-fieldcoat", "magicDefense", "percentage", .08)]),
  "deepward-fieldcoat": item("deepward-fieldcoat", "Deepward Fieldcoat", "armor", "rare", 16, 2960, [mod("deepward-fieldcoat", "armorClass", "flat", 1), mod("deepward-fieldcoat", "maxHP", "percentage", .13), mod("deepward-fieldcoat", "physicalDefense", "percentage", .10), mod("deepward-fieldcoat", "magicDefense", "percentage", .10)]),

  "stormglass-boots": item("stormglass-boots", "Stormglass Boots", "boots", "rare", 6, 330, [mod("stormglass-boots", "movementRange", "flat", 1), mod("stormglass-boots", "speed", "percentage", .06), mod("stormglass-boots", "magicDefense", "percentage", .05)]),
  "oathkeepers-helm": item("oathkeepers-helm", "Oathkeeper's Helm", "helmet", "rare", 6, 345, [mod("oathkeepers-helm", "armorClass", "flat", 1), mod("oathkeepers-helm", "maxHP", "percentage", .06)], ["warrior", "cleric", "paladin", "berserker"]),
  "harmonic-locket": item("harmonic-locket", "Harmonic Locket", "accessory2", "rare", 6, 365, [mod("harmonic-locket", "magicDamage", "percentage", .07), mod("harmonic-locket", "healingPower", "percentage", .07)], ["mage", "cleric", "bard"]),
  "jade-prayer-wheel": item("jade-prayer-wheel", "Jade Prayer Wheel", "accessory2", "rare", 6, 360, [mod("jade-prayer-wheel", "armorClass", "flat", 1), mod("jade-prayer-wheel", "physicalDamage", "percentage", .06), mod("jade-prayer-wheel", "magicDefense", "percentage", .06)], ["monk"]),
  "astral-limb-longbow": item("astral-limb-longbow", "Astral-Limb Longbow", "weapon", "rare", 6, 390, [mod("astral-limb-longbow", "attackRoll", "flat", 1), mod("astral-limb-longbow", "magicDamage", "percentage", .1)], ["spellbow"]),
  "adamant-door-shield": item("adamant-door-shield", "Adamant Door Shield", "weapon", "rare", 6, 410, [mod("adamant-door-shield", "armorClass", "flat", 2), mod("adamant-door-shield", "magicDefense", "percentage", .08)], ["bulwark"]),
  "runebound-archer-ring": item("runebound-archer-ring", "Runebound Archer Ring", "accessory1", "uncommon", 4, 225, [mod("runebound-archer-ring", "magicDamage", "percentage", .05), mod("runebound-archer-ring", "magicDefenseScore", "flat", 1)], ["spellbow"]),
  "gatekeepers-band": item("gatekeepers-band", "Gatekeeper's Band", "accessory1", "uncommon", 4, 230, [mod("gatekeepers-band", "maxHP", "percentage", .05), mod("gatekeepers-band", "physicalDefense", "percentage", .05)], ["bulwark"]),
};
