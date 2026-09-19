import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { TEMPLE_CONFIG } from "../../config/templeConfig";
import { CONDITIONS } from "../../data/conditions/conditions";
import { ActionButton, BackButton, EmptyState, Panel, Portrait, SegmentedTabs, colors } from "../../components/ui";
import { calculateHero } from "../../game/heroes/heroCalculator";
import { fullyTreatHero, getConditionTreatmentCost, getFullTreatmentCost, getHalfHealingCost, getHealingCost, hasLocalHealingService, healHero, healHeroToHalf, reviveHero, treatHeroConditions } from "../../game/temple/templeService";
import { SETTLEMENTS } from "../../data/world/settlements";
import { useGuild } from "../../state/GuildContext";
import { getRaceNameColor } from "../../ui/raceColors";

type Tab = "Treatment" | "Revival";
export function TempleScreen({ onBack, openWorld }: { onBack(): void; openWorld(): void }) {
  const { guild, updateGuild } = useGuild();
  const [tab, setTab] = useState<Tab>("Treatment");
  const [message, setMessage] = useState<string | null>(null);
  const [confirmHeroId, setConfirmHeroId] = useState<string | null>(null);
  const currentSettlement = guild.world.currentSettlementId ? SETTLEMENTS[guild.world.currentSettlementId] : undefined;
  const localHealingAvailable = hasLocalHealingService(guild.world);
  const living = guild.heroes.filter((hero) => hero.currentHP > 0);
  const fallen = guild.heroes.filter((hero) => hero.currentHP <= 0);
  const act = (action: () => ReturnType<typeof fullyTreatHero>, success: string) => { try { updateGuild(action()); setMessage(success); } catch (error) { setMessage(error instanceof Error ? error.message : "Temple service failed"); } };

  if (!localHealingAvailable) return <ScrollView contentContainerStyle={styles.content}><BackButton onPress={onBack}/><Text style={styles.eyebrow}>LOCAL SERVICES</Text><Text style={styles.title}>Healing Unavailable</Text><Panel style={styles.unavailable}><Text style={styles.panelTitle}>{currentSettlement?.name ?? "Wilderness"}</Text><Text style={styles.intro}>This location has no Temple or healer. Travel to a settlement with healing services before treating, healing, or reviving heroes.</Text><ActionButton label="Open World Map" onPress={openWorld}/></Panel></ScrollView>;

  return <ScrollView contentContainerStyle={styles.content}>
    <BackButton onPress={onBack} />
    <Text style={styles.eyebrow}>{(currentSettlement?.name ?? "Local").toUpperCase()} · HEALING SERVICES</Text><Text style={styles.title}>Temple of Renewal</Text>
    <Text style={styles.intro}>Restore wounded adventurers with guild gold. Fallen heroes require rare soul gems before ordinary treatment can continue.</Text>
    <View style={styles.wallet}><Text style={styles.gold}>◆ {guild.gold.toLocaleString()} gold</Text><Text style={styles.gems}>◇ {guild.gems} gems</Text></View>
    {message ? <Panel style={styles.message}><Text style={styles.messageText}>{message}</Text><Pressable onPress={() => setMessage(null)}><Text style={styles.dismiss}>Dismiss</Text></Pressable></Panel> : null}
    <SegmentedTabs values={["Treatment", "Revival"] as const} value={tab} onChange={setTab} />
    {tab === "Treatment" ? (living.length ? living.map((hero) => {
      const maxHP = calculateHero(hero).stats.maxHP; const halfHealingCost = getHalfHealingCost(hero); const healingCost = getHealingCost(hero); const conditionCost = getConditionTreatmentCost(hero); const fullCost = getFullTreatmentCost(hero); const ailments = hero.conditions.filter((item) => item.conditionId !== "inspired");
      return <Panel key={hero.id} style={styles.heroCard}><View style={styles.heroHeader}><Portrait hero={hero} size={58} /><View style={styles.heroInfo}><Text style={[styles.heroName,{color:getRaceNameColor(hero.raceId)}]}>{hero.name}</Text><Text style={styles.hp}>HP {Math.round(hero.currentHP)} / {Math.round(maxHP)}</Text><View style={styles.bar}><View style={[styles.hpFill, { width: `${Math.max(0, Math.min(100, hero.currentHP / maxHP * 100))}%` }]} /></View></View></View>
        <Text style={styles.conditions}>{ailments.length ? ailments.map((item) => `${CONDITIONS[item.conditionId].name} (${item.remainingDuration}d)`).join(" • ") : "No treatable conditions"}</Text>
        <View style={styles.actions}>
          <TempleAction label={`Heal to 50% · ◆${halfHealingCost}`} disabled={!halfHealingCost || guild.gold < halfHealingCost} onPress={() => act(() => healHeroToHalf(guild, hero.id), `${hero.name} was restored to at least 50% health.`)} />
          <TempleAction label={`Heal Full · ◆${healingCost}`} disabled={!healingCost || guild.gold < healingCost} onPress={() => act(() => healHero(guild, hero.id), `${hero.name}'s health was restored.`)} />
        </View>
        <TempleAction label={`Cure · ◆${conditionCost}`} disabled={!conditionCost || guild.gold < conditionCost} onPress={() => act(() => treatHeroConditions(guild, hero.id), `${hero.name}'s ailments were cured.`)} />
        <TempleAction primary label={`Full treatment · ◆${fullCost}`} disabled={!fullCost || guild.gold < fullCost} onPress={() => act(() => fullyTreatHero(guild, hero.id), `${hero.name} received full treatment.`)} />
      </Panel>;
    }) : <EmptyState title="No heroes to treat" message="Recruit heroes or return after an expedition." />) : null}
    {tab === "Revival" ? (fallen.length ? fallen.map((hero) => <Panel key={hero.id} style={styles.heroCard}><View style={styles.heroHeader}><Portrait hero={hero} size={58} /><View style={styles.heroInfo}><Text style={[styles.heroName,{color:getRaceNameColor(hero.raceId)}]}>{hero.name}</Text><Text style={styles.fallen}>FALLEN • Level {hero.level}</Text></View></View><Text style={styles.conditions}>Revival restores 25% HP and leaves the hero Injured. Further healing costs gold.</Text>{confirmHeroId === hero.id ? <View style={styles.confirm}><Text style={styles.confirmText}>Spend ◇ {TEMPLE_CONFIG.revivalGemCost} to revive {hero.name}?</Text><View style={styles.actions}><TempleAction label="Cancel" onPress={() => setConfirmHeroId(null)} /><TempleAction primary label={`Confirm · ◇${TEMPLE_CONFIG.revivalGemCost}`} disabled={guild.gems < TEMPLE_CONFIG.revivalGemCost} onPress={() => { act(() => reviveHero(guild, hero.id), `${hero.name} has returned from the brink.`); setConfirmHeroId(null); }} /></View></View> : <TempleAction primary label={`Revive · ◇${TEMPLE_CONFIG.revivalGemCost}`} disabled={guild.gems < TEMPLE_CONFIG.revivalGemCost} onPress={() => setConfirmHeroId(hero.id)} />}</Panel>) : <EmptyState title="No fallen heroes" message="All guild members are alive. May the temple bells remain silent." />) : null}

  </ScrollView>;
}

function TempleAction({ label, onPress, disabled = false, primary = false }: { label: string; onPress(): void; disabled?: boolean; primary?: boolean }) { return <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.action, primary && styles.primary, (pressed || disabled) && styles.dim]}><Text style={[styles.actionText, primary && styles.primaryText]}>{label}</Text></Pressable>; }

const styles = StyleSheet.create({ content: { padding: 20, paddingBottom: 44 }, unavailable: { borderColor: colors.danger, gap: 8 }, eyebrow: { color: colors.gold, fontSize: 11, fontWeight: "900", letterSpacing: 1.8, marginTop: 8 }, title: { color: colors.text, fontSize: 30, fontWeight: "900", marginTop: 3 }, intro: { color: colors.muted, lineHeight: 20, marginTop: 8, marginBottom: 14 }, wallet: { flexDirection: "row", gap: 18, marginBottom: 14 }, gold: { color: colors.gold, fontWeight: "900" }, gems: { color: colors.blue, fontWeight: "900" }, message: { borderColor: colors.green, marginBottom: 12, flexDirection: "row", justifyContent: "space-between", gap: 10 }, messageText: { color: colors.text, flex: 1 }, dismiss: { color: colors.gold, fontWeight: "800" }, heroCard: { marginBottom: 12, gap: 12 }, heroHeader: { flexDirection: "row", alignItems: "center", gap: 13 }, heroInfo: { flex: 1 }, heroName: { color: colors.text, fontSize: 19, fontWeight: "900" }, hp: { color: colors.text, marginTop: 4, fontSize: 12 }, bar: { height: 7, backgroundColor: colors.border, borderRadius: 4, overflow: "hidden", marginTop: 5 }, hpFill: { height: "100%", backgroundColor: colors.green }, conditions: { color: colors.muted, lineHeight: 19 }, fallen: { color: colors.danger, fontWeight: "900", fontSize: 12, marginTop: 5 }, actions: { flexDirection: "row", gap: 8 }, action: { flex: 1, borderWidth: 1, borderColor: colors.gold, borderRadius: 9, paddingHorizontal: 10, paddingVertical: 11, alignItems: "center" }, primary: { backgroundColor: colors.gold }, actionText: { color: colors.gold, fontSize: 12, fontWeight: "900" }, primaryText: { color: "#17130c" }, dim: { opacity: .42 }, confirm: { backgroundColor: colors.panel2, borderRadius: 10, padding: 12, gap: 10 }, confirmText: { color: colors.text, fontWeight: "700" }, gemPanel: { gap: 10, marginBottom: 16 }, panelTitle: { color: colors.text, fontSize: 17, fontWeight: "900" }, section: { color: colors.gold, fontWeight: "900", letterSpacing: 1.4, marginBottom: 8 }, pack: { alignItems: "center", flexDirection: "row", gap: 12, justifyContent: "space-between", marginBottom: 9 }, recommendedPack: { borderColor: colors.gold }, packCopy: { flex: 1 }, packHeading: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: 7 }, recommended: { backgroundColor: colors.gold, borderRadius: 5, color: "#17130c", fontSize: 8, fontWeight: "900", letterSpacing: .7, overflow: "hidden", paddingHorizontal: 6, paddingVertical: 3 }, packDescription: { color: colors.muted, fontSize: 11, lineHeight: 15, marginTop: 4 }, buyArea: { alignItems: "stretch", minWidth: 92 }, price: { color: colors.text, fontSize: 14, fontWeight: "900", marginBottom: 6, textAlign: "center" }, storeNotice: { borderColor: colors.blue, gap: 9, marginBottom: 10 }, storeNoticeTitle: { color: colors.blue, fontWeight: "900" }, legal: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 6 } });
