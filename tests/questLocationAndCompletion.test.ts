import { describe, expect, it } from "vitest";
import { QUESTS } from "../src/data/quests/quests";
import { createGuild } from "../src/game/guild/guildService";
import { hasCompletedQuestOnce } from "../src/game/quests/questCompletionService";
import { isQuestAtCurrentLocation } from "../src/game/quests/questAvailability";

describe("quest location and prior completion guidance", () => {
  it("requires both the destination region and an allowed settlement", () => {
    const guild = createGuild();
    const quest = QUESTS.return_to_blackwater!;

    expect(isQuestAtCurrentLocation(quest, guild.world)).toBe(false);
    expect(isQuestAtCurrentLocation(quest, { ...guild.world, currentRegionId: "shadowfen", currentSettlementId: "mirewatch" })).toBe(false);
    expect(isQuestAtCurrentLocation(quest, { ...guild.world, currentRegionId: "shadowfen", currentSettlementId: "blackwater" })).toBe(true);
  });

  it("recognizes first clears from completed quest state and legacy chronicle records", () => {
    const guild = createGuild();
    expect(hasCompletedQuestOnce(guild, "coils_of_the_sunken_grove")).toBe(false);

    const permanent = { ...guild, world: { ...guild.world, completedQuestIds: ["night_of_thirteen_ladders"] } };
    expect(hasCompletedQuestOnce(permanent, "night_of_thirteen_ladders")).toBe(true);

    const chronicleRecorded = { ...guild, questChronicle: [{ questId: "coils_of_the_sunken_grove", status: "victory" } as typeof guild.questChronicle[number]] };
    expect(hasCompletedQuestOnce(chronicleRecorded, "coils_of_the_sunken_grove")).toBe(true);
  });
});
