import type { Attributes, DerivedStats } from "../attributes/types";
import type { SkillId } from "../proficiencies/proficiencyTypes";

export type RaceId = "human" | "elf" | "dwarf" | "orc" | "tiefling" | "stoneborn" | "veilborn";
export type ClassId = "warrior" | "ranger" | "mage" | "cleric" | "paladin" | "berserker" | "monk" | "bard" | "spellbow" | "bulwark" | "summoner";
export type BackgroundId = "farmhand" | "scholar" | "street_urchin" | "noble" | "mercenary";
export type TraitId =
  | "brave" | "greedy" | "lazy" | "genius" | "lucky" | "reckless"
  | "tough" | "nimble" | "iron_willed" | "arcane_touched" | "cautious" | "fleet_footed"
  | "hardy" | "quick_learner" | "frugal" | "silver_tongued" | "sickly" | "clumsy"
  | "alert" | "perceptive" | "powerful_build" | "keen_minded" | "steadfast" | "inspiring"
  | "battle_hardened" | "duelist" | "spell_savant" | "gifted_healer" | "ambusher" | "observant"
  | "resilient" | "hotheaded" | "timid" | "absent_minded" | "oathbound" | "wanderer";
export type ConditionId =
  | "injured" | "sprained_ankle" | "broken_arm" | "cracked_ribs" | "concussion" | "deep_wound"
  | "exhausted" | "inspired" | "poisoned" | "infected" | "diseased" | "cursed";
export type EquipmentSlot = "weapon" | "armor" | "helmet" | "boots" | "accessory1" | "accessory2";

export interface ConditionInstance { conditionId: ConditionId; remainingDuration: number }
export interface EquipmentSlots { weapon: string | null; armor: string | null; helmet: string | null; boots: string | null; accessory1: string | null; accessory2: string | null }
export interface HeroRoleplayProfile { personalityTraitId: string; idealId: string; bondId: string; flawId: string }
export type HeroHistoryEventType =
  | "recruitment"
  | "quest"
  | "training"
  | "level_up"
  | "injury"
  | "revival"
  | "relationship"
  | "crafting"
  | "campaign";
export type HeroHistoryEventOutcome = "positive" | "negative" | "neutral";
export interface HeroHistoryEvent {
  id: string;
  day: number;
  type: HeroHistoryEventType;
  outcome: HeroHistoryEventOutcome;
  title: string;
  description: string;
  questId?: string;
  relatedHeroIds?: string[];
  tags?: string[];
}
export interface HeroHistory {
  questsCompleted: number;
  enemiesDefeated: number;
  achievements: string[];
  /** Retained for old saves; new gameplay records structured events. */
  importantEvents: string[];
  events: HeroHistoryEvent[];
}
export interface Hero {
  id: string;
  name: string;
  age: number;
  gender: "female" | "male";
  /** Stable visual variant selected once when the hero is generated. */
  portraitVariant?: 0 | 1 | 2 | 3 | 4;
  portraitKey: string;
  raceId: RaceId;
  classId: ClassId;
  subclassId: string | null;
  /** Permanent level-10 mastery layered on top of the level-5 subclass. */
  masteryId?: string | null;
  /** Permanently selected non-basic class skills. The basic attack is granted automatically. */
  learnedSkillIds: string[];
  /** D20 exploration/social proficiencies. Expertise doubles the proficiency bonus. */
  skillProficiencyIds?: SkillId[];
  skillExpertiseIds?: SkillId[];
  /** Missing only in legacy saves created before backgrounds became data-driven. */
  backgroundId?: BackgroundId;
  /** D&D-style narrative pillars used by relationship and story systems. */
  roleplayProfile?: HeroRoleplayProfile;
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
  /** Persistent readiness used to rotate squads between quests. Combat stamina remains encounter-local. */
  adventureStamina: number;
  attributeGrowthProgress: Attributes;
  /** Development sessions already consumed at focusedTrainingLevel. Legacy saves omit both fields. */
  focusedTrainingLevel?: number;
  focusedTrainingSessions?: number;
}

export interface CalculatedHero { attributes: Attributes; stats: DerivedStats }
