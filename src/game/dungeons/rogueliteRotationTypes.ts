import type { DungeonRunGrade } from "./dungeonTypes";

export interface RogueliteDungeonRecord {
  attempts: number;
  victories: number;
  bestScore: number;
  bestGrade: DungeonRunGrade | null;
  lastVictoryDay: number | null;
}

export interface RogueliteRotationState {
  offeredDungeonIds: string[];
  selectedDungeonId: string | null;
  cooldownUntilDay: number;
  records: Record<string, RogueliteDungeonRecord>;
}

export const createRogueliteRotationState = (): RogueliteRotationState => ({ offeredDungeonIds: [], selectedDungeonId: null, cooldownUntilDay: 0, records: {} });
export const createRogueliteDungeonRecord = (): RogueliteDungeonRecord => ({ attempts: 0, victories: 0, bestScore: 0, bestGrade: null, lastVictoryDay: null });
export function migrateRogueliteRotationState(value?: Partial<RogueliteRotationState> | null): RogueliteRotationState {
  const defaults = createRogueliteRotationState();
  if (!value) return defaults;
  return { ...defaults, ...value, offeredDungeonIds: value.offeredDungeonIds ?? [], records: value.records ?? {} };
}
