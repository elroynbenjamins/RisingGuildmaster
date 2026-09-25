import { emptyPotionInventory } from "../src/game/alchemy/potionTypes";
import { describe, expect, it } from "vitest";
import { QUESTS } from "../src/data/quests/quests";
import { buildRecommendedQuestParty, getDeploymentRole, getQuestDeploymentSummary } from "../src/game/party/questDeploymentService";
import { testHero } from "./testHero";

const quest = QUESTS.guildhaven_cellar_slimes!;
const potions = { ...emptyPotionInventory(), minor_healing_potion: 1, mana_tonic: 0, stamina_draught: 1 } as const;

function hero(id: string, classId: ReturnType<typeof testHero>["classId"], level = 2) {
  return { ...testHero(), id, name: id, classId, level };
}

describe("quest deployment presentation", () => {
  it("summarizes roles, field supplies, intel and equipment warnings", () => {
    const party = [
      { ...hero("front", "warrior"), equipment: { ...testHero().equipment, weapon: "training_sword@@0" } },
      hero("support", "cleric"),
      hero("range", "ranger"),
    ];
    const summary = getQuestDeploymentSummary(quest, party, [], potions);
    expect(summary.roleCounts).toEqual({ frontline: 1, support: 1, ranged: 1 });
    expect(summary.supplies).toMatchObject({ healing: 1, stamina: 1, total: 2 });
    expect(summary.equipment.brokenItems).toBe(1);
    expect(summary.warnings.some((entry) => entry.id === "broken_gear" && entry.tone === "danger")).toBe(true);
    expect(summary.intel.coverageLabel).toBe("NO FIELD INTEL");
  });

  it("marks an under-levelled deployment as high risk when the quest does not hard-block it", () => {
    const harder = { ...quest, recommendedLevelMin: 4, minimumPartyAverageLevel: undefined };
    const party = [hero("a", "warrior", 2), hero("b", "cleric", 2)];
    const summary = getQuestDeploymentSummary(harder, party, [], potions);
    expect(summary.status).toBe("high_risk");
    expect(summary.warnings.some((entry) => entry.id === "level")).toBe(true);
  });

  it("builds a balanced ordinary quest party before filling spare slots", () => {
    const roster = [
      hero("fighter", "warrior", 3),
      hero("healer", "cleric", 2),
      hero("archer", "ranger", 2),
      hero("mage", "mage", 5),
      hero("fighter2", "berserker", 4),
    ];
    const ids = buildRecommendedQuestParty(quest, roster);
    const picked = roster.filter((entry) => ids.includes(entry.id));
    expect(ids).toHaveLength(quest.maxPartySize);
    expect(picked.map(getDeploymentRole)).toEqual(expect.arrayContaining(["frontline", "support", "ranged"]));
  });

  it("forces an eligible personal-quest hero into recommended selection", () => {
    const roster = [hero("required", "bard", 1), hero("a", "warrior", 5), hero("b", "ranger", 5), hero("c", "mage", 5), hero("d", "cleric", 5)];
    expect(buildRecommendedQuestParty(quest, roster, ["required"])).toContain("required");
  });

  it("blocks the Hollow Warden below average Level 5 and clears the level gate at 5", () => {
    const quest = QUESTS.hollow_warden_boss!;
    const levelFour = ["warrior","ranger","cleric","mage"].map((classId,index)=>({ ...testHero(), id:`warden-l4-${index}`, classId:classId as typeof testHero()["classId"], level:4, adventureStamina:100 }));
    const blocked = getQuestDeploymentSummary(quest, levelFour, [], [], [], []);
    expect(blocked.status).toBe("blocked");
    expect(blocked.warnings.map((warning)=>warning.id)).toContain("level_gate");

    const levelFive = levelFour.map((hero)=>({ ...hero, level:5 }));
    const ready = getQuestDeploymentSummary(quest, levelFive, [], [], [], []);
    expect(ready.warnings.map((warning)=>warning.id)).not.toContain("level_gate");
  });

});
