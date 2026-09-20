import { describe, expect, it } from "vitest";
import { GAME_CONFIG } from "../src/config/gameConfig";
import { createGuild } from "../src/game/guild/guildService";
import { startHeroTraining } from "../src/game/training/trainingService";
import { getTrainingCatchupAdvice, getTrainingQuotePresentation, getTrainingSessionPresentation, projectReadinessAfterDays } from "../src/game/training/trainingPresentationService";
import { testHero } from "./testHero";

describe("training presentation", () => {
  it("projects readiness recovery across the training duration", () => {
    const hero = { ...testHero(), adventureStamina: 35 };
    expect(projectReadinessAfterDays(hero, 2)).toBe(Math.min(GAME_CONFIG.maxAdventureStamina, 35 + GAME_CONFIG.adventureStaminaRecoveryPerDay * 2));
  });

  it("shows the complete training order and projected result", () => {
    const hero = { ...testHero(), adventureStamina: 40 };
    const guild = createGuild(); guild.heroes = [hero];
    const presentation = getTrainingQuotePresentation(guild, hero, "sparring_drills");
    expect(presentation.canBegin).toBe(true);
    expect(presentation.completionDay).toBe(guild.currentDay + 1);
    expect(presentation.xpReward).toBeGreaterThan(0);
    expect(presentation.readinessAfter).toBeGreaterThanOrEqual(presentation.readinessBefore);
    expect(presentation.levelCap).toBeGreaterThanOrEqual(hero.level);
  });

  it("explains when all training slots are occupied", () => {
    const heroA = { ...testHero(), id: "a" };
    const heroB = { ...testHero(), id: "b" };
    let guild = createGuild(); guild.heroes = [heroA, heroB];
    guild = startHeroTraining(guild, heroA.id, "sparring_drills");
    const presentation = getTrainingQuotePresentation(guild, guild.heroes.find((hero) => hero.id === heroB.id)!, "sparring_drills");
    expect(presentation.canBegin).toBe(false);
    expect(presentation.blockers.some((item) => item.id === "capacity")).toBe(true);
  });

  it("turns active sessions into progress cards", () => {
    const hero = testHero();
    let guild = createGuild(); guild.heroes = [hero];
    guild = startHeroTraining(guild, hero.id, "focused_practice");
    const session = getTrainingSessionPresentation(guild, guild.trainingGround.sessions[0]!);
    expect(session.heroName).toBe(hero.name);
    expect(session.durationDays).toBe(2);
    expect(session.daysRemaining).toBe(2);
    expect(session.progress).toBe(0);
  });

  it("recommends Side Quests when the post-Chieftain roster is below campaign level", () => {
    const guild = createGuild();
    guild.heroes = [0, 1, 2, 3].map((index) => ({ ...testHero(), id: `hero-${index}`, level: 1 }));
    guild.world.completedCampaignNodeIds.push("attack_on_guildhaven");
    const advice = getTrainingCatchupAdvice(guild);
    expect(advice).not.toBeNull();
    expect(advice!.averageLevel).toBeLessThan(advice!.targetLevel);
    expect(advice!.message).toMatch(/Side Quests/i);
  });
});
