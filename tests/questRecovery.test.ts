import { describe, expect, it } from "vitest";
import { createGuild } from "../src/game/guild/guildService";
import { createCombatState } from "../src/game/combat/combatEngine";
import { normalizeActiveQuestCombatRecovery, normalizePendingQuestResult } from "../src/game/quests/questRecoveryService";
import { createSeededRandom } from "../src/utils/random";
import { testHero } from "./testHero";

describe("quest recovery normalization", () => {
  it("drops a pending result whose campaign node is already complete", () => {
    const guild = createGuild();
    guild.world.completedCampaignNodeIds.push("goblin_chieftain");
    const pending = {
      questId: "goblin_chieftain_boss",
      status: "victory",
      campaignNodeId: "goblin_chieftain",
      chronicle: { id: "done" },
    };
    expect(normalizePendingQuestResult(pending, guild.world)).toBeNull();
  });

  it("drops active combat when a selected hero no longer exists", () => {
    const guild = createGuild();
    guild.heroes = [{ ...testHero(), id: "present" }];
    const recovery = {
      questId: "guildhaven_cellar_slimes",
      party: { id: "party", heroIds: ["missing"] },
      randomState: 123,
      state: null,
    };
    expect(normalizeActiveQuestCombatRecovery(recovery, guild.heroes, guild.world, null)).toBeNull();
  });

  it("drops active combat when a pending post-battle result takes precedence", () => {
    const guild = createGuild();
    const hero = { ...testHero(), id: "hero-a" };
    guild.heroes = [hero];
    const random = createSeededRandom(456);
    const state = createCombatState("guildhaven_cellar_slimes", 0, [hero], random);
    const active = {
      questId: "guildhaven_cellar_slimes",
      party: { id: "party", heroIds: [hero.id] },
      randomState: random.getState(),
      state,
    };
    const pending = {
      questId: "goblin_chieftain_boss",
      status: "victory" as const,
      goldEarned: 0,
      xpEarnedPerHero: 0,
      lootIds: [],
      heroOutcomes: [],
      chronicle: {
        id: "pending",
        day: 1,
        questId: "goblin_chieftain_boss",
        questName: "Goblin Chieftain",
        status: "victory" as const,
        aftermath: "",
        consequences: [],
        loreDiscoveries: [],
        heroMoments: [],
        relationshipChanges: [],
      },
      campaignNodeId: "goblin_chieftain",
    };
    expect(normalizeActiveQuestCombatRecovery(active, guild.heroes, guild.world, pending)).toBeNull();
  });
});
