import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { DUNGEON_NODES } from "../../data/dungeons/dungeons";
import type { DungeonDefinition, DungeonNodeDefinition, DungeonRunState } from "../../game/dungeons/dungeonTypes";
import { getDungeonEncounterSummary, getDungeonNodeRewardSummary, getDungeonNodeRisk, getDungeonRouteLayers } from "../../game/dungeons/dungeonIntelService";
import type { GuildState } from "../../game/guild/types";
import { Panel, Portrait, colors } from "../ui";
import { DungeonNodeArtworkIcon } from "./DungeonArtwork";

const RISK_COLORS = { SAFE: colors.green, UNCERTAIN: colors.gold, DANGEROUS: "#e29a55", DEADLY: colors.danger, BOSS: "#d277ff" } as const;

function Bar({ value, color }: { value: number; color: string }) {
  return <View style={styles.barTrack}><View style={[styles.barFill, { width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color }]} /></View>;
}

export function DungeonPartyHud({ guild, run }: { guild: GuildState; run: DungeonRunState }) {
  return <Panel style={styles.partyPanel}><View style={styles.partyHeader}><Text style={styles.heading}>EXPEDITION PARTY</Text><Text style={styles.survivors}>{run.heroInstances.filter((entry) => entry.isAlive).length}/4 standing</Text></View><View style={styles.partyGrid}>{run.heroInstances.map((instance) => { const hero = guild.heroes.find((entry) => entry.id === instance.heroId); if (!hero) return null; const hp = instance.maxHP ? instance.currentHP / instance.maxHP * 100 : 0; const mana = instance.maxMana ? instance.currentMana / instance.maxMana * 100 : 0; return <View key={instance.heroId} style={[styles.partyHero, !instance.isAlive && styles.fallen]}><Portrait hero={hero} size={42}/><View style={styles.heroInfo}><Text numberOfLines={1} style={styles.heroName}>{hero.name}</Text><Text style={styles.resource}>HP {Math.max(0, Math.round(instance.currentHP))}/{Math.round(instance.maxHP)}</Text><Bar value={hp} color={hp <= 30 ? colors.danger : colors.green}/><Text style={styles.resource}>MP {Math.round(instance.currentMana)}/{Math.round(instance.maxMana)}</Text><Bar value={mana} color="#5797d1"/></View></View>; })}</View></Panel>;
}

function MapNode({ node, run, accentColor }: { node: DungeonNodeDefinition; run: DungeonRunState; accentColor: string }) {
  const current = node.id === run.currentNodeId; const cleared = run.resolvedNodeIds.includes(node.id); const visited = run.visitedNodeIds.includes(node.id);
  return <View style={[styles.mapNode, current && { borderColor: accentColor, borderWidth: 2 }, cleared && styles.cleared]}><DungeonNodeArtworkIcon type={node.type}/><Text numberOfLines={1} style={styles.mapName}>{node.title}</Text><Text style={[styles.mapState, current && { color: accentColor }]}>{current ? "◆ CURRENT" : cleared ? "✓ CLEARED" : visited ? "• VISITED" : node.type.toUpperCase()}</Text></View>;
}

export function DungeonRouteMap({ dungeon, run }: { dungeon: DungeonDefinition; run: DungeonRunState }) {
  const layers = getDungeonRouteLayers(dungeon.id);
  return <Panel style={styles.routeMap}>{layers.map((layer, index) => <React.Fragment key={index}><View style={styles.mapLayer}>{layer.map((id) => <MapNode key={id} node={DUNGEON_NODES[id]!} run={run} accentColor={dungeon.accentColor}/>)}</View>{index < layers.length - 1 && <Text style={styles.connector}>↓</Text>}</React.Fragment>)}</Panel>;
}

export function DungeonNodeIntel({ node, encounterId }: { node: DungeonNodeDefinition; encounterId?: string }) {
  const risk = getDungeonNodeRisk(node); const encounter = getDungeonEncounterSummary(encounterId);
  return <View style={styles.intel}><View style={styles.intelTop}><Text style={[styles.risk, { color: RISK_COLORS[risk] }]}>{risk} ROUTE</Text><Text style={styles.reward}>{getDungeonNodeRewardSummary(node)}</Text></View>{encounter && <Text style={styles.enemies}>ENEMIES: {encounter}</Text>}</View>;
}

const styles = StyleSheet.create({
  partyPanel: { marginVertical: 10 }, partyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }, heading: { color: colors.gold, fontSize: 11, fontWeight: "900", letterSpacing: 1 }, survivors: { color: colors.muted, fontSize: 11, fontWeight: "800" }, partyGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, partyHero: { width: "48%", minWidth: 140, flexDirection: "row", gap: 7, alignItems: "center", backgroundColor: colors.panel2, borderRadius: 8, padding: 7 }, fallen: { opacity: .42 }, heroInfo: { flex: 1 }, heroName: { color: colors.text, fontSize: 11, fontWeight: "900" }, resource: { color: colors.muted, fontSize: 8, marginTop: 2 }, barTrack: { height: 4, borderRadius: 3, overflow: "hidden", backgroundColor: "#10191b", marginTop: 2 }, barFill: { height: "100%", borderRadius: 3 },
  routeMap: { alignItems: "stretch" }, mapLayer: { flexDirection: "row", justifyContent: "center", gap: 8 }, mapNode: { flex: 1, maxWidth: 150, minHeight: 76, backgroundColor: colors.panel2, borderColor: colors.border, borderWidth: 1, borderRadius: 8, padding: 6, alignItems: "center", justifyContent: "center" }, cleared: { backgroundColor: "#203129" }, mapName: { color: colors.text, fontSize: 9, fontWeight: "800", textAlign: "center", marginTop: 2 }, mapState: { color: colors.muted, fontSize: 7, fontWeight: "900", marginTop: 2 }, connector: { color: colors.border, fontSize: 18, fontWeight: "900", lineHeight: 20, textAlign: "center" },
  intel: { marginTop: 10, borderTopColor: colors.border, borderTopWidth: 1, paddingTop: 9 }, intelTop: { gap: 4 }, risk: { fontSize: 10, fontWeight: "900", letterSpacing: .8 }, reward: { color: colors.text, fontSize: 11, lineHeight: 17, fontWeight: "700" }, enemies: { color: colors.muted, fontSize: 10, lineHeight: 16, marginTop: 6 },
});
