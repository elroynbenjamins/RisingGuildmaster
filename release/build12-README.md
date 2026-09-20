# Rising Guildmaster — integrated production build 12

Use `RisingGuildmaster-0.1.0-build12-production.aab` for the integrated release. Build 11 remains on hold and is superseded by this bundle.

- Version name: **0.1.0**
- Android version code: **12**
- Package: `com.elroybenjamins.risingguildmaster`
- Size: **140,487,503 bytes** (134.0 MiB)
- Source commit: `69c436a2a6eade821029b939b830628cd3e4a594`, also on local `main`
- SHA-256: `4C6696D08580B81CDBF9238FF1C4B40D4AC410D9B79AD82BDD9BA82A10818AEC`
- Signature verified; signing certificate matches build 11.
- Bundle contains 1,310 WebP resources, including the optimized runtime portraits and illustrations.

[Successful Expo build](https://expo.dev/accounts/snelroy/projects/guildmaster/builds/63c9deb8-62d7-4b9d-a015-0625cdae5f16)

Validation completed before building: TypeScript, 850 tests, release configuration, artwork/icon checks, 47 rendered screens, targeted visual checks, guided recruitment without mandatory comparison, and save/reload through the actual app. Android export and the signed native production build also succeeded.

Detailed integration notes: `../docs/release-integration-2026-09-20.md`.
Test evidence: `../output/release-integration-check/`.
Store listing and initial release notes: `../output/play-store-marketing/`.

This file has not been uploaded to Google Play. Native purchases and live ad delivery still need verification through a Play testing track; the browser checks do not exercise those services.
