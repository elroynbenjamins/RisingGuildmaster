import { describe, expect, it } from "vitest";
import { QUESTS } from "../src/data/quests/quests";
import { createWorldState } from "../src/game/world/worldState";
import { grantCampaignHeroXp, releaseBankedCampaignXp } from "../src/game/progression/levelSystem";
import { xpRequiredForNextLevel } from "../src/game/progression/xpSystem";
import { getQuestEnemyXpPool } from "../src/game/quests/questResolver";
import { testHero } from "./testHero";

describe("Chapter 1 progression path", () => {
  it("provides a kill-based starter path toward Level 2", () => {
    const ids = ["guildhaven_cellar_slimes", "rats_beneath_guildhaven", "goblin_patrol", "missing_merchant", "attack_on_guildhaven"];
    const perHero = ids.reduce((sum, id) => sum + Math.floor(getQuestEnemyXpPool(QUESTS[id]!) / 2), 0);
    expect(perHero).toBeGreaterThanOrEqual(xpRequiredForNextLevel(1));
  });
  it("keeps starter contracts in the Level 1–2 range", () => {
    expect(QUESTS.orchard_road_patrol).toMatchObject({ questType: "contract", recommendedLevelMin: 2 });
    expect(QUESTS.troll_hunt).toMatchObject({ questType: "contract", recommendedLevelMin: 5, recommendedLevelMax: 5 });
    expect(QUESTS.spider_nest?.recommendedLevelMin).toBeLessThanOrEqual(2);
  });
  it("banks XP at Level 4 until the Chieftain is defeated", () => {
    const world = createWorldState(); const capped = grantCampaignHeroXp({ ...testHero(), level: 4, xp: xpRequiredForNextLevel(4) - 50 }, 500, world);
    expect(capped).toMatchObject({ level: 4, xp: xpRequiredForNextLevel(4) + 450 });
    const [released] = releaseBankedCampaignXp([capped], { ...world, completedQuestIds: ["goblin_chieftain_boss"] });
    expect(released).toMatchObject({ level: 5, xp: 450 });
  });
  it("keeps the mandatory Brambleway preparation step below the Chieftain ceiling", () => {
    expect(QUESTS.brambleway_road_ambush).toMatchObject({ recommendedLevelMin: 2, recommendedLevelMax: 3, minPartySize: 3, maxPartySize: 3 });
    expect(QUESTS.brambleway_caravan).toMatchObject({ difficulty: 3, recommendedLevelMin: 2, recommendedLevelMax: 3, minPartySize: 3, maxPartySize: 4 });
  });
  it("makes the Chieftain a Level 2, three-to-four hero boss", () => {
    expect(QUESTS.goblin_chieftain_boss).toMatchObject({ recommendedLevelMin: 2, recommendedLevelMax: 2, minimumPartyAverageLevel: 2, minPartySize: 3, maxPartySize: 4 });
    expect(QUESTS.goblin_chieftain_boss?.preparationNotes).toEqual(expect.arrayContaining([expect.stringContaining("Recommended: frontline"), expect.stringContaining("Optional: common gear")]));
  });
});
