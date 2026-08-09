import type { Attributes, DerivedStats } from "../attributes/types";

export type RaceId = "human" | "elf" | "dwarf" | "orc";
export type ClassId = "warrior" | "ranger" | "mage" | "cleric" | "paladin" | "berserker";
export type TraitId = "brave" | "greedy" | "lazy" | "genius" | "lucky" | "reckless";
export type ConditionId = "injured" | "exhausted" | "inspired" | "poisoned" | "infected";
export type EquipmentSlot = "weapon" | "armor" | "helmet" | "boots" | "accessory1" | "accessory2";

export interface ConditionInstance { conditionId: ConditionId; remainingDuration: number }
export interface EquipmentSlots { weapon: string | null; armor: string | null; helmet: string | null; boots: string | null; accessory1: string | null; accessory2: string | null }
export interface HeroHistory { questsCompleted: number; enemiesDefeated: number; achievements: string[]; importantEvents: string[] }
export interface Hero {
  id: string;
  name: string;
  age: number;
  gender: "female" | "male" | "nonbinary";
  portraitKey: string;
  raceId: RaceId;
  classId: ClassId;
  subclassId: string | null;
  background: string;
  baseAttributes: Attributes;
  level: number;
  xp: number;
  potential: number;
  potentialEstimateMin: number;
  potentialEstimateMax: number;
  traitIds: TraitId[];
  conditions: ConditionInstance[];
  equipment: EquipmentSlots;
  currentHP: number;
  history: HeroHistory;
  recruitmentCost: number;
  salary: number;
  isAvailable: boolean;
  attributeGrowthProgress: Attributes;
}

export interface CalculatedHero { attributes: Attributes; stats: DerivedStats }
