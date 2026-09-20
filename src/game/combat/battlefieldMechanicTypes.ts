import type { GridPosition } from "./grid/gridTypes";

export type BattlefieldInteractiveKind = "explosive_barrel" | "healing_shrine" | "lever";

export interface BattlefieldInteractiveDefinition {
  id: string;
  name: string;
  kind: BattlefieldInteractiveKind;
  position: GridPosition;
  integrity?: number;
  radius?: number;
  damageMaxHpRatio?: number;
  healMaxHpRatio?: number;
  linkedPositions?: readonly GridPosition[];
}

export interface BattlefieldInteractiveState extends BattlefieldInteractiveDefinition {
  currentIntegrity: number;
  used: boolean;
}
