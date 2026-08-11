import type { RaceId } from "../game/heroes/types";

/** High-contrast identity colors designed for the game's dark mobile UI. */
export const RACE_NAME_COLORS: Record<RaceId, string> = {
  human: "#F2C57C",
  elf: "#7FD7FF",
  dwarf: "#F28C6B",
  orc: "#A7D66D",
};

export function getRaceNameColor(raceId: RaceId): string { return RACE_NAME_COLORS[raceId]; }
