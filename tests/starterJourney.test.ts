import { describe, expect, it } from "vitest";
import { createGuild } from "../src/game/guild/guildService";
import { markFourthHeroReady, needsBramblefordSideQuest, needsFourthHeroForChieftain, needsStarterJourneyTravel, needsStarterRoadEncounter, needsThirdHeroForJourney, starterBramblewayEvent } from "../src/game/onboarding/starterJourneyService";
import { testHero } from "./testHero";

const hero = (id: string) => ({ ...testHero(), id, name: id });
const atCompanyTrial = () => {
  const guild = createGuild();
  guild.world.completedCampaignNodeIds = ["attack_on_guildhaven"];
  return guild;
};

describe("starter Brambleford journey continuity", () => {
  it("separates recruitment, travel, road encounter, side quest, and fourth-hero stages", () => {
    const guild = atCompanyTrial();
    guild.heroes = [hero("one"), hero("two")];
    expect(needsThirdHeroForJourney(guild)).toBe(true);

    guild.heroes.push(hero("three"));
    expect(needsStarterJourneyTravel(guild)).toBe(true);
    expect(needsStarterRoadEncounter(guild)).toBe(false);

    guild.world.currentSettlementId = "brambleford";
    expect(needsStarterJourneyTravel(guild)).toBe(false);
    expect(needsStarterRoadEncounter(guild)).toBe(true);

    guild.world.worldFlags.starter_brambleway_road_ambush_complete = true;
    expect(needsStarterRoadEncounter(guild)).toBe(false);
    expect(needsBramblefordSideQuest(guild)).toBe(true);

    guild.world.worldFlags.starter_brambleford_side_quest_complete = true;
    expect(needsFourthHeroForChieftain(guild)).toBe(true);
    guild.heroes.push(hero("four"));
    expect(markFourthHeroReady(guild).world.worldFlags.starter_fourth_hero_ready).toBe(true);
  });

  it("keeps the interrupted road encounter recoverable", () => {
    const event = starterBramblewayEvent();
    expect(event.choices[0]).toMatchObject({ questId: "brambleway_road_ambush" });
  });
});
