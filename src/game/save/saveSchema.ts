import type { GuildState } from "../guild/types";

/**
 * Storage schema is versioned independently from the AsyncStorage key names.
 * Keeping the existing keys avoids a second key-level migration while the
 * envelope lets future releases migrate payloads explicitly and safely.
 */
export const SAVE_FORMAT = "rising-guildmaster-save" as const;
export const CURRENT_SAVE_SCHEMA_VERSION = 2 as const;

export class UnsupportedSaveSchemaError extends Error {
  constructor(
    public readonly foundVersion: number,
    public readonly supportedVersion: number = CURRENT_SAVE_SCHEMA_VERSION,
  ) {
    super(`Save schema v${foundVersion} is newer than this build supports (v${supportedVersion}).`);
    this.name = "UnsupportedSaveSchemaError";
  }
}

interface SaveEnvelopeV1 {
  schemaVersion: 1;
  guild: unknown;
}

export interface SaveEnvelopeV2 {
  format: typeof SAVE_FORMAT;
  schemaVersion: typeof CURRENT_SAVE_SCHEMA_VERSION;
  savedAt: string;
  guild: GuildState;
}

interface DecodedSavePayload {
  guild: unknown;
  sourceSchemaVersion: number;
  currentSchemaVersion: typeof CURRENT_SAVE_SCHEMA_VERSION;
  migrated: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isEnvelopeV1(value: unknown): value is SaveEnvelopeV1 {
  return isRecord(value) && value.schemaVersion === 1 && "guild" in value;
}

function isEnvelopeV2(value: unknown): value is SaveEnvelopeV2 {
  return isRecord(value)
    && value.format === SAVE_FORMAT
    && value.schemaVersion === CURRENT_SAVE_SCHEMA_VERSION
    && typeof value.savedAt === "string"
    && "guild" in value;
}

function schemaVersionOf(value: unknown): number | null {
  if (!isRecord(value) || typeof value.schemaVersion !== "number") return null;
  return value.schemaVersion;
}

/**
 * Explicit serialized-payload migration pipeline.
 *
 * v0 = historical raw GuildState JSON (no envelope)
 * v1 = first envelope shape: { schemaVersion: 1, guild }
 * v2 = current named envelope with timestamp and format discriminator
 */
function migratePayloadToCurrent(parsed: unknown): DecodedSavePayload {
  let sourceSchemaVersion = 0;
  let working: unknown = parsed;

  const declaredVersion = schemaVersionOf(parsed);
  if (declaredVersion !== null) {
    if (declaredVersion > CURRENT_SAVE_SCHEMA_VERSION) {
      throw new UnsupportedSaveSchemaError(declaredVersion);
    }
    sourceSchemaVersion = declaredVersion;
  }

  if (sourceSchemaVersion === CURRENT_SAVE_SCHEMA_VERSION) {
    if (!isEnvelopeV2(working)) {
      throw new Error(`Save schema v${CURRENT_SAVE_SCHEMA_VERSION} is malformed.`);
    }
    return {
      guild: working.guild,
      sourceSchemaVersion,
      currentSchemaVersion: CURRENT_SAVE_SCHEMA_VERSION,
      migrated: false,
    };
  }

  if (sourceSchemaVersion === 1 && !isEnvelopeV1(working)) {
    throw new Error("Save schema v1 is malformed.");
  }

  // v0 -> v1: wrap the historical raw guild JSON.
  if (sourceSchemaVersion === 0) {
    working = { schemaVersion: 1, guild: working } satisfies SaveEnvelopeV1;
  }

  // v1 -> v2: the timestamp is metadata only; domain-state normalization runs
  // after this payload migration in guildStateMigration.ts.
  if (isEnvelopeV1(working)) {
    working = {
      format: SAVE_FORMAT,
      schemaVersion: CURRENT_SAVE_SCHEMA_VERSION,
      savedAt: new Date(0).toISOString(),
      guild: working.guild,
    };
  }

  if (!isEnvelopeV2(working)) {
    throw new Error("Unsupported or malformed save payload.");
  }

  return {
    guild: working.guild,
    sourceSchemaVersion,
    currentSchemaVersion: CURRENT_SAVE_SCHEMA_VERSION,
    migrated: sourceSchemaVersion !== CURRENT_SAVE_SCHEMA_VERSION,
  };
}

export function decodePersistedSave(value: string): DecodedSavePayload {
  return migratePayloadToCurrent(JSON.parse(value) as unknown);
}

export function serializePersistedGuild(guild: GuildState, savedAt = new Date()): string {
  const envelope: SaveEnvelopeV2 = {
    format: SAVE_FORMAT,
    schemaVersion: CURRENT_SAVE_SCHEMA_VERSION,
    savedAt: savedAt.toISOString(),
    guild,
  };
  return JSON.stringify(envelope);
}

export function inspectPersistedSaveSchema(value: string): {
  sourceSchemaVersion: number;
  currentSchemaVersion: number;
  migrated: boolean;
} {
  const decoded = decodePersistedSave(value);
  return {
    sourceSchemaVersion: decoded.sourceSchemaVersion,
    currentSchemaVersion: decoded.currentSchemaVersion,
    migrated: decoded.migrated,
  };
}
