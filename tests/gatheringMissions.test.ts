import { describe, expect, it } from "vitest";
import { createGuild } from "../src/game/guild/guildService";
import { IDLE_MISSION_UNLOCK_HERO_COUNT, advanceGuildDays, calculateGatheringModifier, claimGatheringMission, getIdleMissionLevelProgressXp, resolveGatheringMission, startGatheringMission } from "../src/game/gathering/gatheringService";
import type { GatheringMissionInstance } from "../src/game/gathering/gatheringTypes";
import { createSeededRandom } from "../src/utils/random";
import { sequenceRandom } from "./combatTestUtils";
import { testHero } from "./testHero";

const heroes = () => Array.from({ length: IDLE_MISSION_UNLOCK_HERO_COUNT }, (_, index) => ({ ...testHero(), id: `g${index + 1}`, name: `Gatherer ${index + 1}`, level: 3 }));
describe("persistent two-hero gathering missions", () => {
  it("stays locked until the guild owns six heroes", () => {
    const guild=createGuild(); guild.heroes=heroes().slice(0,5);
    expect(()=>startGatheringMission(guild,"guildhaven_salvage",["g1","g2"],sequenceRandom([0,0]))).toThrow("unlock at 6 owned heroes");
  });

  it("still allows a legacy pre-gate mission to be claimed below six heroes", () => {
    const guild=createGuild();
    guild.heroes=heroes().slice(0,2).map((hero)=>({...hero,isAvailable:false}));
    guild.currentDay=3;
    guild.gatheringMissions=[{id:"legacy-gather",definitionId:"greenveil_foraging",heroIds:["g1","g2"],startDay:1,completionDay:3,resolutionSeed:44,status:"active"}];
    const claimed=claimGatheringMission(guild,"legacy-gather");
    expect(claimed.guild.gatheringMissions[0]?.status).toBe("claimed");
    expect(claimed.guild.heroes.every((hero)=>hero.isAvailable)).toBe(true);
  });

  it("requires exactly two distinct available heroes and locks them for multiple days", () => {
    const guild = createGuild(); guild.heroes = heroes();
    expect(() => startGatheringMission(guild, "greenveil_foraging", ["g1"], sequenceRandom([0, 0]))).toThrow("exactly two");
    const started = startGatheringMission(guild, "greenveil_foraging", ["g1", "g2"], sequenceRandom([0, 0]));
    expect(started.gatheringMissions[0]).toMatchObject({ heroIds: ["g1", "g2"], startDay: 1, completionDay: 3, status: "active" });
    expect(started.heroes.filter((hero) => ["g1","g2"].includes(hero.id)).every((hero) => !hero.isAvailable)).toBe(true);
    expect(started.heroes.filter((hero) => !["g1","g2"].includes(hero.id)).every((hero) => hero.isAvailable)).toBe(true);
    expect(() => resolveGatheringMission(started, started.gatheringMissions[0]!.id)).toThrow("not complete");
  });

  it("uses both hero attributes and level in the D20 modifier", () => {
    const low = heroes().slice(0,2) as [ReturnType<typeof heroes>[number], ReturnType<typeof heroes>[number]];
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

  it("adds five percent of next-level XP when an idle mission is claimed", () => {
    let guild = createGuild(); guild.heroes = heroes(); guild = startGatheringMission(guild, "greenveil_foraging", ["g1", "g2"], createSeededRandom(44)); guild = advanceGuildDays(guild, 2);
    const id = guild.gatheringMissions[0]!.id; const resolved = resolveGatheringMission(guild, id); const beforeXp = guild.heroes[0]!.xp;
    const claimed = claimGatheringMission(guild, id);
    expect(claimed.guild.heroes[0]!.xp - beforeXp).toBe(resolved.xpPerHero + getIdleMissionLevelProgressXp(3));
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
