import { describe, expect, it } from "vitest";
import { QUESTS } from "../src/data/quests/quests";
import { GAME_CONFIG } from "../src/config/gameConfig";
import { generateRogueliteThemeOffers } from "../src/game/dungeons/rogueliteRotationService";
import { advanceGuildTime } from "../src/game/economy/guildCalendarService";
import { createGuild } from "../src/game/guild/guildService";
import { recoverAdventureStamina, spendPartyAdventureStamina } from "../src/game/heroes/adventureStaminaService";
import { creditVerifiedGems, exchangeGemsForGold } from "../src/game/monetization/gemService";
import { beginTutorial, recordTutorialRecruit, recordTutorialRefresh } from "../src/game/onboarding/tutorialService";
import { isQuestBoardCategoryUnlocked } from "../src/game/quests/questAvailability";
import { generateHero } from "../src/game/heroes/heroGenerator";
import { createSeededRandom } from "../src/utils/random";

describe("new-game onboarding and progression gates", () => {
  it("guides two recruits through one mandatory free refresh", () => {
    let guild = beginTutorial(createGuild());
    expect(guild.tutorial.step).toBe("recruit_first");
    guild = recordTutorialRecruit({ ...guild, heroes: [generateHero(createSeededRandom(1))] });
    expect(guild.tutorial.step).toBe("refresh_board");
    guild = recordTutorialRefresh(guild);
    expect(guild.tutorial).toMatchObject({ step: "recruit_second", freeRefreshUsed: true });
    guild = recordTutorialRecruit({ ...guild, heroes: [...guild.heroes, generateHero(createSeededRandom(2))] });
    expect(guild.tutorial).toMatchObject({ step: "complete", active: false, completed: true });
  });

  it("keeps guild-board content gated behind campaign progress", () => {
    const world = createGuild().world;
    expect(isQuestBoardCategoryUnlocked("campaign", world)).toBe(true);
    expect(isQuestBoardCategoryUnlocked("contract", world)).toBe(false);
    expect(isQuestBoardCategoryUnlocked("boss", world)).toBe(false);
    const afterMerchant = { ...world, completedCampaignNodeIds: ["missing_merchant"] };
    expect(isQuestBoardCategoryUnlocked("contract", afterMerchant, 2)).toBe(true);
    expect(isQuestBoardCategoryUnlocked("side", afterMerchant, 2)).toBe(false);
    expect(isQuestBoardCategoryUnlocked("side", afterMerchant, 3)).toBe(true);
    expect(isQuestBoardCategoryUnlocked("boss", afterMerchant)).toBe(false);
    const afterChapterOne = { ...afterMerchant, completedCampaignNodeIds: ["missing_merchant", "broken_wardstone"] };
    expect(isQuestBoardCategoryUnlocked("contract", afterChapterOne, 2)).toBe(true);
    expect(isQuestBoardCategoryUnlocked("boss", afterChapterOne)).toBe(true);
  });

  it("offers exactly three roguelite themes only after Chapter 1", () => {
    const locked = createGuild();
    expect(() => generateRogueliteThemeOffers(locked, createSeededRandom(4))).toThrow("Complete Chapter 1");
    const unlocked = { ...locked, world: { ...locked.world, completedCampaignNodeIds: ["broken_wardstone"] } };
    const offered = generateRogueliteThemeOffers(unlocked, createSeededRandom(4));
    expect(offered.rogueliteRotation.offeredDungeonIds).toHaveLength(3);
    expect(new Set(offered.rogueliteRotation.offeredDungeonIds).size).toBe(3);
  });
});

describe("gems, economy, and hero rotation", () => {
  it("awards five verified ad gems and exchanges one gem for 250 gold", () => {
    const guild = createGuild();
    const rewarded = creditVerifiedGems(guild, { source: "rewarded_ad", gems: GAME_CONFIG.rewardedAdGems, verified: true, transactionId: "ad-test" });
    expect(rewarded.gems).toBe(guild.gems + 5);
    const exchanged = exchangeGemsForGold(rewarded, 1);
    expect(exchanged.gems).toBe(rewarded.gems - 1);
    expect(exchanged.gold).toBe(rewarded.gold + 250);
  });

  it("spends quest readiness and recovers it gradually when days advance", () => {
    const hero = generateHero(createSeededRandom(7));
    const base = { ...createGuild(), heroes: [hero] };
    const spent = spendPartyAdventureStamina(base, [hero.id], QUESTS.orchard_road_patrol!);
    expect(spent.heroes[0]!.adventureStamina).toBe(50);
    expect(recoverAdventureStamina(spent).heroes[0]!.adventureStamina).toBe(85);
    const nextDay = advanceGuildTime(spent).guild;
    expect(nextDay.heroes[0]!.adventureStamina).toBe(85);
    expect(nextDay.gold).toBe(spent.gold + GAME_CONFIG.dailyTavernIncome);
  });
});
