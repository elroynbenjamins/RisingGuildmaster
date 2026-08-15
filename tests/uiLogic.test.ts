import { describe, expect, it } from "vitest";
import { QUESTS } from "../src/data/quests/quests";
import { createGuild } from "../src/game/guild/guildService";
import { selectMainTab, MAIN_TABS } from "../src/ui/navigation";
import { filterAndSortHeroes } from "../src/ui/heroList";
import { filterQuests } from "../src/ui/questList";
import { filterInventory } from "../src/ui/inventory";
import { compareEquipment } from "../src/ui/equipmentComparison";
import { getGuildNotifications } from "../src/ui/guildStatus";
import { getRaceNameColor, RACE_NAME_COLORS } from "../src/ui/raceColors";
import { testHero } from "./testHero";

describe("Milestone 5 UI state selectors", () => {
  it("assigns a distinct name color to every playable race", () => { expect(new Set(Object.values(RACE_NAME_COLORS)).size).toBe(4); expect(getRaceNameColor("human")).toBe(RACE_NAME_COLORS.human); expect(Object.values(RACE_NAME_COLORS).every((color) => /^#[0-9A-F]{6}$/i.test(color))).toBe(true); });
  it("exposes exactly five permanent tabs and safely switches among them", () => { expect(MAIN_TABS).toEqual(["Guild", "Quests", "World", "Heroes", "Inventory"]); expect(selectMainTab("Guild", "World")).toBe("World"); expect(selectMainTab("World", "Settings")).toBe("World"); });
  it("filters and sorts heroes without mutating the roster", () => { const base = testHero(); const injured = { ...base, id: "injured", name: "Ada", level: 4, conditions: [{ conditionId: "injured" as const, remainingDuration: 2 }] }; const available = { ...base, id: "available", name: "Zara", level: 2 }; const roster = [available, injured]; expect(filterAndSortHeroes(roster, "Injured", "Name").map((hero) => hero.id)).toEqual(["injured"]); expect(filterAndSortHeroes(roster, "All", "Level").map((hero) => hero.id)).toEqual(["injured", "available"]); expect(roster[0]?.id).toBe("available"); });
  it("separates contracts, side quests, campaign quests, and bosses", () => { const quests = Object.values(QUESTS); expect(filterQuests(quests, "Contracts").every((quest) => quest.questType === "contract")).toBe(true); expect(filterQuests(quests, "Side Quests").map((quest) => quest.id)).toContain("hunt_spider_queen"); expect(filterQuests(quests, "Campaign").every((quest) => quest.questType === "campaign")).toBe(true); expect(filterQuests(quests, "Bosses").map((quest) => quest.id)).toContain("goblin_chieftain_boss"); });
  it("filters inventory categories and calculates real equipment differences", () => { expect(filterInventory(["worn-sword", "padded-armor"], "Weapons").map((item) => item.id)).toEqual(["worn-sword"]); const hero = { ...testHero(), classId: "warrior" as const, equipment: { ...testHero().equipment, weapon: null } }; const rows = compareEquipment(hero, "worn-sword"); expect(rows.find((row) => row.label === "STR")?.difference).toBe(2); expect(hero.equipment.weapon).toBeNull(); });
  it("derives notifications from live guild state", () => {
    const guild = createGuild();
    expect(getGuildNotifications(guild).some((item) => item.id === "contracts_locked")).toBe(true);
    guild.world.completedCampaignNodeIds.push("broken_wardstone");
    expect(getGuildNotifications(guild).some((item) => item.id === "contracts")).toBe(true);
    const injured = { ...testHero(), conditions: [{ conditionId: "injured" as const, remainingDuration: 2 }] };
    expect(getGuildNotifications({ ...guild, heroes: [injured] }).some((item) => item.id === "injured")).toBe(true);
  });
});
