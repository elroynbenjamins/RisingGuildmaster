import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { TEMPLE_CONFIG } from "../../config/templeConfig";
import { CONDITIONS } from "../../data/conditions/conditions";
import { GEM_PACKS } from "../../data/monetization/gemPacks";
import { BackButton, EmptyState, Panel, Portrait, SegmentedTabs, colors } from "../../components/ui";
import { calculateHero } from "../../game/heroes/heroCalculator";
import { creditVerifiedGems, exchangeGemsForGold } from "../../game/monetization/gemService";
import { fullyTreatHero, getConditionTreatmentCost, getFullTreatmentCost, getHealingCost, healHero, reviveHero, treatHeroConditions } from "../../game/temple/templeService";
import { useGuild } from "../../state/GuildContext";
import { getRaceNameColor } from "../../ui/raceColors";

type Tab = "Treatment" | "Revival" | "Gems";
const DEVELOPMENT_BUILD = (globalThis as { __DEV__?: boolean }).__DEV__ ?? false;

export function TempleScreen({ onBack }: { onBack(): void }) {
  const { guild, updateGuild } = useGuild();
  const [tab, setTab] = useState<Tab>("Treatment");
  const [message, setMessage] = useState<string | null>(null);
  const [confirmHeroId, setConfirmHeroId] = useState<string | null>(null);
  const living = guild.heroes.filter((hero) => hero.currentHP > 0);
  const fallen = guild.heroes.filter((hero) => hero.currentHP <= 0);
  const act = (action: () => ReturnType<typeof fullyTreatHero>, success: string) => { try { updateGuild(action()); setMessage(success); } catch (error) { setMessage(error instanceof Error ? error.message : "Temple service failed"); } };
  const testReward = () => act(() => creditVerifiedGems(guild, { transactionId: `dev-ad-${Date.now()}`, source: "rewarded_ad", gems: TEMPLE_CONFIG.rewardedAdGems, verified: true, note: "Development rewarded-ad test" }), `${TEMPLE_CONFIG.rewardedAdGems} gems received.`);
  const exchangeGem = () => act(() => exchangeGemsForGold(guild, 1), "1 gem exchanged for 250 gold.");

  return <ScrollView contentContainerStyle={styles.content}>
    <BackButton onPress={onBack} />
    <Text style={styles.eyebrow}>GUILDHAVEN SANCTUARY</Text><Text style={styles.title}>Temple of Renewal</Text>
    <Text style={styles.intro}>Restore wounded adventurers with guild gold. Fallen heroes require rare soul gems before ordinary treatment can continue.</Text>
    <View style={styles.wallet}><Text style={styles.gold}>◆ {guild.gold.toLocaleString()} gold</Text><Text style={styles.gems}>◇ {guild.gems} gems</Text></View>
    {message ? <Panel style={styles.message}><Text style={styles.messageText}>{message}</Text><Pressable onPress={() => setMessage(null)}><Text style={styles.dismiss}>Dismiss</Text></Pressable></Panel> : null}
    <SegmentedTabs values={["Treatment", "Revival", "Gems"] as const} value={tab} onChange={setTab} />
    {tab === "Treatment" ? (living.length ? living.map((hero) => {
      const maxHP = calculateHero(hero).stats.maxHP; const healingCost = getHealingCost(hero); const conditionCost = getConditionTreatmentCost(hero); const fullCost = getFullTreatmentCost(hero); const ailments = hero.conditions.filter((item) => item.conditionId !== "inspired");
      return <Panel key={hero.id} style={styles.heroCard}><View style={styles.heroHeader}><Portrait hero={hero} size={58} /><View style={styles.heroInfo}><Text style={[styles.heroName,{color:getRaceNameColor(hero.raceId)}]}>{hero.name}</Text><Text style={styles.hp}>HP {Math.round(hero.currentHP)} / {Math.round(maxHP)}</Text><View style={styles.bar}><View style={[styles.hpFill, { width: `${Math.max(0, Math.min(100, hero.currentHP / maxHP * 100))}%` }]} /></View></View></View>
        <Text style={styles.conditions}>{ailments.length ? ailments.map((item) => `${CONDITIONS[item.conditionId].name} (${item.remainingDuration}d)`).join(" • ") : "No treatable conditions"}</Text>
        <View style={styles.actions}>
          <TempleAction label={`Heal · ◆${healingCost}`} disabled={!healingCost || guild.gold < healingCost} onPress={() => act(() => healHero(guild, hero.id), `${hero.name}'s health was restored.`)} />
          <TempleAction label={`Cure · ◆${conditionCost}`} disabled={!conditionCost || guild.gold < conditionCost} onPress={() => act(() => treatHeroConditions(guild, hero.id), `${hero.name}'s ailments were cured.`)} />
        </View>
        <TempleAction primary label={`Full treatment · ◆${fullCost}`} disabled={!fullCost || guild.gold < fullCost} onPress={() => act(() => fullyTreatHero(guild, hero.id), `${hero.name} received full treatment.`)} />
      </Panel>;
    }) : <EmptyState title="No heroes to treat" message="Recruit heroes or return after an expedition." />) : null}
    {tab === "Revival" ? (fallen.length ? fallen.map((hero) => <Panel key={hero.id} style={styles.heroCard}><View style={styles.heroHeader}><Portrait hero={hero} size={58} /><View style={styles.heroInfo}><Text style={[styles.heroName,{color:getRaceNameColor(hero.raceId)}]}>{hero.name}</Text><Text style={styles.fallen}>FALLEN • Level {hero.level}</Text></View></View><Text style={styles.conditions}>Revival restores 25% HP and leaves the hero Injured. Further healing costs gold.</Text>{confirmHeroId === hero.id ? <View style={styles.confirm}><Text style={styles.confirmText}>Spend ◇ {TEMPLE_CONFIG.revivalGemCost} to revive {hero.name}?</Text><View style={styles.actions}><TempleAction label="Cancel" onPress={() => setConfirmHeroId(null)} /><TempleAction primary label={`Confirm · ◇${TEMPLE_CONFIG.revivalGemCost}`} disabled={guild.gems < TEMPLE_CONFIG.revivalGemCost} onPress={() => { act(() => reviveHero(guild, hero.id), `${hero.name} has returned from the brink.`); setConfirmHeroId(null); }} /></View></View> : <TempleAction primary label={`Revive · ◇${TEMPLE_CONFIG.revivalGemCost}`} disabled={guild.gems < TEMPLE_CONFIG.revivalGemCost} onPress={() => setConfirmHeroId(hero.id)} />}</Panel>) : <EmptyState title="No fallen heroes" message="All guild members are alive. May the temple bells remain silent." />) : null}
    {tab === "Gems" ? <><Panel style={styles.gemPanel}><Text style={styles.panelTitle}>Rewarded offering</Text><Text style={styles.conditions}>Watch an optional rewarded ad to receive ◇ {TEMPLE_CONFIG.rewardedAdGems}. A verified reward is credited only once.</Text>{DEVELOPMENT_BUILD ? <TempleAction primary label={`Test rewarded ad · +◇${TEMPLE_CONFIG.rewardedAdGems}`} onPress={testReward} /> : <Text style={styles.unavailable}>Rewarded-ad provider not configured</Text>}</Panel><Panel style={styles.gemPanel}><Text style={styles.panelTitle}>Guild Treasury Exchange</Text><Text style={styles.conditions}>Exchange gems into ordinary guild funds. Current rate: 1 gem = 250 gold.</Text><TempleAction label="Exchange 1 Gem · +250 Gold" disabled={guild.gems < 1} onPress={exchangeGem} /></Panel><Text style={styles.section}>GEM SHOP</Text>{GEM_PACKS.map((pack) => <Panel key={pack.productId} style={styles.pack}><View><Text style={styles.panelTitle}>{pack.name}</Text><Text style={styles.gems}>◇ {pack.gems}</Text></View><Text style={styles.unavailable}>Store setup required</Text></Panel>)}<Text style={styles.legal}>Purchases and ad rewards must be verified by their platform provider before gems are credited. Platform-localized prices will appear here once store products are connected.</Text></> : null}
  </ScrollView>;
}

function TempleAction({ label, onPress, disabled = false, primary = false }: { label: string; onPress(): void; disabled?: boolean; primary?: boolean }) { return <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.action, primary && styles.primary, (pressed || disabled) && styles.dim]}><Text style={[styles.actionText, primary && styles.primaryText]}>{label}</Text></Pressable>; }

const styles = StyleSheet.create({ content: { padding: 20, paddingBottom: 44 }, eyebrow: { color: colors.gold, fontSize: 11, fontWeight: "900", letterSpacing: 1.8, marginTop: 8 }, title: { color: colors.text, fontSize: 30, fontWeight: "900", marginTop: 3 }, intro: { color: colors.muted, lineHeight: 20, marginTop: 8, marginBottom: 14 }, wallet: { flexDirection: "row", gap: 18, marginBottom: 14 }, gold: { color: colors.gold, fontWeight: "900" }, gems: { color: colors.blue, fontWeight: "900" }, message: { borderColor: colors.green, marginBottom: 12, flexDirection: "row", justifyContent: "space-between", gap: 10 }, messageText: { color: colors.text, flex: 1 }, dismiss: { color: colors.gold, fontWeight: "800" }, heroCard: { marginBottom: 12, gap: 12 }, heroHeader: { flexDirection: "row", alignItems: "center", gap: 13 }, heroInfo: { flex: 1 }, heroName: { color: colors.text, fontSize: 19, fontWeight: "900" }, hp: { color: colors.text, marginTop: 4, fontSize: 12 }, bar: { height: 7, backgroundColor: colors.border, borderRadius: 4, overflow: "hidden", marginTop: 5 }, hpFill: { height: "100%", backgroundColor: colors.green }, conditions: { color: colors.muted, lineHeight: 19 }, fallen: { color: colors.danger, fontWeight: "900", fontSize: 12, marginTop: 5 }, actions: { flexDirection: "row", gap: 8 }, action: { flex: 1, borderWidth: 1, borderColor: colors.gold, borderRadius: 9, paddingHorizontal: 10, paddingVertical: 11, alignItems: "center" }, primary: { backgroundColor: colors.gold }, actionText: { color: colors.gold, fontSize: 12, fontWeight: "900" }, primaryText: { color: "#17130c" }, dim: { opacity: .42 }, confirm: { backgroundColor: colors.panel2, borderRadius: 10, padding: 12, gap: 10 }, confirmText: { color: colors.text, fontWeight: "700" }, gemPanel: { gap: 10, marginBottom: 16 }, panelTitle: { color: colors.text, fontSize: 17, fontWeight: "900" }, unavailable: { color: colors.muted, fontSize: 12, fontStyle: "italic" }, section: { color: colors.gold, fontWeight: "900", letterSpacing: 1.4, marginBottom: 8 }, pack: { marginBottom: 9, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, legal: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 6 } });
