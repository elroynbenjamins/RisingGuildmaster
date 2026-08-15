import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useGameDialog } from "../../components/dialogs/GameDialog";
import { ActionButton, BackButton, EmptyState, Panel, SecondaryButton, SectionTitle, colors } from "../../components/ui";
import { MaterialIcon } from "../../components/materials/MaterialIcon";
import { MATERIALS } from "../../data/crafting/materials";
import { describeEquipmentSpecialEffect } from "../../game/equipment/equipmentSpecialEffectService";
import { resolveEquipmentDefinition } from "../../game/equipment/equipmentResolver";
import { equipItem } from "../../game/equipment/equipmentService";
import { useGuild } from "../../state/GuildContext";
import { compareEquipment } from "../../ui/equipmentComparison";
import { getRaceNameColor } from "../../ui/raceColors";
import { previewEquipmentDisposition, salvageInventoryEquipment, sellInventoryEquipment } from "../../game/equipment/equipmentDispositionService";
import type { MaterialId } from "../../game/crafting/craftingTypes";
import { getEquipmentRarityColor } from "../../ui/equipmentRarity";
import { getModifierTargetLabel } from "../../ui/modifierLabels";

export function ItemDetailScreen({ itemId, onBack }: { itemId: string; onBack(): void }) {
  const { showDialog } = useGameDialog();
  const { guild, updateGuild } = useGuild(); const item = resolveEquipmentDefinition(itemId);
  const compatible = item ? guild.heroes.filter((hero) => hero.level >= item.levelRequirement && (!item.classRestrictions.length || item.classRestrictions.includes(hero.classId))) : [];
  const [selectedId, setSelectedId] = useState(compatible[0]?.id); const [equipNotice, setEquipNotice] = useState<{ title: string; message: string; error?: boolean }>(); const hero = compatible.find((entry) => entry.id === selectedId);
  const comparison = useMemo(() => hero && item ? compareEquipment(hero, item.inventoryKey) : [], [hero, item]);
  if (!item) return <ScrollView contentContainerStyle={styles.content}><BackButton onPress={onBack} /><EmptyState title="Item unavailable" message="This item definition could not be found." /></ScrollView>;
  const disposition = previewEquipmentDisposition(item.inventoryKey);
  const salvageMaterials = Object.entries(disposition.salvageMaterials) as [MaterialId, number][];
  const salvageWorkshop = guild.artisans[disposition.salvageArtisan];
  const specialEffects = item.specialEffectIds.map(describeEquipmentSpecialEffect).filter((effect): effect is NonNullable<typeof effect> => Boolean(effect));
  const equip = () => { if (!hero) return; try { const oldId = hero.equipment[item.slot]; const updated = equipItem(hero, item.inventoryKey); const inventory = [...guild.inventory]; const index = inventory.indexOf(item.inventoryKey); if (index >= 0) inventory.splice(index, 1); if (oldId) inventory.push(oldId); updateGuild({ ...guild, inventory, heroes: guild.heroes.map((entry) => entry.id === hero.id ? updated : entry) }); setEquipNotice({ title: "Equipment Ready", message: `${item.name} is now equipped by ${hero.name}.` }); } catch (error) { setEquipNotice({ title: "Cannot Equip", message: error instanceof Error ? error.message : "Equipment failed", error: true }); } };
  if (equipNotice) return <ScrollView contentContainerStyle={styles.content}><BackButton onPress={onBack}/><Panel style={{ borderColor: equipNotice.error ? colors.danger : colors.green, gap: 14, marginTop: 28 }}><Text style={{ color: equipNotice.error ? colors.danger : colors.green, fontSize: 24, fontWeight: "900" }}>{equipNotice.title}</Text><Text style={{ color: colors.text, fontSize: 15, lineHeight: 21 }}>{equipNotice.message}</Text><ActionButton label="Return to Inventory" onPress={onBack}/></Panel></ScrollView>;
  const rarityColor = getEquipmentRarityColor(item.rarity);
  return <ScrollView contentContainerStyle={styles.content}><BackButton onPress={onBack} /><Text style={[styles.title, { color: rarityColor }]}>{item.name}</Text><Text style={[styles.rarity, { color: rarityColor }]}>{item.rarity.toUpperCase()} • {item.slot.toUpperCase()} • Level {item.level}</Text>
    <Panel style={{ borderColor: rarityColor }}><Text style={styles.line}>Value: {item.value} gold</Text><Text style={styles.line}>Requirement: Level {item.levelRequirement}</Text><Text style={styles.line}>Classes: {item.classRestrictions.length ? item.classRestrictions.join(", ") : "Any"}</Text>{item.modifiers.map((modifier, index) => <Text key={index} style={styles.effect}>{modifier.value >= 0 ? "+" : ""}{modifier.operation === "percentage" ? `${modifier.value * 100}%` : modifier.value} {getModifierTargetLabel(modifier.target)}</Text>)}</Panel>
    {specialEffects.length ? <><SectionTitle>SPECIAL EFFECTS</SectionTitle>{specialEffects.map((effect) => <Panel key={effect.name} style={styles.special}><Text style={styles.specialName}>{effect.name}</Text><Text style={styles.specialDescription}>{effect.description}</Text></Panel>)}</> : null}
    <SectionTitle>EQUIP TO HERO</SectionTitle>{compatible.map((entry) => <Pressable key={entry.id} onPress={() => setSelectedId(entry.id)}><Panel style={[styles.hero, selectedId === entry.id && styles.selected]}><Text style={[styles.heroName, { color: getRaceNameColor(entry.raceId) }]}>{entry.name}</Text><Text style={styles.meta}>Lv {entry.level} • {entry.classId}</Text></Panel></Pressable>)}
    {!compatible.length && <Text style={styles.error}>No guild hero meets this item's requirements.</Text>}
    {hero && <><SectionTitle>CALCULATED COMPARISON</SectionTitle><Panel>{comparison.length ? comparison.map((row) => <View key={row.label} style={styles.row}><Text style={styles.meta}>{row.label}</Text><Text style={[styles.diff, row.difference < 0 && styles.negative]}>{format(row.before, row.label)} → {format(row.after, row.label)} ({row.difference > 0 ? "+" : ""}{format(row.difference, row.label)})</Text></View>) : <Text style={styles.meta}>No calculated stat changes.</Text>}</Panel><View style={styles.action}><ActionButton label={`Equip to ${hero.name}`} onPress={equip} /></View></>}
    <SectionTitle>QUARTERMASTER</SectionTitle>
    <Panel style={styles.disposition}>
      <Text style={styles.dispositionTitle}>Sell or salvage this inventory copy</Text>
      <Text style={styles.meta}>Selling returns 40% of its current value, including attached enchantments. Salvaging destroys it and recovers part of the original recipe materials.</Text>
      <View style={styles.salvageRow}>{salvageMaterials.map(([materialId, amount]) => <View key={materialId} style={styles.salvageMaterial}><MaterialIcon materialId={materialId} size={32}/><Text style={styles.salvageText}>{MATERIALS[materialId].name} x{amount}</Text></View>)}</View>
      <Text style={salvageWorkshop.recruited ? styles.workshopReady : styles.error}>{salvageWorkshop.recruited ? `${disposition.salvageArtisan} workshop ready` : `Requires an operational ${disposition.salvageArtisan} workshop`}</Text>
      <View style={styles.dispositionActions}>
        <View style={styles.flex}><SecondaryButton label={`Sell for ${disposition.saleGold} gold`} onPress={() => showDialog({ title: "Sell equipment?", message: `${item.name} will be permanently sold for ${disposition.saleGold} gold.`, eyebrow: "QUARTERMASTER ORDER", tone: "danger", actions: [{ label: "Cancel", tone: "secondary" }, { label: "Sell", tone: "danger", onPress: () => { updateGuild(sellInventoryEquipment(guild, item.inventoryKey)); onBack(); } }] })}/></View>
        <View style={styles.flex}><SecondaryButton label="Salvage materials" disabled={!salvageWorkshop.recruited || !salvageMaterials.length} onPress={() => showDialog({ title: "Salvage equipment?", message: `${item.name} will be permanently dismantled.`, eyebrow: "WORKSHOP ORDER", tone: "danger", actions: [{ label: "Cancel", tone: "secondary" }, { label: "Salvage", tone: "danger", onPress: () => { try { updateGuild(salvageInventoryEquipment(guild, item.inventoryKey)); onBack(); } catch (error) { showDialog({ title: "Cannot salvage", message: error instanceof Error ? error.message : "Salvage failed", tone: "danger" }); } } }] })}/></View>
      </View>
    </Panel>
  </ScrollView>;
}
function format(value: number, label: string) { return label === "Critical Chance" ? `${(value * 100).toFixed(1)}%` : Number.isInteger(value) ? String(value) : value.toFixed(1); }
const styles = StyleSheet.create({ content: { padding: 20, paddingBottom: 45 }, title: { color: colors.text, fontSize: 30, fontWeight: "900", marginTop: 10 }, rarity: { color: colors.gold, fontWeight: "800", marginVertical: 8 }, line: { color: colors.text, marginVertical: 5 }, effect: { color: colors.green, fontWeight: "800", marginTop: 8 }, special: { borderColor: "#8c6ac7", marginBottom: 8 }, specialName: { color: "#d2b8ff", fontSize: 16, fontWeight: "900" }, specialDescription: { color: colors.text, lineHeight: 19, marginTop: 5 }, hero: { marginBottom: 8 }, selected: { borderColor: colors.gold, backgroundColor: colors.panel2 }, heroName: { color: colors.text, fontWeight: "900" }, meta: { color: colors.muted, marginTop: 3 }, error: { color: colors.danger, marginTop: 8 }, row: { flexDirection: "row", justifyContent: "space-between", gap: 10, paddingVertical: 6 }, diff: { color: colors.green, fontWeight: "700" }, negative: { color: colors.danger }, action: { marginTop: 16 }, disposition: { gap: 10 }, dispositionTitle: { color: colors.text, fontSize: 16, fontWeight: "900" }, salvageRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 }, salvageMaterial: { alignItems: "center", backgroundColor: colors.panel2, borderRadius: 8, flexDirection: "row", gap: 6, padding: 5 }, salvageText: { color: colors.text, fontSize: 10, fontWeight: "800" }, workshopReady: { color: colors.green, fontSize: 11, fontWeight: "800", textTransform: "capitalize" }, dispositionActions: { flexDirection: "row", gap: 8 }, flex: { flex: 1 } });
