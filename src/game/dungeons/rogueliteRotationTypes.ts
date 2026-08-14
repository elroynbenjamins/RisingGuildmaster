export interface RogueliteRotationState {
  offeredDungeonIds: string[];
  selectedDungeonId: string | null;
  cooldownUntilDay: number;
}

export const createRogueliteRotationState = (): RogueliteRotationState => ({ offeredDungeonIds: [], selectedDungeonId: null, cooldownUntilDay: 0 });
