import { describe, it, expect } from 'vitest';
import { createGuidedTourProgress, normalizeGuidedTourProgress, reduceGuidedTour, nextGuidedTour, getGuidedStep, isGuideEligible, GUIDED_TOUR_IDS, type GuideSnapshot } from '../src/game/onboarding/guidedTourService';
import { containsGuideRect, relativeGuideRect, guideCardPlacement } from '../src/components/tutorial/guideGeometry';

const fresh = (): GuideSnapshot => ({ mainTab: 'Guild', recruitmentActive: false, heroCount: 2, hasQuestResult: false, hasStoredGear: false, travelRelevant: false });
const advanced = (): GuideSnapshot => ({ ...fresh(), hasQuestResult: true, hasStoredGear: true, travelRelevant: true });
const completeCore = () => reduceGuidedTour(reduceGuidedTour(createGuidedTourProgress(), { type: 'complete', tour: 'guild' }), { type: 'complete', tour: 'quests' });

describe('progressive main-tab guides', () => {
  it('does not force a tutorial on an older save', () => {
    expect(normalizeGuidedTourProgress(undefined).enabled).toBe(false);
    expect(nextGuidedTour(normalizeGuidedTourProgress(undefined), fresh())).toBe(null);
  });
  it('tolerates malformed and future progress without enabling it', () => {
    for (const value of [null, [], 4, 'bad', { version: 2, enabled: true }, { version: 1, enabled: 'yes' }]) expect(normalizeGuidedTourProgress(value).enabled).toBe(false);
  });
  it('accepts only known saved tour ids and states', () => {
    const parsed = normalizeGuidedTourProgress({ version: 1, enabled: true, tours: { guild: { status: 'completed', opened: true }, quests: { status: 'nonsense' }, unknown: { status: 'completed' }, heroes: null } });
    expect(parsed.tours).toEqual({ guild: { status: 'completed', opened: true } });
  });
  it('retains the two-hero start and waits for recruitment to finish', () => {
    for (const heroCount of [0, 1]) expect(nextGuidedTour(createGuidedTourProgress(), { ...fresh(), heroCount })).toBe(null);
    expect(nextGuidedTour(createGuidedTourProgress(), { ...fresh(), recruitmentActive: true })).toBe(null);
    expect(nextGuidedTour(createGuidedTourProgress(), fresh())).toBe('guild');
  });
  it('suspends outside the main shell instead of following into combat or dialogs', () => {
    expect(nextGuidedTour(createGuidedTourProgress(), { ...advanced(), mainTab: null })).toBe(null);
  });
  it('introduces Guild before Quests', () => {
    expect(nextGuidedTour(createGuidedTourProgress(), fresh())).toBe('guild');
    expect(nextGuidedTour(reduceGuidedTour(createGuidedTourProgress(), { type: 'complete', tour: 'guild' }), fresh())).toBe('quests');
  });
  it('does not tour all five tabs at the start', () => {
    expect(nextGuidedTour(completeCore(), fresh())).toBe(null);
  });
  it('waits for a quest result before introducing Heroes', () => {
    expect(isGuideEligible('heroes', fresh())).toBe(false);
    expect(nextGuidedTour(completeCore(), { ...fresh(), hasQuestResult: true })).toBe('heroes');
  });
  it('requires useful stored loot and a quest result for Inventory', () => {
    expect(isGuideEligible('inventory', { ...fresh(), hasStoredGear: true })).toBe(false);
    expect(isGuideEligible('inventory', { ...fresh(), hasQuestResult: true })).toBe(false);
    expect(isGuideEligible('inventory', advanced())).toBe(true);
  });
  it('introduces World only when travel is relevant', () => {
    expect(isGuideEligible('world', fresh())).toBe(false);
    expect(isGuideEligible('world', { ...fresh(), travelRelevant: true })).toBe(true);
  });
  it('keeps offered, visited, completed and skipped distinct', () => {
    let p = reduceGuidedTour(createGuidedTourProgress(), { type: 'offer', tour: 'guild' });
    expect(p.tours.guild).toEqual({ status: 'offered', opened: false });
    p = reduceGuidedTour(p, { type: 'visit', tour: 'guild' });
    expect(p.tours.guild).toEqual({ status: 'in_progress', opened: true });
    p = reduceGuidedTour(p, { type: 'complete', tour: 'guild' });
    p = reduceGuidedTour(p, { type: 'skip', tour: 'quests' });
    expect(p.tours.guild?.status).toBe('completed');
    expect(p.tours.quests?.status).toBe('skipped');
  });
  it('is idempotent under repeated rendering and double taps', () => {
    const offered = reduceGuidedTour(createGuidedTourProgress(), { type: 'offer', tour: 'guild' });
    expect(reduceGuidedTour(offered, { type: 'offer', tour: 'guild' })).toBe(offered);
    const done = reduceGuidedTour(offered, { type: 'complete', tour: 'guild' });
    for (const type of ['visit', 'offer', 'complete', 'skip'] as const) expect(reduceGuidedTour(done, { type, tour: 'guild' })).toBe(done);
  });
  it('never turns a skipped lesson into an action completion', () => {
    const p = reduceGuidedTour(createGuidedTourProgress(), { type: 'skip', tour: 'guild' });
    expect(reduceGuidedTour(p, { type: 'complete', tour: 'guild' })).toBe(p);
  });
  it('pauses and resumes without losing progress', () => {
    const p = reduceGuidedTour(createGuidedTourProgress(), { type: 'complete', tour: 'guild' });
    const paused = reduceGuidedTour(p, { type: 'pause' });
    expect(nextGuidedTour(paused, advanced())).toBe(null);
    const resumed = reduceGuidedTour(paused, { type: 'resume' });
    expect(resumed.tours.guild?.status).toBe('completed');
    expect(nextGuidedTour(resumed, fresh())).toBe('quests');
  });
  it('replay resets only the independent tour progress', () => {
    const p = reduceGuidedTour(completeCore(), { type: 'pause' });
    expect(reduceGuidedTour(p, { type: 'replay' })).toEqual(createGuidedTourProgress());
    expect(p.tours.guild?.status).toBe('completed');
  });
  it('round-trips progress through the save JSON representation', () => {
    const p = reduceGuidedTour(reduceGuidedTour(completeCore(), { type: 'skip', tour: 'heroes' }), { type: 'offer', tour: 'world' });
    expect(normalizeGuidedTourProgress(JSON.parse(JSON.stringify(p)))).toEqual(p);
  });
  it('does not mutate another save slot or a previous snapshot', () => {
    const slotOne = createGuidedTourProgress();
    const slotTwo = createGuidedTourProgress();
    const updated = reduceGuidedTour(slotOne, { type: 'complete', tour: 'guild' });
    expect(slotOne.tours).toEqual({});
    expect(slotTwo.tours).toEqual({});
    expect(updated.tours.guild?.status).toBe('completed');
  });
  it('prioritizes an already offered eligible guide', () => {
    const p = reduceGuidedTour(completeCore(), { type: 'offer', tour: 'world' });
    expect(nextGuidedTour(p, advanced())).toBe('world');
    expect(nextGuidedTour(p, { ...advanced(), travelRelevant: false })).toBe('heroes');
  });
  it('waits for the actual destination tab, not a Next button', () => {
    const before = getGuidedStep('quests', fresh(), new Set(['nav.Quests']));
    expect(before?.target).toBe('nav.Quests');
    expect(before?.acknowledgement).toBe(false);
    const after = getGuidedStep('quests', { ...fresh(), mainTab: 'Quests' }, new Set(['quests.story']));
    expect(after?.target).toBe('quests.story');
    expect(after?.acknowledgement).toBe(false);
  });
  it('finds Campaign when a notification opened another quest category', () => {
    const step = getGuidedStep('quests', { ...fresh(), mainTab: 'Quests' }, new Set(['quests.campaign']));
    expect(step?.target).toBe('quests.campaign');
  });
  it('waits safely when the story controls are absent', () => {
    expect(getGuidedStep('quests', { ...fresh(), mainTab: 'Quests' }, new Set())).toBe(null);
  });
  it('finishes informational hints with acknowledgement, not a forced purchase', () => {
    for (const tour of ['guild', 'heroes', 'inventory', 'world'] as const) {
      const tab = ({ guild: 'Guild', heroes: 'Heroes', inventory: 'Inventory', world: 'World' } as const)[tour];
      expect(getGuidedStep(tour, { ...advanced(), mainTab: tab }, new Set())?.acknowledgement).toBe(true);
    }
  });
  it('stops after all eligible tours are finished', () => {
    let p = createGuidedTourProgress();
    for (const tour of GUIDED_TOUR_IDS) p = reduceGuidedTour(p, { type: 'complete', tour });
    expect(nextGuidedTour(p, advanced())).toBe(null);
  });
});

describe('measured tutorial placement', () => {
  it('converts window measurements into the safe-area root coordinate space', () => {
    expect(relativeGuideRect({ x: 12, y: 704, width: 65, height: 61 }, { x: 0, y: 44, width: 390, height: 740 })).toEqual({ x: 12, y: 660, width: 65, height: 61 });
  });
  it('rejects missing, zero-sized, non-finite and offscreen targets', () => {
    const root = { x: 0, y: 0, width: 390, height: 740 };
    for (const rect of [{ x: 0, y: 0, width: 0, height: 40 }, { x: NaN, y: 0, width: 40, height: 40 }, { x: 0, y: 800, width: 40, height: 40 }, { x: -40, y: 0, width: 50, height: 40 }]) expect(relativeGuideRect(rect, root)).toBe(null);
  });
  it('does not highlight content clipped by its scroll viewport', () => {
    expect(containsGuideRect({ x: 0, y: 90, width: 390, height: 560 }, { x: 15, y: 630, width: 350, height: 44 })).toBe(false);
  });
  it('clamps subpixel rounding at screen edges', () => {
    const rect = relativeGuideRect({ x: -0.5, y: 0, width: 40, height: 40 }, { x: 0, y: 0, width: 390, height: 740 });
    expect(rect?.x).toBe(0);
  });
  it('keeps tooltip cards inside phone and tablet layouts without covering the control', () => {
    for (const [width, height] of [[320, 480], [360, 640], [390, 740], [768, 1024], [844, 390]] as const) {
      for (const x of [8, width / 2, width - 68]) {
        const target = { x, y: height - 70, width: 60, height: 61 };
        const card = guideCardPlacement(target, width, height, 218);
        expect(card).toBeTruthy();
        if (!card) throw new Error('Expected a visible tutorial card');
        expect(card.x >= 0 && card.y >= 0 && card.x + card.width <= width && card.y + card.height <= target.y - 12).toBeTruthy();
      }
    }
  });
  it('positions below a top-of-screen target', () => {
    const target = { x: 18, y: 20, width: 100, height: 44 };
    const card = guideCardPlacement(target, 390, 740, 218);
    expect(card && card.y >= target.y + target.height + 12).toBeTruthy();
  });
  it('uses a scrollable shorter card when space is limited', () => {
    const card = guideCardPlacement({ x: 20, y: 170, width: 60, height: 44 }, 320, 360, 218);
    expect(card && card.height >= 130 && card.height < 218).toBeTruthy();
  });
  it('declines an overlay rather than trapping a control in an unusably small viewport', () => {
    expect(guideCardPlacement({ x: 10, y: 90, width: 80, height: 60 }, 200, 240, 218)).toBe(null);
    expect(guideCardPlacement({ x: 10, y: 250, width: 80, height: 60 }, 200, 240, 218)).toBe(null);
  });
});
