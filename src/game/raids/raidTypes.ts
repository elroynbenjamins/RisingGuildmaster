import type { GridPosition } from "../combat/grid/gridTypes";

export type RaidRole = "vanguard" | "support";
export interface RaidSquad { role: RaidRole; heroIds: string[] }
export interface RaidPhaseDefinition { id: string; hpRatioMax: number; name: string; telegraph: string; mechanic: string; requiredResponse: string }
export interface RaidDefinition {
  id: string; name: string; description: string; recommendedLevel: number; unlockChapter: number;
  questId: string; battlefieldId: string; bossEnemyDefinitionId: string; requiredHeroCount: 8; squads: 2;
  heroSpawnPositions: GridPosition[]; phases: RaidPhaseDefinition[]; weeklyLockoutDays: number;
  firstVictoryReward: { gold: number; trophyId: string; trophyName: string };
}
export interface RaidPartyValidation { valid: boolean; errors: string[]; squads: RaidSquad[] }
export interface RaidReadiness { readyHeroes: number; averageLevel: number; averageStamina: number; recommendedLevel: number; status: "ready" | "risky" | "unready"; warnings: string[] }
export interface RaidRecord { attempts: number; victories: number; lastAttemptDay: number | null; nextAvailableDay: number; bestSurvivors: number; firstVictoryDay: number | null; bonusGoldClaimed: number }
export interface RaidProgressState { records: Record<string, RaidRecord> }
export type RaidMechanicEffect =
  | { kind: "telegraphed_damage"; positions: GridPosition[]; damageMaxHpRatio: number; repeatEveryRounds?: number }
  | { kind: "entomb"; targetCount: number; damageMaxHpRatio: number; durationTurns: number }
  | { kind: "interception"; targetCount: number; damageMaxHpRatio: number; mitigationRatio: number }
  | { kind: "contracting_arena"; inset: number; damageMaxHpRatio: number };
export interface RaidObjective { id: string; name: string; position: GridPosition; currentIntegrity: number; maxIntegrity: number }
export interface RaidCombatMechanicState { activePhaseId: string | null; telegraphedPositions: GridPosition[]; safePositions: GridPosition[]; objectives: RaidObjective[]; resolvesAtRound: number | null; lastScheduledRound: number; announcement: string | null }
