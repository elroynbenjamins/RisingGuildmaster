import type { EnemyFactionId } from "../enemies/enemyTypes";
import type { SkillModifier } from "./skillTypes";
import type { GridPosition } from "./grid/gridTypes";
import type { TerrainType } from "./grid/gridTypes";
import type { D20RollMode } from "./dice/d20RollMode";

export interface CombatStats { physicalDamage: number; physicalDefense: number; magicDamage: number; magicDefense: number; speed: number; initiativeBonus: number; evasion: number; criticalChance: number; accuracy: number; healingPower: number; physicalAttackBonus: number; magicAttackBonus: number; armorClass: number; magicDefenseScore: number; attackRollModifier: number; rangedAttackRollModifier: number }
export interface ActiveCombatCondition { conditionId: string; remainingTurns: number }
export interface ActiveSkillModifier extends SkillModifier { sourceSkillId: string }
export interface ActiveCompanion { id: string; sourceSkillId: string; currentHP: number; maxHP: number; damagePerTurn: number; damageType: "physical" | "magic"; armorClass: number; movementRange: number; remainingTurns: number }

export interface CombatUnit {
  combatantId: string;
  side: "heroes" | "enemies";
  factionId?: EnemyFactionId;
  currentHP: number;
  maxHP: number;
  stats: CombatStats;
  activeConditions: ActiveCombatCondition[];
  activeModifiers: ActiveSkillModifier[];
  isAlive: boolean;
  position: GridPosition;
  movementRange: number;
  ignoredTerrainMovementCosts?: TerrainType[];
}

export interface HeroCombatInstance {
  heroId: string;
  currentHP: number;
  maxHP: number;
  currentMana: number;
  maxMana: number;
  currentStamina: number;
  maxStamina: number;
  activeConditions: ActiveCombatCondition[];
  activeCooldowns: Record<string, number>;
  /** A bound summon shares its summoner's initiative until full unit AI is introduced. */
  activeCompanion?: ActiveCompanion;
  isAlive: boolean;
  position: GridPosition;
  movementRange: number;
  ignoredTerrainMovementCosts?: TerrainType[];
}

export interface CombatLogEntry { turn: number; actorId: string; actionId: string; targetIds: string[]; message: string }
export interface InitiativeRoll { combatantId: string; d20: number; modifier: number; total: number }

/** Runtime consequences from pre-combat story choices. Definitions remain immutable. */
export interface QuestCombatSetup {
  encounterIds: string[];
  label: string;
  heroInitiativeModifier: number;
  enemyInitiativeModifier: number;
  heroArmorClassModifier: number;
  heroOpeningAttackRollModifier: number;
  enemyOpeningAttackRollModifier: number;
  enemyAttackRollModifier?: number;
  enemyPhysicalDamageModifier?: number;
  enemyDamageModifier?: number;
  heroHealingPowerModifier?: number;
  heroMovementRangeModifier?: number;
  enemyMovementRangeModifier?: number;
}

export interface SkillHitResult { targetId: string; hit: boolean; critical: boolean; damage: number; healing?: number; appliedConditionIds: string[]; diceRoll?: number; diceRolls?: number[]; rollMode?: D20RollMode; attackBonus?: number; skillAttackModifier?: number; attackTotal?: number; targetValue?: number; rollResult?: "critical" | "hit" | "miss" | "critical_miss" }
export interface SkillResolution { skillId: string; actorId: string; hits: SkillHitResult[]; targetIds: string[] }
export interface CombatVisualEvent { id: number; kind:"skill"|"movement"|"phase"; actionId: string; actorId: string; damageType?: "physical" | "magic" | "true"; range: number; areaRadius?:number; fromPosition?:GridPosition;toPosition?:GridPosition;terrainType?:TerrainType; effects: Array<{ targetId: string; hit: boolean; critical: boolean; damage: number; healing: number;conditionIds:string[] }> }
