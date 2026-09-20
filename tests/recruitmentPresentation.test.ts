import { describe, expect, it } from "vitest";
import { generateRecruitmentCandidate } from "../src/game/recruitment/candidateGenerator";
import { getCandidateRecruitmentPresentation, getRosterRoleSummary } from "../src/game/recruitment/recruitmentPresentationService";
import { createSeededRandom } from "../src/utils/random";
import type { Hero } from "../src/game/heroes/types";

function hero(id: string, classId: Hero["classId"]): Hero {
  const candidate = generateRecruitmentCandidate(createSeededRandom(id.length * 77 + classId.length), 1, 0, "standard", undefined, classId);
  return { ...candidate.heroPreview, id, currentHP: 10, isAvailable: true };
}

describe("recruitment presentation", () => {
  it("identifies missing party roles", () => {
    const summary = getRosterRoleSummary([hero("w", "warrior"), hero("r", "ranger")]);
    expect(summary.counts.frontline).toBe(1);
    expect(summary.counts.ranged).toBe(1);
    expect(summary.missing).toContain("support");
  });

  it("calls out a candidate who fills a missing support role", () => {
    const candidate = generateRecruitmentCandidate(createSeededRandom(12), 4, 0, "standard", undefined, "cleric");
    const presentation = getCandidateRecruitmentPresentation(candidate, [hero("w", "warrior"), hero("r", "ranger")], 4, 2000, 200);
    expect(presentation.roleLabel).toBe("SUPPORT");
    expect(presentation.fitLabel).toContain("FILLS SUPPORT GAP");
    expect(presentation.fitTone).toBe("good");
  });

  it("warns when the minimum fee is unaffordable and when a candidate is leaving soon", () => {
    const candidate = { ...generateRecruitmentCandidate(createSeededRandom(22), 5, 0, "standard", undefined, "mage"), recruitmentFeeEstimateMin: 500, expiresAtDay: 6 };
    const presentation = getCandidateRecruitmentPresentation(candidate, [], 5, 100, 0);
    expect(presentation.affordable).toBe(false);
    expect(presentation.economyTone).toBe("danger");
    expect(presentation.expiryLabel).toBe("LEAVES TOMORROW");
    expect(presentation.expiryTone).toBe("danger");
  });
});
