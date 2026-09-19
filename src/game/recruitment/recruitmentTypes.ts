import type { Hero } from "../heroes/types";
import type { ClassId, RaceId } from "../heroes/types";
import type { AttributeKey } from "../attributes/types";

export type RecruitmentArchetype = "prospect" | "standard" | "veteran" | "elite";
export type ScoutingLevel = 0 | 1 | 2 | 3;
export type ContractLengthWeeks = 12 | 24 | 52;
export type ContractStatus = "active" | "expiring" | "expired";
export type RenewalLengthWeeks = 4 | 8 | 12;
export type ContractRenewalIntent = "undecided" | "depart";
export type RecruitmentCandidateSource = "guild_board" | "regional_scout";
export interface AttributeEstimate { minimum: number; maximum: number }
export type AttributeEstimates = Record<AttributeKey, AttributeEstimate>;

export interface RecruitmentCandidate {
  candidateId: string;
  heroPreview: Hero;
  truePotential: number;
  archetype: RecruitmentArchetype;
  recruitmentFee: number;
  weeklySalary: number;
  recruitmentFeeEstimateMin: number;
  recruitmentFeeEstimateMax: number;
  weeklySalaryEstimateMin: number;
  weeklySalaryEstimateMax: number;
  contractLengthWeeks: ContractLengthWeeks;
  potentialEstimateMin: number;
  potentialEstimateMax: number;
  attributeEstimates: AttributeEstimates;
  scoutingLevel: ScoutingLevel;
  generatedAtDay: number;
  expiresAtDay: number;
  rarityScore: number;
  source: RecruitmentCandidateSource;
  sourceRaceId: RaceId | null;
  sourceRegionId: string | null;
  sourceLocationName: string | null;
}

export interface RecruitmentState {
  candidateIds: string[];
  candidates: RecruitmentCandidate[];
  reservedCandidateId: string | null;
  reservationExpiresAtDay: number | null;
  lastFreeRefreshDay: number;
  nextFreeRefreshDay: number;
  manualRefreshCost: number;
  regionalScoutMission: RegionalScoutMission | null;
}

export interface RegionalScoutMission {
  id: string;
  raceId: RaceId;
  classId: ClassId | null;
  regionId: string;
  locationName: string;
  startDay: number;
  completionDay: number;
  resolutionSeed: number;
}

export interface HeroContract {
  heroId: string;
  weeklySalary: number;
  startDay: number;
  endDay: number;
  startLevel: number;
  status: ContractStatus;
  renewalIntent: ContractRenewalIntent;
}
