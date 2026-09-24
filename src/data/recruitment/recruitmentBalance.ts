import type { ClassId, RaceId } from "../../game/heroes/types";
import type { ContractLengthWeeks, RecruitmentArchetype } from "../../game/recruitment/recruitmentTypes";

export interface ArchetypeBalance { weight: number; ageMin: number; ageMax: number; levelMin: number; levelMax: number; salaryModifier: number; recruitmentFeeModifier: number; traitCountMin: number; traitCountMax: number; estimateRadius: number }
export const RECRUITMENT_ARCHETYPES: Record<RecruitmentArchetype, ArchetypeBalance> = {
  prospect: { weight: .35, ageMin: 18, ageMax: 24, levelMin: 1, levelMax: 3, salaryModifier: -.25, recruitmentFeeModifier: -.20, traitCountMin: 1, traitCountMax: 2, estimateRadius: 18 },
  standard: { weight: .40, ageMin: 21, ageMax: 32, levelMin: 2, levelMax: 6, salaryModifier: 0, recruitmentFeeModifier: 0, traitCountMin: 1, traitCountMax: 3, estimateRadius: 15 },
  veteran: { weight: .20, ageMin: 28, ageMax: 42, levelMin: 5, levelMax: 10, salaryModifier: .30, recruitmentFeeModifier: .25, traitCountMin: 2, traitCountMax: 3, estimateRadius: 12 },
  elite: { weight: .05, ageMin: 20, ageMax: 36, levelMin: 6, levelMax: 12, salaryModifier: .60, recruitmentFeeModifier: .75, traitCountMin: 2, traitCountMax: 4, estimateRadius: 10 },
};
export const RECRUITMENT_RACE_WEIGHTS: Record<RaceId, number> = { human: .30, elf: .15, dwarf: .15, orc: .15, tiefling: .09, stoneborn: .08, veilborn: .08 };
export const RECRUITMENT_CLASS_WEIGHTS: Record<ClassId, number> = { warrior: .14, ranger: .12, mage: .10, cleric: .10, paladin: .10, berserker: .10, monk: .07, bard: .07, spellbow: .07, bulwark: .07, summoner: .06 };
export const CONTRACT_LENGTH_WEIGHTS: Record<ContractLengthWeeks, number> = { 12: .25, 24: .50, 52: .25 };
export const RECRUITMENT_CONFIG = { candidateCount: 3, regionalScoutCandidateCount: 5, regionalScoutGemCost: 10, regionalScoutDurationDays: 3, regionalScoutSpeedUpGemCost: 5, regionalScoutClassFocusGemCost: 5, expirationDays: 7, freeRefreshDays: 7, manualRefreshCost: 150, reservationDays: 3, reservationCost: 50, reserveSlots: 1, basicScoutCost: 100, advancedScoutCost: 250, expertScoutCost: 500, heroCapacity: 8 } as const;
