import type { ConditionId } from "../../game/heroes/types";

export interface CombatConditionDefinition {
  id: string;
  name: string;
  description: string;
  skipTurn?: boolean;
  damageMaxHpModifierPerTurn?: number;
  physicalDamageModifier?: number;
  magicDamageModifier?: number;
  speedModifier?: number;
  attackRollModifier?: number;
  armorClassModifier?: number;
  magicDefenseScoreModifier?: number;
  movementRangeModifier?: number;
  movementRangeOverride?: number;
  blocksMagicSkills?: boolean;
  durationTurns: number;
  stackable: boolean;
  persistsAfterCombat: boolean;
  persistentConditionId?: ConditionId;
}
export const COMBAT_CONDITIONS: Record<string, CombatConditionDefinition> = {
  stunned: { id: "stunned", name: "Stunned", description: "Cannot act for the duration.", skipTurn: true, durationTurns: 1, stackable: false, persistsAfterCombat: false },
  poisoned: { id: "poisoned", name: "Poisoned", description: "Takes 3% maximum HP damage at the start of each turn.", damageMaxHpModifierPerTurn: .03, durationTurns: 3, stackable: false, persistsAfterCombat: true, persistentConditionId: "poisoned" },
  infected: { id: "infected", name: "Infected", description: "Deals 10% less physical damage and may persist after combat.", physicalDamageModifier: -.10, durationTurns: 3, stackable: false, persistsAfterCombat: true, persistentConditionId: "infected" },
  burning: { id: "burning", name: "Burning", description: "Takes 4% maximum HP fire damage at the start of each turn.", damageMaxHpModifierPerTurn: .04, durationTurns: 2, stackable: false, persistsAfterCombat: false },
  bleeding: { id: "bleeding", name: "Bleeding", description: "Takes 3% maximum HP damage each turn until the wound closes.", damageMaxHpModifierPerTurn: .03, durationTurns: 3, stackable: false, persistsAfterCombat: false },
  blinded: { id: "blinded", name: "Blinded", description: "Suffers -4 to attack rolls and -2 Armor Class.", attackRollModifier: -4, armorClassModifier: -2, durationTurns: 2, stackable: false, persistsAfterCombat: false },
  frightened: { id: "frightened", name: "Frightened", description: "Suffers -2 to attack rolls and loses 1 movement tile.", attackRollModifier: -2, movementRangeModifier: -1, durationTurns: 2, stackable: false, persistsAfterCombat: false },
  rooted: { id: "rooted", name: "Rooted", description: "Movement range becomes 0, but combat actions remain available.", movementRangeOverride: 0, durationTurns: 1, stackable: false, persistsAfterCombat: false },
  frozen: { id: "frozen", name: "Frozen", description: "Cannot act and suffers -2 Armor Class until the ice breaks.", skipTurn: true, armorClassModifier: -2, durationTurns: 1, stackable: false, persistsAfterCombat: false },
  weakened: { id: "weakened", name: "Weakened", description: "Deals 20% less physical and magical damage.", physicalDamageModifier: -.20, magicDamageModifier: -.20, durationTurns: 2, stackable: false, persistsAfterCombat: false },
  silenced: { id: "silenced", name: "Silenced", description: "Cannot use mana-based skills.", blocksMagicSkills: true, durationTurns: 2, stackable: false, persistsAfterCombat: false },
  vulnerable: { id: "vulnerable", name: "Vulnerable", description: "Suffers -2 Armor Class and -2 Magic Defense Score.", armorClassModifier: -2, magicDefenseScoreModifier: -2, durationTurns: 2, stackable: false, persistsAfterCombat: false },
  restrained: { id: "restrained", name: "Restrained", description: "Cannot move and suffers -2 to attacks and Armor Class.", movementRangeOverride: 0, attackRollModifier: -2, armorClassModifier: -2, durationTurns: 2, stackable: false, persistsAfterCombat: false },
  prone: { id: "prone", name: "Prone", description: "Knocked down: suffers -2 to attacks and Armor Class and loses 2 movement tiles.", movementRangeModifier: -2, attackRollModifier: -2, armorClassModifier: -2, durationTurns: 1, stackable: false, persistsAfterCombat: false },
  slowed: { id: "slowed", name: "Slowed", description: "Movement is hindered, reducing movement range by 2 tiles.", movementRangeModifier: -2, durationTurns: 2, stackable: false, persistsAfterCombat: false },
};
