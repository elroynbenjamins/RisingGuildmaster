import { describe, expect, it } from "vitest";
import { DUNGEON_NODES } from "../src/data/dungeons/dungeons";
import { beginDungeonCombatCheckpoint, beginDungeonExpedition, checkpointDungeonCombat, getDungeonCombatSetup, resolveDungeonCombat, resolveDungeonUtilityNode } from "../src/game/dungeons/dungeonRunService";
import { chooseDungeonNode } from "../src/game/dungeons/dungeonService";
import { createGuild } from "../src/game/guild/guildService";
import { generateHero } from "../src/game/heroes/heroGenerator";
import { createSeededRandom } from "../src/utils/random";
import { sequenceRandom } from "./combatTestUtils";
import { ENEMIES } from "../src/data/enemies";
import { createCombatState } from "../src/game/combat/combatEngine";
import { EQUIPMENT } from "../src/data/equipment/equipment";
import { RECRUITMENT_FIELD_GEAR_IDS } from "../src/data/equipment/equipmentBalanceExpansion";

function expeditionGuild() { const guild = createGuild(); const heroes = Array.from({ length: 8 }, (_, index) => generateHero(createSeededRandom(11 + index))).map((hero, index) => ({ ...hero, id: `dungeon-hero-${index}`, level: 6 })); return { ...guild, heroes, discoveredEnemyIds: Object.keys(ENEMIES), world: { ...guild.world, completedCampaignNodeIds: ["broken_wardstone"] }, rogueliteRotation: { ...guild.rogueliteRotation, offeredDungeonIds: ["wardstone_depths", "thornwood_trials", "temple_of_coils"] } }; }
const partyIds = (guild: ReturnType<typeof expeditionGuild>) => guild.heroes.slice(0, 4).map((hero) => hero.id);

describe("playable dungeon run integration", () => {
  it("starts one serializable run with carried resources and pre-rolled encounters", () => { const base = expeditionGuild(); const guild = beginDungeonExpedition(base, "wardstone_depths", partyIds(base), ["brutal_host"], createSeededRandom(4)); expect(guild.activeDungeonRun).toMatchObject({ currentNodeId: "depths_start", status: "active", selectedModifierIds: ["brutal_host"] }); expect(guild.activeDungeonRun?.heroInstances).toHaveLength(4); expect(Object.keys(guild.activeDungeonRun?.selectedEncounterIds ?? {})).toHaveLength(4); expect(guild.activeRogueliteRun?.id).toBe(guild.activeDungeonRun?.id); expect(() => JSON.parse(JSON.stringify(guild.activeDungeonRun))).not.toThrow(); });
  it("resolves the opening D20 event before allowing a branch", () => { const base = expeditionGuild(); let guild = beginDungeonExpedition(base, "wardstone_depths", partyIds(base)); expect(() => chooseDungeonNode(guild.activeDungeonRun!, "depths_elite")).toThrow("not connected"); guild = resolveDungeonUtilityNode(guild, sequenceRandom([.99])).guild; expect(guild.activeDungeonRun?.resolvedNodeIds).toContain("depths_start"); expect(guild.gold).toBe(base.gold + DUNGEON_NODES.depths_start!.successGoldReward!); guild = { ...guild, activeDungeonRun: chooseDungeonNode(guild.activeDungeonRun!, "depths_elite") }; expect(guild.activeDungeonRun?.currentNodeId).toBe("depths_elite"); });
  it("combines theme and run modifiers and awards at most one elite recipe", () => { const base = expeditionGuild(); let guild = beginDungeonExpedition(base, "wardstone_depths", partyIds(base), ["brutal_host", "withered_grace"]); guild = resolveDungeonUtilityNode(guild, sequenceRandom([.99])).guild; guild = { ...guild, activeDungeonRun: chooseDungeonNode(guild.activeDungeonRun!, "depths_elite") }; expect(getDungeonCombatSetup(guild)).toMatchObject({ enemyPhysicalDamageModifier: .15, enemyDamageModifier: .15, heroHealingPowerModifier: -.35 }); const instances = guild.activeDungeonRun!.heroInstances; const result = resolveDungeonCombat(guild, "victory", instances, sequenceRandom([0, 0])); guild = result.guild; expect(result.goldDelta).toBe(104); expect(result.recipeId).not.toBeNull(); expect(guild.activeDungeonRun?.recipeIdsUnlocked).toHaveLength(1); expect(guild.activeDungeonRun?.status).toBe("active"); });
  it("checkpoints and resumes an exact tactical dungeon battle until the room resolves", () => {
    const base = expeditionGuild();
    let guild = beginDungeonExpedition(base, "wardstone_depths", partyIds(base));
    guild = resolveDungeonUtilityNode(guild, sequenceRandom([.99])).guild;
    guild = { ...guild, activeDungeonRun: chooseDungeonNode(guild.activeDungeonRun!, "depths_elite") };

    const seed = 424242;
    guild = beginDungeonCombatCheckpoint(guild, seed);
    expect(guild.activeDungeonRun).toMatchObject({ combatState: null, combatRandomState: seed });

    const random = createSeededRandom(seed);
    const heroes = guild.heroes.filter((hero) => guild.activeDungeonRun!.partyHeroIds.includes(hero.id));
    const state = createCombatState("wardstone_depths_expedition", 0, heroes, random, guild.activeDungeonRun!.heroInstances, getDungeonCombatSetup(guild), guild.relationships, guild.difficultyId);
    guild = checkpointDungeonCombat(guild, { ...state, combatStarted: true, turn: 3, round: 2 }, random.getState());

    expect(guild.activeDungeonRun?.combatState).toMatchObject({ questId: "wardstone_depths_expedition", combatStarted: true, turn: 3, round: 2 });
    expect(guild.activeDungeonRun?.combatRandomState).toBe(random.getState());

    const result = resolveDungeonCombat(guild, "victory", guild.activeDungeonRun!.heroInstances, sequenceRandom([0, 0]));
    expect(result.guild.activeDungeonRun?.combatState).toBeNull();
    expect(result.guild.activeDungeonRun?.combatRandomState).toBeNull();
  });

  it("awards fallen expedition heroes reduced catch-up XP instead of zero XP", () => {
    const base = expeditionGuild();
    let guild = beginDungeonExpedition(base, "wardstone_depths", partyIds(base));
    guild = resolveDungeonUtilityNode(guild, sequenceRandom([.99])).guild;
    guild = { ...guild, activeDungeonRun: chooseDungeonNode(guild.activeDungeonRun!, "depths_elite") };

    const before = new Map(guild.heroes.map((hero) => [hero.id, hero.xp]));
    const fallenId = guild.activeDungeonRun!.partyHeroIds[0]!;
    const instances = guild.activeDungeonRun!.heroInstances.map((instance) =>
      instance.heroId === fallenId ? { ...instance, currentHP: 0, isAlive: false } : instance,
    );
    const result = resolveDungeonCombat(guild, "victory", instances, sequenceRandom([0, 0]));
    const roomXp = result.guild.activeDungeonRun!.xpEarnedPerHero;
    const fallen = result.guild.heroes.find((hero) => hero.id === fallenId)!;
    const survivorId = guild.activeDungeonRun!.partyHeroIds[1]!;
    const survivor = result.guild.heroes.find((hero) => hero.id === survivorId)!;

    expect(fallen.xp - (before.get(fallenId) ?? 0)).toBe(Math.round(roomXp * .85));
    expect(survivor.xp - (before.get(survivorId) ?? 0)).toBe(roomXp);
    expect(fallen.isAvailable).toBe(false);
  });

  it("prioritizes a Level-11 primary weapon for a badly behind Level-12 party", () => {
    const classes = ["ranger", "mage", "cleric", "bard"] as const;
    const currentArmor = ["galewing-mantle", "galewing-mantle", "galewing-mantle", "resonant-fieldcoat"] as const;
    const base = createGuild();
    const partyHeroes = classes.map((classId, index) => {
      const hero = generateHero(createSeededRandom(2_000 + index), { classId });
      return { ...hero, id: `ch7-catchup-hero-${index}`, level: 12, equipment: { ...hero.equipment, armor: currentArmor[index]! } };
    });
    const reserves = [
      { ...generateHero(createSeededRandom(2_090), { classId: "warrior" }), id: "ch7-catchup-reserve-1" },
      { ...generateHero(createSeededRandom(2_091), { classId: "berserker" }), id: "ch7-catchup-reserve-2" },
    ];
    let guild: ReturnType<typeof createGuild> = {
      ...base,
      heroes: [...partyHeroes, ...reserves],
      discoveredEnemyIds: Object.keys(ENEMIES),
      world: { ...base.world, completedCampaignNodeIds: ["broken_wardstone"] },
      rogueliteRotation: { ...base.rogueliteRotation, offeredDungeonIds: ["wardstone_depths", "thornwood_trials", "temple_of_coils"] },
    };
    guild = beginDungeonExpedition(guild, "wardstone_depths", partyHeroes.map((hero) => hero.id));
    const run = guild.activeDungeonRun!;
    guild = {
      ...guild,
      activeDungeonRun: { ...run, currentNodeId: "depths_boss" },
      activeRogueliteRun: { ...guild.activeRogueliteRun!, bossRecipeAwarded: true },
    };

    const result = resolveDungeonCombat(guild, "victory", guild.activeDungeonRun!.heroInstances, sequenceRandom([.99, 0]));
    const awardedIds = result.guild.activeDungeonRun?.gearIdsAwarded ?? [];
    const awarded = EQUIPMENT[awardedIds[awardedIds.length - 1]!]!;

    expect(awarded.id.startsWith("wayfarers-")).toBe(true);
    expect(awarded.slot).toBe("weapon");
    expect(awarded.levelRequirement).toBe(11);
    expect(awarded.rarity).toBe("rare");
  });

  it("prioritizes a primary weapon when a Level-15 party is badly behind", () => {
    const classes = ["ranger", "mage", "cleric", "bard"] as const;
    const base = createGuild();
    const partyHeroes = classes.map((classId, index) => {
      const hero = generateHero(createSeededRandom(2_100 + index), { classId });
      return { ...hero, id: `catchup-hero-${index}`, level: 15, equipment: { ...hero.equipment, armor: "deadletter-coat" } };
    });
    const reserves = [
      { ...generateHero(createSeededRandom(2_190), { classId: "warrior" }), id: "catchup-reserve-1" },
      { ...generateHero(createSeededRandom(2_191), { classId: "berserker" }), id: "catchup-reserve-2" },
    ];
    let guild: ReturnType<typeof createGuild> = {
      ...base,
      heroes: [...partyHeroes, ...reserves],
      discoveredEnemyIds: Object.keys(ENEMIES),
      world: { ...base.world, completedCampaignNodeIds: ["broken_wardstone"] },
      rogueliteRotation: { ...base.rogueliteRotation, offeredDungeonIds: ["wardstone_depths", "thornwood_trials", "temple_of_coils"] },
    };
    guild = beginDungeonExpedition(guild, "wardstone_depths", partyHeroes.map((hero) => hero.id));
    const run = guild.activeDungeonRun!;
    guild = {
      ...guild,
      activeDungeonRun: { ...run, currentNodeId: "depths_boss" },
      activeRogueliteRun: { ...guild.activeRogueliteRun!, bossRecipeAwarded: true },
    };

    const result = resolveDungeonCombat(guild, "victory", guild.activeDungeonRun!.heroInstances, sequenceRandom([.99, 0]));
    const awardedIds = result.guild.activeDungeonRun?.gearIdsAwarded ?? [];
    const awarded = EQUIPMENT[awardedIds[awardedIds.length - 1]!]!;

    expect(awarded.id.startsWith("delvers-")).toBe(true);
    expect(awarded.slot).toBe("weapon");
    expect(awarded.levelRequirement).toBe(14);
    expect(awarded.rarity).toBe("rare");
  });

  it("prioritizes a Level-16 primary weapon for a badly behind Level-17 party", () => {
    const classes = ["ranger", "mage", "cleric", "bard"] as const;
    const base = createGuild();
    const partyHeroes = classes.map((classId, index) => {
      const hero = generateHero(createSeededRandom(2_200 + index), { classId });
      return { ...hero, id: `ch9-catchup-hero-${index}`, level: 17, equipment: { ...hero.equipment, armor: "last-call-mantle" } };
    });
    const reserves = [
      { ...generateHero(createSeededRandom(2_290), { classId: "warrior" }), id: "ch9-catchup-reserve-1" },
      { ...generateHero(createSeededRandom(2_291), { classId: "berserker" }), id: "ch9-catchup-reserve-2" },
    ];
    let guild: ReturnType<typeof createGuild> = {
      ...base,
      heroes: [...partyHeroes, ...reserves],
      discoveredEnemyIds: Object.keys(ENEMIES),
      world: { ...base.world, completedCampaignNodeIds: ["broken_wardstone"] },
      rogueliteRotation: { ...base.rogueliteRotation, offeredDungeonIds: ["wardstone_depths", "thornwood_trials", "temple_of_coils"] },
    };
    guild = beginDungeonExpedition(guild, "wardstone_depths", partyHeroes.map((hero) => hero.id));
    const run = guild.activeDungeonRun!;
    guild = {
      ...guild,
      activeDungeonRun: { ...run, currentNodeId: "depths_boss" },
      activeRogueliteRun: { ...guild.activeRogueliteRun!, bossRecipeAwarded: true },
    };

    const result = resolveDungeonCombat(guild, "victory", guild.activeDungeonRun!.heroInstances, sequenceRandom([.99, 0]));
    const awardedIds = result.guild.activeDungeonRun?.gearIdsAwarded ?? [];
    const awarded = EQUIPMENT[awardedIds[awardedIds.length - 1]!]!;

    expect(awarded.id.startsWith("deepward-")).toBe(true);
    expect(awarded.slot).toBe("weapon");
    expect(awarded.levelRequirement).toBe(16);
    expect(awarded.rarity).toBe("rare");
  });

  it("does not award recruit-issued fieldcoats from expedition caches", () => {
    const classes = ["warrior", "ranger", "mage", "cleric"] as const;
    const weapons = ["delvers-longsword", "delvers-longbow", "delvers-crozier", "delvers-crozier"] as const;
    const base = createGuild();
    const partyHeroes = classes.map((classId, index) => {
      const hero = generateHero(createSeededRandom(2_300 + index), { classId });
      return {
        ...hero,
        id: `armor-catchup-hero-${index}`,
        level: 15,
        equipment: { ...hero.equipment, weapon: weapons[index]!, armor: "cinderroad-fieldcoat" },
      };
    });
    const reserves = [
      { ...generateHero(createSeededRandom(2_390), { classId: "warrior" }), id: "armor-catchup-reserve-1" },
      { ...generateHero(createSeededRandom(2_391), { classId: "berserker" }), id: "armor-catchup-reserve-2" },
    ];
    let guild: ReturnType<typeof createGuild> = {
      ...base,
      heroes: [...partyHeroes, ...reserves],
      discoveredEnemyIds: Object.keys(ENEMIES),
      world: { ...base.world, completedCampaignNodeIds: ["broken_wardstone"] },
      rogueliteRotation: { ...base.rogueliteRotation, offeredDungeonIds: ["wardstone_depths", "thornwood_trials", "temple_of_coils"] },
    };
    guild = beginDungeonExpedition(guild, "wardstone_depths", partyHeroes.map((hero) => hero.id));
    const run = guild.activeDungeonRun!;
    guild = {
      ...guild,
      activeDungeonRun: { ...run, currentNodeId: "depths_boss" },
      activeRogueliteRun: { ...guild.activeRogueliteRun!, bossRecipeAwarded: true },
    };

    const result = resolveDungeonCombat(guild, "victory", guild.activeDungeonRun!.heroInstances, sequenceRandom([.99, 0]));
    const awardedIds = result.guild.activeDungeonRun?.gearIdsAwarded ?? [];
    const awarded = EQUIPMENT[awardedIds[awardedIds.length - 1]!]!;

    expect(awarded.slot).toBe("armor");
    expect(RECRUITMENT_FIELD_GEAR_IDS.has(awarded.id)).toBe(false);
  });

  it("persists defeat instead of treating entry into a boss room as victory", () => { const base = expeditionGuild(); let guild = beginDungeonExpedition(base, "wardstone_depths", partyIds(base)); const run = guild.activeDungeonRun!; guild = { ...guild, activeDungeonRun: { ...run, currentNodeId: "depths_boss" } }; const result = resolveDungeonCombat(guild, "defeat", run.heroInstances.map((instance) => ({ ...instance, currentHP: 0, isAlive: false })), sequenceRandom([0])); expect(result.guild.activeDungeonRun?.status).toBe("defeat"); expect(result.guild.activeDungeonRun?.resolvedNodeIds).not.toContain("depths_boss"); });
});
