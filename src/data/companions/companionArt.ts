export type CompanionPortraitId = "wolf_companion" | "bound_wisp" | "greater_eidolon";

export interface CompanionPortraitCoordinate {
  column: 0 | 1 | 2;
  row: 0;
}

export const COMPANION_PORTRAITS: Record<CompanionPortraitId, CompanionPortraitCoordinate> = {
  wolf_companion: { column: 0, row: 0 },
  bound_wisp: { column: 1, row: 0 },
  greater_eidolon: { column: 2, row: 0 },
};

export function isCompanionPortraitId(value: string): value is CompanionPortraitId {
  return value in COMPANION_PORTRAITS;
}
