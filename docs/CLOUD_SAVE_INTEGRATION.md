# Rising Guildmaster cloud-save integration

The game now has a provider-neutral cloud-save boundary in `src/game/save/cloudSaveService.ts`.

## Already implemented

- Two independent local save slots.
- One recovery backup per slot.
- Versioned guild payload validation.
- Cloud snapshot format with slot ID, saved time, guild summary and checksum.
- Cloud/local conflict comparison.
- Upload/download helpers.
- Snapshot validation before a cloud payload can become a guild save.

## Still requires platform configuration

A production Google Play Games / cloud provider must supply a `CloudSaveProvider` implementation and the required native credentials / Play Console configuration. This repository intentionally does not fake a working cloud connection when those credentials are absent.

When the provider is connected, the recommended flow is:

1. Read the local `SaveSlotSummary`.
2. Read the cloud snapshot for the same slot.
3. Use `compareCloudSave` to decide whether a conflict choice is needed.
4. Validate any downloaded snapshot with `validateCloudSaveSnapshot`.
5. Write the chosen guild into the normal local save-slot service so the existing recovery backup remains active.
6. Upload only after the local save has validated successfully.

Never silently overwrite a newer local slot with an older cloud snapshot.
