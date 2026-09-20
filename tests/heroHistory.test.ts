import { describe, expect, it } from "vitest";
import { appendHeroHistoryEvent, migrateHeroHistory, recordQuestHistory } from "../src/game/heroes/heroHistoryService";
import { testHero } from "./testHero";

describe("hero history", () => {
  it("records stable, serializable timeline events", () => {
    const hero = appendHeroHistoryEvent(testHero(), { day: 3, type: "recruitment", outcome: "positive", title: "Joined the guild", description: "Signed the guild charter." });
    expect(hero.history.events[0]).toMatchObject({ id: "hero-test:3:recruitment:joined-the-guild:0", day: 3, type: "recruitment", outcome: "positive" });
    expect(JSON.parse(JSON.stringify(hero.history.events))).toEqual(hero.history.events);
  });

  it("records quest victories, injuries, and level gains as separate deeds", () => {
    const hero = recordQuestHistory({ ...testHero(), level: 2 }, { day: 8, questId: "goblin_patrol", questName: "Goblin Patrol", victory: true, xpEarned: 1000, fellInBattle: false, newlyInjured: true, previousLevel: 1 });
    expect(hero.history.questsCompleted).toBe(1);
    expect(hero.history.events.map((event) => event.type)).toEqual(["quest", "level_up", "injury"]);
    expect(hero.history.events[0]).toMatchObject({ questId: "goblin_patrol", outcome: "positive" });
  });

  it("migrates legacy important-event strings into the timeline", () => {
    const migrated = migrateHeroHistory({ questsCompleted: 2, enemiesDefeated: 4, achievements: [], importantEvents: ["Joined the guild on Day 5."] }, "legacy-hero");
    expect(migrated.events[0]).toMatchObject({ day: 5, type: "recruitment", tags: ["legacy"] });
    expect(migrated.questsCompleted).toBe(2);
  });
});
