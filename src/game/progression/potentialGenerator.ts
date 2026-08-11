import { GAME_CONFIG } from "../../config/gameConfig";
import type { RandomSource } from "../../utils/random";
import { clampPotential } from "./potential";

/** Squaring a uniform roll biases results toward the lower bound while retaining 100 as a rare outcome. */
export function generateWeightedPotential(random: RandomSource, minimum: number = GAME_CONFIG.potentialMin, maximum: number = GAME_CONFIG.potentialMax): number {
  const min = clampPotential(minimum); const max = clampPotential(Math.max(min, maximum));
  return Math.min(max, min + Math.floor(random.next() ** 2 * (max - min + 1)));
}
