import { describe, expect, it } from "vitest";
import { QUESTS } from "../src/data/quests/quests";
import { createGuild } from "../src/game/guild/guildService";
import { commitQuestPartyToCombat } from "../src/game/quests/questCombatCommitService";
import type { Party } from "../src/game/party/partyTypes";
import { testHero } from "./testHero";

function hero(id: string) {
  return { ...testHero(), id, name: id, adventureStamina: 100 };
}

describe("quest combat commitment", () => {
  it("keeps party inspection provisional until the combat handoff", () => {
    const guild = createGuild();
    guild.heroes = [hero("one"), hero("two"), hero("three")];
    const party: Party = { id: "provisional-party", heroIds: ["one", "two", "three"] };
    const quest = QUESTS.brambleway_caravan!;

    expect(guild.heroes.map((entry) => entry.adventureStamina)).toEqual([100, 100, 100]);

    const committed = commitQuestPartyToCombat(guild, quest, party);
    expect(guild.heroes.map((entry) => entry.adventureStamina)).toEqual([100, 100, 100]);
    expect(committed.heroes.map((entry) => entry.adventureStamina)).toEqual([45, 45, 45]);
    expect(committed.recentPartyHeroIds).toEqual(party.heroIds);
  });

  it("applies provisional exploration conditions at the same atomic combat commit", () => {
    const guild = createGuild();
    guild.heroes = [hero("one"), hero("two"), hero("three")];
    const party: Party = { id: "exploration-party", heroIds: ["one", "two", "three"] };
    const quest = QUESTS.brambleway_caravan!;

    const committed = commitQuestPartyToCombat(guild, quest, party, [
      { heroId: "two", conditionId: "sprained_ankle" },
    ]);

    expect(guild.heroes[1]!.conditions).toEqual([]);
    expect(committed.heroes[1]!.conditions).toEqual([
      expect.objectContaining({ conditionId: "sprained_ankle" }),
    ]);
    expect(committed.heroes[0]!.conditions).toEqual([]);
    expect(committed.heroes[2]!.conditions).toEqual([]);
  });

  it("rejects pending exploration effects that target someone outside the selected party", () => {
    const guild = createGuild();
    guild.heroes = [hero("one"), hero("two"), hero("three"), hero("reserve")];
    const party: Party = { id: "three-hero-party", heroIds: ["one", "two", "three"] };

    expect(() => commitQuestPartyToCombat(guild, QUESTS.brambleway_caravan!, party, [
      { heroId: "reserve", conditionId: "injured" },
    ])).toThrow(/outside the selected party/i);
  });
});
