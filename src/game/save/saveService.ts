import { deserializeGuild as migrateDomain } from "./domainSaveMigration";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { GuildState } from "../guild/types";
import { applyContentEntitlements, applyStoryRaceUnlocks } from "../monetization/contentUnlockService";
import { loadAccountContentEntitlements, saveAccountContentEntitlements } from "../monetization/accountEntitlementService";
import { accountGemWalletFromGuild, applyAccountGemWallet, initializeAccountGemWallet, saveAccountGemWallet } from "../monetization/accountGemWalletService";
import { migrateGuildState } from "./guildStateMigration";
import { UnsupportedSaveSchemaError, decodePersistedSave, serializePersistedGuild } from "./saveSchema";

export type SaveSlotId = 1 | 2;

export interface SaveSlotSummary {
  slotId: SaveSlotId;
  exists: boolean;
  issue?: SaveSlotLoadIssue;
  campaignChapter?: number;
  reputation?: number;
  guildName?: string;
  guildCrestId?: GuildState["guildCrestId"];
  currentDay?: number;
  difficultyId?: GuildState["difficultyId"];
  heroCount?: number;
  lastPlayedAt?: string;
}

export interface SaveSlotLoadIssue {
  slotId: SaveSlotId;
  kind: "unsupported" | "corrupt";
  message: string;
}

export interface SaveSlotsLoadResult {
  guilds: Record<SaveSlotId, GuildState | null>;
  issues: Record<SaveSlotId, SaveSlotLoadIssue | null>;
}

const LEGACY_SAVE_KEY = "guildmaster.guild.v1";
const LEGACY_BACKUP_SAVE_KEY = "guildmaster.guild.v1.backup";

/** Canonical v2 keys also import historical v1 slots on first access. */
const SAVE_SLOT_KEYS: Record<SaveSlotId, { primary: string; backup: string }> = {
  1: { primary: "guildmaster.guild.slot.1.v2", backup: "guildmaster.guild.slot.1.v2.backup" },
  2: { primary: "guildmaster.guild.slot.2.v2", backup: "guildmaster.guild.slot.2.v2.backup" },
};

const saveQueues: Record<SaveSlotId, Promise<void>> = {
  1: Promise.resolve(),
  2: Promise.resolve(),
};

/**
 * Domain-state JSON helper retained for tests and tools that intentionally
 * inspect GuildState fields. Persistent storage uses serializePersistedGuild()
 * so the on-device save includes an explicit schema envelope.
 */
export function serializeGuild(guild: GuildState): string {
  return JSON.stringify(guild);
}

/** Accepts both historical raw GuildState JSON and versioned save envelopes. */
export function deserializeGuild(value: string): GuildState {
  const decoded = decodePersistedSave(value);
  return applyStoryRaceUnlocks(migrateDomain(JSON.stringify(migrateGuildState(decoded.guild))));
}

/** Keeps the last valid snapshot before replacing the active autosave. */
async function saveGuildImmediate(guild: GuildState, slotId: SaveSlotId): Promise<void> {
  await importHistoricalSlot(slotId);
  const entitlementAwareGuild = applyStoryRaceUnlocks(guild);
  await saveAccountContentEntitlements(entitlementAwareGuild.entitlements);
  await saveAccountGemWallet(accountGemWalletFromGuild(entitlementAwareGuild));

  const next = serializePersistedGuild(entitlementAwareGuild);
  // Validate the exact payload before it can replace a known-good primary.
  deserializeGuild(next);

  const keys = SAVE_SLOT_KEYS[slotId];
  const current = await AsyncStorage.getItem(keys.primary);
  if (current) {
    try {
      deserializeGuild(current);
      await AsyncStorage.setItem(keys.backup, current);
    } catch (error) {
      if (error instanceof UnsupportedSaveSchemaError) throw error;
      // Never preserve a corrupt primary over a known backup.
    }
  }

  await AsyncStorage.setItem(keys.primary, next);
  await AsyncStorage.setItem(`${keys.primary}.meta`, JSON.stringify({lastPlayedAt: new Date().toISOString()}));
}

/**
 * Autosaves are serialized per slot. Rapid state updates therefore cannot race
 * the primary/backup rotation and accidentally make an older write win.
 */
export async function saveGuild(guild: GuildState, slotId: SaveSlotId = 1): Promise<void> {
  const queued = saveQueues[slotId]
    .catch(() => undefined)
    .then(() => saveGuildImmediate(guild, slotId));
  saveQueues[slotId] = queued.catch(() => undefined);
  return queued;
}

type AccountEntitlements = Awaited<ReturnType<typeof loadAccountContentEntitlements>>;

async function prepareLoadedGuild(value: string, accountEntitlements: AccountEntitlements): Promise<{
  guild: GuildState;
  needsSchemaRewrite: boolean;
}> {
  const decoded = decodePersistedSave(value);
  const migrated = applyStoryRaceUnlocks(migrateDomain(JSON.stringify(migrateGuildState(decoded.guild))));
  const entitlementAwareGuild = applyContentEntitlements(migrated, accountEntitlements);
  const accountWallet = await initializeAccountGemWallet(accountGemWalletFromGuild(entitlementAwareGuild));
  const guild = applyAccountGemWallet(entitlementAwareGuild, accountWallet);
  await saveAccountContentEntitlements(guild.entitlements);
  return { guild, needsSchemaRewrite: decoded.migrated };
}

async function loadFromKeys(
  primaryKey: string,
  backupKey: string,
  accountEntitlements: AccountEntitlements,
): Promise<GuildState | null> {
  const primary = await AsyncStorage.getItem(primaryKey);
  if (primary !== null) {
    try {
      const loaded = await prepareLoadedGuild(primary, accountEntitlements);
      if (loaded.needsSchemaRewrite) {
        // Upgrade old raw/v1 payloads in place only after they have loaded and
        // normalized successfully. The old primary becomes the recovery copy.
        await AsyncStorage.setItem(backupKey, primary);
        await AsyncStorage.setItem(primaryKey, serializePersistedGuild(loaded.guild));
      }
      return loaded.guild;
    } catch (error) {
      // A future-version save is valid data from a newer build, not corruption.
      // Never replace it with an older backup during a downgrade attempt.
      if (error instanceof UnsupportedSaveSchemaError) throw error;
      // Other parse/validation failures may recover from the snapshot below.
    }
  }

  const backup = await AsyncStorage.getItem(backupKey);
  if (backup === null) {
    if (primary !== null) throw new Error("The primary save is corrupt and no recovery snapshot is available.");
    return null;
  }

  const recovered = await prepareLoadedGuild(backup, accountEntitlements);
  // Recovery always writes a fresh current-schema primary, even if the backup
  // was already current, so a corrupt/interrupted primary is fully repaired.
  await AsyncStorage.setItem(primaryKey, serializePersistedGuild(recovered.guild));
  return recovered.guild;
}

/** Recovers transparently from an interrupted or corrupt primary write. */
export async function loadGuild(slotId: SaveSlotId = 1): Promise<GuildState | null> {
  await saveQueues[slotId];
  await importHistoricalSlot(slotId);
  const accountEntitlements = await loadAccountContentEntitlements();
  const keys = SAVE_SLOT_KEYS[slotId];
  const saved = await loadFromKeys(keys.primary, keys.backup, accountEntitlements);
  if (saved) return saved;
  if (slotId !== 1) return null;

  // One-time compatibility bridge: old single-save installs become Slot 1.
  const legacy = await loadFromKeys(LEGACY_SAVE_KEY, LEGACY_BACKUP_SAVE_KEY, accountEntitlements);
  if (!legacy) return null;
  await saveGuild(legacy, 1);
  return legacy;
}

function saveSlotIssue(slotId: SaveSlotId, error: unknown): SaveSlotLoadIssue {
  if (error instanceof UnsupportedSaveSchemaError) {
    return {
      slotId,
      kind: "unsupported",
      message: `This save was created by a newer game version (save v${error.foundVersion}; this build supports v${error.supportedVersion}). Update Rising Guildmaster to use this slot.`,
    };
  }
  return {
    slotId,
    kind: "corrupt",
    message: "This save and its recovery snapshot could not be loaded. The slot has been protected from automatic overwrite.",
  };
}

/**
 * Loads both slots independently so a problem in one slot never hides a valid
 * guild in the other. Failed slots are reported as protected issues rather
 * than being presented as empty/new-game slots.
 */
export async function loadGuildSaveSlotsDetailed(): Promise<SaveSlotsLoadResult> {
  const loadOne = async (slotId: SaveSlotId): Promise<{ guild: GuildState | null; issue: SaveSlotLoadIssue | null }> => {
    try {
      return { guild: await loadGuild(slotId), issue: null };
    } catch (error) {
      return { guild: null, issue: saveSlotIssue(slotId, error) };
    }
  };
  const [slot1, slot2] = await Promise.all([loadOne(1), loadOne(2)]);
  return {
    guilds: { 1: slot1.guild, 2: slot2.guild },
    issues: { 1: slot1.issue, 2: slot2.issue },
  };
}

/** Compatibility helper for callers that only need successfully loaded guilds. */
export async function loadGuildSaveSlots(): Promise<Record<SaveSlotId, GuildState | null>> {
  return (await loadGuildSaveSlotsDetailed()).guilds;
}

export function summarizeGuildSave(guild: GuildState, slotId: SaveSlotId): SaveSlotSummary {
  return {
    slotId,
    exists: true,
    guildCrestId: guild.guildCrestId,
    guildName: guild.guildName,
    currentDay: guild.currentDay,
    campaignChapter: guild.world.campaignChapter,
    heroCount: guild.heroes.length,
    reputation: guild.reputation,
    difficultyId: guild.difficultyId,
  };
}

export async function deleteGuildSave(slotId: SaveSlotId = 1): Promise<void> {
  await saveQueues[slotId].catch(() => undefined);
  const keys = SAVE_SLOT_KEYS[slotId];
  await AsyncStorage.multiRemove([keys.primary, keys.backup, `${keys.primary}.meta`, `guildmaster.guild.slot.${slotId}.v1`, `guildmaster.guild.slot.${slotId}.v1.backup`, ...(slotId === 1 ? [LEGACY_SAVE_KEY, LEGACY_BACKUP_SAVE_KEY] : [])]);
}

async function importHistoricalSlot(slotId: SaveSlotId): Promise<void> {
  const keys = SAVE_SLOT_KEYS[slotId];
  if (await AsyncStorage.getItem(keys.primary) !== null || await AsyncStorage.getItem(keys.backup) !== null) return;
  const old = `guildmaster.guild.slot.${slotId}.v1`;
  const primary = await AsyncStorage.getItem(old), backup = await AsyncStorage.getItem(`${old}.backup`);
  if (backup !== null) await AsyncStorage.setItem(keys.backup, backup);
  if (primary !== null) await AsyncStorage.setItem(keys.primary, primary);
}
export async function listSaveSlots(): Promise<SaveSlotSummary[]> {
  const result = await loadGuildSaveSlotsDetailed();
  return Promise.all(([1, 2] as SaveSlotId[]).map(async slotId => {
    const guild = result.guilds[slotId], issue = result.issues[slotId];
    if (!guild) return {slotId, exists: !!issue, ...(issue ? {issue} : {})};
    let lastPlayedAt: string | undefined;
    try { lastPlayedAt = JSON.parse(await AsyncStorage.getItem(`${SAVE_SLOT_KEYS[slotId].primary}.meta`) ?? '{}').lastPlayedAt; } catch {}
    return {...summarizeGuildSave(guild, slotId), lastPlayedAt};
  }));
}
