import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ActionButton, BackButton, Panel, Portrait, colors } from "../components/ui";
import { CLASSES } from "../data/classes/classes";
import { QUESTS } from "../data/quests/quests";
import { calculateHero } from "../game/heroes/heroCalculator";
import type { Party } from "../game/party/partyTypes";
import { validateParty } from "../game/party/partyValidator";
import { useGuild } from "../state/GuildContext";
import { getRaceNameColor } from "../ui/raceColors";

export function PartySelectionScreen({ questId, onBack, start }: { questId: string; onBack(): void; start(party: Party): void }) {
  const { guild } = useGuild(); const quest = QUESTS[questId]!; const [ids, setIds] = useState<string[]>([]);
  const party = { id: `party-${questId}`, heroIds: ids }; const validation = validateParty(party, guild.heroes); const sizeValid = ids.length >= quest.minPartySize && ids.length <= quest.maxPartySize;
  const selectedHeroes = ids.map((id) => guild.heroes.find((hero) => hero.id === id)).filter(Boolean);
  const averageLevel = selectedHeroes.length ? selectedHeroes.reduce((sum, hero) => sum + hero.level, 0) / selectedHeroes.length : 0;
  const recommendedMin = quest.recommendedLevelMin ?? 1; const underLevelled = averageLevel > 0 && averageLevel < recommendedMin;
  const toggle = (id: string) => setIds((current) => current.includes(id) ? current.filter((entry) => entry !== id) : current.length < 4 ? [...current, id] : current);
  return <ScrollView contentContainerStyle={styles.content}>
    <BackButton onPress={onBack} /><Text style={styles.title}>Assemble Party</Text>
    <Text style={styles.quest}>{quest.name} • Difficulty {quest.difficulty} • Recommended Lv {recommendedMin}–{quest.recommendedLevelMax ?? recommendedMin}</Text>
    <View style={styles.slots}>{[0, 1, 2, 3].map((index) => { const hero = guild.heroes.find((entry) => entry.id === ids[index]); return <View key={index} style={[styles.slot, hero && styles.filled]}>{hero ? <><Portrait hero={hero} size={44} /><Text numberOfLines={1} style={[styles.slotName,{color:getRaceNameColor(hero.raceId)}]}>{hero.name}</Text></> : <><Text style={styles.plus}>+</Text><Text style={styles.empty}>Slot {index + 1}</Text></>}</View>; })}</View>
    {selectedHeroes.length > 0 && <Panel style={[styles.readiness, underLevelled && styles.dangerPanel]}><Text style={styles.readinessTitle}>Party average level: {averageLevel.toFixed(1)}</Text><Text style={underLevelled ? styles.danger : styles.ready}>{underLevelled ? `⚠ DANGER: Below recommended level ${recommendedMin}. Complete contracts and improve equipment before attempting this quest.` : "✓ Party meets the recommended level."}</Text></Panel>}
    {guild.heroes.map((hero) => { const selected = ids.includes(hero.id); const stats = calculateHero(hero); const disabled = !hero.isAvailable || hero.currentHP <= 0; return <Pressable key={hero.id} disabled={disabled} onPress={() => toggle(hero.id)}><Panel style={[styles.hero, selected && styles.selected, disabled && styles.disabled]}><View style={styles.row}><Portrait hero={hero} size={52} /><View style={styles.flex}><Text style={[styles.name,{color:getRaceNameColor(hero.raceId)}]}>{hero.name} • Lv {hero.level}</Text><Text style={styles.meta}>{CLASSES[hero.classId].name} • HP {Math.round(hero.currentHP)}/{Math.round(stats.stats.maxHP)}</Text><Text style={styles.meta}>{hero.conditions.length ? hero.conditions.map((condition) => condition.conditionId).join(", ") : "Ready"}</Text></View><Text style={styles.check}>{selected ? "✓" : disabled ? "Unavailable" : "○"}</Text></View></Panel></Pressable>; })}
    {(!validation.valid || !sizeValid) && <Text style={styles.error}>{!ids.length ? `Select ${quest.minPartySize}–${quest.maxPartySize} heroes.` : !sizeValid ? `This quest requires ${quest.minPartySize}–${quest.maxPartySize} heroes.` : validation.errors.join(" • ")}</Text>}
    <ActionButton label={underLevelled ? "Start Despite Danger" : "Start Quest"} disabled={!validation.valid || !sizeValid} onPress={() => start(party)} />
  </ScrollView>;
}

const styles = StyleSheet.create({ content: { padding: 18, paddingBottom: 45 }, title: { color: colors.text, fontSize: 30, fontWeight: "900", marginTop: 10 }, quest: { color: colors.gold, marginTop: 4, marginBottom: 16 }, slots: { flexDirection: "row", gap: 7, marginBottom: 12 }, slot: { flex: 1, height: 92, borderWidth: 1, borderStyle: "dashed", borderColor: colors.border, borderRadius: 10, alignItems: "center", justifyContent: "center" }, filled: { borderStyle: "solid", borderColor: colors.gold, backgroundColor: colors.panel }, plus: { color: colors.muted, fontSize: 23 }, empty: { color: colors.muted, fontSize: 10 }, slotName: { color: colors.text, fontSize: 10, marginTop: 4, maxWidth: "95%" }, readiness: { marginBottom: 14, padding: 12 }, dangerPanel: { borderColor: colors.danger }, readinessTitle: { color: colors.text, fontWeight: "900" }, ready: { color: colors.green, fontSize: 12, marginTop: 5, lineHeight: 17 }, danger: { color: colors.danger, fontSize: 12, marginTop: 5, lineHeight: 17, fontWeight: "700" }, hero: { marginBottom: 8 }, selected: { borderColor: colors.gold, backgroundColor: colors.panel2 }, disabled: { opacity: .45 }, row: { flexDirection: "row", alignItems: "center", gap: 10 }, flex: { flex: 1 }, name: { color: colors.text, fontWeight: "900" }, meta: { color: colors.muted, fontSize: 12, marginTop: 3 }, check: { color: colors.gold, fontWeight: "900" }, error: { color: colors.danger, marginVertical: 10 } });
