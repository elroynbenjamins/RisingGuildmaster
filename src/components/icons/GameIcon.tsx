import React from "react";
import { Image, StyleSheet, View } from "react-native";
import type { GameIconId } from "../../data/ui/gameIcons";
import { GAME_ICON_ART } from "../../data/ui/gameIconArt";
import { useTheme } from "../../theme/theme";
import { formatGameId } from "../../ui/textFormat";

export function GameIcon({ id, size = 42, framed = true }: { id: GameIconId; size?: number; framed?: boolean }) {
  const {colors:themeColors}=useTheme();
  return <View accessibilityLabel={`${formatGameId(id)} icon`} style={[styles.crop,{backgroundColor:framed?themeColors.panel2:"transparent",borderRadius:framed?Math.max(4,size*.13):0,borderColor:framed?themeColors.gold:"transparent",borderWidth:framed?1:0,width:size,height:size}]}><Image fadeDuration={0} resizeMode="contain" source={GAME_ICON_ART[id]} style={styles.image}/></View>;
}
const styles = StyleSheet.create({ crop: { overflow: "hidden" }, image: { width: "100%", height: "100%" } });
