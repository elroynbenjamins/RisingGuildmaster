import { MOSSWATCH_EXPLORATION } from "./mosswatchExploration";
import { SPIDER_QUEEN_EXPLORATION } from "./spiderQueenExploration";
import { RESCUE_DEFENSE_EXPLORATION } from "./rescueDefenseExploration";
import { HUNT_EXPLORATION } from "./huntExploration";
import { BLACKBRIDGE_EXPLORATION } from "./blackbridgeExploration";
import { ASH_BENEATH_GREENVEIL_EXPLORATION } from "./ashBeneathGreenveilExploration";
import { STONEGATE_ASSASSIN_EXPLORATION } from "./stonegateAssassinExploration";

export const QUEST_EXPLORATION_STAGES = {
  ...SPIDER_QUEEN_EXPLORATION,
  ...MOSSWATCH_EXPLORATION,
  ...RESCUE_DEFENSE_EXPLORATION,
  ...HUNT_EXPLORATION,
  ...BLACKBRIDGE_EXPLORATION,
  ...ASH_BENEATH_GREENVEIL_EXPLORATION,
  ...STONEGATE_ASSASSIN_EXPLORATION,
};
