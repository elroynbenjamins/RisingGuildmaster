import { describe, expect, it } from "vitest";
import { QUESTS } from "../src/data/quests/quests";
import { createGuild } from "../src/game/guild/guildService";
import { createQuestChronicleEntry, recordQuestChronicle } from "../src/game/quests/questChronicleService";
import { deserializeGuild, serializeGuild } from "../src/game/save/saveService";
import { testHero } from "./testHero";

function outcome(overrides: Partial<Parameters<typeof createQuestChronicleEntry>[0]["heroOutcomes"][number]> = {}) {
  const hero = testHero();
  return { heroId: hero.id, name: hero.name, raceId: hero.raceId, classId: hero.classId, gender: hero.gender, portraitVariant: hero.portraitVariant ?? 0, levelBefore: 1, levelAfter: 1, currentHP: 100, maxHP: 212, conditionIds: [], availableSkillPoints: 0, fellInBattle: false, newlyInjured: false, ...overrides };
}

describe("quest chronicle", () => {
  it("records authored and mechanical consequences plus newly discovered lore", () => {
    const guild = createGuild();
    const worldAfter = { ...guild.world, completedQuestIds: ["goblin_patrol"], worldFlags: { ...guild.world.worldFlags, lore_wardstones: true, patrol_road_safe: true } };
    const entry = createQuestChronicleEntry({ quest: QUESTS.goblin_patrol!, status: "victory", day: 3, worldBefore: guild.world, worldAfter, heroOutcomes: [outcome({ levelAfter: 2 })] });
    expect(entry.consequences.map((item) => item.id)).toEqual(expect.arrayContaining(["authored-0", "quest-completed", "flag-patrol_road_safe"]));
    expect(entry.loreDiscoveries.map((item) => item.id)).toEqual(expect.arrayContaining(["wardstones", "field-note-goblin_patrol"]));
    expect(entry.heroMoments[0]).toMatchObject({ title: "Rose to Level 2", tone: "positive" });
  });

  it("persists the chronicle and appends hero moments to hero history", () => {
    const guild = createGuild(); guild.heroes = [testHero()];
    const entry = createQuestChronicleEntry({ quest: QUESTS.goblin_patrol!, status: "defeat", day: 4, worldBefore: guild.world, worldAfter: guild.world, heroOutcomes: [outcome({ currentHP: 0, fellInBattle: true, newlyInjured: true })] });
    const recorded = recordQuestChronicle(guild, entry);
    expect(recorded.questChronicle).toHaveLength(1);
    expect(recorded.heroes[0]?.history.events.at(-1)).toMatchObject({ title: "Fell in the line of duty", tags: ["hero_moment", "defeat"] });
    expect(deserializeGuild(serializeGuild(recorded)).questChronicle[0]?.heroMoments[0]?.heroId).toBe("hero-test");
  });

  it("migrates old saves without a chronicle", () => {
    const legacy = JSON.parse(serializeGuild(createGuild())); delete legacy.questChronicle;
    expect(deserializeGuild(JSON.stringify(legacy)).questChronicle).toEqual([]);
  });
});
