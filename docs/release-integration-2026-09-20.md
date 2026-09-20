# Redesigned release integration — 20 September 2026

Integrated the preserved redesign with GitHub main's current gameplay and release changes.

- Retained the War Table dashboard, illustrated portraits, activity strip, redesigned roster, character sheets, recruitment cards and seven-day planner.
- Connected equipment selection, crafting material routes, quest-category navigation, tutorial guide and activity destinations.
- Preserved campaign travel and combat safeguards, achievements, guild identity, tavern upgrades, alumni rehiring, retirement, and contract departure/renewal controls.
- Combined versioned save envelopes with domain migrations and both historical slot-key formats. Added regression coverage for migration, deletion, future-version protection, and contract renewal consistency.
- Kept the requested healing, workshop and training discounts. Training remains XP-only with the newer campaign/roster caps. Visible side quests remain single-clear with guaranteed material rewards; newer reward scaling remains intact.
- Restored daily health recovery and boss phase transitions, and retained recruitment's one-hire-per-batch rule. Candidate comparison is optional in the guided tutorial.
- Runtime WebP illustrations preserve image dimensions and exact alpha channels. Original PNG art remains available. Converted illustration data fell from 429.1 MiB to 72.5 MiB; the complete Android asset export is 79.5 MiB.

## Validation

- TypeScript: passed.
- Complete test suite: 850 tests passed.
- Release configuration: passed.
- Artwork: 913 source PNGs passed dimension checks; 192 UI/equipment PNG icons passed registry checks.
- Browser screen audit: 47 screens rendered without runtime errors, missing image requests, or horizontal page overflow.
- Optimized-art checks: 11 additional screens/tab states, including active combat, passed. Final finance, recruitment and character-tab checks also passed.
- Live app smoke test: created a named guild, inspected a recruit, hired two heroes using the free tutorial refresh without comparing candidates, entered Chapter 1, reloaded, and continued into the redesigned dashboard with both heroes saved.
- Android production JavaScript/assets export: passed.

Native device testing, Play Billing purchases, live ad delivery and Google Play's pre-launch report still require a device/Play testing track. Browser checks do not verify those native services.

Build 11 predates this integration and remains on hold. Use the subsequently generated integrated production bundle.
