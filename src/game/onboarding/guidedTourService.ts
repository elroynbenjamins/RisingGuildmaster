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
    return { tour, target: 'quests.story', title: 'Your next story order', body: 'This button opens your current campaign objective. Review its briefing, then choose available heroes. Opening the timeline does not spend resources or deploy anyone.', acknowledgement: false };
  }
  const copy: Record<Exclude<GuidedTourId, 'quests'>, { title: string; body: string }> = {
    guild: { title: 'Your command center', body: 'Follow Current Order for your next recommended task. Recruit adds heroes; Manage opens guild services. Use End Day when you need recovery or time to pass, and review its costs before confirming.' },
    heroes: { title: 'Get to know your company', body: 'Tap a hero to review health, readiness, equipment and skills. Check availability before deployment. Skill choices are introduced when points are available; you do not need to spend anything now.' },
    inventory: { title: 'Put your first loot to use', body: 'Tap stored gear to inspect it. Check its level and class requirements, then equip compatible items from a hero’s Equipment screen. Equipped items stay with that hero, rather than appearing as stored gear.' },
    world: { title: 'Travel toward your objective', body: 'Open the region containing your next objective. Review the destination, travel party, rations and time before confirming. The guide will never confirm travel for you.' },
  };
  return { tour, target: `nav.${destination}`, ...copy[tour], acknowledgement: true };
}
