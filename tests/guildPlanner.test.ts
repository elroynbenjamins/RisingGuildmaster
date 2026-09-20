import { describe, expect, it } from "vitest";
import { createGuild } from "../src/game/guild/guildService";
import { createHeroContract } from "../src/game/recruitment/contractService";
import { findNextGuildPlannerEvent, forecastGuildPlanner } from "../src/game/economy/guildCalendarService";
import { testHero } from "./testHero";


describe("guild planner forecast", () => {
  it("builds a seven-day forecast while hiding routine daily recovery and tavern events", () => {
    const hero = { ...testHero(), id: "planner-hero", name: "Mira", conditions: [{ conditionId: "injured" as const, remainingDuration: 3 }] };
    const guild = createGuild();
    guild.heroes = [hero];
    guild.heroContracts = [createHeroContract(hero, 100, 12, guild.currentDay)];

    const forecast = forecastGuildPlanner(guild, 7);

    expect(forecast).toHaveLength(7);
    expect(forecast[0]).toMatchObject({ day: guild.currentDay + 1, daysAway: 1 });
    expect(forecast.flatMap((day) => day.events).some((event) => event.type === "tavern_income")).toBe(false);
    expect(forecast.flatMap((day) => day.events).some((event) => event.type === "health_recovered")).toBe(false);
    expect(forecast.flatMap((day) => day.events).some((event) => event.type === "stamina_recovered")).toBe(false);
    expect(forecast[2]?.events).toContainEqual(expect.objectContaining({ type: "condition_recovered" }));
    expect(forecast[6]?.events).toContainEqual(expect.objectContaining({ type: "salary_paid" }));
  });

  it("finds the first meaningful milestone instead of treating every routine day as an event", () => {
    const hero = { ...testHero(), id: "next-event-hero", conditions: [{ conditionId: "injured" as const, remainingDuration: 4 }] };
    const guild = createGuild();
    guild.heroes = [hero];

    const next = findNextGuildPlannerEvent(guild, 10);

    expect(next).toMatchObject({ day: guild.currentDay + 4, daysAway: 4 });
    expect(next?.events).toContainEqual(expect.objectContaining({ type: "condition_recovered" }));
  });

  it("returns null when there is no milestone inside the requested planning horizon", () => {
    const guild = createGuild();
    expect(findNextGuildPlannerEvent(guild, 5)).toBeNull();
  });
});
