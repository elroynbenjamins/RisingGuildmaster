import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { DUNGEON_NODES } from "../../data/dungeons/dungeons";
import type { DungeonDefinition, DungeonNodeDefinition, DungeonRunState } from "../../game/dungeons/dungeonTypes";
import { getDungeonEncounterSummary, getDungeonNodeRewardSummary, getDungeonNodeRisk, getDungeonRouteLayers } from "../../game/dungeons/dungeonIntelService";
import type { GuildState } from "../../game/guild/types";
import { Panel, Portrait, colors } from "../ui";
import { DungeonNodeIcon, DungeonPathIcon } from "./DungeonVisualIcon";
import type { RogueliteNodeState, RoguelitePathVisual } from "../../data/dungeons/dungeonIconAtlas";
import { useTheme } from "../../theme/theme";

const RISK_COLORS = { SAFE: colors.green, UNCERTAIN: colors.gold, DANGEROUS: "#e29a55", DEADLY: colors.danger, BOSS: "#d277ff" } as const;

function Bar({ value, color }: { value: number; color: string }) {
  return <View style={styles.barTrack}><View style={[styles.barFill, { width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color }]} /></View>;
}

export function DungeonPartyHud({ guild, run }: { guild: GuildState; run: DungeonRunState }) {
  const { colors: themeColors } = useTheme();
  return <Panel style={styles.partyPanel}>
    <View style={styles.partyHeader}><Text style={[styles.heading, { color: themeColors.gold }]}>EXPEDITION PARTY</Text><Text style={[styles.survivors, { color: themeColors.muted }]}>{run.heroInstances.filter((entry) => entry.isAlive).length}/4 standing</Text></View>
    <View style={styles.partyGrid}>{run.heroInstances.map((instance) => {
      const hero = guild.heroes.find((entry) => entry.id === instance.heroId); if (!hero) return null;
      const hp = instance.maxHP ? instance.currentHP / instance.maxHP * 100 : 0; const mana = instance.maxMana ? instance.currentMana / instance.maxMana * 100 : 0;
      return <View key={instance.heroId} style={[styles.partyHero, { backgroundColor: themeColors.panel2 }, !instance.isAlive && styles.fallen]}><Portrait hero={hero} size={40}/><View style={styles.heroInfo}><Text numberOfLines={1} style={[styles.heroName, { color: themeColors.text }]}>{hero.name}</Text><Text style={[styles.resource, { color: themeColors.muted }]}>HP {Math.max(0, Math.round(instance.currentHP))}/{Math.round(instance.maxHP)}</Text><Bar value={hp} color={hp <= 30 ? themeColors.danger : themeColors.green}/><Text style={[styles.resource, { color: themeColors.muted }]}>MP {Math.round(instance.currentMana)}/{Math.round(instance.maxMana)}</Text><Bar value={mana} color={themeColors.blue}/></View></View>;
    })}</View>
  </Panel>;
}

function getConnectionVisual(sourceIds: readonly string[], targetIds: readonly string[]): RoguelitePathVisual {
  const edgeCount = sourceIds.reduce((sum, id) => sum + (DUNGEON_NODES[id]?.nextNodeIds.filter((next) => targetIds.includes(next)).length ?? 0), 0);
  if (sourceIds.length === 1 && targetIds.length > 1) return "branch";
  if (sourceIds.length > 1 && targetIds.length === 1) return "t";
  if (sourceIds.length === 1 && targetIds.length === 1) return "vertical";
  if (edgeCount > Math.max(sourceIds.length, targetIds.length)) return "cross";
  return "double";
}

function MapNode({
  node, run, accentColor, layerIndex, currentLayerIndex, availableNodeIds, selectedNodeId, onSelectNode,
}: {
  node: DungeonNodeDefinition; run: DungeonRunState; accentColor: string; layerIndex: number; currentLayerIndex: number;
  availableNodeIds: readonly string[]; selectedNodeId?: string | null; onSelectNode?(id: string): void;
}) {
  const { colors: themeColors } = useTheme();
  const current = node.id === run.currentNodeId;
  const cleared = run.resolvedNodeIds.includes(node.id);
  const visited = run.visitedNodeIds.includes(node.id);
  const available = availableNodeIds.includes(node.id);
  const selected = selectedNodeId === node.id;
  let state: RogueliteNodeState = "normal";
  if (current) state = "current";
  else if (selected) state = "selected";
  else if (cleared || visited) state = "completed";
  else if (available) state = "available";
  else if (layerIndex < currentLayerIndex) state = "unavailable";
  else if (node.type === "boss") state = "boss";
  else state = "locked";
  const stateLabel = current ? "CURRENT" : selected ? "SELECTED" : cleared ? "CLEARED" : visited ? "VISITED" : available ? "AVAILABLE" : layerIndex < currentLayerIndex ? "BYPASSED" : node.type === "boss" ? "BOSS" : "LOCKED";
  const card = <View style={[
    styles.mapNode,
    { backgroundColor: themeColors.panel2, borderColor: themeColors.border },
    current && { borderColor: accentColor, borderWidth: 2 },
    available && styles.availableNode,
    selected && { borderColor: accentColor, borderWidth: 2 },
    (state === "locked" || state === "unavailable") && styles.dimNode,
    cleared && { backgroundColor: themeColors.panel },
  ]}>
    <DungeonNodeIcon type={node.type} state={state} size={42}/>
    <Text numberOfLines={1} style={[styles.mapName, { color: themeColors.text }]}>{node.title}</Text>
    <Text style={[styles.mapState, { color: themeColors.muted }, (current || selected || available) && { color: accentColor }]}>{stateLabel}</Text>
  </View>;
  return available && onSelectNode ? <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={() => onSelectNode(node.id)} style={styles.nodePressable}>{card}</Pressable> : <View style={styles.nodePressable}>{card}</View>;
}

export function DungeonRouteMap({
  dungeon, run, availableNodeIds = [], selectedNodeId = null, onSelectNode,
}: {
  dungeon: DungeonDefinition; run: DungeonRunState; availableNodeIds?: readonly string[]; selectedNodeId?: string | null; onSelectNode?(id: string): void;
}) {
  const layers = getDungeonRouteLayers(dungeon.id);
  const currentLayerIndex = Math.max(0, layers.findIndex((layer) => layer.includes(run.currentNodeId)));
  return <Panel style={styles.routeMap}>
    <Text style={styles.routeHint}>{availableNodeIds.length ? "Tap a glowing AVAILABLE room to inspect that route." : "The map records cleared, bypassed, locked and boss rooms."}</Text>
    {layers.map((layer, index) => {
      const nextLayer = layers[index + 1];
      return <React.Fragment key={index}>
        <View style={styles.mapLayer}>{layer.map((id) => <MapNode key={id} node={DUNGEON_NODES[id]!} run={run} accentColor={dungeon.accentColor} layerIndex={index} currentLayerIndex={currentLayerIndex} availableNodeIds={availableNodeIds} selectedNodeId={selectedNodeId} onSelectNode={onSelectNode}/>)}</View>
        {nextLayer ? <View style={styles.connector}><DungeonPathIcon kind={getConnectionVisual(layer, nextLayer)} size={36}/></View> : null}
      </React.Fragment>;
    })}
  </Panel>;
}

export function DungeonNodeIntel({ node, encounterId }: { node: DungeonNodeDefinition; encounterId?: string }) {
  const { colors: themeColors } = useTheme(); const risk = getDungeonNodeRisk(node); const encounter = getDungeonEncounterSummary(encounterId);
  return <View style={[styles.intel, { borderTopColor: themeColors.border }]}><View style={styles.intelTop}><Text style={[styles.risk, { color: RISK_COLORS[risk] }]}>{risk} ROUTE</Text><Text style={[styles.reward, { color: themeColors.text }]}>{getDungeonNodeRewardSummary(node)}</Text></View>{encounter && <Text style={[styles.enemies, { color: themeColors.muted }]}>ENEMIES: {encounter}</Text>}</View>;
}

const styles = StyleSheet.create({
  partyPanel: { marginVertical: 9 }, partyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }, heading: { color: colors.gold, fontSize: 10, fontWeight: "900", letterSpacing: 1 }, survivors: { color: colors.muted, fontSize: 10, fontWeight: "800" }, partyGrid: { flexDirection: "row", flexWrap: "wrap", gap: 7 }, partyHero: { flexBasis: "47%", flexGrow: 1, minWidth: 132, flexDirection: "row", gap: 6, alignItems: "center", backgroundColor: colors.panel2, borderRadius: 8, padding: 6 }, fallen: { opacity: .42 }, heroInfo: { flex: 1 }, heroName: { color: colors.text, fontSize: 10, fontWeight: "900" }, resource: { color: colors.muted, fontSize: 8, marginTop: 2 }, barTrack: { height: 4, borderRadius: 3, overflow: "hidden", backgroundColor: "#10191b", marginTop: 2 }, barFill: { height: "100%", borderRadius: 3 },
  routeMap: { alignItems: "stretch", paddingHorizontal: 8 }, routeHint: { color: colors.muted, fontSize: 8, lineHeight: 12, marginBottom: 7, textAlign: "center" }, mapLayer: { flexDirection: "row", justifyContent: "center", gap: 7 }, nodePressable: { flex: 1, maxWidth: 150 }, mapNode: { minHeight: 70, backgroundColor: colors.panel2, borderColor: colors.border, borderWidth: 1, borderRadius: 8, padding: 5, alignItems: "center", justifyContent: "center" }, availableNode: { borderColor: colors.gold, backgroundColor: "#25251d" }, dimNode: { opacity: .46 }, mapName: { color: colors.text, fontSize: 8, fontWeight: "800", textAlign: "center", marginTop: 1 }, mapState: { color: colors.muted, fontSize: 7, fontWeight: "900", marginTop: 1 }, connector: { alignItems: "center", height: 32, justifyContent: "center" },
  intel: { marginTop: 9, borderTopColor: colors.border, borderTopWidth: 1, paddingTop: 8 }, intelTop: { gap: 3 }, risk: { fontSize: 10, fontWeight: "900", letterSpacing: .8 }, reward: { color: colors.text, fontSize: 11, lineHeight: 16, fontWeight: "700" }, enemies: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 5 },
});
