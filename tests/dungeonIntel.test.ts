import { describe, expect, it } from "vitest";
import { DUNGEON_NODES } from "../src/data/dungeons/dungeons";
import { calculateDungeonRunScore, getDungeonDiscoveryReadiness, getDungeonEncounterSummary, getDungeonNodeRewardSummary, getDungeonRouteLayers } from "../src/game/dungeons/dungeonIntelService";
import { beginDungeonExpedition, resolveDungeonCombat, resolveDungeonUtilityNode } from "../src/game/dungeons/dungeonRunService";
import { startDungeonRun } from "../src/game/dungeons/dungeonService";
import { createGuild } from "../src/game/guild/guildService";
import { generateHero } from "../src/game/heroes/heroGenerator";
import { deserializeGuild, serializeGuild } from "../src/game/save/saveService";
import { createSeededRandom } from "../src/utils/random";
import { sequenceRandom } from "./combatTestUtils";
import { ENEMIES } from "../src/data/enemies";

function expeditionGuild() {
  const guild = createGuild();
  guild.heroes = Array.from({ length: 8 }, (_, index) => ({ ...generateHero(createSeededRandom(80 + index)), id: `delver-${index}`, level: 7 }));
  guild.world.completedCampaignNodeIds = ["broken_wardstone"];
  guild.discoveredEnemyIds = Object.keys(ENEMIES);
  guild.rogueliteRotation.offeredDungeonIds = ["wardstone_depths", "thornwood_trials", "temple_of_coils"];
  return guild;
}

describe("roguelite dungeon clarity and mastery", () => {
  it("builds the branching route as six readable layers and exposes exact encounter intel", () => {
    expect(getDungeonRouteLayers("wardstone_depths").map((layer) => layer.length)).toEqual([1, 2, 1, 2, 1, 1]);
    expect(getDungeonEncounterSummary("rl_undead_bone_patrol")).toContain("2× Skeleton · Lv 5");
    expect(getDungeonNodeRewardSummary(DUNGEON_NODES.depths_elite!)).toContain("uncommon ring recipe chance");
  });

  it("explains bestiary readiness before the player enters a theme", () => {
    const partial = getDungeonDiscoveryReadiness("wardstone_depths", ["skeleton", "skeleton_archer", "zombie", "ironbound_sentry", "hollow_warden"]);
    expect(partial).toMatchObject({ ready: true, eligibleByType: { combat: 3, elite: 2, boss: 1 } });
    expect(partial.missingEnemyIds).toContain("morrowveil_archivist");
    expect(getDungeonDiscoveryReadiness("wardstone_depths", ["skeleton"])).toMatchObject({ ready: false, eligibleByType: { elite: 0, boss: 0 } });
  });

  it("makes a failed entrance check inflict explicit, nonlethal attrition", () => {
    const base = expeditionGuild(); const party = base.heroes.slice(0, 4).map((hero) => hero.id);
    let guild = beginDungeonExpedition(base, "wardstone_depths", party);
    const before = guild.activeDungeonRun!.heroInstances.map((hero) => hero.currentHP);
    guild = resolveDungeonUtilityNode(guild, sequenceRandom([0])).guild;
    guild.activeDungeonRun!.heroInstances.forEach((hero, index) => expect(hero.currentHP).toBe(Math.max(1, before[index]! - Math.round(hero.maxHP * .10))));
    expect(guild.activeDungeonRun?.lastResolutionText).toContain("loses 10% max HP");
  });

  it("scores danger, survival and victory, then saves the theme record", () => {
    const base = expeditionGuild(); const party = base.heroes.slice(0, 4).map((hero) => hero.id);
    let guild = beginDungeonExpedition(base, "wardstone_depths", party, ["brutal_host"]);
    expect(guild.rogueliteRotation.records.wardstone_depths?.attempts).toBe(1);
    const run = guild.activeDungeonRun!;
    guild = { ...guild, activeDungeonRun: { ...run, currentNodeId: "depths_boss", resolvedNodeIds: ["depths_start", "depths_elite", "depths_treasure", "depths_rest", "depths_guard"] } };
    guild = resolveDungeonCombat(guild, "victory", run.heroInstances, sequenceRandom([.99])).guild;
    const score = calculateDungeonRunScore(guild.activeDungeonRun!);
    expect(score).toMatchObject({ total: 1850, grade: "S", survivalScore: 300, victoryScore: 400 });
    expect(guild.rogueliteRotation.records.wardstone_depths).toMatchObject({ attempts: 1, victories: 1, bestScore: 1850, bestGrade: "S" });
    expect(deserializeGuild(serializeGuild(guild)).rogueliteRotation.records.wardstone_depths?.bestGrade).toBe("S");
  });

  it("migrates older saves without dungeon records", () => {
    const saved = JSON.parse(serializeGuild(expeditionGuild())); delete saved.rogueliteRotation.records;
    expect(deserializeGuild(JSON.stringify(saved)).rogueliteRotation.records).toEqual({});
  });

  it("adds selected oath score bonuses without changing the saved encounter roll", () => {
    const run = startDungeonRun("thornwood_trials", ["brutal_host", "iron_vow"], [], [], sequenceRandom([0, 0, 0, 0]));
    expect(calculateDungeonRunScore(run).dangerScore).toBe(250);
    expect(Object.keys(run.selectedEncounterIds)).toHaveLength(4);
  });
});
