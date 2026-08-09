export const ATTRIBUTE_KEYS = [
  "strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma",
] as const;

export type AttributeKey = (typeof ATTRIBUTE_KEYS)[number];
export type Attributes = Record<AttributeKey, number>;

export const DERIVED_STAT_KEYS = [
  "maxHP", "physicalAttack", "physicalDefense", "magicPower", "magicDefense", "speed", "criticalChance",
] as const;
export type DerivedStatKey = (typeof DERIVED_STAT_KEYS)[number];
export type DerivedStats = Record<DerivedStatKey, number>;

export const emptyAttributes = (): Attributes => ({
  strength: 0, dexterity: 0, constitution: 0, intelligence: 0, wisdom: 0, charisma: 0,
});
