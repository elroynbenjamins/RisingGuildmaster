import type { EnemyDefinition } from "../../game/enemies/enemyTypes";
import { BANDIT_ENEMIES } from "./bandits";
import { BEAST_ENEMIES } from "./beasts";
import { GOBLIN_ENEMIES } from "./goblins";
import { ORC_ENEMIES } from "./orcs";
import { UNDEAD_ENEMIES } from "./undead";
import { CONSTRUCT_ENEMIES } from "./constructs";
import { BLACKBRIDGE_ENEMIES } from "./blackbridge";

export const ENEMIES: Record<string, EnemyDefinition> = {
  ...GOBLIN_ENEMIES,
  ...UNDEAD_ENEMIES,
  ...BEAST_ENEMIES,
  ...BANDIT_ENEMIES,
  ...ORC_ENEMIES,
  ...CONSTRUCT_ENEMIES,
  ...BLACKBRIDGE_ENEMIES,
};

export function getEnemyDefinition(id: string): EnemyDefinition {
  const definition = ENEMIES[id];
  if (!definition) throw new Error(`Unknown enemy definition: ${id}`);
  return definition;
}
