import { describe, expect, it } from "vitest";
import { advanceGuildTime } from "../src/game/economy/guildCalendarService";
import { createGuild } from "../src/game/guild/guildService";
import { deserializeGuild, serializeGuild } from "../src/game/save/saveService";
import { getCampaignTrainingLevelCap, getTrainingGoldCost, calculateTrainingQuote, getTrainingProgressionLimit, grantTrainingXp, startHeroTraining, startTrainingGroundUpgrade, trainingCapacity } from "../src/game/training/trainingService";
import { xpRequiredForNextLevel } from "../src/game/progression/xpSystem";
import { testHero } from "./testHero";

describe("Training Hall", () => {
  it.each([
    ["sparring_drills", 50], ["focused_practice", 110],
    ["class_mastery", 190], ["heroic_regimen", 360],
  ] as const)("charges the discounted, rounded %s price", (programId, cost) => {
    const hero = testHero();
    const guild = createGuild();
    guild.heroes = [hero];
    guild.gold = cost;
    guild.trainingGround.level = 3;
    expect(getTrainingGoldCost(programId)).toBe(cost);
    expect(calculateTrainingQuote(hero, programId, guild).goldCost).toBe(cost);
    const started = startHeroTraining(guild, hero.id, programId);
    expect(started.gold).toBe(0);
    expect(started.trainingGround.sessions[0]?.goldCost).toBe(cost);
    expect(() => startHeroTraining({ ...guild, gold: cost - 1 }, hero.id, programId)).toThrow("Not enough gold");
  });

  it("rounds after hero cost modifiers", () => {
    expect(getTrainingGoldCost("class_mastery", 0.75)).toBe(140);
    expect(getTrainingGoldCost("sparring_drills", 0.25)).toBe(10);
  });

  it("charges gold, occupies the hero, and completes through the guild calendar", () => {
    const hero = testHero(); let guild = createGuild(); guild.heroes = [hero]; const quote = calculateTrainingQuote(hero, "sparring_drills");
    guild = startHeroTraining(guild, hero.id, "sparring_drills");
    expect(guild.gold).toBe(5000 - quote.goldCost); expect(guild.heroes[0]?.isAvailable).toBe(false); expect(guild.trainingGround.sessions).toHaveLength(1);
    const result = advanceGuildTime(guild);
    expect(result.guild.heroes[0]).toMatchObject({ isAvailable: true, xp: quote.xpReward }); expect(result.guild.trainingGround.sessions).toHaveLength(0);
    expect(result.days[0]?.events.some((event) => event.type === "training_complete")).toBe(true);
  });

  it("uses training modifiers in the quoted result", () => {
    const ordinary = testHero(); const gifted = { ...testHero(), backgroundId: "scholar" as const };
    expect(calculateTrainingQuote(gifted, "sparring_drills").xpReward).toBeGreaterThan(calculateTrainingQuote(ordinary, "sparring_drills").xpReward);
  });

  it("upgrades capacity after construction days", () => {
    let guild = startTrainingGroundUpgrade(createGuild()); expect(guild.trainingGround.upgrade).toMatchObject({ targetLevel: 2, completionDay: 4 });
    guild = advanceGuildTime(guild, 3).guild; expect(guild.trainingGround.level).toBe(2); expect(trainingCapacity(guild)).toBe(2); expect(guild.trainingGround.upgrade).toBeNull();
  });

  it("migrates saves created before Training Grounds existed", () => {
    const legacy = JSON.parse(serializeGuild(createGuild())) as Record<string, unknown>; delete legacy.trainingGround;
    expect(deserializeGuild(JSON.stringify(legacy)).trainingGround).toMatchObject({ level: 1, sessions: [], upgrade: null });
  });

  it("limits catch-up training by campaign progress and the strongest four peers", () => {
    const trainee = { ...testHero(), id: "trainee" }; const guild = createGuild();
    guild.heroes = [trainee, ...[8, 8, 7, 7].map((level, index) => ({ ...testHero(), id: `veteran-${index}`, level }))];
    expect(getTrainingProgressionLimit(guild, trainee)).toMatchObject({ campaignCap: 4, rosterCap: 7, levelCap: 4 });
    guild.world.completedCampaignNodeIds.push("broken_wardstone"); guild.world.campaignChapter = 2;
    expect(getTrainingProgressionLimit(guild, trainee).levelCap).toBe(6);
  });

  it("extends the training catch-up cap through the released late chapters", () => {
    const guild = createGuild();
    for (const [chapter, expectedCap] of [[7, 13], [8, 15], [9, 17]] as const) {
      guild.world.campaignChapter = chapter;
      expect(getCampaignTrainingLevelCap(guild)).toBe(expectedCap);
    }
  });

  it("gives late recruits meaningful scalable XP while keeping them below veteran peers", () => {
    const trainee = { ...testHero(), id: "late-trainee", level: 11, xp: 0 };
    const guild = createGuild();
    guild.world.campaignChapter = 7;
    guild.trainingGround.level = 3;
    guild.heroes = [
      trainee,
      ...[13, 13, 13].map((level, index) => ({ ...testHero(), id: `late-peer-${index}`, level })),
    ];
    const limit = getTrainingProgressionLimit(guild, trainee);
    const quote = calculateTrainingQuote(trainee, "heroic_regimen", guild);
    expect(limit).toMatchObject({ campaignCap: 13, rosterCap: 13, levelCap: 13 });
    expect(quote.levelCap).toBe(13);
    expect(quote.xpReward).toBeGreaterThan(300);
    expect(quote.xpReward).toBeGreaterThanOrEqual(Math.floor(xpRequiredForNextLevel(11) * .35));
  });

  it("does not bank training XP beyond the permitted level", () => {
    const progressed = grantTrainingXp(testHero(), 99_999, 3);
    expect(progressed.level).toBe(3); expect(progressed.xp).toBe(xpRequiredForNextLevel(3) - 1);
  });

  it("keeps Training Hall progression strictly XP-only", () => {
    const hero = testHero(); const guild = createGuild(); guild.heroes = [hero];
    const quote = calculateTrainingQuote(hero, "focused_practice", guild);
    expect(quote).not.toHaveProperty("growthReward");
    const trained = startHeroTraining(guild, hero.id, "focused_practice");
    expect(trained.trainingGround.sessions[0]).not.toHaveProperty("growthReward");
    expect(trained.trainingGround.sessions[0]).not.toHaveProperty("focusedAttribute");
  });
});
