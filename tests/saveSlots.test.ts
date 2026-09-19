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
