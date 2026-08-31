import type { ConditionId } from "../../game/heroes/types";
import type { D20RollMode } from "../../game/combat/dice/d20RollMode";

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
  attackRollMode?: D20RollMode;
  attacksAgainstRollMode?: D20RollMode;
  armorClassModifier?: number;
  magicDefenseScoreModifier?: number;
  damageReceivedModifier?: number;
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
  blinded: { id: "blinded", name: "Blinded", description: "Attacks have Disadvantage, while attacks against the blinded unit have Advantage.", attackRollMode: "disadvantage", attacksAgainstRollMode: "advantage", durationTurns: 2, stackable: false, persistsAfterCombat: false },
  frightened: { id: "frightened", name: "Frightened", description: "Suffers -2 to attack rolls and loses 1 movement tile.", attackRollModifier: -2, movementRangeModifier: -1, durationTurns: 2, stackable: false, persistsAfterCombat: false },
  rooted: { id: "rooted", name: "Rooted", description: "Movement range becomes 0, but combat actions remain available.", movementRangeOverride: 0, durationTurns: 1, stackable: false, persistsAfterCombat: false },
  frozen: { id: "frozen", name: "Frozen", description: "Cannot act and suffers -2 Armor Class until the ice breaks.", skipTurn: true, armorClassModifier: -2, durationTurns: 1, stackable: false, persistsAfterCombat: false },
  weakened: { id: "weakened", name: "Weakened", description: "Deals 20% less physical and magical damage.", physicalDamageModifier: -.20, magicDamageModifier: -.20, durationTurns: 2, stackable: false, persistsAfterCombat: false },
  silenced: { id: "silenced", name: "Silenced", description: "Cannot use mana-based skills.", blocksMagicSkills: true, durationTurns: 2, stackable: false, persistsAfterCombat: false },
  vulnerable: { id: "vulnerable", name: "Vulnerable", description: "Suffers -2 Armor Class and -2 Magic Defense Score.", armorClassModifier: -2, magicDefenseScoreModifier: -2, durationTurns: 2, stackable: false, persistsAfterCombat: false },
  restrained: { id: "restrained", name: "Restrained", description: "Cannot move and suffers -2 to attacks and Armor Class.", movementRangeOverride: 0, attackRollModifier: -2, armorClassModifier: -2, durationTurns: 2, stackable: false, persistsAfterCombat: false },
  prone: { id: "prone", name: "Prone", description: "Knocked down: suffers -2 to attacks and Armor Class and loses 2 movement tiles.", movementRangeModifier: -2, attackRollModifier: -2, armorClassModifier: -2, durationTurns: 1, stackable: false, persistsAfterCombat: false },
  slowed: { id: "slowed", name: "Slowed", description: "Movement is hindered, reducing movement range by 2 tiles.", movementRangeModifier: -2, durationTurns: 2, stackable: false, persistsAfterCombat: false },
  charmed: { id: "charmed", name: "Charmed", description: "Magically influenced; harmful actions are made with Disadvantage until source-aware targeting is added.", attackRollMode: "disadvantage", durationTurns: 2, stackable: false, persistsAfterCombat: false },
  deafened: { id: "deafened", name: "Deafened", description: "Cannot hear and automatically fails hearing-dependent checks.", durationTurns: 2, stackable: false, persistsAfterCombat: false },
  grappled: { id: "grappled", name: "Grappled", description: "Movement becomes 0, but combat actions remain available.", movementRangeOverride: 0, durationTurns: 2, stackable: false, persistsAfterCombat: false },
  incapacitated: { id: "incapacitated", name: "Incapacitated", description: "Cannot take actions or reactions.", skipTurn: true, movementRangeOverride: 0, durationTurns: 1, stackable: false, persistsAfterCombat: false },
  invisible: { id: "invisible", name: "Invisible", description: "Attacks have Advantage and attacks against the unit have Disadvantage.", attackRollMode: "advantage", attacksAgainstRollMode: "disadvantage", durationTurns: 2, stackable: false, persistsAfterCombat: false },
  paralyzed: { id: "paralyzed", name: "Paralyzed", description: "Cannot act or move; attacks against the unit have Advantage.", skipTurn: true, movementRangeOverride: 0, attacksAgainstRollMode: "advantage", durationTurns: 1, stackable: false, persistsAfterCombat: false },
  petrified: { id: "petrified", name: "Petrified", description: "Turned to stone: cannot act or move, attacks gain Advantage, and incoming damage is halved.", skipTurn: true, movementRangeOverride: 0, attacksAgainstRollMode: "advantage", damageReceivedModifier: -.50, durationTurns: 2, stackable: false, persistsAfterCombat: false },
  unconscious: { id: "unconscious", name: "Unconscious", description: "Cannot act or move; attacks against the unit have Advantage.", skipTurn: true, movementRangeOverride: 0, attacksAgainstRollMode: "advantage", durationTurns: 1, stackable: false, persistsAfterCombat: false },
};
