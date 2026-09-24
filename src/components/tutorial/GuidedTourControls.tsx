import React, { useContext } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useGuild } from '../../state/GuildContext';
import { useTheme } from '../../theme/theme';
import { GUIDED_TOUR_IDS, normalizeGuidedTourProgress } from '../../game/onboarding/guidedTourService';
import { GuidedTutorialContext } from './GuidedTutorialContext';

export function GuidedTourControls() {
  const { guild } = useGuild();
  const { colors } = useTheme();
  const guide = useContext(GuidedTutorialContext);
  const progress = normalizeGuidedTourProgress(guild.tutorial.guided);
  const completed = GUIDED_TOUR_IDS.filter(id => progress.tours[id]?.status === 'completed').length;
  const skipped = GUIDED_TOUR_IDS.filter(id => progress.tours[id]?.status === 'skipped').length;
  return <View style={[styles.panel, { backgroundColor: colors.panel, borderColor: colors.border }]}>
    <Text style={[styles.title, { color: colors.text }]}>Interactive tab guides</Text>
    <Text style={[styles.body, { color: colors.muted }]}>{completed}/5 completed{skipped ? ` · ${skipped} skipped` : ''} · {progress.enabled ? 'Enabled' : 'Paused'}</Text>
    <Text style={[styles.body, { color: colors.muted }]}>Guides resume on the main tabs after recruitment. Heroes, loot and travel lessons appear when relevant. Replaying changes only these guides, never your guild or rewards.</Text>
    <View style={styles.actions}>
      <Pressable accessibilityRole="button" disabled={!guide} onPress={() => guide?.dispatch({ type: progress.enabled ? 'pause' : 'resume' })} style={[styles.button, { borderColor: colors.border }]}><Text style={{ color: colors.text }}>{progress.enabled ? 'Pause guides' : 'Resume guides'}</Text></Pressable>
      <Pressable accessibilityRole="button" disabled={!guide} onPress={() => guide?.dispatch({ type: 'replay' })} style={[styles.button, { borderColor: colors.gold }]}><Text style={{ color: colors.gold }}>Replay tab guides</Text></Pressable>
    </View>
  </View>;
}
const styles = StyleSheet.create({ panel: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 }, title: { fontSize: 14, fontWeight: '700' }, body: { fontSize: 11, lineHeight: 17, marginTop: 4 }, actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }, button: { flexGrow: 1, minHeight: 44, borderWidth: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 } });
