import { emptyPotionInventory } from "../src/game/alchemy/potionTypes";
import { describe, expect, it } from "vitest";
import { QUESTS } from "../src/data/quests/quests";
import { buildRecommendedQuestParty, getDeploymentRole, getQuestDeploymentSummary } from "../src/game/party/questDeploymentService";
import { testHero } from "./testHero";
import { calculateHero } from "../src/game/heroes/heroCalculator";

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

  it("marks a deployment high risk when heroes are missing a weapon or armor piece", () => {
    const party = [
      hero("missing-a", "warrior", 15),
      hero("missing-b", "warrior", 15),
      hero("missing-c", "warrior", 15),
      hero("missing-d", "warrior", 15),
    ].map((entry) => ({
      ...entry,
      equipment: { ...entry.equipment, weapon: null, armor: "padded-armor" },
    }));
    const summary = getQuestDeploymentSummary({ ...quest, recommendedLevelMin: 15 }, party, [], potions);
    expect(summary.equipment.missingPrimaryHeroes).toBe(4);
    expect(summary.status).toBe("high_risk");
    expect(summary.warnings).toContainEqual(expect.objectContaining({
      id: "missing_primary_gear",
      tone: "danger",
    }));
  });

  it("marks a deployment high risk when multiple heroes have badly lagging primary gear", () => {
    const party = [
      hero("lag-a", "warrior", 15),
      hero("lag-b", "warrior", 15),
      hero("lag-c", "warrior", 15),
      hero("lag-d", "warrior", 15),
    ].map((entry) => ({
      ...entry,
      equipment: { ...entry.equipment, weapon: "worn-sword", armor: "padded-armor" },
    }));
    const summary = getQuestDeploymentSummary({ ...quest, recommendedLevelMin: 15 }, party, [], potions);
    expect(summary.equipment.laggingPrimaryHeroes).toBe(4);
    expect(summary.status).toBe("high_risk");
    expect(summary.warnings).toContainEqual(expect.objectContaining({
      id: "lagging_gear",
      tone: "danger",
    }));
    expect(summary.warnings.find((entry) => entry.id === "lagging_gear")?.text).toContain("higher casualty risk");
  });

  it("warns when a late hero still has class progression choices available", () => {
    const unfinishedBase = hero("unfinished", "warrior", 13);
    const unfinished = {
      ...unfinishedBase,
      learnedSkillIds: [],
      subclassId: null,
      masteryId: null,
      equipment: {
        weapon: "wayfarers-longsword",
        armor: "wayfarer-fieldcoat",
        helmet: "leather-cap",
        boots: "trail-boots",
        accessory1: "copper-luck-ring",
        accessory2: "wayfarer-clasp",
      },
    };
    const readyHero = { ...unfinished, currentHP: calculateHero(unfinished).stats.maxHP };
    const summary = getQuestDeploymentSummary(
      { ...quest, recommendedLevelMin: 13, minimumPartyAverageLevel: undefined, minPartySize: 1 },
      [readyHero],
      [],
      potions,
    );
    expect(summary.status).toBe("watch");
    expect(summary.warnings).toContainEqual(expect.objectContaining({
      id: "unspent_progression",
      tone: "warning",
    }));
  });

  it("warns when a high-level hero has almost no secondary gear", () => {
    const gearedBase = hero("geared", "warrior", 13);
    const geared = {
      ...gearedBase,
      currentHP: 9999,
      equipment: {
        weapon: "wayfarers-longsword",
        armor: "wayfarer-fieldcoat",
        helmet: "leather-cap",
        boots: "trail-boots",
        accessory1: "copper-luck-ring",
        accessory2: "wayfarer-clasp",
      },
    };
    const sparse = {
      ...hero("fresh-recruit", "warrior", 13),
      currentHP: 9999,
      equipment: {
        weapon: "wayfarers-longsword",
        armor: "wayfarer-fieldcoat",
        helmet: null,
        boots: null,
        accessory1: null,
        accessory2: null,
      },
    };
    const summary = getQuestDeploymentSummary(
      { ...quest, recommendedLevelMin: 13, minimumPartyAverageLevel: undefined },
      [sparse, geared],
      [],
      potions,
    );
    expect(summary.equipment.sparseLoadoutHeroes).toBe(1);
    expect(summary.status).toBe("watch");
    expect(summary.warnings).toContainEqual(expect.objectContaining({
      id: "sparse_loadout",
      tone: "warning",
    }));
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
    const levelFour = [
      hero("warden-l4-0", "warrior", 4),
      hero("warden-l4-1", "ranger", 4),
      hero("warden-l4-2", "cleric", 4),
      hero("warden-l4-3", "mage", 4),
    ];
    const blocked = getQuestDeploymentSummary(quest, levelFour, [], potions);
    expect(blocked.status).toBe("blocked");
    expect(blocked.warnings.map((warning)=>warning.id)).toContain("level_gate");

    const levelFive = levelFour.map((entry)=>({ ...entry, level:5 }));
    const ready = getQuestDeploymentSummary(quest, levelFive, [], potions);
    expect(ready.warnings.map((warning)=>warning.id)).not.toContain("level_gate");
  });

});
