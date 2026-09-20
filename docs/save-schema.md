# Save schema and migration policy

Rising Guildmaster uses two independent local guild save slots plus a separate account-entitlement record.

## Storage keys

The historical AsyncStorage key names are intentionally preserved for compatibility:

- `guildmaster.guild.slot.1.v1`
- `guildmaster.guild.slot.1.v1.backup`
- `guildmaster.guild.slot.2.v1`
- `guildmaster.guild.slot.2.v1.backup`

The `v1` suffix in those keys is now only a storage-key generation. It is **not** the serialized save schema version. Save schema versioning is carried inside the payload so future releases do not need to rename or copy storage keys every time the model changes.

The old single-save keys are still recognized once so existing installations can migrate into Slot 1:

- `guildmaster.guild.v1`
- `guildmaster.guild.v1.backup`

## Current payload

Current saves use schema version 2:

```json
{
  "format": "rising-guildmaster-save",
  "schemaVersion": 2,
  "savedAt": "2026-09-12T08:00:00.000Z",
  "guild": { "...": "GuildState" }
}
```

`src/game/save/saveSchema.ts` owns serialized-envelope versions. `src/game/save/guildStateMigration.ts` owns field/default migrations inside `GuildState`. `src/game/save/saveService.ts` is limited to storage, backup rotation, account entitlements, and calling those migration layers.

## Migration chain

- **v0** — historical raw `GuildState` JSON with no envelope.
- **v1** — transitional `{ schemaVersion: 1, guild }` envelope.
- **v2** — current named envelope with `format`, `schemaVersion`, and `savedAt`.

When a v0/v1 primary successfully loads, it is rewritten in place as v2 only after normalization succeeds. The prior raw payload is preserved as the backup snapshot first.

A save that declares a schema newer than the current build supports is rejected instead of being guessed at. The loader does not fall back to an older backup in this case because a future-version primary is valid newer data, not corruption. The affected slot is reported to the main menu as **PROTECTED**, while the other slot still loads independently. This prevents an older app build from silently damaging or presenting a newer save as an empty slot.

## Backup safety

Each slot has one rotating backup. A new autosave is validated before replacing the primary. The previous primary is copied to backup only if it can still be deserialized. If the existing primary belongs to an unsupported future schema, the save write aborts rather than overwriting it. If the primary later becomes corrupt or incomplete, load falls back to the backup and repairs the primary with a current-schema payload.

Autosaves remain serialized per slot, so rapid state updates cannot race and allow an older write to finish after a newer one.

## Adding a future migration

When the serialized envelope changes:

1. Increment `CURRENT_SAVE_SCHEMA_VERSION` in `saveSchema.ts`.
2. Add an explicit `vN -> vN+1` migration step.
3. Keep older steps intact; never make a migration depend on UI state.
4. Add tests for the old payload, the new payload, unsupported future versions, and backup recovery.

When `GuildState` fields change but the envelope does not need to change, add the default/normalization logic to `guildStateMigration.ts` and a focused migration test.
