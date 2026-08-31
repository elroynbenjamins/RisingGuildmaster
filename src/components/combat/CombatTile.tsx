import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { CombatTile as CombatTileState, GroundTheme, TerrainType } from "../../game/combat/grid/gridTypes";

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

function AmbientGround({ theme, variant }: { theme: GroundTheme; variant: number }) {
  const palette = GROUND_COLORS[theme];
  const offset = variant % 5;
  return <View pointerEvents="none" style={[styles.ground, { backgroundColor: palette.base }]}>
    <View style={[styles.groundShade, { backgroundColor: palette.shadow }]} />
    {theme === "grass" && <><View style={[styles.tuftStem,{backgroundColor:palette.detail,left:`${18+offset*9}%`,top:"23%",transform:[{rotate:"-18deg"}]}]}/><View style={[styles.tuftStem,{backgroundColor:palette.detail,left:`${24+offset*9}%`,top:"18%",transform:[{rotate:"12deg"}]}]}/><View style={[styles.pixelDot,{backgroundColor:palette.shadow,right:`${13+offset*5}%`,bottom:"18%"}]}/></>}
    {theme === "stone" && <><View style={[styles.stoneJoint,{backgroundColor:palette.shadow,left:`${-18+offset*8}%`,top:"46%"}]}/><View style={[styles.stoneJointVertical,{backgroundColor:palette.shadow,left:`${38+offset*5}%`,top:0}]}/><View style={[styles.edgeHighlight,{backgroundColor:palette.detail,bottom:"7%",right:"8%"}]}/></>}
    {theme === "cave" && <><View style={[styles.crack,{backgroundColor:palette.shadow,left:`${20+offset*8}%`,top:"30%",transform:[{rotate:"32deg"}]}]}/><View style={[styles.crackShort,{backgroundColor:palette.detail,left:`${43+offset*5}%`,top:"49%",transform:[{rotate:"-24deg"}]}]}/><View style={[styles.pixelDot,{backgroundColor:palette.shadow,bottom:"13%",right:"15%"}]}/></>}
    {theme === "snow" && <><View style={[styles.snowDrift,{borderColor:palette.detail,left:`${-12+offset*7}%`,top:"38%"}]}/><View style={[styles.snowSpark,{backgroundColor:palette.detail,right:`${17+offset*4}%`,top:"19%"}]}/></>}
    {theme === "swamp" && <><View style={[styles.swampPool,{backgroundColor:palette.shadow,left:`${9+offset*7}%`,bottom:"12%"}]}/><View style={[styles.swampGlint,{backgroundColor:palette.detail,left:`${16+offset*7}%`,bottom:"22%"}]}/><View style={[styles.pixelDot,{backgroundColor:palette.detail,right:"13%",top:"18%"}]}/></>}
    {theme === "ash" && <><View style={[styles.ashSmear,{backgroundColor:palette.shadow,left:`${4+offset*8}%`,top:"42%",transform:[{rotate:"-12deg"}]}]}/><View style={[styles.ember,{backgroundColor:palette.detail,right:`${16+offset*4}%`,top:"24%"}]}/></>}
    {theme === "sand" && <><View style={[styles.sandLine,{borderColor:palette.detail,left:`${-18+offset*7}%`,top:"27%"}]}/><View style={[styles.sandLine,{borderColor:palette.shadow,right:`${-10+offset*5}%`,bottom:"18%"}]}/></>}
    {theme === "road" && <><View style={[styles.roadJoint,{borderColor:palette.shadow,left:`${8+offset*6}%`,top:"12%"}]}/><View style={[styles.roadJoint,{borderColor:palette.detail,right:`${4+offset*5}%`,bottom:"6%"}]}/></>}
  </View>;
}

export function CombatTile({ tile, columns, reachable, targetable, affected, hazard, safe, objective, selected, children, onPress }: { tile: CombatTileState; columns: number; reachable?: boolean; targetable?: boolean; affected?: boolean; hazard?:boolean; safe?:boolean; objective?:boolean; selected?: boolean; children?: React.ReactNode; onPress(): void }) {
  const art = TERRAIN_ART[tile.terrainType];
  return <Pressable accessibilityRole="button" accessibilityLabel={`Tile ${tile.position.x},${tile.position.y}, ${tile.terrainType}, height ${tile.elevation}${reachable ? ", reachable" : ""}${targetable ? ", targetable" : ""}${hazard?", raid hazard":""}${safe?", safe zone":""}${objective?", raid objective":""}`} onPress={onPress} style={[styles.tile, { width: `${100 / columns}%` }, safe&&styles.safe,hazard&&styles.hazard, reachable && styles.reachable, targetable && styles.targetable, affected && styles.affected,objective&&styles.objective, selected && styles.selected]}><View style={styles.contents}>{tile.terrainType === "normal" ? <AmbientGround theme={tile.groundTheme} variant={tile.groundVariant} /> : <Image fadeDuration={0} resizeMode="stretch" source={TERRAIN_ATLAS} style={{ position: "absolute", width: "400%", height: "400%", left: `${-art.column * 100}%`, top: `${-art.row * 100}%`, opacity: columns >= 13 ? .78 : .9 }} />}{hazard&&<Text style={styles.raidMark}>!</Text>}{objective&&<Text style={styles.objectiveMark}>◆</Text>}{tile.elevation > 0 && <Text style={styles.height}>▲{tile.elevation}</Text>}{children && <View style={styles.tokenLayer}>{children}</View>}</View></Pressable>;
}

const styles = StyleSheet.create({
  tile: { aspectRatio: 1, borderWidth: 1, borderColor: "#3c485c", alignItems: "center", justifyContent: "center", backgroundColor: "#172033", overflow: "hidden" },
  contents: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  ground: { bottom: 0, left: 0, position: "absolute", right: 0, top: 0 },
  groundShade:{bottom:0,height:"12%",left:0,opacity:.42,position:"absolute",right:0},
  pixelDot:{height:"8%",position:"absolute",width:"10%"},
  tuftStem:{height:"27%",position:"absolute",width:"5%"},
  stoneJoint:{height:"5%",position:"absolute",width:"72%"},
  stoneJointVertical:{height:"49%",position:"absolute",width:"5%"},
  edgeHighlight:{height:"4%",opacity:.7,position:"absolute",width:"28%"},
  crack:{height:"5%",position:"absolute",width:"45%"},
  crackShort:{height:"4%",position:"absolute",width:"27%"},
  snowDrift:{borderRadius:40,borderTopWidth:2,height:"40%",position:"absolute",width:"78%"},
  snowSpark:{height:"7%",position:"absolute",transform:[{rotate:"45deg"}],width:"7%"},
  swampPool:{borderRadius:20,height:"22%",opacity:.75,position:"absolute",width:"50%"},
  swampGlint:{height:"4%",position:"absolute",width:"31%"},
  ashSmear:{height:"16%",opacity:.65,position:"absolute",width:"62%"},
  ember:{height:"6%",position:"absolute",width:"6%"},
  sandLine:{borderRadius:40,borderTopWidth:2,height:"33%",position:"absolute",width:"72%"},
  roadJoint:{borderRadius:5,borderWidth:1,height:"48%",opacity:.65,position:"absolute",width:"48%"},
  tokenLayer: { position: "absolute", alignItems: "center", justifyContent: "center" },
  height: { backgroundColor: "rgba(12,17,22,.76)", color: "#ffe18a", fontSize: 7, fontWeight: "900", left: 1, paddingHorizontal: 2, position: "absolute", top: 1, zIndex: 2 },
  reachable: { borderColor: "#55d6c2", borderWidth: 3 }, targetable: { borderColor: "#ff827a", borderWidth: 3, borderStyle: "dashed" }, affected: { borderColor: "#ffc466", borderWidth: 3 }, selected: { borderColor: "#ffe18a", borderWidth: 4 },
  hazard:{backgroundColor:"#5d2028",borderColor:"#ff665f",borderWidth:3},safe:{backgroundColor:"#173d38",borderColor:"#66e0bd",borderWidth:2},objective:{borderColor:"#d7a9ff",borderWidth:3,borderStyle:"dashed"},raidMark:{color:"#fff0cf",fontSize:12,fontWeight:"900",position:"absolute",right:2,top:0,zIndex:4},objectiveMark:{color:"#e0b9ff",fontSize:12,fontWeight:"900",position:"absolute",bottom:0,right:2,zIndex:4},
});
