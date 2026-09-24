import assert from 'node:assert/strict';
import { describe, it } from 'vitest';
import { createGuidedTourProgress, normalizeGuidedTourProgress, reduceGuidedTour, nextGuidedTour, getGuidedStep, isGuideEligible, GUIDED_TOUR_IDS, type GuideSnapshot } from '../src/game/onboarding/guidedTourService';
import { containsGuideRect, relativeGuideRect, guideCardPlacement } from '../src/components/tutorial/guideGeometry';

const fresh = (): GuideSnapshot => ({ mainTab: 'Guild', recruitmentActive: false, heroCount: 2, hasQuestResult: false, hasStoredGear: false, travelRelevant: false });
const advanced = (): GuideSnapshot => ({ ...fresh(), hasQuestResult: true, hasStoredGear: true, travelRelevant: true });
const completeCore = () => reduceGuidedTour(reduceGuidedTour(createGuidedTourProgress(), { type: 'complete', tour: 'guild' }), { type: 'complete', tour: 'quests' });

describe('progressive main-tab guides', () => {
  it('does not force a tutorial on an older save', () => {
    assert.equal(normalizeGuidedTourProgress(undefined).enabled, false);
    assert.equal(nextGuidedTour(normalizeGuidedTourProgress(undefined), fresh()), null);
  });
  it('tolerates malformed and future progress without enabling it', () => {
    for (const value of [null, [], 4, 'bad', { version: 2, enabled: true }, { version: 1, enabled: 'yes' }]) assert.equal(normalizeGuidedTourProgress(value).enabled, false);
  });
  it('accepts only known saved tour ids and states', () => {
    const parsed = normalizeGuidedTourProgress({ version: 1, enabled: true, tours: { guild: { status: 'completed', opened: true }, quests: { status: 'nonsense' }, unknown: { status: 'completed' }, heroes: null } });
    assert.deepEqual(parsed.tours, { guild: { status: 'completed', opened: true } });
  });
  it('retains the two-hero start and waits for recruitment to finish', () => {
    for (const heroCount of [0, 1]) assert.equal(nextGuidedTour(createGuidedTourProgress(), { ...fresh(), heroCount }), null);
    assert.equal(nextGuidedTour(createGuidedTourProgress(), { ...fresh(), recruitmentActive: true }), null);
    assert.equal(nextGuidedTour(createGuidedTourProgress(), fresh()), 'guild');
  });
  it('suspends outside the main shell instead of following into combat or dialogs', () => {
    assert.equal(nextGuidedTour(createGuidedTourProgress(), { ...advanced(), mainTab: null }), null);
  });
  it('introduces Guild before Quests', () => {
    assert.equal(nextGuidedTour(createGuidedTourProgress(), fresh()), 'guild');
    assert.equal(nextGuidedTour(reduceGuidedTour(createGuidedTourProgress(), { type: 'complete', tour: 'guild' }), fresh()), 'quests');
  });
  it('does not tour all five tabs at the start', () => {
    assert.equal(nextGuidedTour(completeCore(), fresh()), null);
  });
  it('waits for a quest result before introducing Heroes', () => {
    assert.equal(isGuideEligible('heroes', fresh()), false);
    assert.equal(nextGuidedTour(completeCore(), { ...fresh(), hasQuestResult: true }), 'heroes');
  });
  it('requires useful stored loot and a quest result for Inventory', () => {
    assert.equal(isGuideEligible('inventory', { ...fresh(), hasStoredGear: true }), false);
    assert.equal(isGuideEligible('inventory', { ...fresh(), hasQuestResult: true }), false);
    assert.equal(isGuideEligible('inventory', advanced()), true);
  });
  it('introduces World only when travel is relevant', () => {
    assert.equal(isGuideEligible('world', fresh()), false);
    assert.equal(isGuideEligible('world', { ...fresh(), travelRelevant: true }), true);
  });
  it('keeps offered, visited, completed and skipped distinct', () => {
    let p = reduceGuidedTour(createGuidedTourProgress(), { type: 'offer', tour: 'guild' });
    assert.deepEqual(p.tours.guild, { status: 'offered', opened: false });
    p = reduceGuidedTour(p, { type: 'visit', tour: 'guild' });
    assert.deepEqual(p.tours.guild, { status: 'in_progress', opened: true });
    p = reduceGuidedTour(p, { type: 'complete', tour: 'guild' });
    p = reduceGuidedTour(p, { type: 'skip', tour: 'quests' });
    assert.equal(p.tours.guild?.status, 'completed');
    assert.equal(p.tours.quests?.status, 'skipped');
  });
  it('is idempotent under repeated rendering and double taps', () => {
    const offered = reduceGuidedTour(createGuidedTourProgress(), { type: 'offer', tour: 'guild' });
    assert.equal(reduceGuidedTour(offered, { type: 'offer', tour: 'guild' }), offered);
    const done = reduceGuidedTour(offered, { type: 'complete', tour: 'guild' });
    for (const type of ['visit', 'offer', 'complete', 'skip'] as const) assert.equal(reduceGuidedTour(done, { type, tour: 'guild' }), done);
  });
  it('never turns a skipped lesson into an action completion', () => {
    const p = reduceGuidedTour(createGuidedTourProgress(), { type: 'skip', tour: 'guild' });
    assert.equal(reduceGuidedTour(p, { type: 'complete', tour: 'guild' }), p);
  });
  it('pauses and resumes without losing progress', () => {
    const p = reduceGuidedTour(createGuidedTourProgress(), { type: 'complete', tour: 'guild' });
    const paused = reduceGuidedTour(p, { type: 'pause' });
    assert.equal(nextGuidedTour(paused, advanced()), null);
    const resumed = reduceGuidedTour(paused, { type: 'resume' });
    assert.equal(resumed.tours.guild?.status, 'completed');
    assert.equal(nextGuidedTour(resumed, fresh()), 'quests');
  });
  it('replay resets only the independent tour progress', () => {
    const p = reduceGuidedTour(completeCore(), { type: 'pause' });
    assert.deepEqual(reduceGuidedTour(p, { type: 'replay' }), createGuidedTourProgress());
    assert.equal(p.tours.guild?.status, 'completed');
  });
  it('round-trips progress through the save JSON representation', () => {
    const p = reduceGuidedTour(reduceGuidedTour(completeCore(), { type: 'skip', tour: 'heroes' }), { type: 'offer', tour: 'world' });
    assert.deepEqual(normalizeGuidedTourProgress(JSON.parse(JSON.stringify(p))), p);
  });
  it('does not mutate another save slot or a previous snapshot', () => {
    const slotOne = createGuidedTourProgress();
    const slotTwo = createGuidedTourProgress();
    const updated = reduceGuidedTour(slotOne, { type: 'complete', tour: 'guild' });
    assert.deepEqual(slotOne.tours, {});
    assert.deepEqual(slotTwo.tours, {});
    assert.equal(updated.tours.guild?.status, 'completed');
  });
  it('prioritizes an already offered eligible guide', () => {
    const p = reduceGuidedTour(completeCore(), { type: 'offer', tour: 'world' });
    assert.equal(nextGuidedTour(p, advanced()), 'world');
    assert.equal(nextGuidedTour(p, { ...advanced(), travelRelevant: false }), 'heroes');
  });
  it('waits for the actual destination tab, not a Next button', () => {
    const before = getGuidedStep('quests', fresh(), new Set(['nav.Quests']));
    assert.equal(before?.target, 'nav.Quests');
    assert.equal(before?.acknowledgement, false);
    const after = getGuidedStep('quests', { ...fresh(), mainTab: 'Quests' }, new Set(['quests.story']));
    assert.equal(after?.target, 'quests.story');
    assert.equal(after?.acknowledgement, false);
  });
  it('finds Campaign when a notification opened another quest category', () => {
    const step = getGuidedStep('quests', { ...fresh(), mainTab: 'Quests' }, new Set(['quests.campaign']));
    assert.equal(step?.target, 'quests.campaign');
  });
  it('waits safely when the story controls are absent', () => {
    assert.equal(getGuidedStep('quests', { ...fresh(), mainTab: 'Quests' }, new Set()), null);
  });
  it('finishes informational hints with acknowledgement, not a forced purchase', () => {
    for (const tour of ['guild', 'heroes', 'inventory', 'world'] as const) {
      const tab = ({ guild: 'Guild', heroes: 'Heroes', inventory: 'Inventory', world: 'World' } as const)[tour];
      assert.equal(getGuidedStep(tour, { ...advanced(), mainTab: tab }, new Set())?.acknowledgement, true);
    }
  });
  it('stops after all eligible tours are finished', () => {
    let p = createGuidedTourProgress();
    for (const tour of GUIDED_TOUR_IDS) p = reduceGuidedTour(p, { type: 'complete', tour });
    assert.equal(nextGuidedTour(p, advanced()), null);
  });
});

describe('measured tutorial placement', () => {
  it('converts window measurements into the safe-area root coordinate space', () => {
    assert.deepEqual(relativeGuideRect({ x: 12, y: 704, width: 65, height: 61 }, { x: 0, y: 44, width: 390, height: 740 }), { x: 12, y: 660, width: 65, height: 61 });
  });
  it('rejects missing, zero-sized, non-finite and offscreen targets', () => {
    const root = { x: 0, y: 0, width: 390, height: 740 };
    for (const rect of [{ x: 0, y: 0, width: 0, height: 40 }, { x: NaN, y: 0, width: 40, height: 40 }, { x: 0, y: 800, width: 40, height: 40 }, { x: -40, y: 0, width: 50, height: 40 }]) assert.equal(relativeGuideRect(rect, root), null);
  });
  it('does not highlight content clipped by its scroll viewport', () => {
    assert.equal(containsGuideRect({ x: 0, y: 90, width: 390, height: 560 }, { x: 15, y: 630, width: 350, height: 44 }), false);
  });
  it('clamps subpixel rounding at screen edges', () => {
    const rect = relativeGuideRect({ x: -0.5, y: 0, width: 40, height: 40 }, { x: 0, y: 0, width: 390, height: 740 });
    assert.equal(rect?.x, 0);
  });
  it('keeps tooltip cards inside phone and tablet layouts without covering the control', () => {
    for (const [width, height] of [[320, 480], [360, 640], [390, 740], [768, 1024], [844, 390]] as const) {
      for (const x of [8, width / 2, width - 68]) {
        const target = { x, y: height - 70, width: 60, height: 61 };
        const card = guideCardPlacement(target, width, height, 218);
        assert.ok(card);
        assert.ok(card.x >= 0 && card.y >= 0 && card.x + card.width <= width && card.y + card.height <= target.y - 12);
      }
    }
  });
  it('positions below a top-of-screen target', () => {
    const target = { x: 18, y: 20, width: 100, height: 44 };
    const card = guideCardPlacement(target, 390, 740, 218);
    assert.ok(card && card.y >= target.y + target.height + 12);
  });
  it('uses a scrollable shorter card when space is limited', () => {
    const card = guideCardPlacement({ x: 20, y: 170, width: 60, height: 44 }, 320, 360, 218);
    assert.ok(card && card.height >= 130 && card.height < 218);
  });
  it('declines an overlay rather than trapping a control in an unusably small viewport', () => {
    assert.equal(guideCardPlacement({ x: 10, y: 90, width: 80, height: 60 }, 200, 240, 218), null);
    assert.equal(guideCardPlacement({ x: 10, y: 250, width: 80, height: 60 }, 200, 240, 218), null);
  });
});
