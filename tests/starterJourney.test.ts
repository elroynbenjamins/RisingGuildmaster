import { describe, expect, it } from "vitest";
import { createGuild } from "../src/game/guild/guildService";
import { getStarterJourneyStep, markFourthHeroReady, needsBramblefordSideQuest, needsFourthHeroForChieftain, needsStarterJourneyTravel, needsStarterRoadEncounter, needsThirdHeroForJourney, starterBramblewayEvent } from "../src/game/onboarding/starterJourneyService";
import { testHero } from "./testHero";
import { visitSettlementWithEvent } from "../src/game/world/travelService";
import { createSeededRandom } from "../src/utils/random";
import { QUESTS } from "../src/data/quests/quests";
import { getQuestStartBlocker } from "../src/game/quests/questAvailability";
import { getAvailableCampaignNodes } from "../src/game/campaign/campaignService";
import { initializeRecruitment } from "../src/game/recruitment/recruitmentService";

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

  it("guides each company-trial stage with one explicit next order", () => {
    const guild = atCompanyTrial();
    guild.heroes = [hero("one"), hero("two")];
    expect(getStarterJourneyStep(guild)).toMatchObject({ id: "recruit_third", destination: "recruitment" });

    guild.heroes.push(hero("three"));
    expect(getStarterJourneyStep(guild)).toMatchObject({ id: "travel_brambleford", destination: "world", actionLabel: "OPEN BRAMBLEFORD" });

    guild.world.currentSettlementId = "brambleford";
    expect(getStarterJourneyStep(guild)).toMatchObject({ id: "road_ambush", destination: "world", actionLabel: "RETURN TO BRAMBLEFORD" });

    guild.world.worldFlags.starter_brambleway_road_ambush_complete = true;
    expect(getStarterJourneyStep(guild)).toMatchObject({ id: "brambleway_run", destination: "sideQuests", actionLabel: "VIEW BRAMBLEWAY QUEST" });

    guild.world.worldFlags.starter_brambleford_side_quest_complete = true;
    expect(getStarterJourneyStep(guild)).toMatchObject({ id: "recruit_fourth", destination: "recruitment" });
  });

  it("guarantees the Brambleway alarm when the company first reaches Brambleford", () => {
    const guild = atCompanyTrial();
    guild.heroes = [hero("one"), hero("two"), hero("three")];
    const result = visitSettlementWithEvent(guild, "brambleford", 3, createSeededRandom(7));
    expect(result.guild.world.currentSettlementId).toBe("brambleford");
    expect(result.event?.id).toBe("starter_brambleway_road_alarm");
  });

  it("allows the mandatory Level-2 Brambleway Run before general Side Quests unlock", () => {
    const guild = atCompanyTrial();
    guild.heroes = [hero("one"), hero("two"), hero("three")].map((entry) => ({ ...entry, level: 2 }));
    guild.world.currentSettlementId = "brambleford";
    guild.world.worldFlags.starter_brambleway_road_ambush_complete = true;
    expect(getQuestStartBlocker(QUESTS.brambleway_caravan!, guild.world, guild.heroes)).toBeNull();
  });

  it("lets Level-2 heroes fight the mandatory road ambush but keeps other Side Quests locked", () => {
    const guild = atCompanyTrial();
    guild.heroes = [hero("one"), hero("two"), hero("three")].map((entry) => ({ ...entry, level: 2 }));
    guild.world.currentSettlementId = "brambleford";
    expect(needsStarterRoadEncounter(guild)).toBe(true);
    expect(getQuestStartBlocker(QUESTS.brambleway_road_ambush!, guild.world, guild.heroes)).toBeNull();
    expect(getQuestStartBlocker(QUESTS.echoes_of_mosswatch!, guild.world, guild.heroes)).toContain("Level 3");
    guild.world.worldFlags.starter_brambleway_road_ambush_complete = true;
    expect(getQuestStartBlocker(QUESTS.brambleway_road_ambush!, guild.world, guild.heroes)).toContain("Level 3");
  });

  it("allows a pending Brambleway alarm to reopen at the current location without extra travel", () => {
    const guild = atCompanyTrial();
    guild.heroes = [hero("one"), hero("two"), hero("three")];
    guild.world.currentSettlementId = "brambleford";
    const dayBefore = guild.currentDay;
    expect(needsStarterRoadEncounter(guild)).toBe(true);
    expect(starterBramblewayEvent().choices[0]?.questId).toBe("brambleway_road_ambush");
    expect(guild.currentDay).toBe(dayBefore);
  });

  it("keeps the Chieftain locked until the company trial and four-hero roster are ready", () => {
    const guild = atCompanyTrial();
    guild.heroes = [hero("one"), hero("two"), hero("three")];
    expect(getAvailableCampaignNodes(guild.world).map((node) => node.id)).not.toContain("goblin_chieftain");

    guild.world.worldFlags.starter_brambleway_road_ambush_complete = true;
    guild.world.worldFlags.starter_brambleford_side_quest_complete = true;
    guild.heroes.push(hero("four"));
    const healed = initializeRecruitment(guild, createSeededRandom(9));
    expect(healed.world.worldFlags.starter_fourth_hero_ready).toBe(true);
    expect(getAvailableCampaignNodes(healed.world).map((node) => node.id)).toContain("goblin_chieftain");
  });

  it("keeps the interrupted road encounter recoverable", () => {
    const event = starterBramblewayEvent();
    expect(event.choices[0]).toMatchObject({ questId: "brambleway_road_ambush" });
  });
});
