import type { ClassId, RaceId } from "../heroes/types";

export interface RivalCharacterDefinition {
  id: string;
  name: string;
  title: string;
  raceId: RaceId;
  classId: ClassId;
  level: number;
  combatRole: string;
  personality: string;
}

export interface RivalryEncounterDefinition {
  id: string;
  name: string;
  chapter: number;
  mode: "nonlethal_duel" | "guild_battle";
  opponentCharacterIds: string[];
  recommendedLevelMin: number;
  recommendedLevelMax: number;
  unlockFlag: string;
  narrativePurpose: string;
}

export interface RivalGuildDefinition {
  id: string;
  name: string;
  motto: string;
  homeCity: string;
  startingReputation: number;
  leaderCharacterId: string;
  championCharacterId: string;
  characterIds: string[];
  description: string;
  rivalryEncounterIds: string[];
}

export type RivalryStanding = "unknown" | "underdog" | "challenger" | "equal" | "surpassed";
