import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { CombatTile as CombatTileState, GroundTheme, TerrainType } from "../../game/combat/grid/gridTypes";

import { getCombatTileLayout, type MovementBoundaryEdges } from "../../ui/combatBoardLayout";

const TERRAIN_ATLAS = require("../../../assets/combat/terrain-tiles-atlas-v1.png");
const TERRAIN_ART: Record<TerrainType, { column: number; row: number }> = {
  normal: { column: 0, row: 0 }, forest: { column: 1, row: 0 }, mountain: { column: 2, row: 0 }, shallow_water: { column: 3, row: 0 },
  snow: { column: 0, row: 1 }, cracked_ice: { column: 1, row: 1 }, sand: { column: 2, row: 1 }, ash: { column: 3, row: 1 },
  cave_wall: { column: 0, row: 2 }, barricade: { column: 1, row: 2 }, web: { column: 2, row: 2 }, egg_sac: { column: 3, row: 2 },
  caravan: { column: 0, row: 3 }, escort_npc: { column: 1, row: 3 }, obstacle: { column: 2, row: 3 }, trap: { column: 3, row: 3 },
};

const GROUND_COLORS: Record<GroundTheme, { base: string; detail: string; shadow: string }> = {
  grass: { base: "#30472f", detail: "#65814a", shadow: "#203523" },
  stone: { base: "#4b4d4b", detail: "#77786d", shadow: "#303331" },
  cave: { base: "#3d352f", detail: "#75604c", shadow: "#241f1c" },
  snow: { base: "#8495a0", detail: "#c8d8db", shadow: "#566b78" },
  swamp: { base: "#34453d", detail: "#60765b", shadow: "#1d302d" },
  ash: { base: "#493c3b", detail: "#8b6250", shadow: "#2d2829" },
  sand: { base: "#806845", detail: "#b8975b", shadow: "#55442f" },
  road: { base: "#5b5141", detail: "#8a795b", shadow: "#373229" },
};

function AmbientGround({ tile, nearWall }: { tile: CombatTileState; nearWall: boolean }) {
  const palette = GROUND_COLORS[tile.groundTheme];
  const water = tile.terrainType === "shallow_water";
  // Sparse, coordinate-stable details; most of the floor remains quiet.
  const detail = (tile.position.x * 17 + tile.position.y * 31 + tile.groundVariant) % 7 === 0;
  return <View pointerEvents="none" style={[StyleSheet.absoluteFill,{ backgroundColor: water ? "#233d42" : palette.base }]}>
    {detail ? <View style={{position:"absolute",left:"22%",top:"68%",width:water?"35%":"15%",height:2,backgroundColor:water?"#597477":palette.detail,opacity:.28}}/> : null}
    {nearWall && !water ? <View style={{position:"absolute",left:"6%",top:"8%",width:"23%",height:"10%",backgroundColor:tile.groundTheme==="stone"?"#54644b":palette.shadow,opacity:.28}}/> : null}
  </View>;
}

export function CombatTile({ tile, columns, rows, nearWall = false, reachable, autoAttackable, movementBoundary, targetable, affected, hazard, safe, objective, selected, strongerContrast = false, children, onPress }: { tile: CombatTileState; columns: number; rows: number; nearWall?: boolean; autoAttackable?: boolean; reachable?: boolean; movementBoundary?: MovementBoundaryEdges; targetable?: boolean; affected?: boolean; hazard?:boolean; safe?:boolean; objective?:boolean; selected?: boolean; strongerContrast?: boolean; children?: React.ReactNode; onPress(): void }) {
  const art = TERRAIN_ART[tile.terrainType];
  return <Pressable accessibilityRole="button" accessibilityLabel={`Tile ${tile.position.x},${tile.position.y}, ${tile.terrainType}, height ${tile.elevation}${reachable ? ", reachable" : ""}${targetable ? ", targetable" : ""}${hazard?", hazard":""}${safe?", safe zone":""}${objective?", objective":""}`} onPress={onPress} style={[styles.tile, getCombatTileLayout(tile.position, columns, rows)]}>
    <View style={styles.contents}>
      {tile.terrainType === "normal" || tile.terrainType === "shallow_water" ? <AmbientGround tile={tile} nearWall={nearWall}/> : <Image fadeDuration={0} resizeMode="stretch" source={TERRAIN_ATLAS} style={{ position:"absolute",width:"400%",height:"400%",left:`${-art.column*100}%`,top:`${-art.row*100}%`,opacity:.88 }}/>}
      <View pointerEvents="none" style={[styles.grid,reachable && styles.reachable,safe && styles.safe,affected && styles.affected,hazard && styles.hazard,(targetable || autoAttackable) && styles.targetable,objective && styles.objective,selected && styles.selected,strongerContrast&&reachable&&styles.reachableStrong,strongerContrast&&safe&&styles.safeStrong,strongerContrast&&affected&&styles.affectedStrong,strongerContrast&&hazard&&styles.hazardStrong,strongerContrast&&targetable&&styles.targetableStrong,strongerContrast&&objective&&styles.objectiveStrong,strongerContrast&&selected&&styles.selectedStrong]}/>
      {reachable && movementBoundary ? <View pointerEvents="none" style={[styles.movementBoundary, movementBoundary.top&&styles.boundaryTop, movementBoundary.right&&styles.boundaryRight, movementBoundary.bottom&&styles.boundaryBottom, movementBoundary.left&&styles.boundaryLeft]}/> : null}
      {hazard ? <Text style={styles.raidMark}>!</Text> : null}
      {objective ? <Text style={styles.objectiveMark}>◆</Text> : null}
      {tile.elevation > 0 ? <Text style={styles.height}>▲{tile.elevation}</Text> : null}
      <View pointerEvents="none" style={styles.tokenLayer}>{children}</View>
    </View>
  </Pressable>;
}

const styles = StyleSheet.create({
  tile:{backgroundColor:"#253035",overflow:"hidden"},
  contents:{flex:1,overflow:"hidden",alignItems:"center",justifyContent:"center"},
  grid:{position:"absolute",left:0,right:0,top:0,bottom:0,borderRightWidth:StyleSheet.hairlineWidth,borderBottomWidth:StyleSheet.hairlineWidth,borderColor:"rgba(12,20,24,.28)"},
  tokenLayer:{position:"absolute",alignItems:"center",justifyContent:"center"},
  height:{backgroundColor:"rgba(12,17,22,.76)",color:"#ffe18a",fontSize:7,fontWeight:"900",left:1,paddingHorizontal:2,position:"absolute",top:1,zIndex:2},
  reachable:{backgroundColor:"rgba(255,232,143,.28)"},
  movementBoundary:{position:"absolute",left:0,right:0,top:0,bottom:0,zIndex:3},
  boundaryTop:{borderTopColor:"#ffd43b",borderTopWidth:2},
  boundaryRight:{borderRightColor:"#ffd43b",borderRightWidth:2},
  boundaryBottom:{borderBottomColor:"#ffd43b",borderBottomWidth:2},
  boundaryLeft:{borderLeftColor:"#ffd43b",borderLeftWidth:2},
  safe:{backgroundColor:"rgba(75,191,169,.24)",borderColor:"#66e0bd",borderWidth:1},
  affected:{backgroundColor:"rgba(255,196,102,.18)"},
  hazard:{backgroundColor:"rgba(180,45,54,.35)",borderColor:"#ff665f",borderWidth:2},
  targetable:{backgroundColor:"rgba(210,71,65,.2)",borderColor:"#ff827a",borderWidth:2,borderStyle:"dashed"},
  autoAttackBorder:{position:"absolute",left:0,right:0,top:0,bottom:0,borderColor:"#ff4038",borderWidth:2,zIndex:5},
  objective:{borderColor:"#d7a9ff",borderWidth:2,borderStyle:"dashed"},
  selected:{borderColor:"#ffe18a",borderWidth:2,borderStyle:"solid"},
  reachableStrong:{backgroundColor:"rgba(38,220,184,.34)",borderColor:"#54f0d1",borderWidth:2},
  safeStrong:{backgroundColor:"rgba(39,223,157,.40)",borderColor:"#77ffc8",borderWidth:3},
  affectedStrong:{backgroundColor:"rgba(255,211,92,.34)",borderColor:"#ffe879",borderWidth:2},
  hazardStrong:{backgroundColor:"rgba(220,35,51,.52)",borderColor:"#ff5c56",borderWidth:3,borderStyle:"solid"},
  targetableStrong:{backgroundColor:"rgba(244,67,54,.40)",borderColor:"#ff9b94",borderWidth:3,borderStyle:"solid"},
  objectiveStrong:{backgroundColor:"rgba(161,92,224,.26)",borderColor:"#e7c1ff",borderWidth:3,borderStyle:"solid"},
  selectedStrong:{borderColor:"#fff3a1",borderWidth:4,borderStyle:"solid"},
  raidMark:{color:"#fff0cf",fontSize:12,fontWeight:"900",position:"absolute",right:2,top:0,zIndex:4},
  objectiveMark:{color:"#e0b9ff",fontSize:12,fontWeight:"900",position:"absolute",bottom:0,right:2,zIndex:4},
});
