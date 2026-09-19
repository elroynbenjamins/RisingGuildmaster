import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { DUNGEON_NODES } from "../../data/dungeons/dungeons";
import type { DungeonDefinition, DungeonNodeDefinition, DungeonRunState } from "../../game/dungeons/dungeonTypes";
import { getDungeonEncounterSummary, getDungeonNodeRewardSummary, getDungeonNodeRisk, getDungeonRouteLayers } from "../../game/dungeons/dungeonIntelService";
import type { GuildState } from "../../game/guild/types";
import { Panel, Portrait, colors } from "../ui";
import { DungeonNodeIcon, DungeonPathIcon } from "./DungeonVisualIcon";
import { useTheme } from "../../theme/theme";

const RISK_COLORS = { SAFE: colors.green, UNCERTAIN: colors.gold, DANGEROUS: "#e29a55", DEADLY: colors.danger, BOSS: "#d277ff" } as const;

function Bar({ value, color }: { value: number; color: string }) {
  return <View style={styles.barTrack}><View style={[styles.barFill, { width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color }]} /></View>;
}

export function DungeonPartyHud({ guild, run }: { guild: GuildState; run: DungeonRunState }) {
  const{colors:themeColors}=useTheme();return <Panel style={styles.partyPanel}><View style={styles.partyHeader}><Text style={[styles.heading,{color:themeColors.gold}]}>EXPEDITION PARTY</Text><Text style={[styles.survivors,{color:themeColors.muted}]}>{run.heroInstances.filter((entry) => entry.isAlive).length}/4 standing</Text></View><View style={styles.partyGrid}>{run.heroInstances.map((instance) => { const hero = guild.heroes.find((entry) => entry.id === instance.heroId); if (!hero) return null; const hp = instance.maxHP ? instance.currentHP / instance.maxHP * 100 : 0; const mana = instance.maxMana ? instance.currentMana / instance.maxMana * 100 : 0; return <View key={instance.heroId} style={[styles.partyHero,{backgroundColor:themeColors.panel2},!instance.isAlive&&styles.fallen]}><Portrait hero={hero} size={42}/><View style={styles.heroInfo}><Text numberOfLines={1} style={[styles.heroName,{color:themeColors.text}]}>{hero.name}</Text><Text style={[styles.resource,{color:themeColors.muted}]}>HP {Math.max(0, Math.round(instance.currentHP))}/{Math.round(instance.maxHP)}</Text><Bar value={hp} color={hp<=30?themeColors.danger:themeColors.green}/><Text style={[styles.resource,{color:themeColors.muted}]}>MP {Math.round(instance.currentMana)}/{Math.round(instance.maxMana)}</Text><Bar value={mana} color={themeColors.blue}/></View></View>; })}</View></Panel>;
}

function MapNode({ node, run, accentColor }: { node: DungeonNodeDefinition; run: DungeonRunState; accentColor: string }) {
  const {colors:themeColors}=useTheme();
  const current = node.id === run.currentNodeId; const cleared = run.resolvedNodeIds.includes(node.id); const visited = run.visitedNodeIds.includes(node.id);
  const state = current ? "current" : cleared ? "completed" : node.type === "boss" ? "boss" : "normal";
  return <View style={[styles.mapNode,{backgroundColor:themeColors.panel2,borderColor:themeColors.border},current&&{borderColor:accentColor,borderWidth:2},cleared&&{backgroundColor:themeColors.panel}]}><DungeonNodeIcon type={node.type} state={state} size={44}/><Text numberOfLines={1} style={[styles.mapName,{color:themeColors.text}]}>{node.title}</Text><Text style={[styles.mapState,{color:themeColors.muted},current&&{color:accentColor}]}>{current?"CURRENT":cleared?"CLEARED":visited?"VISITED":node.type.toUpperCase()}</Text></View>;
}

export function DungeonRouteMap({ dungeon, run }: { dungeon: DungeonDefinition; run: DungeonRunState }) {
  const layers = getDungeonRouteLayers(dungeon.id);
  return <Panel style={styles.routeMap}>{layers.map((layer, index) => <React.Fragment key={index}><View style={styles.mapLayer}>{layer.map((id) => <MapNode key={id} node={DUNGEON_NODES[id]!} run={run} accentColor={dungeon.accentColor}/>)}</View>{index < layers.length - 1 && <View style={styles.connector}><DungeonPathIcon kind="vertical" size={30}/></View>}</React.Fragment>)}</Panel>;
}

export function DungeonNodeIntel({ node, encounterId }: { node: DungeonNodeDefinition; encounterId?: string }) {
  const{colors:themeColors}=useTheme();const risk=getDungeonNodeRisk(node);const encounter=getDungeonEncounterSummary(encounterId);
  return <View style={[styles.intel,{borderTopColor:themeColors.border}]}><View style={styles.intelTop}><Text style={[styles.risk,{color:RISK_COLORS[risk]}]}>{risk} ROUTE</Text><Text style={[styles.reward,{color:themeColors.text}]}>{getDungeonNodeRewardSummary(node)}</Text></View>{encounter&&<Text style={[styles.enemies,{color:themeColors.muted}]}>ENEMIES: {encounter}</Text>}</View>;
}

const styles = StyleSheet.create({
  partyPanel: { marginVertical: 10 }, partyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }, heading: { color: colors.gold, fontSize: 11, fontWeight: "900", letterSpacing: 1 }, survivors: { color: colors.muted, fontSize: 11, fontWeight: "800" }, partyGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, partyHero: { width: "48%", minWidth: 140, flexDirection: "row", gap: 7, alignItems: "center", backgroundColor: colors.panel2, borderRadius: 8, padding: 7 }, fallen: { opacity: .42 }, heroInfo: { flex: 1 }, heroName: { color: colors.text, fontSize: 11, fontWeight: "900" }, resource: { color: colors.muted, fontSize: 8, marginTop: 2 }, barTrack: { height: 4, borderRadius: 3, overflow: "hidden", backgroundColor: "#10191b", marginTop: 2 }, barFill: { height: "100%", borderRadius: 3 },
  routeMap: { alignItems: "stretch" }, mapLayer: { flexDirection: "row", justifyContent: "center", gap: 8 }, mapNode: { flex: 1, maxWidth: 150, minHeight: 76, backgroundColor: colors.panel2, borderColor: colors.border, borderWidth: 1, borderRadius: 8, padding: 6, alignItems: "center", justifyContent: "center" }, cleared: { backgroundColor: "#203129" }, mapName: { color: colors.text, fontSize: 9, fontWeight: "800", textAlign: "center", marginTop: 2 }, mapState: { color: colors.muted, fontSize: 7, fontWeight: "900", marginTop: 2 }, connector: { alignItems: "center", height: 30, justifyContent: "center" },
  intel: { marginTop: 10, borderTopColor: colors.border, borderTopWidth: 1, paddingTop: 9 }, intelTop: { gap: 4 }, risk: { fontSize: 10, fontWeight: "900", letterSpacing: .8 }, reward: { color: colors.text, fontSize: 11, lineHeight: 17, fontWeight: "700" }, enemies: { color: colors.muted, fontSize: 10, lineHeight: 16, marginTop: 6 },
});
