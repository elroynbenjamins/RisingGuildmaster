import { describe, expect, it } from "vitest";
import { HERO_NAME_POOLS } from "../src/data/heroes/heroNames";
import { HERO_SKILLS } from "../src/data/skills/heroSkills";
import { LORE_ENTRIES } from "../src/data/world/lore";
import { createHeroCombatInstance, createHeroCombatUnit } from "../src/game/combat/heroCombatFactory";
import { resolveHeroAction } from "../src/game/combat/heroActionService";
import { createGuild } from "../src/game/guild/guildService";
import { deserializeGuild, serializeGuild } from "../src/game/save/saveService";
import { testHero } from "./testHero";

describe("new class and race quality pass", () => {
  it("gives both story races full-sized gendered name pools", () => {
    for (const raceId of ["stoneborn", "veilborn"] as const) {
      expect(HERO_NAME_POOLS[raceId].givenNames.female).toHaveLength(24);
      expect(HERO_NAME_POOLS[raceId].givenNames.male).toHaveLength(24);
      expect(HERO_NAME_POOLS[raceId].familyNames).toHaveLength(20);
    }
  });

  it("binds summon runtime state without creating a second board unit", () => {
    const hero = { ...testHero(), classId: "summoner" as const, learnedSkillIds: ["summoner_call_wisp"] };
    const instance = createHeroCombatInstance(hero);
    const actor = createHeroCombatUnit(hero, instance);
    const result = resolveHeroAction(hero, instance, actor, [actor], "summoner_call_wisp", { next: () => .5, int: (min) => min, pick: <T>(values: readonly T[]) => values[0]! });
    expect(result.instance.activeCompanion).toMatchObject({ id: "bound_wisp", sourceSkillId: "summoner_call_wisp" });
    expect(result.instance.activeCompanion!.maxHP).toBe(Math.round(instance.maxHP * HERO_SKILLS.summoner_call_wisp!.companion!.hpMultiplier));
    expect(result.instance.activeCompanion).toMatchObject({ damageType: "magic", remainingTurns: 4 });
    expect(result.instance.activeCompanion!.damagePerTurn).toBe(Math.round(actor.stats.magicDamage * .30));
  });

  it("migrates completed story quests into race entitlements", () => {
    const guild = createGuild();
    guild.world.completedQuestIds.push("kharum_seventh_bell", "archive_below");
    const loaded = deserializeGuild(serializeGuild(guild));
    expect(loaded.entitlements.unlockedRaceIds).toEqual(expect.arrayContaining(["stoneborn", "veilborn"]));
  });

  it("provides discoverable lore for both story peoples", () => {
    expect(LORE_ENTRIES.stoneborn_awakened?.unlockFlag).toBe("lore_stoneborn_awakened");
    expect(LORE_ENTRIES.veilborn_archive?.unlockFlag).toBe("lore_veilborn_archive");
  });
});
