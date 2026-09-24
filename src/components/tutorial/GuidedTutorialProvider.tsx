import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Keyboard, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useGuild } from '../../state/GuildContext';
import { useTheme } from '../../theme/theme';
import { getAvailableCampaignNodes } from '../../game/campaign/campaignService';
import { getCampaignNodeLocationRequirement, isAtCampaignLocation } from '../../game/campaign/campaignLocationService';
import { needsStarterJourneyTravel } from '../../game/onboarding/starterJourneyService';
import { GUIDE_DESTINATIONS, getGuidedStep, nextGuidedTour, normalizeGuidedTourProgress, reduceGuidedTour, type GuideAction, type GuideSnapshot, type GuideTab } from '../../game/onboarding/guidedTourService';
import { GuidedTutorialContext, type GuideAnchor, type GuidedTutorialContextValue } from './GuidedTutorialContext';
import { guideCardPlacement, relativeGuideRect, type GuideRect } from './guideGeometry';

export function GuidedTutorialProvider({ children, blocked, onVisibilityChange }: React.PropsWithChildren<{ blocked: boolean; onVisibilityChange(visible: boolean): void }>) {
  const { guild, updateGuild, gameStarted, isHydrated, activeSlotId } = useGuild();
  const { colors } = useTheme();
  const dimensions = useWindowDimensions();
  const root = useRef<View>(null);
  const anchors = useRef(new Map<string, GuideAnchor>());
  const [revision, setRevision] = useState(0);
  const [mainTab, setMainTab] = useState<GuideTab | null>(null);
  const mainOwner = useRef<object | null>(null);
  const [snoozed, setSnoozed] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [appActive, setAppActive] = useState(AppState.currentState === null || AppState.currentState === 'active');
  const activeTour = useRef<string | null>(null);
  const pendingStoryNavigation = useRef<{ slot: number | null } | null>(null);
  const [frame, setFrame] = useState<{ key: string; target: GuideRect; root: GuideRect } | null>(null);
  const session = useRef({ slot: activeSlotId, started: gameStarted });
  session.current = { slot: activeSlotId, started: gameStarted };

  const dispatch = useCallback((action: GuideAction) => {
    const slot = session.current.slot;
    if (!session.current.started || slot === null) return;
    if (action.type === 'pause' || action.type === 'skip') setSnoozed(true);
    if (action.type === 'resume' || action.type === 'replay') setSnoozed(false);
    updateGuild(current => {
      if (!session.current.started || session.current.slot !== slot) return current;
      const next = reduceGuidedTour(normalizeGuidedTourProgress(current.tutorial.guided), action);
      if (JSON.stringify(next) === JSON.stringify(current.tutorial.guided)) return current;
      return { ...current, tutorial: { ...current.tutorial, guided: next } };
    });
  }, [updateGuild]);
  const register = useCallback((id: string, anchor: GuideAnchor) => {
    anchors.current.set(id, anchor);
    setRevision(value => value + 1);
    return () => {
      if (anchors.current.get(id)?.token !== anchor.token) return;
      anchors.current.delete(id);
      setRevision(value => value + 1);
    };
  }, []);
  const enterMainTab = useCallback((tab: GuideTab) => {
    const token = {};
    mainOwner.current = token;
    setMainTab(tab);
    return () => {
      if (mainOwner.current !== token) return;
      mainOwner.current = null;
      setMainTab(null);
    };
  }, []);
  const finishNavigation = useCallback(() => {
    // The caller requests campaign navigation. Completion waits for the main shell to unmount.
    if (activeTour.current === 'quests') pendingStoryNavigation.current = { slot: session.current.slot };
  }, []);
  useEffect(() => { setSnoozed(false); }, [mainTab, activeSlotId]);
  useEffect(() => {
    if (!gameStarted) pendingStoryNavigation.current = null;
    const pending = pendingStoryNavigation.current;
    if (mainTab !== null || !pending) return;
    pendingStoryNavigation.current = null;
    if (gameStarted && pending.slot === activeSlotId) dispatch({ type: 'complete', tour: 'quests' });
  }, [mainTab, gameStarted, activeSlotId, dispatch]);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardOpen(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardOpen(false));
    const app = AppState.addEventListener('change', value => setAppActive(value === 'active'));
    return () => { show.remove(); hide.remove(); app.remove(); };
  }, []);

  const progress = useMemo(() => normalizeGuidedTourProgress(guild.tutorial.guided), [guild.tutorial.guided]);
  const snapshot = useMemo<GuideSnapshot>(() => {
    const node = getAvailableCampaignNodes(guild.world)[0];
    const requirement = node ? getCampaignNodeLocationRequirement(node.id) : null;
    return { mainTab, recruitmentActive: guild.tutorial.active, heroCount: guild.heroes.length, hasQuestResult: guild.questChronicle.length > 0, hasStoredGear: guild.inventory.length > 0, travelRelevant: needsStarterJourneyTravel(guild) || Boolean(requirement && !isAtCampaignLocation(guild.world, requirement)) };
  }, [guild, mainTab]);
  const targetIds = useMemo(() => new Set(anchors.current.keys()), [revision]);
  const tour = nextGuidedTour(progress, snapshot);
  activeTour.current = tour;
  const step = tour ? getGuidedStep(tour, snapshot, targetIds) : null;
  const target = step ? anchors.current.get(step.target) : undefined;
  const key = step ? `${activeSlotId}:${step.tour}:${step.target}:${mainTab}` : '';
  const allowed = Boolean(gameStarted && isHydrated && step && target && !blocked && !snoozed && !keyboardOpen && appActive);

  useEffect(() => {
    setFrame(null);
    if (!allowed || !target) return;
    let disposed = false;
    target.reveal?.();
    const measure = () => {
      target.measure(targetRect => {
        if (disposed || anchors.current.get(step!.target)?.token !== target.token) return;
        if (!targetRect || !root.current) { setFrame(null); return; }
        root.current.measureInWindow((x, y, width, height) => {
          if (disposed) return;
          const rootRect = { x, y, width, height };
          const relative = relativeGuideRect(targetRect, rootRect);
          if (!relative) { setFrame(null); return; }
          setFrame(previous => previous?.key === key && JSON.stringify(previous.target) === JSON.stringify(relative) && JSON.stringify(previous.root) === JSON.stringify(rootRect) ? previous : { key, target: relative, root: rootRect });
        });
      });
    };
    measure();
    // Only the single active anchor is measured. Scrolling cannot leave an old spotlight behind.
    const timer = setInterval(measure, 250);
    return () => { disposed = true; clearInterval(timer); };
  }, [allowed, key, target, dimensions.width, dimensions.height]);

  const currentFrame = allowed && frame?.key === key ? frame : null;
  const card = currentFrame ? guideCardPlacement(currentFrame.target, currentFrame.root.width, currentFrame.root.height, 218) : null;
  const visible = Boolean(step && currentFrame && card);
  useEffect(() => { onVisibilityChange(visible); return () => onVisibilityChange(false); }, [visible, onVisibilityChange]);
  useEffect(() => {
    if (!visible || !tour) return;
    if (!progress.tours[tour]) dispatch({ type: 'offer', tour });
    else if (mainTab === GUIDE_DESTINATIONS[tour] && !progress.tours[tour]?.opened) dispatch({ type: 'visit', tour });
  }, [visible, tour, mainTab, progress, dispatch]);
  const value = useMemo<GuidedTutorialContextValue>(() => ({ register, enterMainTab, dispatch, finishNavigation }), [register, enterMainTab, dispatch, finishNavigation]);

  return <GuidedTutorialContext.Provider value={value}><View ref={root} collapsable={false} style={styles.root}>
    {children}
    {visible && step && currentFrame && card ? <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[styles.dim, { left: 0, top: 0, right: 0, height: currentFrame.target.y }]} />
        <View style={[styles.dim, { left: 0, top: currentFrame.target.y + currentFrame.target.height, right: 0, bottom: 0 }]} />
        <View style={[styles.dim, { left: 0, top: currentFrame.target.y, width: currentFrame.target.x, height: currentFrame.target.height }]} />
        <View style={[styles.dim, { left: currentFrame.target.x + currentFrame.target.width, top: currentFrame.target.y, right: 0, height: currentFrame.target.height }]} />
        <View style={[styles.outline, { left: currentFrame.target.x, top: currentFrame.target.y, width: currentFrame.target.width, height: currentFrame.target.height, borderColor: colors.gold }]} />
      </View>
      <View style={[styles.card, { left: card.x, top: card.y, width: card.width, height: card.height, backgroundColor: colors.panel, borderColor: colors.gold }]}>
        <ScrollView style={styles.copy} contentContainerStyle={styles.copyContent}>
          <Text style={[styles.eyebrow, { color: colors.gold }]}>GUILDMASTER GUIDE</Text>
          <Text accessibilityLiveRegion="polite" style={[styles.title, { color: colors.text }]}>{step.title}</Text>
          <Text style={[styles.body, { color: colors.text }]}>{step.body}</Text>
          {!step.acknowledgement && <Text style={[styles.hint, { color: colors.gold }]}>Tap the highlighted control to continue.</Text>}
        </ScrollView>
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" accessibilityLabel="Skip this guide for now" onPress={() => dispatch({ type: 'skip', tour: step.tour })} style={styles.action}><Text style={{ color: colors.muted }}>Not now</Text></Pressable>
          {step.acknowledgement ? <Pressable accessibilityRole="button" onPress={() => dispatch({ type: 'complete', tour: step.tour })} style={[styles.action, { backgroundColor: colors.gold, borderRadius: 8 }]}><Text style={{ color: colors.buttonText, fontWeight: '700' }}>Got it</Text></Pressable> : <Pressable accessibilityRole="button" onPress={() => dispatch({ type: 'pause' })} style={styles.action}><Text style={{ color: colors.muted }}>Pause guides</Text></Pressable>}
        </View>
      </View>
    </View> : null}
  </View></GuidedTutorialContext.Provider>;
}
const styles = StyleSheet.create({
  root: { flex: 1 }, dim: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.38)' },
  outline: { position: 'absolute', borderWidth: 2, borderRadius: 10 },
  card: { position: 'absolute', borderWidth: 1, borderRadius: 12, padding: 12, elevation: 12 },
  copy: { flex: 1 }, copyContent: { paddingBottom: 6 }, eyebrow: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  title: { fontSize: 16, fontWeight: '800', marginTop: 4 }, body: { fontSize: 12, lineHeight: 18, marginTop: 5 },
  hint: { fontSize: 11, lineHeight: 16, marginTop: 6 }, actions: { flexDirection: 'row', gap: 8, paddingTop: 6 },
  action: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
