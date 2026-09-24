import { useTheme } from "../../theme/theme";
import { useActionNotifications } from "../../state/useActionNotifications";
import React, { useCallback, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { TEMPLE_CONFIG } from "../../config/templeConfig";
import { GEM_PACKS } from "../../data/monetization/gemPacks";
import { BackButton, Panel } from "../../components/ui";
import { creditVerifiedGems, exchangeGemsForGold } from "../../game/monetization/gemService";
import { showAdMobRewardedAd } from "../../game/monetization/admobRewardedAdProvider";
import type { VerifiedGemCredit } from "../../game/monetization/gemTypes";
import { useGemStore } from "../../game/monetization/useGemStore";
import { REMOVE_ADS_PRODUCT_ID } from "../../game/monetization/supportProducts";
import { claimDailyLogin, getDailyLoginGemReward } from "../../game/monetization/contentUnlockService";
import { saveAccountContentEntitlements } from "../../game/monetization/accountEntitlementService";
import { saveGuild } from "../../game/save/saveService";
import { useGuild } from "../../state/GuildContext";

export function GemsSupportScreen({ onBack }: { onBack(): void }) {
  const { guild, updateGuild, activeSaveSlot } = useGuild();
  const themeColors = useTheme().colors;
  const styles = createStyles(themeColors);
  const notices = useActionNotifications();
  const [message, setMessage] = useState<string | null>(null);
  const [adBusy, setAdBusy] = useState(false);
  const guildRef = useRef(guild); guildRef.current = guild;
  const applyPurchasedGems = useCallback(async (credit: VerifiedGemCredit) => {
    const previous = guildRef.current;
    const updated = creditVerifiedGems(previous, credit);
    guildRef.current = updated;
    updateGuild(updated);
    if (activeSaveSlot !== null) await saveGuild(updated, activeSaveSlot);
    if (updated !== previous) setMessage(`Thank you for supporting development! +${credit.gems} gems received.`);
  }, [updateGuild, activeSaveSlot]);
  const removeAds = useCallback(async () => {
    await saveAccountContentEntitlements({ ...guildRef.current.entitlements, adsRemoved: true });
    const updated = { ...guildRef.current, entitlements: { ...guildRef.current.entitlements, adsRemoved: true } };
    guildRef.current = updated;
    updateGuild(updated);
    if (activeSaveSlot !== null) await saveGuild(updated, activeSaveSlot);
    setMessage("Thank you for supporting development! Remove Ads is permanently unlocked across your saves, with +5 daily Gems and one free Temple revive each real-world day.");
  }, [updateGuild, activeSaveSlot]);
  const gemStore = useGemStore(applyPurchasedGems, removeAds);
  const watchRewardedAd = async () => {
    if (adBusy || guildRef.current.entitlements.adsRemoved) return;
    setAdBusy(true);
    try { await applyPurchasedGems(await showAdMobRewardedAd()); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Ad unavailable."); }
    finally { setAdBusy(false); }
  };
  const exchangeGem = () => {
    try { const next = exchangeGemsForGold(guildRef.current, 1); guildRef.current = next; updateGuild(next); setMessage("1 gem exchanged for 250 gold."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Exchange unavailable."); }
  };
  const adProduct = gemStore.products[REMOVE_ADS_PRODUCT_ID];
  return <ScrollView style={{ backgroundColor: themeColors.background }} contentContainerStyle={styles.content}>
    <BackButton onPress={onBack} />
    <Text style={styles.title}>Gems &amp; Support</Text>
    <Text style={styles.intro}>All purchases and every ad you watch support the continued development of Guildmaster. Thank you for playing!</Text>
    <View style={styles.wallet}><Text style={styles.gold}>{guild.gold.toLocaleString()} gold</Text><Text style={styles.gems}>{guild.gems} gems</Text></View>
    {message ? <Panel style={styles.message}><Text style={styles.messageText}>{message}</Text><Pressable onPress={() => setMessage(null)}><Text style={styles.dismiss}>Dismiss</Text></Pressable></Panel> : null}
    <Panel style={styles.gemPanel}><Text style={styles.panelTitle}>Daily Thanks · {getDailyLoginGemReward(guild)} Gems</Text><Text style={styles.conditions}>{guild.entitlements.adsRemoved ? "Your daily reward includes the +5 Gem Remove Ads bonus." : "A free gift each real-world day. No advertisement or purchase required."}</Text><SupportAction primary label={notices.daily ? `Claim ${getDailyLoginGemReward(guild)} Daily Gems` : "Claimed Today"} disabled={!notices.daily} onPress={() => { try { const reward = getDailyLoginGemReward(guildRef.current); const next = claimDailyLogin(guildRef.current); guildRef.current = next; updateGuild(next); setMessage(`Thank you for returning! +${reward} gems.`); } catch (error) { setMessage(error instanceof Error ? error.message : "Already claimed."); } }} /></Panel>
    <Panel style={styles.gemPanel}><Text style={styles.panelTitle}>Remove Ads · Permanent</Text><Text style={styles.conditions}>One-time purchase · Restorable with your Google Play account.\n\nBenefits: No ads · +5 daily Gems · 1 free revive each day. Free revives do not stack.</Text><SupportAction primary label={guild.entitlements.adsRemoved ? "Owned · Ads Removed" : gemStore.purchasingProductId === REMOVE_ADS_PRODUCT_ID ? "Processing…" : `Remove Ads · ${adProduct?.displayPrice ?? "Unavailable"}`} disabled={guild.entitlements.adsRemoved || !adProduct || Boolean(gemStore.purchasingProductId)} onPress={() => { void gemStore.purchase(REMOVE_ADS_PRODUCT_ID).catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Purchase unavailable.")); }} /><SupportAction label="Restore Purchases" onPress={() => { void gemStore.retry(); }} /></Panel>
    <>{!guild.entitlements.adsRemoved ? <Panel style={styles.gemPanel}><Text style={styles.panelTitle}>Support Guildmaster</Text><Text style={styles.conditions}>Watching an optional rewarded ad helps support continued development of the game. As thanks, the guild receives ◇ {TEMPLE_CONFIG.rewardedAdGems}. Every 20 in-game days, a milestone ad also offers 5 gems after completion.</Text><SupportAction primary disabled={adBusy} label={adBusy ? "Preparing advertisement…" : `Watch Ad · Support Development · +◇${TEMPLE_CONFIG.rewardedAdGems}`} onPress={() => { void watchRewardedAd(); }} /></Panel> : null}<Panel style={styles.gemPanel}><Text style={styles.panelTitle}>Guild Treasury Exchange</Text><Text style={styles.conditions}>Exchange gems into ordinary guild funds. Current rate: 1 gem = 250 gold.</Text><SupportAction label="Exchange 1 Gem · +250 Gold" disabled={guild.gems < 1} onPress={exchangeGem} /></Panel><Text style={styles.section}>GEM SHOP</Text>
      {gemStore.error ? <Panel style={styles.storeNotice}><Text style={styles.storeNoticeTitle}>Google Play Store</Text><Text style={styles.conditions}>{gemStore.error}</Text><SupportAction label="Retry Store Connection" onPress={() => { void gemStore.retry(); }} /></Panel> : null}
      {GEM_PACKS.map((pack) => { const product = gemStore.products[pack.productId]; const buying = gemStore.purchasingProductId === pack.productId; const deliveredGems = pack.gems + pack.bonusGems; return <Panel key={pack.productId} style={[styles.pack, pack.recommended && styles.recommendedPack]}><View style={styles.packCopy}><View style={styles.packHeading}><Text style={styles.panelTitle}>{pack.name}</Text>{pack.recommended ? <Text style={styles.recommended}>BEST VALUE</Text> : null}</View><Text style={styles.gems}>◇ {deliveredGems.toLocaleString()} gems{pack.bonusGems ? ` · ${pack.gems} + ${pack.bonusGems} bonus` : ""}</Text><Text style={styles.packDescription}>{pack.description}</Text></View><View style={styles.buyArea}><Text style={styles.price}>{product?.displayPrice ?? (gemStore.loading ? "Loading…" : "Unavailable")}</Text><SupportAction primary label={buying ? "Processing…" : "Buy"} disabled={!product || Boolean(gemStore.purchasingProductId)} onPress={() => { void gemStore.purchase(pack.productId).catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Purchase could not be started.")); }} /></View></Panel>; })}
      <Text style={styles.legal}>Prices and currency are supplied by Google Play for your account and region. Gem packs are consumable and can be purchased more than once. Payment is charged to your Google Play account after confirmation.</Text></>
  </ScrollView>;
}
function SupportAction({ label, onPress, disabled = false, primary = false }: { label: string; onPress(): void; disabled?: boolean; primary?: boolean }) { const styles = createStyles(useTheme().colors); return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.action, primary && styles.primary, (pressed || disabled) && styles.dim]}><Text style={[styles.actionText, primary && styles.primaryText]}>{label}</Text></Pressable>; }

const createStyles = (colors: typeof import("../../components/ui").colors) => StyleSheet.create({ content: { padding: 20, paddingBottom: 44 }, eyebrow: { color: colors.gold, fontSize: 11, fontWeight: "900", letterSpacing: 1.8, marginTop: 8 }, title: { color: colors.text, fontSize: 30, fontWeight: "900", marginTop: 3 }, intro: { color: colors.muted, lineHeight: 20, marginTop: 8, marginBottom: 14 }, wallet: { flexDirection: "row", gap: 18, marginBottom: 14 }, gold: { color: colors.gold, fontWeight: "900" }, gems: { color: colors.blue, fontWeight: "900" }, message: { borderColor: colors.green, marginBottom: 12, flexDirection: "row", justifyContent: "space-between", gap: 10 }, messageText: { color: colors.text, flex: 1 }, dismiss: { color: colors.gold, fontWeight: "800" }, heroCard: { marginBottom: 12, gap: 12 }, heroHeader: { flexDirection: "row", alignItems: "center", gap: 13 }, heroInfo: { flex: 1 }, heroName: { color: colors.text, fontSize: 19, fontWeight: "900" }, hp: { color: colors.text, marginTop: 4, fontSize: 12 }, bar: { height: 7, backgroundColor: colors.border, borderRadius: 4, overflow: "hidden", marginTop: 5 }, hpFill: { height: "100%", backgroundColor: colors.green }, conditions: { color: colors.muted, lineHeight: 19 }, fallen: { color: colors.danger, fontWeight: "900", fontSize: 12, marginTop: 5 }, actions: { flexDirection: "row", gap: 8 }, action: { borderWidth: 1, borderColor: colors.gold, borderRadius: 9, paddingHorizontal: 10, paddingVertical: 11, alignItems: "center" }, primary: { backgroundColor: colors.gold }, actionText: { color: colors.gold, fontSize: 12, fontWeight: "900" }, primaryText: { color: "#17130c" }, dim: { opacity: .42 }, confirm: { backgroundColor: colors.panel2, borderRadius: 10, padding: 12, gap: 10 }, confirmText: { color: colors.text, fontWeight: "700" }, gemPanel: { gap: 10, marginBottom: 16 }, panelTitle: { color: colors.text, fontSize: 17, fontWeight: "900" }, section: { color: colors.gold, fontWeight: "900", letterSpacing: 1.4, marginBottom: 8 }, pack: { alignItems: "stretch", gap: 12, justifyContent: "space-between", marginBottom: 9 }, recommendedPack: { borderColor: colors.gold }, packCopy: { width: "100%" }, packHeading: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: 7 }, recommended: { backgroundColor: colors.gold, borderRadius: 5, color: "#17130c", fontSize: 8, fontWeight: "900", letterSpacing: .7, overflow: "hidden", paddingHorizontal: 6, paddingVertical: 3 }, packDescription: { color: colors.muted, fontSize: 11, lineHeight: 15, marginTop: 4 }, buyArea: { alignItems: "stretch", minWidth: 92 }, price: { color: colors.text, fontSize: 14, fontWeight: "900", marginBottom: 6, textAlign: "center" }, storeNotice: { borderColor: colors.blue, gap: 9, marginBottom: 10 }, storeNoticeTitle: { color: colors.blue, fontWeight: "900" }, legal: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 6 } });
