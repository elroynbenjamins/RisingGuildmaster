import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CLASSES } from "../../data/classes/classes";
import { RACES } from "../../data/races/races";
import { GAME_CONFIG } from "../../config/gameConfig";
import type { Hero } from "../../game/heroes/types";
import { calculateHero } from "../../game/heroes/heroCalculator";
import { HERO_LOYALTY_LABELS, getHeroLoyaltyBand } from "../../game/heroes/heroLoyaltyService";
import type { HeroContract } from "../../game/recruitment/recruitmentTypes";
import type { TrainingSession } from "../../game/training/trainingTypes";
import { getRaceNameColor } from "../../ui/raceColors";
import { useTheme } from "../../theme/theme";
import { HeroPortrait } from "./HeroPortrait";
import { MiniMeter, StatusChip } from "../ui";
import { NotificationDot } from "../navigation/NotificationDot";
import { getHeroContractPresentation, getHeroDutyStatus, HERO_CLASS_ACCENTS } from "../../ui/heroPresentation";

export function HeroRosterCard({
  hero,
  loyaltyScore,
  skillPoints,
  contract,
  trainingSession,
  currentDay,
  onPress,
}: {
  hero: Hero;
  loyaltyScore: number;
  skillPoints: number;
  contract?: HeroContract;
  trainingSession?: TrainingSession;
  currentDay: number;
  onPress(): void;
}) {
  const { colors: c } = useTheme();
  const calculated = calculateHero(hero);
  const hpMax = Math.max(1, calculated.stats.maxHP);
  const status = getHeroDutyStatus(hero, trainingSession, currentDay);
  const contractState = getHeroContractPresentation(contract, currentDay);
  const loyaltyBand = getHeroLoyaltyBand(loyaltyScore);
  const accent = HERO_CLASS_ACCENTS[hero.classId];
  const lowHp = hero.currentHP <= hpMax * .3;
  const lowReadiness = hero.adventureStamina < 40;

  return <Pressable
    accessibilityRole="button"
    accessibilityLabel={`Inspect ${hero.name}, level ${hero.level} ${CLASSES[hero.classId].name}, ${status.label}`}
    onPress={onPress}
    style={({ pressed }) => [styles.card, { backgroundColor: c.panel, borderColor: pressed ? c.gold : c.border }, pressed && styles.pressed]}
  >
    <View style={[styles.classRail, { backgroundColor: accent }]} />
    <View style={styles.cardTopBar}>
      <View style={styles.nameBlock}>
        <Text style={[styles.heroName, { color: getRaceNameColor(hero.raceId) }]}>{hero.name}</Text>
        <Text style={[styles.identity, { color: c.muted }]}>{RACES[hero.raceId].name} · {CLASSES[hero.classId].name} · Level {hero.level}</Text>
      </View>
    </View>

    <View style={styles.mainRow}>
      <View style={styles.portraitColumn}>
        <View style={[styles.portraitFrame, { borderColor: accent, backgroundColor: c.panel2 }]}>
          <HeroPortrait raceId={hero.raceId} classId={hero.classId} gender={hero.gender} variant={hero.portraitVariant ?? 0} label={hero.name} size={88} />
        </View>
        <StatusChip label={status.label} tone={status.tone} />
      </View>

      <View style={styles.infoColumn}>
        {status.detail ? <Text style={[styles.statusDetail, { color: status.tone === "danger" ? c.danger : status.tone === "gold" ? c.gold : status.tone === "good" ? c.green : status.tone === "blue" ? c.blue : c.muted }]}>{status.detail}</Text> : null}

        <View style={styles.meterBlock}>
          <View style={styles.meterHeader}><Text style={[styles.meterLabel, { color: c.muted }]}>HP</Text><Text style={[styles.meterValue, { color: lowHp ? c.danger : c.text }]}>{Math.max(0, Math.round(hero.currentHP))}/{Math.round(hpMax)}</Text></View>
          <MiniMeter value={hero.currentHP} max={hpMax} color={lowHp ? c.danger : c.green} height={7} />
        </View>
        <View style={styles.meterBlock}>
          <View style={styles.meterHeader}><Text style={[styles.meterLabel, { color: c.muted }]}>Readiness</Text><Text style={[styles.meterValue, { color: lowReadiness ? c.danger : c.text }]}>{Math.round(hero.adventureStamina)}/{GAME_CONFIG.maxAdventureStamina}</Text></View>
          <MiniMeter value={hero.adventureStamina} max={GAME_CONFIG.maxAdventureStamina} color={lowReadiness ? c.danger : c.blue} height={7} />
        </View>
      </View>
    </View>

    <View style={[styles.footer, { borderTopColor: c.border }]}>
      <View style={styles.footerChips}>
        {(loyaltyBand === "resentful" || loyaltyBand === "unhappy") ? <StatusChip label={`${HERO_LOYALTY_LABELS[loyaltyBand]} ${Math.round(loyaltyScore)}`} tone="danger" /> : null}
        {contractState && contractState.tone !== "neutral" ? <StatusChip label={contractState.label} tone={contractState.tone} /> : null}
        {skillPoints > 0 ? <View style={[styles.skillBadge, { backgroundColor: c.panel2 }]}><Text style={[styles.skillBadgeText, { color: c.blue }]}>{skillPoints} skill {skillPoints === 1 ? "choice" : "choices"}</Text><NotificationDot label={`${skillPoints} hero skill choices available`} /></View> : null}
      </View>
      <Text style={[styles.inspect, { color: c.text }]}>Inspect ›</Text>
    </View>
  </Pressable>;
}

const styles = StyleSheet.create({
  card: { borderWidth: 0, borderRadius: 12, marginBottom: 12, overflow: "hidden", paddingBottom: 9, paddingLeft: 7, position: "relative" },
  pressed: { opacity: .92, transform: [{ translateY: 1 }] },
  classRail: { bottom: 0, left: 0, position: "absolute", top: 0, width: 5 },
  cardTopBar: {alignItems: "stretch", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 12, paddingTop: 14, paddingLeft: 12, marginBottom: 12},
  mainRow: { flexDirection: "row", gap: 11, paddingHorizontal: 9 },
  portraitColumn: { alignItems: "center", gap: 7, width: 92 },
  portraitFrame: { borderWidth: 0, borderRadius: 8, overflow: "hidden", padding: 0 },
  infoColumn: { flex: 1, gap: 5, minWidth: 0 },
  nameBlock: { flex: 1, minWidth: 0 },
  heroName: { fontWeight: "700", fontSize: 21, lineHeight: 27},
  identity: {letterSpacing: .25, marginTop: 1, fontWeight: "400", fontSize: 12, lineHeight: 18},
  skillBadge: { alignItems: "center", borderRadius: 10, borderWidth: 0, flexDirection: "row", gap: 3, minHeight: 27, paddingHorizontal: 7 },
  skillBadgeText: { fontSize: 10, fontWeight: "900" },
  statusDetail: {letterSpacing: .15, fontWeight: "500", fontSize: 11, lineHeight: 16},
  meterBlock: { gap: 2 },
  meterHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  meterLabel: { fontWeight: "500", fontSize: 10, letterSpacing: 0},
  meterValue: { fontWeight: "600", fontSize: 11},
  footer: { alignItems: "center", borderTopWidth: 1, flexDirection: "row", gap: 8, justifyContent: "space-between", marginLeft: 9, marginRight: 9, marginTop: 10, paddingTop: 8 },
  footerChips: { flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 5 },
  inspect: { fontWeight: "600", fontSize: 12, letterSpacing: 0},
});
