import type { GuildState } from "../guild/types";
import { deserializeGuild, serializeGuild, type SaveSlotId, type SaveSlotSummary } from "./saveService";

export const CLOUD_SAVE_FORMAT_VERSION = 1;

export interface CloudSaveSnapshot {
  formatVersion: number;
  slotId: SaveSlotId;
  savedAt: string;
  guildName: string;
  currentDay: number;
  difficultyId: GuildState["difficultyId"];
  payload: string;
  checksum: string;
}

export interface CloudSaveProvider {
  readSlot(slotId: SaveSlotId): Promise<CloudSaveSnapshot | null>;
  writeSlot(slotId: SaveSlotId, snapshot: CloudSaveSnapshot): Promise<void>;
  deleteSlot?(slotId: SaveSlotId): Promise<void>;
}

export type CloudConflictState = "same" | "local_only" | "cloud_only" | "local_newer" | "cloud_newer" | "unknown";

function checksum(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8,"0");
}

export function createCloudSaveSnapshot(slotId: SaveSlotId, guild: GuildState, savedAt = new Date().toISOString()): CloudSaveSnapshot {
  const payload = serializeGuild(guild);
  return {
    formatVersion: CLOUD_SAVE_FORMAT_VERSION,
    slotId,
    savedAt,
    guildName: guild.guildName,
    currentDay: guild.currentDay,
    difficultyId: guild.difficultyId,
    payload,
    checksum: checksum(payload),
  };
}

export function validateCloudSaveSnapshot(snapshot: CloudSaveSnapshot): GuildState {
  if (snapshot.formatVersion !== CLOUD_SAVE_FORMAT_VERSION) throw new Error("Cloud save format is not supported by this build");
  if (snapshot.slotId !== 1 && snapshot.slotId !== 2) throw new Error("Cloud save slot is invalid");
  if (checksum(snapshot.payload) !== snapshot.checksum) throw new Error("Cloud save checksum does not match its payload");
  return deserializeGuild(snapshot.payload);
}

export function compareCloudSave(local: SaveSlotSummary | undefined, cloud: CloudSaveSnapshot | null): CloudConflictState {
  if (!local?.exists && !cloud) return "same";
  if (local?.exists && !cloud) return "local_only";
  if (!local?.exists && cloud) return "cloud_only";
  if (!cloud || !local?.lastPlayedAt) return "unknown";
  const localTime = new Date(local.lastPlayedAt).getTime();
  const cloudTime = new Date(cloud.savedAt).getTime();
  if (!Number.isFinite(localTime) || !Number.isFinite(cloudTime)) return "unknown";
  if (localTime === cloudTime) return "same";
  return localTime > cloudTime ? "local_newer" : "cloud_newer";
}

export async function uploadCloudSave(provider: CloudSaveProvider, slotId: SaveSlotId, guild: GuildState): Promise<CloudSaveSnapshot> {
  const snapshot = createCloudSaveSnapshot(slotId,guild);
  await provider.writeSlot(slotId,snapshot);
  return snapshot;
}

export async function downloadCloudSave(provider: CloudSaveProvider, slotId: SaveSlotId): Promise<{snapshot:CloudSaveSnapshot;guild:GuildState}|null> {
  const snapshot = await provider.readSlot(slotId);
  if (!snapshot) return null;
  if (snapshot.slotId !== slotId) throw new Error("Cloud provider returned the wrong save slot");
  return { snapshot, guild: validateCloudSaveSnapshot(snapshot) };
}
