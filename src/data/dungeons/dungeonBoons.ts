export type DungeonBoonKind = "boon" | "pact";

export interface DungeonBoonDefinition {
  id: string;
  name: string;
  kind: DungeonBoonKind;
  description: string;
  heroInitiativeModifier?: number;
  enemyInitiativeModifier?: number;
  heroArmorClassModifier?: number;
  heroOpeningAttackRollModifier?: number;
  enemyOpeningAttackRollModifier?: number;
  heroHealingPowerModifier?: number;
  heroMovementRangeModifier?: number;
  rewardGoldModifier?: number;
  rareLootModifier?: number;
}

export const DUNGEON_BOONS: Record<string, DungeonBoonDefinition> = {
  iron_formation: {
    id: "iron_formation",
    name: "Iron Formation",
    kind: "boon",
    description: "+1 Armor Class for the rest of this expedition.",
    heroArmorClassModifier: 1,
  },
  pathfinders_mark: {
    id: "pathfinders_mark",
    name: "Pathfinder's Mark",
    kind: "boon",
    description: "+1 hero movement range for the rest of this expedition.",
    heroMovementRangeModifier: 1,
  },
  opening_gambit: {
    id: "opening_gambit",
    name: "Opening Gambit",
    kind: "boon",
    description: "+2 to hero attack rolls on the opening round of each remaining fight.",
    heroOpeningAttackRollModifier: 2,
  },
  commanders_rhythm: {
    id: "commanders_rhythm",
    name: "Commander's Rhythm",
    kind: "boon",
    description: "+2 hero initiative for every remaining encounter.",
    heroInitiativeModifier: 2,
  },
  field_surgeons_kit: {
    id: "field_surgeons_kit",
    name: "Field Surgeon's Kit",
    kind: "boon",
    description: "+20% healing power, including dungeon rests and supplies.",
    heroHealingPowerModifier: .20,
  },
  gilded_compass: {
    id: "gilded_compass",
    name: "Gilded Compass",
    kind: "boon",
    description: "+15% gold from remaining dungeon rooms.",
    rewardGoldModifier: .15,
  },
  relic_hunters_eye: {
    id: "relic_hunters_eye",
    name: "Relic Hunter's Eye",
    kind: "boon",
    description: "+10% rare recipe-drop chance from elite and boss caches.",
    rareLootModifier: .10,
  },
  blood_price: {
    id: "blood_price",
    name: "Blood Price",
    kind: "pact",
    description: "+30% room gold, but healing power is reduced by 15%.",
    rewardGoldModifier: .30,
    heroHealingPowerModifier: -.15,
  },
  reckless_vanguard: {
    id: "reckless_vanguard",
    name: "Reckless Vanguard",
    kind: "pact",
    description: "+3 hero initiative, but enemies gain +1 on their opening attack rolls.",
    heroInitiativeModifier: 3,
    enemyOpeningAttackRollModifier: 1,
  },
};

export const DUNGEON_BOON_IDS = Object.keys(DUNGEON_BOONS);
