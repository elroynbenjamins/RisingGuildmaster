import type { GuildState } from "../guild/types";
import type { Hero } from "../heroes/types";
import type { RecruitmentCandidate } from "./recruitmentTypes";

export interface RecruitmentRecommendation {
  heroId: string;
  heroName: string;
  score: number;
  reason: string;
}

function scoreRecommendation(candidate: RecruitmentCandidate, hero: Hero): RecruitmentRecommendation | null {
  const recruit = candidate.heroPreview;
  let score = 0;
  const reasons: string[] = [];
  if (hero.classId === recruit.classId) { score += 4; reasons.push("same class"); }
  if (hero.raceId === recruit.raceId) { score += 2; reasons.push("shared heritage"); }
  if ((hero.backgroundId ?? null) === (recruit.backgroundId ?? null)) { score += 2; reasons.push("similar background"); }
  if (hero.roleplayProfile?.idealId && hero.roleplayProfile.idealId === recruit.roleplayProfile?.idealId) { score += 2; reasons.push("shared ideal"); }
  if (hero.level >= recruit.level + 2) { score += 1; reasons.push("experienced enough to guide them"); }
  if (hero.traitIds.some((trait) => recruit.traitIds.includes(trait))) { score += 1; reasons.push("similar temperament"); }
  if (score < 3) return null;
  return { heroId: hero.id, heroName: hero.name, score, reason: reasons.slice(0, 3).join(", ") };
}

export function getRecruitmentRecommendation(guild: GuildState, candidate: RecruitmentCandidate): RecruitmentRecommendation | null {
  return guild.heroes
    .filter((hero) => hero.isAvailable && hero.currentHP > 0)
    .map((hero) => scoreRecommendation(candidate, hero))
    .filter((entry): entry is RecruitmentRecommendation => Boolean(entry))
    .sort((a, b) => b.score - a.score || a.heroName.localeCompare(b.heroName))[0] ?? null;
}
