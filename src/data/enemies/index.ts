import type { EnemyDefinition } from "../../game/enemies/enemyTypes";
import { BANDIT_ENEMIES } from "./bandits";
import { BEAST_ENEMIES } from "./beasts";
import { GOBLIN_ENEMIES } from "./goblins";
import { ORC_ENEMIES } from "./orcs";
import { UNDEAD_ENEMIES } from "./undead";
import { CONSTRUCT_ENEMIES } from "./constructs";
import { BLACKBRIDGE_ENEMIES } from "./blackbridge";
import { ASH_BENEATH_GREENVEIL_ENEMIES } from "./ashBeneathGreenveil";
import { STONEGATE_ASSASSIN_ENEMIES } from "./stonegateAssassins";
import { SEWER_VERMIN_ENEMIES } from "./sewerVermin";
import { FROSTMARCH_CHAPTER_3_BALANCED_ENEMIES } from "./frostmarchChapter3Balanced";
import { SHADOWFEN_CHAPTER_4_ENEMIES } from "./shadowfenChapter4";
import { ASHLANDS_CHAPTER_5_ENEMIES } from "./ashlandsChapter5";
import { CHAPTER_6_GREENVEIL_ENEMIES } from "./chapter6Greenveil";
import { CHAPTER_7_IRON_HILLS_ENEMIES } from "./chapter7IronHills";
import { CHAPTER_8_WESTERN_SEA_ENEMIES } from "./chapter8WesternSea";
import { CHAPTER_9_DROWNED_SEVENTH_ENEMIES } from "./chapter9DrownedSeventh";
import { NAMED_ELITE_ENEMIES } from "./namedElites";

export const ENEMIES: Record<string, EnemyDefinition> = {
  ...GOBLIN_ENEMIES,
  ...UNDEAD_ENEMIES,
  ...BEAST_ENEMIES,
  ...BANDIT_ENEMIES,
  ...ORC_ENEMIES,
  ...CONSTRUCT_ENEMIES,
  ...BLACKBRIDGE_ENEMIES,
  ...ASH_BENEATH_GREENVEIL_ENEMIES,
  ...STONEGATE_ASSASSIN_ENEMIES,
  ...SEWER_VERMIN_ENEMIES,
  ...FROSTMARCH_CHAPTER_3_BALANCED_ENEMIES,
  ...SHADOWFEN_CHAPTER_4_ENEMIES,
  ...ASHLANDS_CHAPTER_5_ENEMIES,
  ...CHAPTER_6_GREENVEIL_ENEMIES,
  ...CHAPTER_7_IRON_HILLS_ENEMIES,
  ...CHAPTER_8_WESTERN_SEA_ENEMIES,
  ...CHAPTER_9_DROWNED_SEVENTH_ENEMIES,
  ...NAMED_ELITE_ENEMIES,
};

export function getEnemyDefinition(id: string): EnemyDefinition {
  const definition = ENEMIES[id];
  if (!definition) throw new Error(`Unknown enemy definition: ${id}`);
  return definition;
}
