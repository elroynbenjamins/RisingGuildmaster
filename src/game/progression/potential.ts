import { GAME_CONFIG } from "../../config/gameConfig";

export function clampPotential(value: number): number {
  return Math.min(GAME_CONFIG.potentialMax, Math.max(GAME_CONFIG.potentialMin, Math.round(value)));
}

export function potentialMultiplier(potential: number): number {
  return 1 + (clampPotential(potential) - GAME_CONFIG.potentialMin) / 100;
}
