import type { Hero } from "../heroes/types";
import { getDeploymentRole, type DeploymentRole } from "../party/questDeploymentService";
import { publicCandidateRating } from "./candidateGenerator";
import type { RecruitmentCandidate } from "./recruitmentTypes";

export type RecruitmentUiTone = "neutral" | "good" | "gold" | "danger" | "blue";

const ROLE_LABELS: Record<DeploymentRole, string> = {
  frontline: "FRONTLINE",
  support: "SUPPORT",
  ranged: "RANGED",
};

export interface RosterRoleSummary {
  counts: Record<DeploymentRole, number>;
  missing: DeploymentRole[];
  labels: string[];
}

export interface CandidateRecruitmentPresentation {
  role: DeploymentRole;
  roleLabel: string;
  fitLabel: string;
  fitDetail: string;
  fitTone: RecruitmentUiTone;
  qualityLabel: string;
  qualityTone: RecruitmentUiTone;
  expiryLabel: string;
  expiryTone: RecruitmentUiTone;
  daysRemaining: number;
  affordable: boolean;
  goldAfterMinimumFee: number;
  payrollAfterMin: number;
  payrollAfterMax: number;
  economyLabel: string;
  economyTone: RecruitmentUiTone;
}

export function getRosterRoleSummary(heroes: readonly Hero[]): RosterRoleSummary {
  const counts: Record<DeploymentRole, number> = { frontline: 0, support: 0, ranged: 0 };
  heroes.filter((hero) => hero.currentHP > 0).forEach((hero) => { counts[getDeploymentRole(hero)] += 1; });
  const missing = (Object.keys(counts) as DeploymentRole[]).filter((role) => counts[role] === 0);
  return {
    counts,
    missing,
    labels: (Object.keys(counts) as DeploymentRole[]).map((role) => `${ROLE_LABELS[role]} ${counts[role]}`),
  };
}

function qualityTone(label: ReturnType<typeof publicCandidateRating>): RecruitmentUiTone {
  if (label === "Exceptional") return "gold";
  if (label === "Rare") return "blue";
  if (label === "Notable") return "good";
  return "neutral";
}

export function getCandidateRecruitmentPresentation(
  candidate: RecruitmentCandidate,
  roster: readonly Hero[],
  currentDay: number,
  gold: number,
  existingWeeklyPayroll: number,
): CandidateRecruitmentPresentation {
  const role = getDeploymentRole(candidate.heroPreview);
  const roleSummary = getRosterRoleSummary(roster);
  const fillsGap = roleSummary.missing.includes(role);
  const sameRoleCount = roleSummary.counts[role];
  const fitLabel = fillsGap ? `FILLS ${ROLE_LABELS[role]} GAP` : roster.length < 4 ? "BUILDS FIRST FIELD TEAM" : sameRoleCount <= 1 ? "ADDS ROLE DEPTH" : "ROSTER DEPTH";
  const fitDetail = fillsGap
    ? `Your current living roster has no ${ROLE_LABELS[role].toLowerCase()} hero.`
    : roster.length < 4
      ? "Useful while assembling the guild's first four-hero field team."
      : `You already have ${sameRoleCount} living ${ROLE_LABELS[role].toLowerCase()} hero${sameRoleCount === 1 ? "" : "es"}.`;
  const fitTone: RecruitmentUiTone = fillsGap ? "good" : roster.length < 4 ? "blue" : "neutral";

  const qualityLabel = publicCandidateRating(candidate.rarityScore).toUpperCase();
  const qualityToneValue = qualityTone(publicCandidateRating(candidate.rarityScore));
  const daysRemaining = Math.max(0, candidate.expiresAtDay - currentDay);
  const expiryTone: RecruitmentUiTone = daysRemaining <= 1 ? "danger" : daysRemaining <= 2 ? "gold" : "neutral";
  const expiryLabel = daysRemaining <= 0 ? "LEAVING NOW" : daysRemaining === 1 ? "LEAVES TOMORROW" : `LEAVES IN ${daysRemaining}D`;
  const affordable = gold >= candidate.recruitmentFeeEstimateMin;
  const goldAfterMinimumFee = gold - candidate.recruitmentFeeEstimateMin;
  const payrollAfterMin = existingWeeklyPayroll + candidate.weeklySalaryEstimateMin;
  const payrollAfterMax = existingWeeklyPayroll + candidate.weeklySalaryEstimateMax;
  const economyTone: RecruitmentUiTone = !affordable ? "danger" : goldAfterMinimumFee < payrollAfterMin ? "gold" : "neutral";
  const economyLabel = !affordable
    ? "UPFRONT FEE UNAFFORDABLE"
    : goldAfterMinimumFee < payrollAfterMin
      ? "TIGHT TREASURY AFTER HIRE"
      : "CONTRACT AFFORDABLE NOW";

  return {
    role,
    roleLabel: ROLE_LABELS[role],
    fitLabel,
    fitDetail,
    fitTone,
    qualityLabel,
    qualityTone: qualityToneValue,
    expiryLabel,
    expiryTone,
    daysRemaining,
    affordable,
    goldAfterMinimumFee,
    payrollAfterMin,
    payrollAfterMax,
    economyLabel,
    economyTone,
  };
}
