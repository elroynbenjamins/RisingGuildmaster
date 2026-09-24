# Interactive tab guides — first integration pass

## Scope

This pass adds a reusable, non-blocking spotlight and the five main-tab introductions. It preserves the existing guided recruitment, starter journey, party requirements, prices, combat and rewards. Quests additionally walks through the real Campaign category and story action. It does not yet replace the existing recruitment, party-preparation or combat explanations with action-by-action spotlight tours.

New players opt in with Begin Guided Guild. After recruitment, Guild and Quests are introduced first. Heroes waits for the first quest result; Inventory also requires stored gear; World waits for an actual campaign/starter travel requirement. Older saves have no `tutorial.guided` field and remain opt-in through the Handbook.

## Integration

- `guidedTourService.ts` is a pure state machine. Offered, in-progress, completed and skipped are separate. Pause/resume preserve state; replay resets only this field.
- `GameDialogProvider` hosts the guide within the existing safe-area/theme/guild providers. Automatic notices see `isDialogOpen` while a spotlight is visible. Explicit action confirmations preempt the guide. The existing scrollable dialog body is retained.
- `ManagementShell` reports the committed active tab and clears it when nested screens open. Successful story-button navigation is acknowledged only after this shell unmounts, not merely on touch-down.
- Native targets register stable IDs through `useGuideTarget` / `GuidePressable`. `ActionButton.guideId` and `SegmentedTabs.guideIds` are opt-in additions. They do not wrap buttons in extra layout views.
- `GuidedScrollView` reveals a requested offscreen anchor once. It checks scroll-viewport clipping and does not fight subsequent manual scrolling.
- The overlay measures both root and target in window coordinates. It rejects absent, clipped and invalid targets, remeasures while visible, and hides rather than covering a target when there is not enough space. The tooltip copy can scroll.
- Dimming views never intercept touches. Existing navigation and Back remain available. No guide calls a spending, travel, equipment or deployment service.
- Guild context accepts functional updates so guide progress is merged into the latest state, not a stale gameplay snapshot.

## Help

Settings → Guildmaster Handbook → Interactive tab guides: pause/resume or replay. This does not call `beginTutorial`, reset recruitment, grant rewards, or modify other progress.

## Automated checks

`tests/guidedTours.test.ts` contains 31 tests covering progressive eligibility, legacy and malformed state, JSON round trips, immutable save-slot state, idempotency, skip/completion distinction, pause/resume/replay, real tab/category selection, absent targets, safe-area conversion and phone/tablet/landscape tooltip geometry.

For local isolated verification the two dependency-free modules were typechecked and these same test cases were executed with Node's test runner. Repository CI must also run its normal TypeScript check and Vitest suite. Geometry tests are not a native device test.

## Native acceptance checklist (not yet verified on a device)

1. Fresh save: Begin Guided Guild, complete two-hero recruitment, return to Guild. Follow Guild → Quests → Campaign → story. Do not require extra heroes or consume resources.
2. Choose Skip Guided Recruitment; confirm no new automatic guides. Replay from the Handbook; confirm neither heroes nor treasury changes.
3. Open Quests through a Side Quests notification; the guide must point to Campaign before the story action.
4. Scroll the story button out of view, expand Special activities, rotate the phone, use a large text scale and toggle reduced motion. No stale spotlight or covered button.
5. Open a confirmation, show the keyboard, background/resume the app, leave for a nested screen and return. No stacked coach card or dead overlay.
6. Not now skips only the current lesson. Pause guides pauses all. Reload either save slot and verify the other slot's guide state is unchanged.
7. First quest result introduces Heroes; first stored loot introduces Inventory; first required trip introduces World. No full five-tab tour at initial launch.

## Next integration work

Add dedicated successful-action hooks and anchors to recruitment/candidate review, party preparation, legal combat movement/attacks/End Turn, equipping and skill-point spending. Introduce special activity tours from their actual unlock services. Do not mark actions complete on a touch event or require a paid/irreversible action for guide completion.
