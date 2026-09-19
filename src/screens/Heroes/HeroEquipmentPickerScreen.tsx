import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { EquipmentIcon } from "../../components/equipment/EquipmentIcon";
import { ActionButton, BackButton, EmptyState, Panel, Portrait, colors } from "../../components/ui";
import { equipItem } from "../../game/equipment/equipmentService";
import { resolveEquipmentDefinition } from "../../game/equipment/equipmentResolver";
import type { EquipmentSlot, Hero } from "../../game/heroes/types";
import { useGuild } from "../../state/GuildContext";
import { compareEquipment } from "../../ui/equipmentComparison";
import { getEquipmentRarityColor } from "../../ui/equipmentRarity";
import { getRaceNameColor } from "../../ui/raceColors";

function score(hero: Hero, equipmentKey: string): number {
  return compareEquipment(hero, equipmentKey).reduce((sum, row) => sum + row.difference, 0);
}

export function HeroEquipmentPickerScreen({
  heroId,
  slot,
  onBack,
  onEquipped,
}: {
  heroId: string;
  slot: EquipmentSlot;
  onBack(): void;
  onEquipped(hero: Hero): void;
}) {
  const { guild, updateGuild } = useGuild();
  const hero = guild.heroes.find((entry) => entry.id === heroId);
  if (!hero) return <ScrollView contentContainerStyle={styles.content}><BackButton onPress={onBack}/><EmptyState title="Hero unavailable" message="This hero is no longer in the active guild roster."/></ScrollView>;

  const currentKey = hero.equipment[slot];
  const current = currentKey ? resolveEquipmentDefinition(currentKey) : undefined;
  const items = guild.inventory
    .map((key) => resolveEquipmentDefinition(key))
    .filter((item): item is NonNullable<typeof item> => Boolean(item)
      && item.slot === slot
      && hero.level >= item.levelRequirement
      && (!item.classRestrictions.length || item.classRestrictions.includes(hero.classId)))
    .map((item) => ({ item, rows: compareEquipment(hero, item.inventoryKey), score: score(hero, item.inventoryKey) }))
    .sort((a,b) => b.score - a.score || b.item.level - a.item.level || b.item.value - a.item.value);

  const equip = (inventoryKey: string) => {
    const oldKey = hero.equipment[slot];
    const updatedHero = equipItem(hero, inventoryKey);
    const inventory = [...guild.inventory];
    const index = inventory.indexOf(inventoryKey);
    if (index < 0) return;
    inventory.splice(index, 1);
    if (oldKey) inventory.push(oldKey);
    updateGuild({ ...guild, inventory, heroes: guild.heroes.map((entry) => entry.id === hero.id ? updatedHero : entry) });
    onEquipped(updatedHero);
  };

  return <ScrollView contentContainerStyle={styles.content}>
    <BackButton onPress={onBack}/>
    <View style={styles.heroHeader}><Portrait hero={hero} size={58}/><View style={styles.flex}><Text style={[styles.heroName,{color:getRaceNameColor(hero.raceId)}]}>{hero.name}</Text><Text style={styles.subtitle}>CHOOSE {slot.replace(/([0-9])/g," $1").toUpperCase()} · LEVEL {hero.level}</Text></View></View>

    <Panel style={styles.current}>
      <Text style={styles.sectionLabel}>CURRENTLY EQUIPPED</Text>
      <View style={styles.itemRow}><EquipmentIcon equipmentKey={currentKey} slot={slot} label={current?.name} size={52}/><View style={styles.flex}><Text style={[styles.itemName,current&&{color:getEquipmentRarityColor(current.rarity)}]}>{current?.name ?? "Empty slot"}</Text><Text style={styles.meta}>{current ? `${current.rarity.toUpperCase()} · Lv ${current.levelRequirement} · ${current.durability}% durability` : "No equipment in this slot."}</Text></View></View>
    </Panel>

    <Text style={styles.sectionLabel}>AVAILABLE IN INVENTORY · {items.length}</Text>
    {items.map(({item,rows,score},index) => {
      const positive = rows.some((row) => row.difference > 0);
      const negative = rows.some((row) => row.difference < 0);
      const verdict = positive && !negative ? "UPGRADE" : positive ? "TRADEOFF" : score === 0 ? "SIDEGRADE" : "DOWNGRADE";
      return <Panel key={item.inventoryKey} style={[styles.itemCard,{borderColor:getEquipmentRarityColor(item.rarity)},index===0&&positive&&styles.bestCard]}>
        <View style={styles.itemRow}><EquipmentIcon equipmentKey={item.inventoryKey} slot={item.slot} label={item.name} size={52}/><View style={styles.flex}><View style={styles.titleRow}><Text style={[styles.itemName,{color:getEquipmentRarityColor(item.rarity)}]}>{item.name}</Text><Text style={index===0&&positive?styles.best:index===0?styles.verdict:positive?styles.upgrade:styles.verdict}>{index===0&&positive?"BEST UPGRADE":verdict}</Text></View><Text style={styles.meta}>{item.rarity.toUpperCase()} · Requirement Lv {item.levelRequirement} · {item.durability}% durability</Text></View></View>
        <View style={styles.comparison}>{rows.length ? rows.slice(0,4).map((row)=><View key={row.label} style={styles.compareRow}><Text style={styles.compareLabel}>{row.label}</Text><Text style={row.difference>=0?styles.positive:styles.negative}>{row.difference>0?"+":""}{row.label==="Critical Chance"?`${(row.difference*100).toFixed(1)}%`:row.difference.toFixed(1)}</Text></View>):<Text style={styles.meta}>No calculated stat difference from the current item.</Text>}</View>
        <ActionButton label={currentKey ? `Replace ${current?.name ?? "Current Gear"}` : "Equip Item"} onPress={()=>equip(item.inventoryKey)}/>
      </Panel>;
    })}
    {!items.length && <EmptyState title="No compatible gear in inventory" message="Craft, buy, or earn equipment for this slot. Items will appear here automatically when this hero meets their requirements."/>}
  </ScrollView>;
}

const styles=StyleSheet.create({
  content:{padding:16,paddingBottom:46},heroHeader:{alignItems:"center",flexDirection:"row",gap:10,marginBottom:12,marginTop:8},flex:{flex:1},heroName:{fontSize:23,fontWeight:"900"},subtitle:{color:colors.gold,fontSize:9,fontWeight:"900",letterSpacing:.8,marginTop:3},current:{borderColor:colors.gold,marginBottom:14},sectionLabel:{color:colors.gold,fontSize:9,fontWeight:"900",letterSpacing:1,marginBottom:7},itemRow:{alignItems:"center",flexDirection:"row",gap:10},itemCard:{gap:9,marginBottom:9},bestCard:{borderWidth:2},titleRow:{alignItems:"center",flexDirection:"row",gap:7,justifyContent:"space-between"},itemName:{color:colors.text,fontSize:15,fontWeight:"900",flex:1},meta:{color:colors.muted,fontSize:10,lineHeight:15,marginTop:2},best:{backgroundColor:"#4d3a16",borderRadius:4,color:colors.gold,fontSize:7,fontWeight:"900",overflow:"hidden",paddingHorizontal:5,paddingVertical:3},upgrade:{backgroundColor:"#173d2b",borderRadius:4,color:colors.green,fontSize:7,fontWeight:"900",overflow:"hidden",paddingHorizontal:5,paddingVertical:3},verdict:{backgroundColor:colors.panel2,borderRadius:4,color:colors.muted,fontSize:7,fontWeight:"900",overflow:"hidden",paddingHorizontal:5,paddingVertical:3},comparison:{borderTopColor:colors.border,borderTopWidth:1,paddingTop:7},compareRow:{flexDirection:"row",justifyContent:"space-between",paddingVertical:2},compareLabel:{color:colors.muted,fontSize:10},positive:{color:colors.green,fontSize:10,fontWeight:"900"},negative:{color:colors.danger,fontSize:10,fontWeight:"900"}
});
