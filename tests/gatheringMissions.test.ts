import { describe, expect, it } from "vitest";
import { createGuild } from "../src/game/guild/guildService";
import { advanceGuildDays, calculateGatheringModifier, claimGatheringMission, resolveGatheringMission, startGatheringMission } from "../src/game/gathering/gatheringService";
import type { GatheringMissionInstance } from "../src/game/gathering/gatheringTypes";
import { createSeededRandom } from "../src/utils/random";
import { sequenceRandom } from "./combatTestUtils";
import { testHero } from "./testHero";

const heroes = () => [{ ...testHero(), id: "g1", name: "Gatherer One", level: 3 }, { ...testHero(), id: "g2", name: "Gatherer Two", level: 3 }];
describe("persistent two-hero gathering missions", () => {
  it("requires exactly two distinct available heroes and locks them for multiple days", () => {
    const guild = createGuild(); guild.heroes = heroes();
    expect(() => startGatheringMission(guild, "greenveil_foraging", ["g1"], sequenceRandom([0, 0]))).toThrow("exactly two");
    const started = startGatheringMission(guild, "greenveil_foraging", ["g1", "g2"], sequenceRandom([0, 0]));
    expect(started.gatheringMissions[0]).toMatchObject({ heroIds: ["g1", "g2"], startDay: 1, completionDay: 3, status: "active" });
    expect(started.heroes.every((hero) => !hero.isAvailable)).toBe(true);
    expect(() => resolveGatheringMission(started, started.gatheringMissions[0]!.id)).toThrow("not complete");
  });

  it("uses both hero attributes and level in the D20 modifier", () => {
    const low = heroes() as [ReturnType<typeof testHero>, ReturnType<typeof testHero>];
    const high = low.map((hero) => ({ ...hero, level: 10, baseAttributes: { strength: 20, dexterity: 20, constitution: 20, intelligence: 20, wisdom: 20, charisma: 20 } })) as typeof low;
    expect(calculateGatheringModifier("greenveil_foraging", high)).toBeGreaterThan(calculateGatheringModifier("greenveil_foraging", low));
  });

  it("stores a deterministic non-guaranteed result and returns heroes when claimed", () => {
    let guild = createGuild(); guild.heroes = heroes(); guild = startGatheringMission(guild, "greenveil_foraging", ["g1", "g2"], createSeededRandom(44)); guild = advanceGuildDays(guild, 2);
    const id = guild.gatheringMissions[0]!.id; expect(resolveGatheringMission(guild, id)).toEqual(resolveGatheringMission(guild, id));
    const claimed = claimGatheringMission(guild, id);
    expect(claimed.guild.gatheringMissions[0]?.status).toBe("claimed");
    expect(claimed.guild.heroes.every((hero) => hero.isAvailable)).toBe(true);
  });

  it("can fail even after the required days while stronger teams improve quality", () => {
    const weakGuild = createGuild(); weakGuild.heroes = heroes().map((hero) => ({ ...hero, level: 1 })); weakGuild.world.unlockedRegionIds.push("shadowfen"); weakGuild.currentDay = 4;
    const failureMission: GatheringMissionInstance = { id: "failure", definitionId: "shadowfen_relic_search", heroIds: ["g1", "g2"], startDay: 1, completionDay: 4, resolutionSeed: 1, status: "active" };
    weakGuild.gatheringMissions = [failureMission];
    const findSeed = (wanted: number) => { for (let seed = 1; seed < 10000; seed++) if (createSeededRandom(seed).int(1, 20) === wanted) return seed; throw new Error("seed not found"); };
    failureMission.resolutionSeed = findSeed(1); expect(resolveGatheringMission(weakGuild, "failure").success).toBe(false);
    weakGuild.heroes = weakGuild.heroes.map((hero) => ({ ...hero, level: 10, baseAttributes: { strength: 20, dexterity: 20, constitution: 20, intelligence: 20, wisdom: 20, charisma: 20 } })); failureMission.resolutionSeed = findSeed(20);
    expect(resolveGatheringMission(weakGuild, "failure")).toMatchObject({ success: true, quality: "rare" });
  });
});
