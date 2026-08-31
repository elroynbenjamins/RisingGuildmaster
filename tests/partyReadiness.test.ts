import { describe, expect, it } from "vitest";
import { QUESTS } from "../src/data/quests/quests";
import { getPartyBondSummary, getQuestSkillCoverage } from "../src/game/party/partyReadinessService";
import { setRelationship } from "../src/game/relationships/relationshipService";
import { testHero } from "./testHero";
import type { SkillId } from "../src/game/proficiencies/proficiencyTypes";

describe("party readiness guidance", () => {
  it("reports proficiency coverage for authored exploration stages", () => {
    const hero = { ...testHero(), name: "Elara", skillProficiencyIds: ["history", "athletics"] as SkillId[] };
    const coverage = getQuestSkillCoverage(QUESTS.echoes_of_mosswatch!, [hero]);
    expect(coverage.map((entry) => [entry.skillId, entry.covered])).toEqual([["history", true], ["athletics", true], ["perception", false]]);
    expect(coverage[0]).toMatchObject({ bestHeroName: "Elara", bonus: 2 });
  });

  it("summarizes friendly and rival pairs without changing relationships", () => {
    const a = testHero(); const b = { ...testHero(), id: "b", name: "Bryn" }; const c = { ...testHero(), id: "c", name: "Cora" };
    const relationships = setRelationship(setRelationship([], a.id, b.id, 30), a.id, c.id, -60);
    expect(getPartyBondSummary([a, b, c], relationships)).toMatchObject({ friends: 1, rivals: 1, warning: expect.any(String) });
    expect(relationships.map((entry) => entry.score)).toEqual([30, -60]);
  });
});
