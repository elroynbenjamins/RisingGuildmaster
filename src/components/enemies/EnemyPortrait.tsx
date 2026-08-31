import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ENEMY_PORTRAITS, type EnemyPortraitAtlasId } from "../../data/enemies/enemyPortraits";
import { AtlasCrop } from "../art/AtlasCrop";
import { ENEMIES } from "../../data/enemies";
import { useTheme } from "../../theme/theme";

const ATLASES: Record<EnemyPortraitAtlasId, number> = {
  goblins: require("../../../assets/enemies/goblins.png"), undead: require("../../../assets/enemies/undead.png"), beastsA: require("../../../assets/enemies/beasts-a.png"), beastsB: require("../../../assets/enemies/beasts-b.png"), bandits: require("../../../assets/enemies/bandits.png"), orcs: require("../../../assets/enemies/orcs.png"), constructs: require("../../../assets/enemies/constructs.png"), ashStory: require("../../../assets/enemies/ash-beneath-greenveil-enemies-atlas-v1.png"), guildhavenSewers: require("../../../assets/enemies/guildhaven-sewers-atlas-v1.png"), stonegateAssassins: require("../../../assets/enemies/stonegate-assassins-atlas-v1.png"), frostmarchChapter3: require("../../../assets/enemies/frostmarch-chapter3-atlas-v1.png"), shadowfenChapter4: require("../../../assets/enemies/shadowfen-chapter4-atlas-v1.png"), ashlandsChapter5: require("../../../assets/enemies/ashlands-chapter5-atlas-v1.png"), greenveilChapter6: require("../../../assets/enemies/greenveil-chapter6-atlas-v1.png"), ironHillsChapter7: require("../../../assets/enemies/iron-hills-chapter7-atlas-v2.png"), westernSeaChapter8: require("../../../assets/enemies/western-sea-chapter8-atlas-v1.png"), drownedSeventhChapter9: require("../../../assets/enemies/drowned-seventh-chapter9-atlas-v1.png"),
};

const CELL_ASPECT_RATIOS: Partial<Record<EnemyPortraitAtlasId, number>> = {};

export function EnemyPortrait({ enemyId, size = 48, hidden = false }: { enemyId: string; size?: number; hidden?: boolean }) {
  const {colors}=useTheme();
  const portraitId = ENEMIES[enemyId]?.portraitSourceId ?? enemyId;
  const crop = ENEMY_PORTRAITS[portraitId];
  if (!crop) return <View style={[styles.frame,styles.unknown,{backgroundColor:colors.panel,borderColor:colors.border,width:size,height:size}]}><Text style={[styles.question,{color:colors.muted,fontSize:size*.42}]}>?</Text></View>;
  const borderWidth = size < 30 ? 1 : 2;
  return <AtlasCrop accessibilityLabel={hidden?"Undiscovered creature silhouette":`${enemyId.replace(/_/g," ")} portrait`} source={ATLASES[crop.atlasId]} columns={3} rows={2} column={crop.column} row={crop.row} size={size} borderWidth={borderWidth} sourceCellAspectRatio={CELL_ASPECT_RATIOS[crop.atlasId]??1} frameStyle={[styles.frame,{backgroundColor:colors.panel2,borderColor:colors.gold},hidden&&styles.unknown,hidden&&{borderColor:colors.border}]}>{hidden?<><View style={styles.shadow}/><Text style={[styles.question,styles.questionOverlay,{color:colors.muted,fontSize:size*.28}]}>?</Text></>:null}</AtlasCrop>;
}

const styles = StyleSheet.create({ frame: { borderColor: "#b98a48", borderRadius: 6, backgroundColor: "#17130f" }, unknown: { alignItems: "center", justifyContent: "center", borderColor: "#69717d", backgroundColor: "#111517", borderStyle: "dashed" }, shadow: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(2,5,6,.70)" }, question: { color: "#aab1bb", fontWeight: "900" }, questionOverlay: { position: "absolute", alignSelf: "center", top: "30%", textShadowColor: "#000", textShadowRadius: 3 } });
