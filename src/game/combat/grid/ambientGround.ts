import type { GridPosition, GroundTheme } from "./gridTypes";

const THEME_HINTS: readonly [GroundTheme, readonly string[]][] = [
  ["stone", ["sewer", "cistern"]],
  ["cave", ["cave", "forge", "vault", "sewer", "cistern", "tomb", "lift", "under", "cellar", "sanctum"]],
  ["snow", ["frost", "ice", "glacier", "white", "northwatch", "aurora", "rime"]],
  ["swamp", ["fen", "drowned", "water", "abbey", "mire", "sunken"]],
  ["ash", ["ash", "ember", "cinder", "glass", "hearth", "burn"]],
  ["sand", ["desert", "sand", "mesa", "waste"]],
  ["stone", ["iron", "stone", "mountain", "kharum", "flint", "skyvault", "bridge", "wall"]],
  ["road", ["road", "caravan", "courtyard", "guildhaven"]],
];

export function getGroundTheme(environmentId: string): GroundTheme {
  const normalized = environmentId.toLowerCase();
  return THEME_HINTS.find(([, hints]) => hints.some((hint) => normalized.includes(hint)))?.[0] ?? "grass";
}

/** Stable cosmetic variation: never changes movement, cover, line of sight, or spawning. */
export function getGroundVariant(environmentId: string, position: GridPosition): number {
  let hash = 17;
  for (const character of environmentId) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return ((hash + position.x * 13 + position.y * 29 + position.x * position.y * 7) % 4) + 1;
}
