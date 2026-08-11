export type EnemyRole =
  | "skirmisher"
  | "ranged"
  | "frontline"
  | "tank"
  | "debuffer"
  | "support"
  | "elite"
  | "heavy_attacker"
  | "mini_boss";

export type EnemyFactionId = "goblins" | "undead" | "beasts" | "bandits" | "orcs" | "constructs";
import type { GridPosition } from "../combat/grid/gridTypes";

export interface EnemyDefinition {
  id: string;
  name: string;
  factionId: EnemyFactionId;
  role: EnemyRole;
  hpModifier: number;
  physicalDamageModifier: number;
  physicalDefenseModifier: number;
  magicDamageModifier: number;
  magicDefenseModifier: number;
  speedModifier: number;
  xpReward: number;
  goldRewardMin: number;
  goldRewardMax: number;
  abilityIds: string[];
  skillIds: string[];
  behaviorId: string;
  conditionImmunities: string[];
  resistanceModifiers: Record<string, number>;
  lootTableId: string;
}

export interface EnemyBaseStats {
  hp: number;
  physicalDamage: number;
  physicalDefense: number;
  magicDamage: number;
  magicDefense: number;
  speed: number;
}

export interface EnemyCalculatedStats extends EnemyBaseStats {}

export interface EnemyStatScaling {
  levelMultiplier?: number;
  difficultyMultiplier?: number;
}

export interface ActiveEnemyCondition {
  conditionId: string;
  remainingTurns: number;
}

export interface EnemyInstance {
  instanceId: string;
  enemyDefinitionId: string;
  level: number;
  currentHP: number;
  maxHP: number;
  activeConditionIds: string[];
  activeConditions: ActiveEnemyCondition[];
  activeCooldowns: Record<string, number>;
  isAlive: boolean;
  position: GridPosition;
  movementRange: number;
  triggeredPhaseIds?: string[];
}

export interface EncounterEntry { enemyDefinitionId: string; count: number }
export interface EncounterTemplate { id: string; name: string; enemies: EncounterEntry[] }
