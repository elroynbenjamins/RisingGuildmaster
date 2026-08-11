import { RECRUITMENT_CONFIG } from "../../data/recruitment/recruitmentBalance";
import type { GuildState } from "../guild/types";
import type { RecruitmentCandidate } from "./recruitmentTypes";
export function validateCandidateRecruitment(guild: GuildState, candidate: RecruitmentCandidate): string[] { const errors: string[] = []; if (guild.heroes.length >= RECRUITMENT_CONFIG.heroCapacity) errors.push("Guild hero capacity reached"); if (guild.gold < candidate.recruitmentFee) errors.push("Insufficient Gold"); if (!guild.recruitment.candidateIds.includes(candidate.candidateId)) errors.push("Candidate is no longer available"); if (candidate.expiresAtDay <= guild.currentDay) errors.push("Candidate has expired"); return errors; }
