const MODIFIER_TARGET_LABELS: Record<string, string> = {
  strength: "Strength",
  dexterity: "Dexterity",
  constitution: "Constitution",
  intelligence: "Intelligence",
  wisdom: "Wisdom",
  charisma: "Charisma",
  maxHP: "Max HP",
  physicalAttack: "Physical Attack",
  physicalDefense: "Physical Defense",
  magicPower: "Magic Power",
  magicDefense: "Magic Defense",
  speed: "Speed",
  criticalChance: "Critical Chance",
  xp: "XP Gain",
  trainingXp: "Training XP",
  trainingCost: "Training Cost",
  questGold: "Quest Gold",
  salary: "Salary",
  recoveryDuration: "Recovery Duration",
  intelligenceGrowth: "Intelligence Growth",
  rareLoot: "Rare Loot Chance",
  rangedDamage: "Ranged Damage",
  physicalDamage: "Physical Damage",
  magicDamage: "Magic Damage",
  damage: "Damage",
  injuryChance: "Injury Chance",
  healingReceived: "Healing Received",
  healingPower: "Healing Power",
  equipmentDurability: "Equipment Durability",
  movementSpeed: "Movement Speed",
  movementRange: "Movement Range",
  craftingCost: "Crafting Cost",
  armorClass: "Armor Class",
  magicDefenseScore: "Magic Defense Score",
  initiative: "Initiative",
};

export function getModifierTargetLabel(target: string): string {
  return MODIFIER_TARGET_LABELS[target] ?? target
    .replace(/_/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\bXp\b/gi, "XP")
    .replace(/\bHp\b/gi, "HP")
    .replace(/^./, (letter) => letter.toUpperCase());
}
