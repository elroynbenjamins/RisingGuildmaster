import { describe, expect, it } from "vitest";
import { DIFFICULTIES } from "../src/data/difficulty/difficulties";
import { createGuild } from "../src/game/guild/guildService";
import { advanceGuildTime } from "../src/game/economy/guildCalendarService";
import { createQuestEncounter } from "../src/game/quests/encounterFactory";
import { freeRefreshRecruitment, initializeRecruitment, manualRefreshRecruitment } from "../src/game/recruitment/recruitmentService";
import { selectTacticalTarget } from "../src/game/combat/tacticalAiService";
import { combatUnit, sequenceRandom } from "./combatTestUtils";
import { deserializeGuild, serializeGuild } from "../src/game/save/saveService";

describe("game difficulty", () => {
  it("keeps Standard at intended balance and progressively scales enemies", () => {
    const standard = createQuestEncounter("goblin_patrol_encounter", sequenceRandom([.1]), "standard")[0]!;
    const veteran = createQuestEncounter("goblin_patrol_encounter", sequenceRandom([.1]), "veteran")[0]!;
    const iron = createQuestEncounter("goblin_patrol_encounter", sequenceRandom([.1]), "iron_guild")[0]!;
    expect(veteran.unit.maxHP).toBeGreaterThan(standard.unit.maxHP);
    expect(veteran.unit.stats.physicalDamage).toBeGreaterThan(standard.unit.stats.physicalDamage);
    expect(iron.unit.maxHP).toBeGreaterThan(veteran.unit.maxHP);
    expect(iron.unit.stats.physicalAttackBonus - standard.unit.stats.physicalAttackBonus).toBe(2);
    expect(iron.unit.stats.armorClass).toBeGreaterThan(standard.unit.stats.armorClass);
  });

  it("makes higher AI tiers focus a vulnerable hero", () => {
    const actor = combatUnit("enemy", "enemies", { position: { x: 3, y: 2 } });
    const nearest = combatUnit("nearest", "heroes", { position: { x: 2, y: 2 }, currentHP: 100 });
    const wounded = combatUnit("wounded", "heroes", { position: { x: 7, y: 2 }, currentHP: 20 });
    const behavior = { preferredRange: 1, targetPriority: "nearest" as const };
    expect(selectTacticalTarget(actor, [nearest, wounded], behavior, sequenceRandom([0]), "trained")?.combatantId).toBe("nearest");
    expect(selectTacticalTarget(actor, [nearest, wounded], behavior, sequenceRandom([0]), "ruthless")?.combatantId).toBe("wounded");
  });

  it("tightens passive income by difficulty", () => {
    const standard = advanceGuildTime(createGuild("Standard", "standard")).days[0]!;
    const veteran = advanceGuildTime(createGuild("Veteran", "veteran")).days[0]!;
    const iron = advanceGuildTime(createGuild("Iron", "iron_guild")).days[0]!;
    expect(standard.events.find((event) => event.type === "tavern_income")?.amount).toBe(50);
    expect(veteran.events.find((event) => event.type === "tavern_income")?.amount).toBe(43);
    expect(iron.events.find((event) => event.type === "tavern_income")?.amount).toBe(35);
  });

  it("blocks paid Iron Guild refreshes but permits scheduled free refreshes", () => {
    const random = sequenceRandom([.1]);
    const guild = initializeRecruitment(createGuild("Iron", "iron_guild"), random);
    expect(() => manualRefreshRecruitment(guild, random)).toThrow(/Iron Guild/);
    const ready = { ...guild, currentDay: guild.recruitment.nextFreeRefreshDay };
    expect(freeRefreshRecruitment(ready, random).recruitment.candidates).toHaveLength(3);
  });

  it("migrates older saves to Standard", () => {
    const old = JSON.parse(serializeGuild(createGuild())) as Record<string, unknown>;
    delete old.difficultyId;
    expect(deserializeGuild(JSON.stringify(old)).difficultyId).toBe("standard");
  });

  it("defines the promised difficulty identities", () => {
    expect(DIFFICULTIES.standard.enemyAiLevel).toBe("trained");
    expect(DIFFICULTIES.veteran.enemyAiLevel).toBe("tactical");
    expect(DIFFICULTIES.iron_guild).toMatchObject({ enemyAiLevel: "ruthless", allowsPaidRecruitmentRefresh: false });
  });
});
