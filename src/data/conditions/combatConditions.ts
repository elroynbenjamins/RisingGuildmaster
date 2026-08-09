export interface CombatConditionDefinition {
  id: string;
  skipTurn?: boolean;
  damageMaxHpModifierPerTurn?: number;
  physicalDamageModifier?: number;
  durationTurns: number;
  stackable: boolean;
  persistsAfterCombat: boolean;
}
export const COMBAT_CONDITIONS: Record<string, CombatConditionDefinition> = {
  stunned: { id: "stunned", skipTurn: true, durationTurns: 1, stackable: false, persistsAfterCombat: false },
  poisoned: { id: "poisoned", damageMaxHpModifierPerTurn: 0.03, durationTurns: 3, stackable: false, persistsAfterCombat: false },
  infected: { id: "infected", physicalDamageModifier: -0.10, durationTurns: 3, stackable: false, persistsAfterCombat: true },
  burning: { id: "burning", damageMaxHpModifierPerTurn: 0.04, durationTurns: 2, stackable: false, persistsAfterCombat: false },
};
