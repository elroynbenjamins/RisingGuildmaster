import { describe, expect, it } from "vitest";
import { createGuild } from "../src/game/guild/guildService";
import { getPostBattleManagementActions, markPostBattleGuidanceSeen } from "../src/game/onboarding/postBattleGuidanceService";
import type { QuestHeroOutcomeRecord } from "../src/game/quests/questChronicleTypes";
import { testHero } from "./testHero";

function outcome(overrides: Partial<QuestHeroOutcomeRecord> = {}): QuestHeroOutcomeRecord {
  const hero = testHero();
  return { heroId: hero.id, name: hero.name, raceId: hero.raceId, classId: hero.classId, gender: hero.gender, portraitVariant: hero.portraitVariant ?? 0, levelBefore: 1, levelAfter: 2, currentHP: 50, maxHP: 100, conditionIds: ["injured"], availableSkillPoints: 1, fellInBattle: false, newlyInjured: true, ...overrides };
}

describe("post-battle management guidance", () => {
  it("offers only actions relevant to the persisted quest result", () => {
    const hero = { ...testHero(), currentHP: 50, conditions: [{ conditionId: "injured" as const, remainingDuration: 2 }], adventureStamina: 75 };
    const guild = { ...createGuild(), heroes: [hero], inventory: ["worn-sword"] };
    const actions = getPostBattleManagementActions({ lootIds: ["worn-sword"], heroOutcomes: [outcome()] }, guild);
    expect(actions.map((action) => action.id)).toEqual(["recovery", "skills", "equipment", "readiness"]);
    expect(actions.find((action) => action.id === "skills")?.heroId).toBe(hero.id);
    expect(actions.find((action) => action.id === "equipment")?.itemId).toBe("worn-sword");
  });

  it("does not recommend management when the party returned fully ready without rewards", () => {
    const hero = { ...testHero(), adventureStamina: 100 };
    const guild = { ...createGuild(), heroes: [hero] };
    const result = getPostBattleManagementActions({ lootIds: [], heroOutcomes: [outcome({ currentHP: 100, maxHP: 100, availableSkillPoints: 0, levelAfter: 1 })] }, guild);
    expect(result).toEqual([]);
  });

  it("removes the first-time badge without removing the useful action", () => {
    const guild = { ...createGuild(), inventory: ["worn-sword"] };
    const summary = { lootIds: ["worn-sword"], heroOutcomes: [] };
    expect(getPostBattleManagementActions(summary, guild)[0]?.isNew).toBe(true);
    const seen = markPostBattleGuidanceSeen(guild, "equipment");
    expect(getPostBattleManagementActions(summary, seen)[0]).toMatchObject({ id: "equipment", isNew: false });
  });
});
