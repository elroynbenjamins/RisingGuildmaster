import type { GameDifficultyId } from "../game/difficulty/difficultyTypes";

export const PREPARED_BALANCE_GEAR_LEVEL_LAG = 2;

/**
 * Primary campaign balance benchmark for a well-built four-hero party:
 * - coherent roles and subclasses;
 * - sensible recommended skill paths;
 * - gear averaging about two levels below the heroes;
 * - competent skill use, focus fire and positioning.
 *
 * Simulation is a conservative automation proxy for skilled human play, so
 * deterministic regression tests use a small tolerance around these centers.
 */
export const PREPARED_BALANCE_WIN_RATE_TARGETS: Record<GameDifficultyId, number> = {
  standard: 0.85,
  veteran: 0.75,
  iron_guild: 0.60,
};

export const PREPARED_BALANCE_WIN_RATE_TOLERANCE = 0.10;
