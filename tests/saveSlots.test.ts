import { beforeEach, describe, expect, it, vi } from "vitest";

const store = vi.hoisted(() => new Map<string,string>());
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(async (key:string) => store.get(key) ?? null),
    setItem: vi.fn(async (key:string,value:string) => { store.set(key,value); }),
    multiSet: vi.fn(async (entries:[string,string][]) => { entries.forEach(([key,value]) => store.set(key,value)); }),
    multiRemove: vi.fn(async (keys:string[]) => { keys.forEach((key) => store.delete(key)); }),
  },
}));

import { createGuild } from "../src/game/guild/guildService";
import { deleteGuildSave, listSaveSlots, loadGuild, saveGuild } from "../src/game/save/saveService";

describe("two save slots", () => {
  beforeEach(() => store.clear());

  it("saves, lists, and loads two guilds independently", async () => {
    const first = createGuild("First Banner");
    first.currentDay = 8;
    first.heroes = [];
    const second = createGuild("Second Banner", "iron_guild");
    second.currentDay = 14;

    await saveGuild(first,1);
    await saveGuild(second,2);

    const slots = await listSaveSlots();
    expect(slots).toHaveLength(2);
    expect(slots[0]).toMatchObject({ slotId:1, exists:true, guildName:"First Banner", currentDay:8, difficultyId:"standard" });
    expect(slots[1]).toMatchObject({ slotId:2, exists:true, guildName:"Second Banner", currentDay:14, difficultyId:"iron_guild" });

    expect((await loadGuild(1))?.guildName).toBe("First Banner");
    expect((await loadGuild(2))?.guildName).toBe("Second Banner");
  });

  it("recovers a corrupt primary save from its last valid backup without touching the other slot", async () => {
    const first = createGuild("Backup Banner");
    first.currentDay = 4;
    await saveGuild(first, 1);

    const newer = { ...first, currentDay: 9, gold: first.gold + 777 };
    await saveGuild(newer, 1);
    await saveGuild(createGuild("Other Slot"), 2);

    store.set("guildmaster.guild.slot.1.v2", "{corrupt-json");
    const recovered = await loadGuild(1);

    expect(recovered).toMatchObject({ guildName: "Backup Banner", currentDay: 4 });
    expect(() => JSON.parse(store.get("guildmaster.guild.slot.1.v2")!)).not.toThrow();
    expect((await loadGuild(2))?.guildName).toBe("Other Slot");
  });

  it("deletes only the selected slot", async () => {
    await saveGuild(createGuild("Keep Me"),1);
    await saveGuild(createGuild("Delete Me"),2);
    await deleteGuildSave(2);
    const slots = await listSaveSlots();
    expect(slots[0]?.exists).toBe(true);
    expect(slots[1]?.exists).toBe(false);
    expect((await loadGuild(1))?.guildName).toBe("Keep Me");
  });
});

describe("integrated save compatibility", () => {
  beforeEach(() => store.clear());
  it("imports both historical v1 slots without losing newer domain fields", async () => {
    const guild = createGuild("Historical Banner"); guild.achievementClaims = ["first_contract"];
    store.set("guildmaster.guild.slot.2.v1", JSON.stringify(guild));
    const loaded = await loadGuild(2);
    expect(loaded?.guildName).toBe("Historical Banner");
    expect(loaded?.achievementClaims).toEqual(["first_contract"]);
    expect(store.has("guildmaster.guild.slot.2.v2")).toBe(true);
  });
  it("prefers canonical slots over stale historical saves and prevents resurrection after deletion", async () => {
    store.set("guildmaster.guild.slot.1.v1", JSON.stringify(createGuild("Old Banner")));
    await saveGuild(createGuild("Current Banner"), 1);
    expect((await loadGuild(1))?.guildName).toBe("Current Banner");
    await deleteGuildSave(1);
    expect(await loadGuild(1)).toBeNull();
  });
  it("protects future domain versions as well as future envelope versions", async () => {
    const future = JSON.stringify({...createGuild("Future"), saveVersion: 999});
    store.set("guildmaster.guild.slot.1.v2", future);
    store.set("guildmaster.guild.slot.1.v2.backup", JSON.stringify(createGuild("Past")));
    await expect(loadGuild(1)).rejects.toThrow(/newer/);
    await expect(saveGuild(createGuild("Replacement"), 1)).rejects.toThrow(/newer/);
    expect(store.get("guildmaster.guild.slot.1.v2")).toBe(future);
    expect((await listSaveSlots())[0]).toMatchObject({exists: true, issue: {kind: "unsupported"}});
  });
});
