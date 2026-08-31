import React, { useCallback, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { TEMPLE_CONFIG } from "../../config/templeConfig";
import { CONDITIONS } from "../../data/conditions/conditions";
import { GEM_PACKS } from "../../data/monetization/gemPacks";
import { BackButton, EmptyState, Panel, Portrait, SegmentedTabs, colors } from "../../components/ui";
import { calculateHero } from "../../game/heroes/heroCalculator";
import { creditVerifiedGems, exchangeGemsForGold } from "../../game/monetization/gemService";
import { showAdMobRewardedAd } from "../../game/monetization/admobRewardedAdProvider";
import type { VerifiedGemCredit } from "../../game/monetization/gemTypes";
import { useGemStore } from "../../game/monetization/useGemStore";
import { saveGuild } from "../../game/save/saveService";
import { fullyTreatHero, getConditionTreatmentCost, getFullTreatmentCost, getHealingCost, healHero, reviveHero, treatHeroConditions } from "../../game/temple/templeService";
import { useGuild } from "../../state/GuildContext";
import { getRaceNameColor } from "../../ui/raceColors";

type Tab = "Treatment" | "Revival" | "Gems";
export function TempleScreen({ onBack }: { onBack(): void }) {
  const { guild, updateGuild } = useGuild();
  const [tab, setTab] = useState<Tab>("Treatment");
  const [message, setMessage] = useState<string | null>(null);
  const [confirmHeroId, setConfirmHeroId] = useState<string | null>(null);
  const [adBusy, setAdBusy] = useState(false);
  const guildRef = useRef(guild);
  guildRef.current = guild;
  const applyPurchasedGems = useCallback(async (credit: VerifiedGemCredit) => {
    const previous = guildRef.current;
    const updated = creditVerifiedGems(previous, credit);
    await saveGuild(updated);
    guildRef.current = updated;
    updateGuild(updated);
    if (updated !== previous) setMessage(`Purchase complete. +${credit.gems} gems added to the guild treasury.`);
  }, [updateGuild]);
  const gemStore = useGemStore(applyPurchasedGems);
  const living = guild.heroes.filter((hero) => hero.currentHP > 0);
  const fallen = guild.heroes.filter((hero) => hero.currentHP <= 0);
  const act = (action: () => ReturnType<typeof fullyTreatHero>, success: string) => { try { updateGuild(action()); setMessage(success); } catch (error) { setMessage(error instanceof Error ? error.message : "Temple service failed"); } };
  const watchRewardedAd = async () => { if (adBusy) return; setAdBusy(true); setMessage("Preparing a rewarded ad…"); try { const credit = await showAdMobRewardedAd(); updateGuild(creditVerifiedGems(guild, credit)); setMessage(`Thank you for supporting Guildmaster. +${credit.gems} gems received.`); } catch (error) { setMessage(error instanceof Error ? error.message : "The rewarded ad is unavailable right now."); } finally { setAdBusy(false); } };
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
    {tab === "Gems" ? <><Panel style={styles.gemPanel}><Text style={styles.panelTitle}>Support Guildmaster</Text><Text style={styles.conditions}>Watching an optional rewarded ad helps support continued development of the game. As thanks, the guild receives ◇ {TEMPLE_CONFIG.rewardedAdGems}. You never need to watch an ad to continue playing.</Text><TempleAction primary disabled={adBusy} label={adBusy ? "Preparing advertisement…" : `Watch Ad · Support Development · +◇${TEMPLE_CONFIG.rewardedAdGems}`} onPress={() => { void watchRewardedAd(); }} /></Panel><Panel style={styles.gemPanel}><Text style={styles.panelTitle}>Guild Treasury Exchange</Text><Text style={styles.conditions}>Exchange gems into ordinary guild funds. Current rate: 1 gem = 250 gold.</Text><TempleAction label="Exchange 1 Gem · +250 Gold" disabled={guild.gems < 1} onPress={exchangeGem} /></Panel><Text style={styles.section}>GEM SHOP</Text>
      {gemStore.error ? <Panel style={styles.storeNotice}><Text style={styles.storeNoticeTitle}>Google Play Store</Text><Text style={styles.conditions}>{gemStore.error}</Text><TempleAction label="Retry Store Connection" onPress={() => { void gemStore.retry(); }} /></Panel> : null}
      {GEM_PACKS.map((pack) => { const product = gemStore.products[pack.productId]; const buying = gemStore.purchasingProductId === pack.productId; return <Panel key={pack.productId} style={[styles.pack, pack.recommended && styles.recommendedPack]}><View style={styles.packCopy}><View style={styles.packHeading}><Text style={styles.panelTitle}>{pack.name}</Text>{pack.recommended ? <Text style={styles.recommended}>BEST VALUE</Text> : null}</View><Text style={styles.gems}>◇ {pack.gems.toLocaleString()} gems{pack.bonusGems ? ` · includes ${pack.bonusGems} bonus` : ""}</Text><Text style={styles.packDescription}>{pack.description}</Text></View><View style={styles.buyArea}><Text style={styles.price}>{product?.displayPrice ?? (gemStore.loading ? "Loading…" : "Unavailable")}</Text><TempleAction primary label={buying ? "Processing…" : "Buy"} disabled={!product || Boolean(gemStore.purchasingProductId)} onPress={() => { void gemStore.purchase(pack.productId).catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Purchase could not be started.")); }} /></View></Panel>; })}
      <Text style={styles.legal}>Prices and currency are supplied by Google Play for your account and region. Gem packs are consumable and can be purchased more than once. Payment is charged to your Google Play account after confirmation.</Text></> : null}
  </ScrollView>;
}

function TempleAction({ label, onPress, disabled = false, primary = false }: { label: string; onPress(): void; disabled?: boolean; primary?: boolean }) { return <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.action, primary && styles.primary, (pressed || disabled) && styles.dim]}><Text style={[styles.actionText, primary && styles.primaryText]}>{label}</Text></Pressable>; }

const styles = StyleSheet.create({ content: { padding: 20, paddingBottom: 44 }, eyebrow: { color: colors.gold, fontSize: 11, fontWeight: "900", letterSpacing: 1.8, marginTop: 8 }, title: { color: colors.text, fontSize: 30, fontWeight: "900", marginTop: 3 }, intro: { color: colors.muted, lineHeight: 20, marginTop: 8, marginBottom: 14 }, wallet: { flexDirection: "row", gap: 18, marginBottom: 14 }, gold: { color: colors.gold, fontWeight: "900" }, gems: { color: colors.blue, fontWeight: "900" }, message: { borderColor: colors.green, marginBottom: 12, flexDirection: "row", justifyContent: "space-between", gap: 10 }, messageText: { color: colors.text, flex: 1 }, dismiss: { color: colors.gold, fontWeight: "800" }, heroCard: { marginBottom: 12, gap: 12 }, heroHeader: { flexDirection: "row", alignItems: "center", gap: 13 }, heroInfo: { flex: 1 }, heroName: { color: colors.text, fontSize: 19, fontWeight: "900" }, hp: { color: colors.text, marginTop: 4, fontSize: 12 }, bar: { height: 7, backgroundColor: colors.border, borderRadius: 4, overflow: "hidden", marginTop: 5 }, hpFill: { height: "100%", backgroundColor: colors.green }, conditions: { color: colors.muted, lineHeight: 19 }, fallen: { color: colors.danger, fontWeight: "900", fontSize: 12, marginTop: 5 }, actions: { flexDirection: "row", gap: 8 }, action: { flex: 1, borderWidth: 1, borderColor: colors.gold, borderRadius: 9, paddingHorizontal: 10, paddingVertical: 11, alignItems: "center" }, primary: { backgroundColor: colors.gold }, actionText: { color: colors.gold, fontSize: 12, fontWeight: "900" }, primaryText: { color: "#17130c" }, dim: { opacity: .42 }, confirm: { backgroundColor: colors.panel2, borderRadius: 10, padding: 12, gap: 10 }, confirmText: { color: colors.text, fontWeight: "700" }, gemPanel: { gap: 10, marginBottom: 16 }, panelTitle: { color: colors.text, fontSize: 17, fontWeight: "900" }, section: { color: colors.gold, fontWeight: "900", letterSpacing: 1.4, marginBottom: 8 }, pack: { alignItems: "center", flexDirection: "row", gap: 12, justifyContent: "space-between", marginBottom: 9 }, recommendedPack: { borderColor: colors.gold }, packCopy: { flex: 1 }, packHeading: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: 7 }, recommended: { backgroundColor: colors.gold, borderRadius: 5, color: "#17130c", fontSize: 8, fontWeight: "900", letterSpacing: .7, overflow: "hidden", paddingHorizontal: 6, paddingVertical: 3 }, packDescription: { color: colors.muted, fontSize: 11, lineHeight: 15, marginTop: 4 }, buyArea: { alignItems: "stretch", minWidth: 92 }, price: { color: colors.text, fontSize: 14, fontWeight: "900", marginBottom: 6, textAlign: "center" }, storeNotice: { borderColor: colors.blue, gap: 9, marginBottom: 10 }, storeNoticeTitle: { color: colors.blue, fontWeight: "900" }, legal: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 6 } });
