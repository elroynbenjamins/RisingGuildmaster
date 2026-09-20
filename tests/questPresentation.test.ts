import { describe, expect, it } from "vitest";
import { QUESTS } from "../src/data/quests/quests";
import { createGuild } from "../src/game/guild/guildService";
import { createQuestChronicleEntry } from "../src/game/quests/questChronicleService";
import { getQuestContinuity, getQuestTypePresentation } from "../src/game/quests/questPresentationService";
import { testHero } from "./testHero";

function outcome(classId = testHero().classId) {
  const hero = { ...testHero(), classId };
  return {
    heroId: hero.id,
    name: hero.name,
    raceId: hero.raceId,
    classId: hero.classId,
    gender: hero.gender,
    portraitVariant: hero.portraitVariant ?? 0,
    levelBefore: 1,
    levelAfter: 1,
    currentHP: 180,
    maxHP: 212,
    conditionIds: [],
    availableSkillPoints: 0,
    fellInBattle: false,
    newlyInjured: false,
  };
}

describe("quest RPG presentation", () => {
  it("gives each quest category a distinct player-facing identity", () => {
    expect(getQuestTypePresentation(QUESTS.goblin_patrol!).badge).toBe("MAIN STORY");
    expect(getQuestTypePresentation(QUESTS.brambleway_caravan!).badge).toBe("LOCAL STORY");
    expect(getQuestTypePresentation(QUESTS.goblin_cave_hideout!).badge).toBe("GUILD WORK");
    expect(getQuestTypePresentation(QUESTS.goblin_chieftain_boss!).badge).toBe("MAJOR THREAT");
    expect(getQuestTypePresentation(QUESTS.goblin_patrol!).debriefLabel).toBe("CHAPTER AFTERMATH");
  });

  it("uses completed quest history to identify real returning story contacts", () => {
    const guild = createGuild();
    const first = createQuestChronicleEntry({
      quest: QUESTS.goblin_patrol!,
      status: "victory",
      day: 2,
      worldBefore: guild.world,
      worldAfter: guild.world,
      heroOutcomes: [outcome()],
    });
    guild.questChronicle = [first];
    const continuity = getQuestContinuity(guild, "missing_merchant");
    expect(continuity.previousBeat).toMatchObject({ questId: "goblin_patrol", day: 2 });
    expect(continuity.returningContacts).toEqual(expect.arrayContaining([
      expect.objectContaining({ speaker: "Registrar Mara Voss", previousQuestId: "goblin_patrol" }),
    ]));
  });

  it("tracks named side-story contacts across different quests", () => {
    const guild = createGuild();
    guild.questChronicle = [createQuestChronicleEntry({
      quest: QUESTS.missing_merchant!,
      status: "victory",
      day: 5,
      worldBefore: guild.world,
      worldAfter: guild.world,
      heroOutcomes: [outcome()],
    })];
    const continuity = getQuestContinuity(guild, "brambleway_caravan");
    expect(continuity.returningContacts).toEqual(expect.arrayContaining([
      expect.objectContaining({ speaker: "Aldren Vale", previousQuestId: "missing_merchant" }),
    ]));
  });

  it("gives ordinary hero aftermath moments class-specific RPG flavor", () => {
    const guild = createGuild();
    const warriorEntry = createQuestChronicleEntry({
      quest: QUESTS.goblin_patrol!,
      status: "victory",
      day: 2,
      worldBefore: guild.world,
      worldAfter: guild.world,
      heroOutcomes: [outcome("warrior")],
    });
    const rangerEntry = createQuestChronicleEntry({
      quest: QUESTS.goblin_patrol!,
      status: "victory",
      day: 3,
      worldBefore: guild.world,
      worldAfter: guild.world,
      heroOutcomes: [outcome("ranger")],
    });
    expect(warriorEntry.heroMoments[0]?.title).toBe("Anchored the field");
    expect(rangerEntry.heroMoments[0]?.title).toBe("Read the battlefield");
  });
});
