/** Small, save-slot-owned tours. Recruitment and game progression remain authoritative. */
export const GUIDED_TOUR_IDS = ['guild', 'quests', 'heroes', 'inventory', 'world'] as const;
export type GuidedTourId = typeof GUIDED_TOUR_IDS[number];
export type GuideTab = 'Guild' | 'Quests' | 'World' | 'Heroes' | 'Inventory';
export type GuideStatus = 'offered' | 'in_progress' | 'completed' | 'skipped';
export interface GuideRecord { status: GuideStatus; opened: boolean }
export interface GuidedTourProgress {
  version: 1;
  enabled: boolean;
  tours: Partial<Record<GuidedTourId, GuideRecord>>;
}
export interface GuideSnapshot {
  mainTab: GuideTab | null;
  recruitmentActive: boolean;
  heroCount: number;
  hasQuestResult: boolean;
  hasStoredGear: boolean;
  travelRelevant: boolean;
}
export interface GuidedStep {
  tour: GuidedTourId;
  target: string;
  title: string;
  body: string;
  acknowledgement: boolean;
}
export const GUIDE_DESTINATIONS: Record<GuidedTourId, GuideTab> = {
  guild: 'Guild', quests: 'Quests', heroes: 'Heroes', inventory: 'Inventory', world: 'World',
};
export function createGuidedTourProgress(): GuidedTourProgress {
  return { version: 1, enabled: true, tours: {} };
}
/** Missing fields belong to older saves: do not automatically replay new tutorials. */
export function normalizeGuidedTourProgress(value: unknown): GuidedTourProgress {
  const empty: GuidedTourProgress = { version: 1, enabled: false, tours: {} };
  if (!value || typeof value !== 'object') return empty;
  const raw = value as Record<string, unknown>;
  if (raw.version !== 1) return empty;
  const tours = raw.tours && typeof raw.tours === 'object' ? raw.tours as Record<string, unknown> : {};
  for (const id of GUIDED_TOUR_IDS) {
    const entry = tours[id];
    if (!entry || typeof entry !== 'object') continue;
    const record = entry as Record<string, unknown>;
    if (record.status === 'offered' || record.status === 'in_progress' || record.status === 'completed' || record.status === 'skipped') {
      empty.tours[id] = { status: record.status, opened: record.opened === true };
    }
  }
  return { ...empty, enabled: raw.enabled === true };
}
export type GuideAction =
  | { type: 'offer' | 'visit' | 'complete' | 'skip'; tour: GuidedTourId }
  | { type: 'pause' } | { type: 'resume' } | { type: 'replay' };
export function reduceGuidedTour(progress: GuidedTourProgress, action: GuideAction): GuidedTourProgress {
  if (action.type === 'replay') return createGuidedTourProgress();
  if (action.type === 'pause' || action.type === 'resume') {
    const enabled = action.type === 'resume';
    return progress.enabled === enabled ? progress : { ...progress, enabled };
  }
  const existing = progress.tours[action.tour];
  if (existing?.status === 'completed' || existing?.status === 'skipped') return progress;
  const status: GuideStatus = action.type === 'complete' ? 'completed' : action.type === 'skip' ? 'skipped' : action.type === 'visit' ? 'in_progress' : existing?.status ?? 'offered';
  const opened = action.type === 'visit' || existing?.opened === true;
  if (existing?.status === status && existing.opened === opened) return progress;
  return { ...progress, tours: { ...progress.tours, [action.tour]: { status, opened } } };
}
export function isGuideEligible(tour: GuidedTourId, snapshot: GuideSnapshot): boolean {
  if (snapshot.recruitmentActive || snapshot.heroCount < 2) return false;
  switch (tour) {
    case 'guild': case 'quests': return true;
    case 'heroes': return snapshot.hasQuestResult;
    case 'inventory': return snapshot.hasStoredGear && snapshot.hasQuestResult;
    case 'world': return snapshot.travelRelevant;
  }
}
export function nextGuidedTour(progress: GuidedTourProgress, snapshot: GuideSnapshot): GuidedTourId | null {
  if (!progress.enabled || !snapshot.mainTab) return null;
  // A started tour gets priority, but cannot force a now-unavailable system.
  const available = GUIDED_TOUR_IDS.filter(id => isGuideEligible(id, snapshot) && progress.tours[id]?.status !== 'completed' && progress.tours[id]?.status !== 'skipped');
  return available.find(id => progress.tours[id]?.status === 'in_progress' || progress.tours[id]?.status === 'offered') ?? available[0] ?? null;
}
export function getGuidedStep(tour: GuidedTourId, snapshot: GuideSnapshot, targets: ReadonlySet<string>): GuidedStep | null {
  const destination = GUIDE_DESTINATIONS[tour];
  if (snapshot.mainTab !== destination) {
    return { tour, target: `nav.${destination}`, title: `Open ${destination}`, body: `Tap the highlighted ${destination} tab. You are using the real screen; you can explore elsewhere or stop this guide at any time.`, acknowledgement: false };
  }
  if (tour === 'quests') {
    if (!targets.has('quests.story')) {
      return targets.has('quests.campaign') ? { tour, target: 'quests.campaign', title: 'Choose Campaign', body: 'Open Campaign to find the next story objective. Side quests and bosses become useful as your guild progresses.', acknowledgement: false } : null;
    }
    return { tour, target: 'quests.story', title: 'Your next story order', body: 'Campaign is the main story path. Open the highlighted story card when you are ready; party risk is checked before deployment.', acknowledgement: true };
  }
  if (tour === 'guild') {
    return targets.has('guild.currentOrder')
      ? { tour, target: 'guild.currentOrder', title: 'Follow Current Order', body: 'When you are unsure what to do next, this is the guild’s recommended next action. It never deploys or spends resources silently.', acknowledgement: true }
      : null;
  }
  if (tour === 'heroes') {
    return targets.has('heroes.firstHero')
      ? { tour, target: 'heroes.firstHero', title: 'Inspect a hero', body: 'Open a hero to see HP, readiness, gear and skills. Those are the checks that matter before deployment.', acknowledgement: false }
      : null;
  }
  if (tour === 'inventory') {
    return targets.has('inventory.firstItem')
      ? { tour, target: 'inventory.firstItem', title: 'Inspect your loot', body: 'Open the highlighted item. The comparison view shows who can equip it and whether it is actually an upgrade.', acknowledgement: false }
      : null;
  }
  if (tour === 'world') {
    return targets.has('world.campaignRoute')
      ? { tour, target: 'world.campaignRoute', title: 'Follow the campaign route', body: 'Use this control to focus the next campaign leg. Travel shows day and ration costs before you commit.', acknowledgement: false }
      : null;
  }
  return null;
}
