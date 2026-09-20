import { beforeEach, describe, expect, it, vi } from "vitest";

const storage = new Map<string, string>();
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: async (key: string) => storage.get(key) ?? null,
    setItem: async (key: string, value: string) => { storage.set(key, value); },
    multiRemove: async (keys: string[]) => { keys.forEach((key) => storage.delete(key)); },
  },
}));

import { createGuild } from "../src/game/guild/guildService";
import { deserializeGuild, loadGuild, loadGuildSaveSlotsDetailed, saveGuild } from "../src/game/save/saveService";
import { CURRENT_SAVE_SCHEMA_VERSION, SAVE_FORMAT, inspectPersistedSaveSchema, serializePersistedGuild } from "../src/game/save/saveSchema";

const SLOT_1_PRIMARY = "guildmaster.guild.slot.1.v2";
const SLOT_1_BACKUP = "guildmaster.guild.slot.1.v2.backup";

describe("versioned save schema", () => {
  beforeEach(() => storage.clear());

  it.each(["raw", "current"])("resumes a retired comparison step at first recruitment in a %s save", (format) => {
    const guild = createGuild("Returning Recruiter");
    const legacy = { ...guild, tutorial: { ...guild.tutorial, step: "compare_candidates", inspectedCandidateId: "candidate-1", inspectedCandidateTabs: ["Overview", "Stats"] } };
    const payload = format === "raw" ? legacy : { format: SAVE_FORMAT, schemaVersion: CURRENT_SAVE_SCHEMA_VERSION, savedAt: new Date().toISOString(), guild: legacy };
    const restored = deserializeGuild(JSON.stringify(payload));
    expect(restored.tutorial).toEqual({ ...legacy.tutorial, step: "recruit_first" });
    expect(restored.gold).toBe(guild.gold);
    expect(restored.heroes).toEqual(guild.heroes);
    expect(deserializeGuild(serializePersistedGuild(restored)).tutorial).toEqual(restored.tutorial);
  });

  it("writes current saves inside an explicit versioned envelope", async () => {
    const guild = createGuild("Schema Banner");
    await saveGuild(guild, 1);

    const stored = storage.get(SLOT_1_PRIMARY);
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!) as Record<string, unknown>;
    expect(parsed.format).toBe(SAVE_FORMAT);
    expect(parsed.schemaVersion).toBe(CURRENT_SAVE_SCHEMA_VERSION);
    expect(typeof parsed.savedAt).toBe("string");
    expect((parsed.guild as { guildName: string }).guildName).toBe("Schema Banner");
  });

  it("recognizes historical raw GuildState JSON as schema v0", () => {
    const legacy = JSON.stringify(createGuild("Old Banner"));
    expect(inspectPersistedSaveSchema(legacy)).toEqual({
      sourceSchemaVersion: 0,
      currentSchemaVersion: CURRENT_SAVE_SCHEMA_VERSION,
      migrated: true,
    });
    expect(deserializeGuild(legacy).guildName).toBe("Old Banner");
  });

  it("loads the intermediate v1 envelope and upgrades a raw slot in place", async () => {
    const guild = createGuild("Migration Banner");
    const v1 = JSON.stringify({ schemaVersion: 1, guild });
    expect(deserializeGuild(v1).guildName).toBe("Migration Banner");

    storage.set(SLOT_1_PRIMARY, JSON.stringify(guild));
    const loaded = await loadGuild(1);
    expect(loaded?.guildName).toBe("Migration Banner");

    const upgraded = JSON.parse(storage.get(SLOT_1_PRIMARY)!) as Record<string, unknown>;
    expect(upgraded.schemaVersion).toBe(CURRENT_SAVE_SCHEMA_VERSION);
    expect(storage.get(SLOT_1_BACKUP)).toBe(JSON.stringify(guild));
  });

  it("rejects a malformed payload that claims to be the current schema", () => {
    const malformed = JSON.stringify({
      format: SAVE_FORMAT,
      schemaVersion: CURRENT_SAVE_SCHEMA_VERSION,
      guild: createGuild("Missing Timestamp"),
    });
    expect(() => deserializeGuild(malformed)).toThrow(/schema v2 is malformed/i);
  });

  it("rejects a malformed v1 envelope instead of treating it as guild state", () => {
    const malformed = JSON.stringify({ schemaVersion: 1, notGuild: createGuild() });
    expect(() => deserializeGuild(malformed)).toThrow(/schema v1 is malformed/i);
  });

  it("refuses a save created by a newer unsupported schema", () => {
    const future = JSON.stringify({
      format: SAVE_FORMAT,
      schemaVersion: CURRENT_SAVE_SCHEMA_VERSION + 1,
      savedAt: new Date().toISOString(),
      guild: createGuild(),
    });
    expect(() => deserializeGuild(future)).toThrow(/newer than this build supports/i);
  });

  it("protects a future-version slot instead of replacing it with an older backup", async () => {
    const olderBackup = serializePersistedGuild(createGuild("Older Backup"));
    const futurePrimary = JSON.stringify({
      format: SAVE_FORMAT,
      schemaVersion: CURRENT_SAVE_SCHEMA_VERSION + 1,
      savedAt: new Date().toISOString(),
      guild: createGuild("Future Guild"),
    });
    storage.set(SLOT_1_PRIMARY, futurePrimary);
    storage.set(SLOT_1_BACKUP, olderBackup);

    const loaded = await loadGuildSaveSlotsDetailed();
    expect(loaded.guilds[1]).toBeNull();
    expect(loaded.issues[1]).toMatchObject({ slotId: 1, kind: "unsupported" });
    expect(storage.get(SLOT_1_PRIMARY)).toBe(futurePrimary);
    expect(storage.get(SLOT_1_BACKUP)).toBe(olderBackup);
  });

  it("recovers the last valid backup when the primary is corrupt", async () => {
    const first = createGuild("Recovery Banner"); first.currentDay = 9;
    const second = createGuild("Newer Banner"); second.currentDay = 10;
    await saveGuild(first, 1);
    await saveGuild(second, 1);

    storage.set(SLOT_1_PRIMARY, "{broken json");
    const recovered = await loadGuild(1);
    expect(recovered).toMatchObject({ guildName: "Recovery Banner", currentDay: 9 });

    const repaired = storage.get(SLOT_1_PRIMARY)!;
    expect(inspectPersistedSaveSchema(repaired).migrated).toBe(false);
    expect(deserializeGuild(repaired).guildName).toBe("Recovery Banner");
  });

  it("round-trips an explicit envelope through the normal deserializer", () => {
    const guild = createGuild("Envelope Banner"); guild.reputation = 31;
    const persisted = serializePersistedGuild(guild, new Date("2026-09-12T08:00:00.000Z"));
    expect(deserializeGuild(persisted)).toMatchObject({ guildName: "Envelope Banner", reputation: 31 });
  });

  it.each(["{broken json", ""])("protects a corrupt primary without a backup (%j)", async (corrupt) => {
    storage.set(SLOT_1_PRIMARY, corrupt);
    // A stale legacy save must not silently replace an occupied, damaged slot.
    storage.set("guildmaster.guild.v1", JSON.stringify(createGuild("Stale Legacy")));
    await saveGuild(createGuild("Healthy Second Slot"), 2);

    const loaded = await loadGuildSaveSlotsDetailed();
    expect(loaded.guilds[1]).toBeNull();
    expect(loaded.issues[1]).toMatchObject({ slotId: 1, kind: "corrupt" });
    expect(loaded.guilds[2]?.guildName).toBe("Healthy Second Slot");
    expect(loaded.issues[2]).toBeNull();
    expect(storage.get(SLOT_1_PRIMARY)).toBe(corrupt);
    expect(storage.has(SLOT_1_BACKUP)).toBe(false);
  });

  it("refuses an autosave over a newer primary and leaves both snapshots intact", async () => {
    const future = JSON.stringify({ schemaVersion: CURRENT_SAVE_SCHEMA_VERSION + 1, guild: createGuild("Future") });
    const backup = serializePersistedGuild(createGuild("Backup"));
    storage.set(SLOT_1_PRIMARY, future);
    storage.set(SLOT_1_BACKUP, backup);
    await expect(saveGuild(createGuild("Replacement"), 1)).rejects.toThrow(/newer than this build supports/i);
    expect(storage.get(SLOT_1_PRIMARY)).toBe(future);
    expect(storage.get(SLOT_1_BACKUP)).toBe(backup);
  });

  it("serializes rapid saves independently for each slot", async () => {
    await Promise.all([1, 2, 3].flatMap((day) => [1, 2].map((slot) => {
      const guild = createGuild(`Slot ${slot}`); guild.currentDay = day;
      return saveGuild(guild, slot as 1 | 2);
    })));
    for (const slot of [1, 2] as const) {
      expect(await loadGuild(slot)).toMatchObject({ guildName: `Slot ${slot}`, currentDay: 3 });
      expect(deserializeGuild(storage.get(`guildmaster.guild.slot.${slot}.v2.backup`)!)).toMatchObject({ guildName: `Slot ${slot}`, currentDay: 2 });
    }
  });
});
